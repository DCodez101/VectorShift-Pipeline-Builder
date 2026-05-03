// bottomBar.js
import { useState } from "react";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const glass = {
  background: "var(--glass-bg)",
  backdropFilter: "var(--backdrop)",
  WebkitBackdropFilter: "var(--backdrop)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

export const BottomBar = () => {
  const [dagResult, setDagResult] = useState(null);
  const [dagLoading, setDagLoading] = useState(false);
  const [execHistory, setExecHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const { nodes, edges, isExecuting, executionResult, executePipeline, executionState } =
    useStore((s) => ({ nodes: s.nodes, edges: s.edges, isExecuting: s.isExecuting, executionResult: s.executionResult, executePipeline: s.executePipeline, executionState: s.executionState }), shallow);

  const handleValidate = async () => {
    setDagLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/pipelines/parse`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nodes: nodes.map((n) => ({ id: n.id })), edges: edges.map((e) => ({ source: e.source, target: e.target })) }) });
      setDagResult(await res.json());
    } catch { setDagResult({ error: "Backend offline" }); }
    setDagLoading(false);
  };

  const handleRun = async () => {
    await executePipeline();
    const result = useStore.getState().executionResult;
    if (result) {
      setExecHistory((prev) => [{ id: Date.now(), time: new Date().toLocaleTimeString(), success: result.success, outputs: result.outputs, error: result.error, nodeCount: nodes.length }, ...prev.slice(0, 9)]);
    }
  };

  const doneCount    = Object.values(executionState).filter((s) => s === "done").length;
  const errorCount   = Object.values(executionState).filter((s) => s === "error").length;
  const runningCount = Object.values(executionState).filter((s) => s === "running").length;

  return (
    <>
      <div style={{ ...glass, borderRadius: 0, borderTop: "1px solid var(--glass-border)", borderBottom: "none", borderLeft: "none", borderRight: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Stat label="Nodes" value={nodes.length} />
          <Stat label="Edges" value={edges.length} />
          {isExecuting && runningCount > 0 && (
            <div style={{ fontSize: "11px", color: "var(--accent-blue)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-blue)", display: "inline-block", animation: "pulse-run 1s infinite" }} />
              executing…
            </div>
          )}
          {!isExecuting && doneCount > 0 && (
            <div style={{ fontSize: "11px", color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
              {doneCount}/{nodes.length} done
              {errorCount > 0 && <span style={{ color: "var(--accent-red)", marginLeft: "8px" }}>{errorCount} error{errorCount > 1 ? "s" : ""}</span>}
            </div>
          )}
          {execHistory.length > 0 && (
            <button onClick={() => setShowHistory(true)}
              style={{ height: "26px", padding: "0 10px", borderRadius: "6px", background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-muted)", fontSize: "9px", fontFamily: "var(--font-mono)", cursor: "pointer", letterSpacing: "0.5px", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--glass-border-bright)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >HISTORY ({execHistory.length})</button>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <ActionBtn onClick={handleValidate} disabled={dagLoading || nodes.length === 0} color="var(--accent-secondary)" label={dagLoading ? "Validating…" : "Validate DAG"} />
          <ActionBtn onClick={handleRun} disabled={isExecuting || nodes.length === 0} color="var(--accent-primary)" label={isExecuting ? "Running…" : "Run Pipeline →"} primary />
        </div>
      </div>

      {dagResult && <ResultModal result={dagResult} onClose={() => setDagResult(null)} />}
      {executionResult && <ExecutionModal result={executionResult} onClose={() => useStore.setState({ executionResult: null })} />}
      {showHistory && <HistoryModal history={execHistory} onClose={() => setShowHistory(false)} />}
    </>
  );
};

const ActionBtn = ({ onClick, disabled, color, label, primary }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ height: "36px", padding: "0 20px", borderRadius: "9px", background: primary ? `${color}14` : "transparent", border: `1px solid ${color}${primary ? "55" : "40"}`, color, fontSize: "12px", fontWeight: "600", fontFamily: "var(--font-body)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, transition: "all 0.15s" }}
    onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.transform = "translateY(-1px)"; } }}
    onMouseLeave={(e) => { e.currentTarget.style.background = primary ? `${color}14` : "transparent"; e.currentTarget.style.transform = "none"; }}
  >{label}</button>
);

const Stat = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>
    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "600", fontFamily: "var(--font-mono)", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "5px", padding: "1px 7px" }}>{value}</span>
  </div>
);

const Modal = ({ children, onClose, width = "380px" }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
    <div onClick={(e) => e.stopPropagation()} style={{ ...glass, borderRadius: "20px", padding: "28px", width, maxWidth: "92vw", maxHeight: "85vh", overflow: "auto", animation: "fadeIn 0.2s ease" }}>
      {children}
    </div>
  </div>
);

const CloseBtn = ({ onClose }) => (
  <button onClick={onClose} style={{ width: "100%", height: "36px", borderRadius: "9px", background: "rgba(110,231,247,0.07)", border: "1px solid rgba(110,231,247,0.22)", color: "var(--accent-primary)", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginTop: "4px" }}>Close</button>
);

const ResultModal = ({ result, onClose }) => {
  if (result.error) return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", textAlign: "center" }}>Validation Error</div>
      <div style={{ color: "var(--accent-red)", fontSize: "13px", textAlign: "center", marginBottom: "20px" }}>{result.error}</div>
      <CloseBtn onClose={onClose} />
    </Modal>
  );
  const { num_nodes, num_edges, is_dag } = result;
  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "2px", textTransform: "uppercase", textAlign: "center", marginBottom: "4px" }}>FlowForge</div>
      <div style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "18px", textAlign: "center" }}>Pipeline Analysis</div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        {[["Nodes", num_nodes, "var(--accent-green)"], ["Edges", num_edges, "var(--accent-secondary)"]].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: c, fontFamily: "var(--font-mono)" }}>{v}</div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "3px" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "14px", borderRadius: "12px", background: is_dag ? "rgba(52,211,153,0.07)" : "rgba(248,113,113,0.07)", border: `1px solid ${is_dag ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`, marginBottom: "18px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: is_dag ? "var(--accent-green)" : "var(--accent-red)", marginBottom: "4px" }}>{is_dag ? "✓  Valid DAG" : "✗  Cycle detected"}</div>
        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{is_dag ? "No cycles. Pipeline is ready to execute." : "Remove circular connections to fix this."}</div>
      </div>
      <CloseBtn onClose={onClose} />
    </Modal>
  );
};

const ExecutionModal = ({ result, onClose }) => {
  if (!result) return null;
  if (!result.success) return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", textAlign: "center" }}>Execution Failed</div>
      <div style={{ color: "var(--accent-red)", fontSize: "12px", fontFamily: "var(--font-mono)", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "9px", padding: "12px", marginBottom: "18px", wordBreak: "break-word" }}>{result.error}</div>
      <CloseBtn onClose={onClose} />
    </Modal>
  );
  const outputs = Object.entries(result.outputs || {});
  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "2px", textTransform: "uppercase", textAlign: "center", marginBottom: "4px" }}>FlowForge</div>
      <div style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", textAlign: "center" }}>Pipeline Complete</div>
      <div style={{ padding: "10px 14px", borderRadius: "9px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.28)", marginBottom: "16px", fontSize: "12px", color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>✓ Executed successfully</div>
      {outputs.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>Outputs</div>
          {outputs.map(([name, value]) => (
            <div key={name} style={{ marginBottom: "8px", padding: "10px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "9px" }}>
              <div style={{ fontSize: "9px", color: "var(--accent-primary)", fontFamily: "var(--font-mono)", marginBottom: "5px", textTransform: "uppercase" }}>{name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: "130px", overflow: "auto" }}>{value || "(empty)"}</div>
            </div>
          ))}
        </div>
      )}
      <CloseBtn onClose={onClose} />
    </Modal>
  );
};

const HistoryModal = ({ history, onClose }) => (
  <Modal onClose={onClose}>
    <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>Execution History</div>
    <div style={{ maxHeight: "380px", overflowY: "auto" }}>
      {history.map((item) => (
        <div key={item.id} style={{ padding: "10px 12px", borderRadius: "10px", marginBottom: "6px", background: item.success ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)", border: `1px solid ${item.success ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: item.success ? "var(--accent-green)" : "var(--accent-red)", fontWeight: "600" }}>{item.success ? "✓ Success" : "✗ Failed"}</span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{item.time}</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
            {item.nodeCount} nodes
            {item.success && item.outputs && Object.keys(item.outputs).length > 0 && <span style={{ marginLeft: "8px", color: "var(--text-muted)" }}>→ {Object.keys(item.outputs).join(", ")}</span>}
            {!item.success && item.error && <span style={{ color: "rgba(248,113,113,0.7)", marginLeft: "8px", fontFamily: "var(--font-mono)", fontSize: "9px" }}>{item.error?.slice(0, 55)}…</span>}
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: "12px" }}><CloseBtn onClose={onClose} /></div>
  </Modal>
);