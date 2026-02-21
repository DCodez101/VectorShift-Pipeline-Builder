// nodes/customNodes.js
// Five new nodes built using BaseNode — each takes ~15 lines to define!

import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect, NodeTextarea } from './BaseNode';
import { useStore } from '../store';

// ─────────────────────────────────────────────────────────────────────────────
// 1. API Node — calls an external HTTP endpoint
// ─────────────────────────────────────────────────────────────────────────────
export const APINode = ({ id, data }) => {
  const [url, setUrl] = useState(data?.url || 'https://api.example.com');
  const [method, setMethod] = useState(data?.method || 'GET');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="🌐 API Call"
      color="#0ea5e9"
      inputs={[{ id: 'body', label: 'body' }]}
      outputs={[
        { id: 'response', label: 'response' },
        { id: 'status', label: 'status' },
      ]}
    >
      <NodeSelect
        label="Method"
        value={method}
        onChange={(e) => { setMethod(e.target.value); updateNodeField(id, 'method', e.target.value); }}
        options={[
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ]}
      />
      <NodeField
        label="URL"
        value={url}
        placeholder="https://..."
        onChange={(e) => { setUrl(e.target.value); updateNodeField(id, 'url', e.target.value); }}
      />
    </BaseNode>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Note Node — a sticky note for leaving comments on the canvas
// ─────────────────────────────────────────────────────────────────────────────
export const NoteNode = ({ id, data }) => {
  const [note, setNote] = useState(data?.note || 'Add a note...');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="🗒️ Note"
      color="#eab308"
      inputs={[]}
      outputs={[]}
      style={{ minWidth: '180px' }}
    >
      <NodeTextarea
        value={note}
        placeholder="Write a note..."
        onChange={(e) => { setNote(e.target.value); updateNodeField(id, 'note', e.target.value); }}
        style={{ minHeight: '70px' }}
      />
    </BaseNode>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Condition Node — if/else branching logic
// ─────────────────────────────────────────────────────────────────────────────
export const ConditionNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || 'value > 0');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="🔀 Condition"
      color="#8b5cf6"
      inputs={[{ id: 'input', label: 'input' }]}
      outputs={[
        { id: 'true', label: 'true ✓' },
        { id: 'false', label: 'false ✗' },
      ]}
    >
      <NodeField
        label="Condition"
        value={condition}
        placeholder="e.g. value > 0"
        onChange={(e) => { setCondition(e.target.value); updateNodeField(id, 'condition', e.target.value); }}
      />
    </BaseNode>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Data Transform Node — applies a transformation to data
// ─────────────────────────────────────────────────────────────────────────────
export const TransformNode = ({ id, data }) => {
  const [transform, setTransform] = useState(data?.transform || 'uppercase');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="⚙️ Transform"
      color="#f97316"
      inputs={[{ id: 'input', label: 'input' }]}
      outputs={[{ id: 'output', label: 'output' }]}
    >
      <NodeSelect
        label="Operation"
        value={transform}
        onChange={(e) => { setTransform(e.target.value); updateNodeField(id, 'transform', e.target.value); }}
        options={[
          { value: 'uppercase', label: 'Uppercase' },
          { value: 'lowercase', label: 'Lowercase' },
          { value: 'trim', label: 'Trim Whitespace' },
          { value: 'parse_json', label: 'Parse JSON' },
          { value: 'stringify', label: 'Stringify' },
        ]}
      />
    </BaseNode>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Merge Node — combines multiple inputs into one output
// ─────────────────────────────────────────────────────────────────────────────
export const MergeNode = ({ id, data }) => {
  const [separator, setSeparator] = useState(data?.separator || '\\n');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="🔗 Merge"
      color="#ec4899"
      inputs={[
        { id: 'input1', label: 'input 1' },
        { id: 'input2', label: 'input 2' },
        { id: 'input3', label: 'input 3' },
      ]}
      outputs={[{ id: 'merged', label: 'merged' }]}
    >
      <NodeField
        label="Separator"
        value={separator}
        placeholder="e.g. , or \n"
        onChange={(e) => { setSeparator(e.target.value); updateNodeField(id, 'separator', e.target.value); }}
      />
    </BaseNode>
  );
};