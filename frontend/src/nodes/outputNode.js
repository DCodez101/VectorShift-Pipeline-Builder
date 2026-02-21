// nodes/outputNode.js
import { useState } from 'react';
import { BaseNode, NodeField, NodeSelect } from './BaseNode';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="🔴 Output"
      color="#ef4444"
      inputs={[{ id: 'value', label: 'value' }]}
      outputs={[]}
    >
      <NodeField
        label="Name"
        value={currName}
        onChange={(e) => {
          setCurrName(e.target.value);
          updateNodeField(id, 'outputName', e.target.value);
        }}
      />
      <NodeSelect
        label="Type"
        value={outputType}
        onChange={(e) => {
          setOutputType(e.target.value);
          updateNodeField(id, 'outputType', e.target.value);
        }}
        options={[
          { value: 'Text', label: 'Text' },
          { value: 'File', label: 'File' },
          { value: 'Image', label: 'Image' },
        ]}
      />
    </BaseNode>
  );
};