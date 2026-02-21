// nodes/textNode.js
// Includes Part 3 logic:
//   1. Auto-resize width/height as text grows
//   2. Detects {{variable}} patterns and creates dynamic input handles

import { useState, useEffect, useRef } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

// Regex to find all valid JS variable names inside {{ }}
const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

export const TextNode = ({ id, data }) => {
  const [text, setText] = useState(data?.text || '{{input}}');
  const [variables, setVariables] = useState([]);
  const updateNodeField = useStore((s) => s.updateNodeField);
  const textareaRef = useRef(null);

  // ── Extract {{variables}} from text ─────────────────────────────────────
  useEffect(() => {
    const matches = [];
    const seen = new Set();
    let match;
    VAR_REGEX.lastIndex = 0;
    while ((match = VAR_REGEX.exec(text)) !== null) {
      const name = match[1];
      if (!seen.has(name)) {
        seen.add(name);
        matches.push({ id: name, label: name });
      }
    }
    setVariables(matches);
  }, [text]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value);
    updateNodeField(id, 'text', e.target.value);
  };

  // Node width grows slightly with text length
  const dynamicWidth = Math.max(200, Math.min(500, 200 + text.length * 1.5));

  return (
    <BaseNode
      id={id}
      title="📝 Text"
      color="#f59e0b"
      inputs={variables}          // ← dynamic handles from {{variables}}
      outputs={[{ id: 'output', label: 'output' }]}
      style={{ minWidth: dynamicWidth }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Type text... use {{variable}} to create inputs"
        style={{
          width: '100%',
          minHeight: '60px',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '6px',
          color: '#e2e8f0',
          fontSize: '12px',
          padding: '6px 8px',
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'none',
          overflowY: 'hidden',
          fontFamily: 'Inter, monospace',
          lineHeight: '1.5',
        }}
        rows={1}
      />
      {variables.length > 0 && (
        <div style={{ marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
          Variables: {variables.map((v) => v.label).join(', ')}
        </div>
      )}
    </BaseNode>
  );
};