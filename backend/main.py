# backend/main.py
# backend/main.py
import os
import json
import httpx
import asyncio
from collections import defaultdict, deque
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import AsyncGroq

app = FastAPI(title="FlowForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Persistent storage (JSON file) ──────────────────────────────────────────
STORAGE_FILE = Path("pipelines.json")

def load_store() -> Dict[str, Any]:
    if STORAGE_FILE.exists():
        try:
            return json.loads(STORAGE_FILE.read_text())
        except Exception:
            return {}
    return {}

def save_store(store: Dict[str, Any]):
    STORAGE_FILE.write_text(json.dumps(store, indent=2))

pipeline_store: Dict[str, Any] = load_store()

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class Node(BaseModel):
    id: str

class Edge(BaseModel):
    source: str
    target: str

class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class NodeData(BaseModel):
    id: str
    type: str
    data: Dict[str, Any] = {}

class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class ExecutePipelineRequest(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]

class SavePipelineRequest(BaseModel):
    name: str
    nodes: List[Dict]
    edges: List[Dict]

# ─── DAG Utils ────────────────────────────────────────────────────────────────

def is_dag(nodes, edges):
    graph = {node.id: [] for node in nodes}
    for edge in edges:
        if edge.source in graph:
            graph[edge.source].append(edge.target)
    state = {node.id: 0 for node in nodes}

    def dfs(node_id):
        if state[node_id] == 1:
            return False
        if state[node_id] == 2:
            return True
        state[node_id] = 1
        for neighbor in graph.get(node_id, []):
            if not dfs(neighbor):
                return False
        state[node_id] = 2
        return True

    for node in nodes:
        if state[node.id] == 0:
            if not dfs(node.id):
                return False
    return True


def topological_sort(nodes: List[NodeData], edges: List[EdgeData]) -> List[str]:
    node_ids = {n.id for n in nodes}
    in_degree = defaultdict(int)
    adj = defaultdict(list)

    for edge in edges:
        if edge.source in node_ids and edge.target in node_ids:
            adj[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    for node_id in node_ids:
        if node_id not in in_degree:
            in_degree[node_id] = 0

    queue = deque([n for n in node_ids if in_degree[n] == 0])
    order = []

    while queue:
        node_id = queue.popleft()
        order.append(node_id)
        for neighbor in adj[node_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return order


def get_inputs_for_node(node_id: str, edges: List[EdgeData], context: Dict) -> Dict[str, str]:
    """
    Gather all inputs for a node from upstream outputs.
    Properly maps source handle outputs to target handle inputs.
    """
    inputs = {}
    for edge in edges:
        if edge.target != node_id:
            continue

        source_id = edge.source
        source_output = context.get(source_id, "")

        # Resolve the actual value from source
        if isinstance(source_output, dict):
            # Condition node outputs dict with true/false keys
            src_handle = edge.sourceHandle or ""
            # Strip "sourceId-" prefix if present
            src_key = src_handle.replace(f"{source_id}-", "") if src_handle.startswith(source_id) else src_handle
            source_value = source_output.get(src_key, str(source_output))
        else:
            source_value = str(source_output)

        # Determine the input handle key on the target node
        tgt_handle = edge.targetHandle or "input"
        tgt_key = tgt_handle.replace(f"{node_id}-", "") if tgt_handle.startswith(node_id) else tgt_handle

        inputs[tgt_key] = source_value

    return inputs


# ─── Node Execution Handlers ─────────────────────────────────────────────────

async def execute_llm_node(node: NodeData, inputs: Dict[str, str]) -> str:
    data = node.data
    model = data.get("model", "llama-3.1-8b-instant")
    temperature = float(data.get("temperature", 0.7))
    max_tokens = int(data.get("maxTokens", 512))
    system_prompt = data.get("systemPrompt", "You are a helpful assistant.")

    # Accept prompt from multiple possible input handle names
    prompt_input = (
        inputs.get("prompt")
        or inputs.get("input")
        or inputs.get("value")
        or inputs.get("output")
        or ""
    )
    system_input = inputs.get("system", system_prompt)

    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return f"[LLM Node - Mock Response] Input received: '{prompt_input[:100]}'. Set GROQ_API_KEY env var for real execution."

    try:
        client = AsyncGroq(api_key=api_key)
        response = await client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_input},
                {"role": "user", "content": prompt_input},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"[LLM Error] {str(e)}"


async def execute_api_node(node: NodeData, inputs: Dict[str, str]) -> str:
    data = node.data
    url = data.get("url", "")
    method = data.get("method", "GET").upper()
    body = inputs.get("body", "")

    if not url:
        return "[API Node] No URL configured."

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if method == "GET":
                r = await client.get(url)
            elif method == "POST":
                r = await client.post(url, content=body)
            elif method == "PUT":
                r = await client.put(url, content=body)
            elif method == "DELETE":
                r = await client.delete(url)
            else:
                return f"[API Node] Unsupported method: {method}"
            return r.text[:1000]
    except Exception as e:
        return f"[API Error] {str(e)}"


def execute_transform_node(node: NodeData, inputs: Dict[str, str]) -> str:
    data = node.data
    transform = data.get("transform", "uppercase")
    input_val = inputs.get("input", inputs.get("value", inputs.get("output", "")))

    if transform == "uppercase":
        return input_val.upper()
    elif transform == "lowercase":
        return input_val.lower()
    elif transform == "trim":
        return input_val.strip()
    elif transform == "parse_json":
        try:
            return json.dumps(json.loads(input_val), indent=2)
        except Exception:
            return f"[Transform Error] Invalid JSON: {input_val[:100]}"
    elif transform == "stringify":
        return json.dumps(input_val)
    return input_val


def execute_text_node(node: NodeData, inputs: Dict[str, str]) -> str:
    """Execute a text template node, replacing {{variable}} patterns."""
    text = node.data.get("text", "")
    for key, val in inputs.items():
        text = text.replace("{{" + key + "}}", val)
        text = text.replace("{{ " + key + " }}", val)
    return text


def execute_merge_node(node: NodeData, inputs: Dict[str, str]) -> str:
    sep_raw = node.data.get("separator", "\\n")
    separator = sep_raw.replace("\\n", "\n").replace("\\t", "\t")
    parts = [v for k, v in sorted(inputs.items()) if v]
    return separator.join(parts)


def execute_condition_node(node: NodeData, inputs: Dict[str, str]) -> Dict[str, str]:
    condition = node.data.get("condition", "True")
    input_val = inputs.get("input", inputs.get("value", ""))
    value = input_val
    try:
        result = eval(condition, {"value": value, "input": input_val, "__builtins__": {}})
        is_true = bool(result)
    except Exception:
        is_true = bool(input_val)
    return {"true": input_val if is_true else "", "false": input_val if not is_true else ""}


def execute_input_node(node: NodeData, inputs: Dict[str, str]) -> str:
    """Input node: return its configured value."""
    return node.data.get("value", node.data.get("inputName", ""))


def execute_output_node(node: NodeData, inputs: Dict[str, str]) -> str:
    """Output node: collect the first available input."""
    return inputs.get("value", inputs.get("input", inputs.get("output", "")))


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "FlowForge API running"}


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):
    return {
        "num_nodes": len(pipeline.nodes),
        "num_edges": len(pipeline.edges),
        "is_dag": is_dag(pipeline.nodes, pipeline.edges),
    }


