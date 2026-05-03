// nodes/BaseNode.js
import { Handle, Position } from "reactflow";
import { useStore } from "../store";

const stateCfg = {
  idle:    { border: "var(--glass-border)",          shadow: "var(--glass-shadow)",                                       badge: null },
  running: { border: "rgba(96,165,250,0.55)",        shadow: "0 0 0 3px rgba(96,165,250,0.18), var(--glass-shadow)",      badge: { color: "#60a5fa", label: "● running" } },
  done:    { border: "rgba(52,211,153,0.55)",        shadow: "0 0 0 3px rgba(52,211,153,0.15), var(--glass-shadow)",      badge: { color: "#34d399", label: "done" } },
  error:   { border: "rgba(248,113,113,0.55)",       shadow: "0 0 0 3px rgba(248,113,113,0.15), var(--glass-shadow)",     badge: { color: "#f87171", label: "error" } },
};

export const BaseNode = ({ id, title, color = "#6366f1", inputs = [], outputs = [], children, style = {} }) => {
  const execState  = useStore((s) => s.executionState[id]  ?? "idle");
  const execOutput = useStore((s) => s.executionOutputs[id]);
  const retryNode  = useStore((s) => s.retryNode);
  const cfg = stateCfg[execState] || stateCfg.idle;

  return (
    <div style={{
      position: "relative", minWidth: "234px",
      background: "var(--glass-bg)",
      backdropFilter: "var(--backdrop)", WebkitBackdropFilter: "var(--backdrop)",
      borderRadius: "16px", fontFamily: "var(--font-body)",
      border: `1px solid ${cfg.border}`,
      boxShadow: cfg.shadow,
      transition: "border-color 0.35s, box-shadow 0.35s",
      animation: execState === "running" ? "pulse-run 1.5s ease-in-out infinite" : "none",
      overflow: "visible",
      ...style,
    }}>
      {/* Color accent bar */}
      <div style={{ height: "2px", background: `linear-gradient(90deg, ${color}dd, ${color}33, transparent)`, borderRadius: "16px 16px 0 0" }} />

      {/* Header */}
      <div style={{ padding: "10px 14px 9px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}99` }} />
          <span style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "12px", letterSpacing: "0.3px" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          {execState === "error" && (
            <button onClick={() => retryNode && retryNode(id)} title="Retry"
              style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "4px", padding: "2px 7px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.22)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
            >↺ retry</button>
          )}
          {cfg.badge && (
            <div style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.7px", textTransform: "uppercase", color: cfg.badge.color, background: `${cfg.badge.color}18`, border: `1px solid ${cfg.badge.color}35`, borderRadius: "5px", padding: "2px 7px" }}>
              {cfg.badge.label}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px" }}>{children}</div>

      {/* Output preview */}
      {execState === "done" && execOutput && (
        <div style={{ margin: "0 12px 12px", padding: "7px 10px", background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: "8px", fontSize: "10px", color: "rgba(52,211,153,0.9)", fontFamily: "var(--font-mono)", maxHeight: "52px", overflow: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: "1.4" }}>
          {execOutput.slice(0, 110)}{execOutput.length > 110 ? "…" : ""}
        </div>
      )}
      {execState === "error" && execOutput && (
        <div style={{ margin: "0 12px 12px", padding: "7px 10px", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.22)", borderRadius: "8px", fontSize: "10px", color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-mono)", maxHeight: "52px", overflow: "hidden", wordBreak: "break-all", lineHeight: "1.4" }}>
          {execOutput.slice(0, 110)}{execOutput.length > 110 ? "…" : ""}
        </div>
      )}

      {/* Input Handles */}
      {inputs.map((handle, index) => (
        <div key={handle.id}>
          <Handle type="target" position={Position.Left} id={`${id}-${handle.id}`}
            style={{ top: `${((index + 1) / (inputs.length + 1)) * 100}%`, background: color, width: 10, height: 10, border: "2px solid var(--bg-base)", left: -5, boxShadow: `0 0 7px ${color}77` }} />
          <div style={{ position: "absolute", left: 12, top: `calc(${((index + 1) / (inputs.length + 1)) * 100}% - 8px)`, fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.7px", textTransform: "uppercase", pointerEvents: "none" }}>
            {handle.label}
          </div>
        </div>
      ))}

      {/* Output Handles */}
      {outputs.map((handle, index) => (
        <div key={handle.id}>
          <Handle type="source" position={Position.Right} id={`${id}-${handle.id}`}
            style={{ top: `${((index + 1) / (outputs.length + 1)) * 100}%`, background: color, width: 10, height: 10, border: "2px solid var(--bg-base)", right: -5, boxShadow: `0 0 7px ${color}77` }} />
          <div style={{ position: "absolute", right: 12, top: `calc(${((index + 1) / (outputs.length + 1)) * 100}% - 8px)`, fontSize: "8px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.7px", textTransform: "uppercase", textAlign: "right", pointerEvents: "none" }}>
            {handle.label}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Shared field styles ─────────────────────────────────────────────────── */
const lbl = { display: "block", color: "var(--text-muted)", fontSize: "9px", marginBottom: "5px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "var(--font-mono)" };
const base = { width: "100%", background: "rgba(0,0,0,0.18)", border: "1px solid var(--glass-border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "12px", padding: "7px 10px", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-body)", transition: "border-color 0.2s, box-shadow 0.2s" };
const onFocus = (e) => { e.target.style.borderColor = "rgba(110,231,247,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(110,231,247,0.1)"; };
const onBlur  = (e) => { e.target.style.borderColor = "var(--glass-border)"; e.target.style.boxShadow = "none"; };

export const NodeField = ({ label, value, onChange, placeholder = "", type = "text" }) => (
  <div style={{ marginBottom: "10px" }}>
    {label && <label style={lbl}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} onFocus={onFocus} onBlur={onBlur} />
  </div>
);

export const NodeSlider = ({ label, value, min = 0, max = 1, step = 0.1, onChange }) => (
  <div style={{ marginBottom: "10px" }}>
    {label && <div style={{ ...lbl, display: "flex", justifyContent: "space-between" }}><span>{label}</span><span style={{ color: "var(--accent-primary)" }}>{parseFloat(value).toFixed(1)}</span></div>}
    <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} style={{ width: "100%", accentColor: "var(--accent-primary)", cursor: "pointer", marginTop: "4px" }} />
  </div>
);

export const NodeSelect = ({ label, value, onChange, options = [] }) => (
  <div style={{ marginBottom: "10px" }}>
    {label && <label style={lbl}>{label}</label>}
    <select value={value} onChange={onChange} style={{ ...base, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23445577' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" }} onFocus={onFocus} onBlur={onBlur}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export const NodeTextarea = ({ label, value, onChange, placeholder = "", style: s = {} }) => (
  <div style={{ marginBottom: "10px" }}>
    {label && <label style={lbl}>{label}</label>}
    <textarea value={value} onChange={onChange} placeholder={placeholder} style={{ ...base, resize: "none", lineHeight: "1.6", ...s }} onFocus={onFocus} onBlur={onBlur} />
  </div>
);