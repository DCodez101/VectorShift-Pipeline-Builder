// nodes/BaseNode.js
import { Handle, Position } from 'reactflow';

export const BaseNode = ({
  id,
  title,
  color = '#6366f1',
  inputs = [],
  outputs = [],
  children,
  style = {},
}) => {
  return (
    <div style={{
      position: 'relative',
      minWidth: '220px',
      background: '#0e1420',
      border: `1px solid ${color}35`,
      borderRadius: '12px',
      boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 0px ${color}`,
      fontFamily: 'DM Sans, sans-serif',
      overflow: 'visible',
      transition: 'box-shadow 0.2s',
      ...style,
    }}>
      {/* Thin color top line */}
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, ${color}, ${color}00)`,
        borderRadius: '12px 12px 0 0',
      }} />

      {/* Header */}
      <div style={{
        padding: '10px 14px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #1a2440',
      }}>
        {/* Color dot */}
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
        }} />
        <span style={{
          color: '#e8edf5',
          fontWeight: '600',
          fontSize: '12px',
          letterSpacing: '0.3px',
        }}>{title}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        {children}
      </div>

      {/* Input Handles */}
      {inputs.map((handle, index) => (
        <div key={handle.id}>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-${handle.id}`}
            style={{
              top: `${((index + 1) / (inputs.length + 1)) * 100}%`,
              background: color,
              width: 10,
              height: 10,
              border: '2px solid #0e1420',
              left: -5,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
          <div style={{
            position: 'absolute',
            left: 12,
            top: `calc(${((index + 1) / (inputs.length + 1)) * 100}% - 8px)`,
            fontSize: '9px',
            color: '#3d5070',
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}>{handle.label}</div>
        </div>
      ))}

      {/* Output Handles */}
      {outputs.map((handle, index) => (
        <div key={handle.id}>
          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-${handle.id}`}
            style={{
              top: `${((index + 1) / (outputs.length + 1)) * 100}%`,
              background: color,
              width: 10,
              height: 10,
              border: '2px solid #0e1420',
              right: -5,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
          <div style={{
            position: 'absolute',
            right: 12,
            top: `calc(${((index + 1) / (outputs.length + 1)) * 100}% - 8px)`,
            fontSize: '9px',
            color: '#3d5070',
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            textAlign: 'right',
            pointerEvents: 'none',
          }}>{handle.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Shared Field Components ──────────────────────────────────────────────────

const fieldLabel = {
  display: 'block',
  color: '#3d5070',
  fontSize: '9px',
  marginBottom: '5px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontFamily: 'Space Mono, monospace',
};

const fieldBase = {
  width: '100%',
  background: '#080c14',
  border: '1px solid #1a2440',
  borderRadius: '7px',
  color: '#e8edf5',
  fontSize: '12px',
  padding: '7px 10px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export const NodeField = ({ label, value, onChange, placeholder = '' }) => (
  <div style={{ marginBottom: '10px' }}>
    {label && <label style={fieldLabel}>{label}</label>}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={fieldBase}
      onFocus={(e) => {
        e.target.style.borderColor = '#00d4ff50';
        e.target.style.boxShadow = '0 0 0 2px #00d4ff15';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#1a2440';
        e.target.style.boxShadow = 'none';
      }}
    />
  </div>
);

export const NodeSelect = ({ label, value, onChange, options = [] }) => (
  <div style={{ marginBottom: '10px' }}>
    {label && <label style={fieldLabel}>{label}</label>}
    <select
      value={value}
      onChange={onChange}
      style={{ ...fieldBase, cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%233d5070' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '28px',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#00d4ff50';
        e.target.style.boxShadow = '0 0 0 2px #00d4ff15';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#1a2440';
        e.target.style.boxShadow = 'none';
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: '#0e1420' }}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const NodeTextarea = ({ label, value, onChange, placeholder = '', style = {} }) => (
  <div style={{ marginBottom: '10px' }}>
    {label && <label style={fieldLabel}>{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...fieldBase, resize: 'none', lineHeight: '1.5', ...style }}
      onFocus={(e) => {
        e.target.style.borderColor = '#00d4ff50';
        e.target.style.boxShadow = '0 0 0 2px #00d4ff15';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#1a2440';
        e.target.style.boxShadow = 'none';
      }}
    />
  </div>
);