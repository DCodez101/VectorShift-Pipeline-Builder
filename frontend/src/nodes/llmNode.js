// nodes/llmNode.js
import { useState } from 'react';
import { BaseNode, NodeSelect } from './BaseNode';
import { useStore } from '../store';

export const LLMNode = ({ id, data }) => {
  const [model, setModel] = useState(data?.model || 'gpt-4o');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="🤖 LLM"
      color="#6366f1"
      inputs={[
        { id: 'system', label: 'system' },
        { id: 'prompt', label: 'prompt' },
      ]}
      outputs={[{ id: 'response', label: 'response' }]}
    >
      <NodeSelect
        label="Model"
        value={model}
        onChange={(e) => {
          setModel(e.target.value);
          updateNodeField(id, 'model', e.target.value);
        }}
        options={[
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'claude-3-opus', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
        ]}
      />
    </BaseNode>
  );
};