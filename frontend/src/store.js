// store.js
import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from "reactflow";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const MAX_HISTORY = 50;

export const useStore = create((set, get) => ({
  nodes: [], edges: [], nodeIDs: {},
  executionState: {}, executionOutputs: {},
  isExecuting: false, executionResult: null,
  pipelineName: "Untitled Pipeline",
  savedSlug: null, savedPipelines: [],
  theme: "dark",
  history: [], historyIndex: -1,

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    set({ theme: next });
  },

  _snapshot: () => ({
    nodes: JSON.parse(JSON.stringify(get().nodes)),
    edges: JSON.parse(JSON.stringify(get().edges)),
  }),

  _pushHistory: () => {
    const snap = get()._snapshot();
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snap);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) newIDs[type] = 0;
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => { get()._pushHistory(); set({ nodes: [...get().nodes, node] }); },

  onNodesChange: (changes) => {
    const hasPosition = changes.some((c) => c.type === "position" && c.dragging === false);
    const hasRemove = changes.some((c) => c.type === "remove");
    if (hasPosition || hasRemove) get()._pushHistory();
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    if (changes.some((c) => c.type === "remove")) get()._pushHistory();
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    get()._pushHistory();
    set({ edges: addEdge({ ...connection, type: "smoothstep", animated: true, markerEnd: { type: MarkerType.ArrowClosed, height: 16, width: 16 } }, get().edges) });
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({ nodes: get().nodes.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, [fieldName]: fieldValue } } : node) });
  },

  setPipelineName: (name) => set({ pipelineName: name }),

  clearCanvas: () => {
    get()._pushHistory();
    set({ nodes: [], edges: [], nodeIDs: {}, executionState: {}, executionOutputs: {}, executionResult: null, savedSlug: null, pipelineName: "Untitled Pipeline" });
  },

  setNodeState: (nodeId, state, output = null) => {
    set((s) => ({
      executionState: { ...s.executionState, [nodeId]: state },
      executionOutputs: output != null ? { ...s.executionOutputs, [nodeId]: output } : s.executionOutputs,
    }));
  },

  resetExecution: () => {
    const emptyState = {};
    get().nodes.forEach((n) => { emptyState[n.id] = "idle"; });
    set({ executionState: emptyState, executionOutputs: {}, executionResult: null });
  },

  retryNode: async (nodeId) => {
    const { nodes, edges, setNodeState } = get();
    setNodeState(nodeId, "running", null);
    const payload = {
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data || {} })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })),
    };
    try {
      const response = await fetch(`${BACKEND_URL}/pipelines/execute`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "node_state" && event.nodeId === nodeId) setNodeState(event.nodeId, event.state, event.output);
          } catch (_) {}
        }
      }
    } catch (err) { setNodeState(nodeId, "error", err.message); }
  },

  executePipeline: async () => {
    const { nodes, edges, resetExecution, setNodeState } = get();
    if (nodes.length === 0) return;
    resetExecution();
    set({ isExecuting: true, executionResult: null });
    const payload = {
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data || {} })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })),
    };
    try {
      const response = await fetch(`${BACKEND_URL}/pipelines/execute`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "node_state") setNodeState(event.nodeId, event.state, event.output);
            else if (event.type === "done") set({ executionResult: { outputs: event.outputs, success: true } });
            else if (event.type === "error") set({ executionResult: { error: event.message, success: false } });
          } catch (_) {}
        }
      }
    } catch (err) {
      set({ executionResult: { error: `Could not connect to backend: ${err.message}`, success: false } });
      get().nodes.forEach((n) => setNodeState(n.id, "idle"));
    } finally { set({ isExecuting: false }); }
  },

  savePipeline: async () => {
    const { nodes, edges, pipelineName } = get();
    try {
      const res = await fetch(`${BACKEND_URL}/pipelines/save`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: pipelineName, nodes, edges }) });
      const data = await res.json();
      set({ savedSlug: data.slug });
      return data;
    } catch (err) { console.error("Save failed:", err); return null; }
  },

  loadPipeline: (pipeline) => {
    get()._pushHistory();
    set({ nodes: pipeline.nodes || [], edges: pipeline.edges || [], pipelineName: pipeline.name || "Untitled", savedSlug: pipeline.slug || null, executionState: {}, executionOutputs: {}, executionResult: null });
  },

  fetchSavedPipelines: async () => {
    try { const res = await fetch(`${BACKEND_URL}/pipelines`); const data = await res.json(); set({ savedPipelines: data }); } catch (_) {}
  },

  exportPipeline: () => {
    const { nodes, edges, pipelineName } = get();
    const data = JSON.stringify({ name: pipelineName, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${pipelineName.replace(/\s+/g, "_")}.json`; a.click();
    URL.revokeObjectURL(url);
  },

  importPipeline: (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        get()._pushHistory();
        set({ nodes: data.nodes || [], edges: data.edges || [], pipelineName: data.name || "Imported Pipeline", executionState: {}, executionOutputs: {}, executionResult: null });
        resolve(data.name || "Imported Pipeline");
      } catch (err) { reject(new Error("Invalid JSON file")); }
    };
    reader.readAsText(file);
  }),
}));