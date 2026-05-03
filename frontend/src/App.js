// App.js
import { Header } from './header';
import { PipelineUI } from './ui';
import { BottomBar } from './bottomBar';
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
      <Header />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <PipelineUI />
      </div>
      <BottomBar />
    </div>
  );
}

export default App;