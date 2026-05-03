// ui.js
import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { LLMNode } from './nodes/llmNode';
import { InputNode, OutputNode, TextNode, APINode, NoteNode, ConditionNode, TransformNode, MergeNode } from './nodes/allNodes';
import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  customInput: InputNode, llm: LLMNode, customOutput: OutputNode,
  text: TextNode, api: APINode, note: NoteNode,
  condition: ConditionNode, transform: TransformNode, merge: MergeNode,
};

const nodeColorMap = {
  customInput: '#10b981', llm: '#6366f1', customOutput: '#ef4444',
  text: '#f59e0b', api: '#0ea5e9', note: '#eab308',
  condition: '#8b5cf6', transform: '#f97316', merge: '#ec4899',
};

const CONTEXT_NODES = [
  { type: "customInput", label: "Input", color: "#10b981", icon: "→" },
  { type: "llm", label: "LLM", color: "#6366f1", icon: "◈" },
  { type: "customOutput", label: "Output", color: "#ef4444", icon: "←" },
  { type: "text", label: "Text", color: "#f59e0b", icon: "T" },
  { type: "api", label: "API", color: "#0ea5e9", icon: "⚡" },
  { type: "note", label: "Note", color: "#eab308", icon: "✎" },
  { type: "condition", label: "Condition", color: "#8b5cf6", icon: "?" },
  { type: "transform", label: "Transform", color: "#f97316", icon: "⚙" },
  { type: "merge", label: "Merge", color: "#ec4899", icon: "⊕" },
];

// Connection validation — prevent source→source or target→target
const isValidConnection = (connection) => {
  // Can't connect a node to itself
  if (connection.source === connection.target) return false;
  return true;
};

const selector = (state) => ({
  nodes: state.nodes, edges: state.edges,
  getNodeID: state.getNodeID, addNode: state.addNode,
  onNodesChange: state.onNodesChange, onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const { nodes, edges, getNodeID, addNode, onNodesChange, onEdgesChange, onConnect } =
    useStore(selector, shallow);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const raw = event?.dataTransfer?.getData('application/reactflow');
    if (!raw) return;
    const { nodeType: type } = JSON.parse(raw);
    if (!type) return;
    const position = reactFlowInstance.project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    const nodeID = getNodeID(type);
    addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
  }, [addNode, getNodeID, reactFlowInstance]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const flowPos = reactFlowInstance?.project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    setContextMenu({ x: event.clientX, y: event.clientY, flowX: flowPos?.x ?? 0, flowY: flowPos?.y ?? 0 });
  }, [reactFlowInstance]);

  const addNodeAtContext = useCallback((type) => {
    if (!contextMenu) return;
    const nodeID = getNodeID(type);
    addNode({ id: nodeID, type, position: { x: contextMenu.flowX, y: contextMenu.flowY }, data: { id: nodeID, nodeType: type } });
    setContextMenu(null);
  }, [contextMenu, getNodeID, addNode]);

  const handleConnect = useCallback((connection) => {
    if (!isValidConnection(connection)) {
      setConnectionError("Cannot connect a node to itself.");
      setTimeout(() => setConnectionError(null), 2500);
      return;
    }
    onConnect(connection);
  }, [onConnect]);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'relative' }}
      onClick={() => setContextMenu(null)}>

      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDrop={onDrop} onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={() => setContextMenu(null)}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        isValidConnection={isValidConnection}
        fitView
        deleteKeyCode={["Delete", "Backspace"]}
      >
        <Background color="var(--canvas-dot)" gap={gridSize} variant="dots" />
        <Controls />
        <MiniMap nodeColor={(n) => nodeColorMap[n.type] || '#334155'} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '14px' }} />
      </ReactFlow>

      {/* Connection error toast */}
      {connectionError && (
        <div style={{
          position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(248,113,113,0.12)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(248,113,113,0.3)", borderRadius: "9px",
          padding: "8px 16px", fontSize: "12px", color: "#f87171",
          fontFamily: "var(--font-body)", zIndex: 50, animation: "fadeIn 0.2s ease",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}>{connectionError}</div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: "fixed", left: contextMenu.x, top: contextMenu.y,
          background: "var(--glass-bg)", backdropFilter: "var(--backdrop)", WebkitBackdropFilter: "var(--backdrop)",
          border: "1px solid var(--glass-border)", borderRadius: "14px",
          padding: "6px", zIndex: 999,
          boxShadow: "var(--glass-shadow-lg)", minWidth: "168px",
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "1.5px", textTransform: "uppercase", padding: "5px 10px 7px" }}>Add Node Here</div>
          {CONTEXT_NODES.map((node) => (
            <div key={node.type} onClick={() => addNodeAtContext(node.type)}
              style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", transition: "background 0.12s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--glass-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: "12px", color: node.color, width: "16px", textAlign: "center" }}>{node.icon}</span>
              <span style={{ fontSize: "12px", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{node.label}</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: node.color, marginLeft: "auto", opacity: 0.55, boxShadow: `0 0 5px ${node.color}` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};