@app.post("/pipelines/execute")
async def execute_pipeline(request: ExecutePipelineRequest):
    async def stream():
        try:
            order = topological_sort(request.nodes, request.edges)
            node_map = {n.id: n for n in request.nodes}
            context: Dict[str, Any] = {}

            total = len(order)
            for i, node_id in enumerate(order):
                node = node_map.get(node_id)
                if not node:
                    continue

                yield f"data: {json.dumps({'type': 'node_state', 'nodeId': node_id, 'state': 'running', 'progress': i, 'total': total})}\n\n"
                await asyncio.sleep(0.05)

                inputs = get_inputs_for_node(node_id, request.edges, context)

                try:
                    if node.type == "llm":
                        output = await execute_llm_node(node, inputs)
                    elif node.type == "api":
                        output = await execute_api_node(node, inputs)
                    elif node.type == "transform":
                        output = execute_transform_node(node, inputs)
                    elif node.type == "text":
                        output = execute_text_node(node, inputs)
                    elif node.type == "merge":
                        output = execute_merge_node(node, inputs)
                    elif node.type == "condition":
                        output = execute_condition_node(node, inputs)
                    elif node.type == "customInput":
                        output = execute_input_node(node, inputs)
                    elif node.type == "customOutput":
                        output = execute_output_node(node, inputs)
                    elif node.type == "note":
                        output = node.data.get("note", "")
                    else:
                        output = inputs.get("input", inputs.get("value", ""))

                    context[node_id] = output
                    output_str = json.dumps(output) if isinstance(output, dict) else str(output)

                    yield f"data: {json.dumps({'type': 'node_state', 'nodeId': node_id, 'state': 'done', 'output': output_str[:500]})}\n\n"

                except Exception as e:
                    context[node_id] = f"Error: {str(e)}"
                    yield f"data: {json.dumps({'type': 'node_state', 'nodeId': node_id, 'state': 'error', 'output': str(e)})}\n\n"

                await asyncio.sleep(0.1)

            # Collect final outputs
            final_outputs = {}
            for node in request.nodes:
                if node.type == "customOutput":
                    name = node.data.get("outputName", node.id)
                    final_outputs[name] = str(context.get(node.id, ""))

            yield f"data: {json.dumps({'type': 'done', 'outputs': final_outputs})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/pipelines/save")
def save_pipeline(req: SavePipelineRequest):
    import uuid
    slug = uuid.uuid4().hex[:8]
    pipeline_store[slug] = {
        "name": req.name,
        "nodes": req.nodes,
        "edges": req.edges,
        "slug": slug,
    }
    save_store(pipeline_store)
    return {"slug": slug, "url": f"/p/{slug}"}


@app.get("/pipelines/{slug}")
def load_pipeline(slug: str):
    pipeline = pipeline_store.get(slug)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


@app.get("/pipelines")
def list_pipelines():
    return [{"slug": p["slug"], "name": p["name"]} for p in pipeline_store.values()]


@app.delete("/pipelines/{slug}")
def delete_pipeline(slug: str):
    if slug not in pipeline_store:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    del pipeline_store[slug]
    save_store(pipeline_store)
    return {"deleted": slug}