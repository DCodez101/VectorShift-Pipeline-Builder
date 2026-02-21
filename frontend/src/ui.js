// ui.js
import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

// Original nodes
import { InputNode }  from './nodes/inputNode';
import { LLMNode }    from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode }   from './nodes/textNode';

// New nodes
import { APINode, NoteNode, ConditionNode, TransformNode, MergeNode } from './nodes/customNodes';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

// Register ALL node types here — adding a new node = 1 line
const nodeTypes = {
  customInput:  InputNode,
  llm:          LLMNode,
  customOutput: OutputNode,
  text:         TextNode,
  api:          APINode,
  note:         NoteNode,
  condition:    ConditionNode,
  transform:    TransformNode,
  merge:        MergeNode,
};

const selector = (state) => ({
  nodes:         state.nodes,
  edges:         state.edges,
  getNodeID:     state.getNodeID,
  addNode:       state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect:     state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { nodes, edges, getNodeID, addNode, onNodesChange, onEdgesChange, onConnect } =
    useStore(selector, shallow);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const raw = event?.dataTransfer?.getData('application/reactflow');
      if (!raw) return;

      const { nodeType: type } = JSON.parse(raw);
      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const nodeID = getNodeID(type);
      addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
    },
    [addNode, getNodeID, reactFlowInstance]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100vw', height: '70vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType='smoothstep'
      >
        <Background color="#1e293b" gap={gridSize} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const colors = {
              customInput: '#10b981', llm: '#6366f1', customOutput: '#ef4444',
              text: '#f59e0b', api: '#0ea5e9', note: '#eab308',
              condition: '#8b5cf6', transform: '#f97316', merge: '#ec4899',
            };
            return colors[n.type] || '#334155';
          }}
          style={{ background: '#0f172a' }}
        />
      </ReactFlow>
    </div>
  );
};