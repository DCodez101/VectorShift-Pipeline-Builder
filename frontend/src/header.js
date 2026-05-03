// header.js
import { useState, useEffect, useRef } from "react";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";
import { DraggableNode } from "./draggableNode";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const EXAMPLE_PIPELINES = [
  {
    name: "Sentiment Analyser", slug: "example-sentiment",
    nodes: [
      { id: "customInput-1", type: "customInput", position: { x: 60, y: 160 }, data: { inputName: "text", value: "I absolutely love this product!" } },
      { id: "text-1", type: "text", position: { x: 320, y: 100 }, data: { text: "Analyse the sentiment of this text and respond with POSITIVE, NEGATIVE, or NEUTRAL followed by a brief explanation:\n\n{{text}}" } },
      { id: "llm-1", type: "llm", position: { x: 740, y: 100 }, data: { model: "llama-3.1-8b-instant", temperature: 0.3, maxTokens: 200, systemPrompt: "You are a sentiment analysis expert. Be concise." } },
      { id: "customOutput-1", type: "customOutput", position: { x: 1060, y: 160 }, data: { outputName: "sentiment" } },
    ],
    edges: [
      { id: "e1", source: "customInput-1", target: "text-1", sourceHandle: "customInput-1-value", targetHandle: "text-1-text", type: "smoothstep", animated: true },
      { id: "e2", source: "text-1", target: "llm-1", sourceHandle: "text-1-output", targetHandle: "llm-1-prompt", type: "smoothstep", animated: true },
      { id: "e3", source: "llm-1", target: "customOutput-1", sourceHandle: "llm-1-response", targetHandle: "customOutput-1-value", type: "smoothstep", animated: true },
    ],
  },
  {
    name: "Text Transformer", slug: "example-transform",
    nodes: [
      { id: "customInput-1", type: "customInput", position: { x: 60, y: 160 }, data: { inputName: "raw_text", value: "  Hello World! This is a test.  " } },
      { id: "transform-1", type: "transform", position: { x: 320, y: 100 }, data: { transform: "trim" } },
      { id: "transform-2", type: "transform", position: { x: 560, y: 100 }, data: { transform: "uppercase" } },
      { id: "customOutput-1", type: "customOutput", position: { x: 820, y: 160 }, data: { outputName: "result" } },
    ],
    edges: [
      { id: "e1", source: "customInput-1", target: "transform-1", sourceHandle: "customInput-1-value", targetHandle: "transform-1-input", type: "smoothstep", animated: true },
      { id: "e2", source: "transform-1", target: "transform-2", sourceHandle: "transform-1-output", targetHandle: "transform-2-input", type: "smoothstep", animated: true },
      { id: "e3", source: "transform-2", target: "customOutput-1", sourceHandle: "transform-2-output", targetHandle: "customOutput-1-value", type: "smoothstep", animated: true },
    ],
  },
  {
    name: "Translation Chain", slug: "example-translate",
    nodes: [
      { id: "customInput-1", type: "customInput", position: { x: 60, y: 160 }, data: { inputName: "english_text", value: "The quick brown fox jumps over the lazy dog." } },
      { id: "text-1", type: "text", position: { x: 300, y: 80 }, data: { text: "Translate the following English text to Spanish:\n\n{{english_text}}" } },
      { id: "llm-1", type: "llm", position: { x: 720, y: 80 }, data: { model: "llama-3.1-8b-instant", temperature: 0.2, maxTokens: 300, systemPrompt: "You are a professional translator. Output only the translation, no explanations." } },
      { id: "customOutput-1", type: "customOutput", position: { x: 1040, y: 160 }, data: { outputName: "spanish" } },
    ],
    edges: [
      { id: "e1", source: "customInput-1", target: "text-1", sourceHandle: "customInput-1-value", targetHandle: "text-1-english_text", type: "smoothstep", animated: true },
      { id: "e2", source: "text-1", target: "llm-1", sourceHandle: "text-1-output", targetHandle: "llm-1-prompt", type: "smoothstep", animated: true },
      { id: "e3", source: "llm-1", target: "customOutput-1", sourceHandle: "llm-1-response", targetHandle: "customOutput-1-value", type: "smoothstep", animated: true },
    ],
  },
  {
    name: "Text Summarizer", slug: "example-summarize",
    nodes: [
      { id: "customInput-1", type: "customInput", position: { x: 60, y: 160 }, data: { inputName: "long_text", value: "Artificial intelligence is transforming industries worldwide. From healthcare to finance, AI systems are being deployed to automate tasks, identify patterns, and make predictions that were previously impossible." } },
      { id: "text-1", type: "text", position: { x: 320, y: 80 }, data: { text: "Summarize the following text in 2-3 sentences:\n\n{{long_text}}" } },
      { id: "llm-1", type: "llm", position: { x: 740, y: 80 }, data: { model: "llama-3.1-8b-instant", temperature: 0.3, maxTokens: 150, systemPrompt: "You are a concise summarizer. Output only the summary." } },
      { id: "customOutput-1", type: "customOutput", position: { x: 1060, y: 160 }, data: { outputName: "summary" } },
    ],
    edges: [
      { id: "e1", source: "customInput-1", target: "text-1", sourceHandle: "customInput-1-value", targetHandle: "text-1-long_text", type: "smoothstep", animated: true },
      { id: "e2", source: "text-1", target: "llm-1", sourceHandle: "text-1-output", targetHandle: "llm-1-prompt", type: "smoothstep", animated: true },
      { id: "e3", source: "llm-1", target: "customOutput-1", sourceHandle: "llm-1-response", targetHandle: "customOutput-1-value", type: "smoothstep", animated: true },
    ],
  },
];

