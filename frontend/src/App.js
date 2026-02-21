// App.js
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import './index.css';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      {/* Top bar with logo + toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        {/* Logo area */}
        <div style={{
          padding: '0 24px',
          borderRight: '1px solid var(--border)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}>⚡</div>
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '0.5px',
          }}>VectorShift</span>
        </div>

        {/* Toolbar */}
        <PipelineToolbar />
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <PipelineUI />
      </div>

      {/* Bottom bar with submit */}
      <div style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <SubmitButton />
      </div>
    </div>
  );
}

export default App;