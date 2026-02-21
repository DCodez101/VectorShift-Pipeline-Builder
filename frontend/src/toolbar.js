// toolbar.js
import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
  const nodes = [
    { type: 'customInput',  label: 'Input',     color: '#10b981', icon: '→' },
    { type: 'llm',          label: 'LLM',       color: '#6366f1', icon: '🤖' },
    { type: 'customOutput', label: 'Output',    color: '#ef4444', icon: '←' },
    { type: 'text',         label: 'Text',      color: '#f59e0b', icon: 'T' },
    { type: 'api',          label: 'API',       color: '#0ea5e9', icon: '⚡' },
    { type: 'note',         label: 'Note',      color: '#eab308', icon: '📌' },
    { type: 'condition',    label: 'Condition', color: '#8b5cf6', icon: '?' },
    { type: 'transform',    label: 'Transform', color: '#f97316', icon: '⚙' },
    { type: 'merge',        label: 'Merge',     color: '#ec4899', icon: '⊕' },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '8px',
      height: '64px',
      overflowX: 'auto',
    }}>
      <span style={{
        fontSize: '10px',
        color: 'var(--text-muted)',
        fontFamily: 'Space Mono, monospace',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        marginRight: '4px',
        flexShrink: 0,
      }}>
        Nodes
      </span>
      {nodes.map((node) => (
        <DraggableNode
          key={node.type}
          type={node.type}
          label={node.label}
          icon={node.icon}
          color={node.color}
        />
      ))}
    </div>
  );
};