const NODES = [
  { type: "customInput", label: "Input", color: "#10b981", icon: "→" },
  { type: "llm", label: "LLM", color: "#6366f1", icon: "◈" },
  { type: "customOutput", label: "Output", color: "#ef4444", icon: "←" },
  { type: "text", label: "Text", color: "#f59e0b", icon: "T" },
  { type: "api", label: "API", color: "#0ea5e9", icon: "⚡" },
  { type: "note", label: "Note", color: "#eab308", icon: "✎" },
  { type: "condition", label: "Condition", color: "#8b5cf6", icon: "?" },
  { type: "transform", label: "Transform", color: "#f97316", icon: "⚙" },
  { type: "merge", label: "Merge", color: "#ec4899", icon: "⊕" },
];

const glass = {
  background: "var(--glass-bg)",
  backdropFilter: "var(--backdrop)",
  WebkitBackdropFilter: "var(--backdrop)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

export const Header = () => {
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [nodeSearch, setNodeSearch] = useState("");
  const importRef = useRef(null);

  const { pipelineName, savePipeline, loadPipeline, setPipelineName, clearCanvas,
    undo, redo, canUndo, canRedo, exportPipeline, importPipeline, toggleTheme, theme } =
    useStore((s) => ({
      pipelineName: s.pipelineName, savePipeline: s.savePipeline,
      loadPipeline: s.loadPipeline, setPipelineName: s.setPipelineName,
      clearCanvas: s.clearCanvas, undo: s.undo, redo: s.redo,
      canUndo: s.canUndo, canRedo: s.canRedo, exportPipeline: s.exportPipeline,
      importPipeline: s.importPipeline, toggleTheme: s.toggleTheme, theme: s.theme,
    }), shallow);

  useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && e.key === "s") { e.preventDefault(); handleSave(); }
      if (ctrl && e.key === "e") { e.preventDefault(); exportPipeline(); }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) setShowShortcuts((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, exportPipeline, handleSave]);

  const handleSave = async () => {
    const result = await savePipeline();
    if (result) {
      setShareUrl(`${window.location.origin}/p/${result.slug}`);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importPipeline(file);
      setShareUrl(null);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    } catch (err) { alert("Failed to import: " + err.message); }
    e.target.value = "";
  };

  const filteredNodes = NODES.filter((n) => n.label.toLowerCase().includes(nodeSearch.toLowerCase()));

  return (
    <>
      <div style={{ ...glass, display: "flex", alignItems: "center", borderBottom: "1px solid var(--glass-border)", borderRadius: 0, height: "60px", flexShrink: 0, position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ padding: "0 20px", borderRight: "1px solid var(--glass-border)", height: "60px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: "8px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", boxShadow: "0 4px 16px rgba(110,231,247,0.3)" }}>⚡</div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "0.5px" }}>FlowForge</span>
        </div>

        {/* Node toolbar */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 12px", gap: "6px", overflowX: "auto" }}>
          <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "1.5px", textTransform: "uppercase", marginRight: "2px", flexShrink: 0 }}>NODES</span>
          <input value={nodeSearch} onChange={(e) => setNodeSearch(e.target.value)} placeholder="Filter…"
            style={{ height: "28px", width: "72px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)", borderRadius: "7px", color: "var(--text-primary)", fontSize: "11px", padding: "0 8px", outline: "none", fontFamily: "var(--font-body)", flexShrink: 0, transition: "width 0.2s" }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(110,231,247,0.4)"; e.target.style.width = "100px"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--glass-border)"; if (!nodeSearch) e.target.style.width = "72px"; }}
          />
          {filteredNodes.map((node) => (
            <DraggableNode key={node.type} type={node.type} label={node.label} icon={node.icon} color={node.color} />
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "0 12px", borderLeft: "1px solid var(--glass-border)", flexShrink: 0 }}>
          <IconBtn onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)" label="↩" />
          <IconBtn onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)" label="↪" />
          <div style={{ width: 1, height: 22, background: "var(--glass-border)", margin: "0 3px" }} />

          {editingName ? (
            <input autoFocus value={pipelineName} onChange={(e) => setPipelineName(e.target.value)}
              onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(110,231,247,0.35)", borderRadius: "7px", color: "var(--text-primary)", fontSize: "12px", padding: "5px 10px", fontFamily: "var(--font-body)", outline: "none", width: "140px" }} />
          ) : (
            <button onClick={() => setEditingName(true)}
              style={{ background: "transparent", border: "1px solid var(--glass-border)", borderRadius: "7px", color: "var(--text-secondary)", fontSize: "12px", padding: "5px 10px", cursor: "pointer", fontFamily: "var(--font-body)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--glass-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              title="Rename">{pipelineName}</button>
          )}

          <HBtn onClick={() => setShowLoadModal(true)} color="var(--accent-secondary)" label="Load" />
          <HBtn onClick={handleSave} color="var(--accent-green)" label="Save" title="Ctrl+S" />
          <HBtn onClick={exportPipeline} color="var(--accent-blue)" label="Export" title="Ctrl+E" />
          <HBtn onClick={() => importRef.current?.click()} color="var(--accent-amber)" label="Import" />
          <HBtn onClick={clearCanvas} color="var(--accent-red)" label="Clear" />
          <IconBtn onClick={toggleTheme} title="Toggle theme" label={theme === "dark" ? "☀" : "◑"} />
          <IconBtn onClick={() => setShowShortcuts(true)} title="Shortcuts (?)" label="⌨" />
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
        </div>
      </div>

      {/* Toast */}
      {showSaveToast && (
        <div style={{ position: "fixed", top: "68px", right: "20px", ...glass, borderRadius: "10px", background: "rgba(52,211,153,0.15)", borderColor: "rgba(52,211,153,0.3)", padding: "10px 16px", fontSize: "12px", fontWeight: "600", color: "#34d399", zIndex: 2000, display: "flex", gap: "10px", alignItems: "center", animation: "fadeIn 0.2s ease" }}>
          ✓ {shareUrl ? "Saved!" : "Imported!"}
          {shareUrl && (
            <button onClick={() => navigator.clipboard.writeText(shareUrl).catch(() => {})}
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "5px", color: "#34d399", fontSize: "10px", padding: "2px 8px", cursor: "pointer" }}>
              Copy URL
            </button>
          )}
        </div>
      )}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {showLoadModal && <LoadModal onClose={() => setShowLoadModal(false)} onLoad={(p) => { loadPipeline(p); setShowLoadModal(false); }} />}
    </>
  );
};

