// submit.js
import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

export const SubmitButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { nodes, edges } = useStore(
    (state) => ({ nodes: state.nodes, edges: state.edges }),
    shallow
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map((n) => ({ id: n.id })),
          edges: edges.map((e) => ({ source: e.source, target: e.target })),
        }),
      });

      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Could not connect to backend. Is it running on port 8000?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bottom bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Stat label="Nodes" value={nodes.length} />
          <Stat label="Edges" value={edges.length} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            height: '38px',
            padding: '0 28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00d4ff22, #3b82f622)',
            border: '1px solid #00d4ff50',
            color: '#00d4ff',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #00d4ff35, #3b82f635)';
              e.currentTarget.style.boxShadow = '0 0 20px #00d4ff20';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #00d4ff22, #3b82f622)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? 'Running...' : 'Run Pipeline →'}
        </button>
      </div>

      {result && <ResultModal result={result} onClose={() => setResult(null)} />}
    </>
  );
};

// ─── Result Modal ─────────────────────────────────────────────────────────────

const ResultModal = ({ result, onClose }) => {
  if (result.error) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '20px' }}>{result.error}</div>
          <CloseBtn onClose={onClose} />
        </div>
      </Overlay>
    );
  }

  const { num_nodes, num_edges, is_dag } = result;

  return (
    <Overlay onClose={onClose}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#3d5070', fontFamily: 'Space Mono, monospace', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
          Pipeline Analysis
        </div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#e8edf5' }}>
          Results
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <StatCard label="Nodes" value={num_nodes} color="#10b981" />
        <StatCard label="Edges" value={num_edges} color="#6366f1" />
      </div>

      <div style={{
        padding: '16px',
        borderRadius: '10px',
        background: is_dag ? '#10b98112' : '#ef444412',
        border: `1px solid ${is_dag ? '#10b98140' : '#ef444440'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '28px' }}>{is_dag ? '✅' : '❌'}</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: is_dag ? '#10b981' : '#ef4444' }}>
            {is_dag ? 'Valid DAG' : 'Not a DAG — cycle detected'}
          </div>
          <div style={{ fontSize: '11px', color: '#7a8fad', marginTop: '3px' }}>
            {is_dag
              ? 'No cycles found. Pipeline is ready to run.'
              : 'Remove circular connections to fix this.'}
          </div>
        </div>
      </div>

      <CloseBtn onClose={onClose} />
    </Overlay>
  );
};

const Overlay = ({ children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: '#0e1420',
        border: '1px solid #1a2440',
        borderRadius: '16px',
        padding: '28px',
        width: '340px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        animation: 'fadeSlideIn 0.2s ease',
      }}
    >
      {children}
    </div>
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div style={{
    flex: 1,
    padding: '16px',
    borderRadius: '10px',
    background: `${color}10`,
    border: `1px solid ${color}30`,
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '28px', fontWeight: '700', color, fontFamily: 'Space Mono, monospace' }}>
      {value}
    </div>
    <div style={{ fontSize: '10px', color: '#7a8fad', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
      {label}
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{
      fontSize: '10px',
      color: 'var(--text-muted)',
      fontFamily: 'Space Mono, monospace',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    }}>{label}</span>
    <span style={{
      fontSize: '13px',
      color: 'var(--text-primary)',
      fontWeight: '600',
      fontFamily: 'Space Mono, monospace',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '1px 8px',
    }}>{value}</span>
  </div>
);

const CloseBtn = ({ onClose }) => (
  <button
    onClick={onClose}
    style={{
      width: '100%',
      height: '38px',
      borderRadius: '8px',
      background: '#00d4ff18',
      border: '1px solid #00d4ff40',
      color: '#00d4ff',
      fontSize: '13px',
      fontWeight: '600',
      fontFamily: 'DM Sans, sans-serif',
      cursor: 'pointer',
      letterSpacing: '0.5px',
    }}
  >
    Close
  </button>
);