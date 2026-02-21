// nodes/inputNode.js
import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect } from './BaseNode';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = useState(data?.inputType || 'Text');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="🟢 Input"
      color="#10b981"
      inputs={[]}
      outputs={[{ id: 'value', label: 'value' }]}
    >
      <NodeField
        label="Name"
        value={currName}
        onChange={(e) => {
          setCurrName(e.target.value);
          updateNodeField(id, 'inputName', e.target.value);
        }}
      />
      <NodeSelect
        label="Type"
        value={inputType}
        onChange={(e) => {
          setInputType(e.target.value);
          updateNodeField(id, 'inputType', e.target.value);
        }}
        options={[
          { value: 'Text', label: 'Text' },
          { value: 'File', label: 'File' },
        ]}
      />
    </BaseNode>
  );
};