const HBtn = ({ onClick, color, label, title }) => (
  <button onClick={onClick} title={title}
    style={{ height: "30px", padding: "0 11px", borderRadius: "7px", background: "transparent", border: `1px solid ${color}40`, color, fontSize: "11px", fontWeight: "600", fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
    onMouseEnter={(e) => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}70`; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${color}40`; }}
  >{label}</button>
);

const IconBtn = ({ onClick, disabled, title, label }) => (
  <button onClick={onClick} disabled={disabled} title={title}
    style={{ width: "30px", height: "30px", borderRadius: "7px", background: "transparent", border: "1px solid var(--glass-border)", color: disabled ? "var(--text-muted)" : "var(--text-secondary)", fontSize: "14px", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "var(--glass-bg-hover)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
  >{label}</button>
);

const GlassModal = ({ children, onClose, width = "380px" }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
    <div onClick={(e) => e.stopPropagation()} style={{ ...glass, borderRadius: "20px", padding: "28px", width, maxWidth: "92vw", maxHeight: "85vh", overflow: "auto", animation: "fadeIn 0.2s ease" }}>
      {children}
    </div>
  </div>
);

const ShortcutsModal = ({ onClose }) => (
  <GlassModal onClose={onClose}>
    <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>Keyboard Shortcuts</div>
    {[["Ctrl + Z", "Undo"], ["Ctrl + Y / Ctrl+Shift+Z", "Redo"], ["Ctrl + S", "Save"], ["Ctrl + E", "Export JSON"], ["Delete / Backspace", "Delete selected"], ["?", "Toggle shortcuts"]].map(([k, d]) => (
      <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--glass-border)" }}>
        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: "rgba(110,231,247,0.08)", border: "1px solid rgba(110,231,247,0.2)", borderRadius: "5px", padding: "3px 9px", color: "var(--accent-primary)" }}>{k}</span>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d}</span>
      </div>
    ))}
    <button onClick={onClose} style={{ marginTop: "20px", width: "100%", height: "36px", borderRadius: "9px", background: "rgba(110,231,247,0.08)", border: "1px solid rgba(110,231,247,0.25)", color: "var(--accent-primary)", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Close</button>
  </GlassModal>
);

const LoadModal = ({ onClose, onLoad }) => {
  const [savedPipelines, setSavedPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const res = await fetch(`${BACKEND_URL}/pipelines`); setSavedPipelines(await res.json()); } catch { setSavedPipelines([]); }
      setLoading(false);
    })();
  }, []);
  const loadSaved = async (slug) => {
    try { const res = await fetch(`${BACKEND_URL}/pipelines/${slug}`); onLoad(await res.json()); } catch { alert("Failed to load."); }
  };
  return (
    <GlassModal onClose={onClose} width="430px">
      <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>Load Pipeline</div>
      <SLabel>Examples</SLabel>
      {EXAMPLE_PIPELINES.map((p) => <PRow key={p.slug} name={p.name} badge="example" color="var(--accent-secondary)" onClick={() => onLoad(p)} />)}
      <SLabel style={{ marginTop: "14px" }}>Saved</SLabel>
      {loading ? <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 0" }}>Loading…</div>
        : savedPipelines.length === 0 ? <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 0" }}>No saved pipelines yet.</div>
        : savedPipelines.map((p) => <PRow key={p.slug} name={p.name} badge={p.slug} color="var(--accent-green)" onClick={() => loadSaved(p.slug)} />)}
      <button onClick={onClose} style={{ marginTop: "18px", width: "100%", height: "36px", borderRadius: "9px", background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
    </GlassModal>
  );
};

const SLabel = ({ children, style }) => (
  <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px", ...style }}>{children}</div>
);

const PRow = ({ name, badge, color, onClick }) => (
  <div onClick={onClick}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", marginBottom: "6px", cursor: "pointer", transition: "all 0.15s" }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--glass-bg-hover)"; e.currentTarget.style.borderColor = "var(--glass-border-bright)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass-bg)"; e.currentTarget.style.borderColor = "var(--glass-border)"; }}
  >
    <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500" }}>{name}</span>
    <span style={{ fontSize: "9px", color, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: "5px", padding: "2px 8px", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{badge}</span>
  </div>
);