//nodes/allNodes.js
import { useState, useEffect, useRef } from "react";
import { BaseNode, NodeField, NodeSelect, NodeTextarea } from "./BaseNode";
import { useStore } from "../store";

// ─── Input Node ───────────────────────────────────────────────────────────────

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.inputName || id.replace("customInput-", "input_")
  );
  const [inputType, setInputType] = useState(data?.inputType || "Text");
  const [value, setValue] = useState(data?.value || "");
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Input"
      color="#10b981"
      inputs={[]}
      outputs={[{ id: "value", label: "value" }]}
    >
      <NodeField
        label="Name"
        value={currName}
        onChange={(e) => {
          setCurrName(e.target.value);
          updateNodeField(id, "inputName", e.target.value);
        }}
      />
      <NodeSelect
        label="Type"
        value={inputType}
        onChange={(e) => {
          setInputType(e.target.value);
          updateNodeField(id, "inputType", e.target.value);
        }}
        options={[
          { value: "Text", label: "Text" },
          { value: "File", label: "File" },
        ]}
      />
      <NodeField
        label="Value"
        value={value}
        placeholder="Enter input value..."
        onChange={(e) => {
          setValue(e.target.value);
          updateNodeField(id, "value", e.target.value);
        }}
      />
    </BaseNode>
  );
};

// ─── Output Node ──────────────────────────────────────────────────────────────

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace("customOutput-", "output_")
  );
  const [outputType, setOutputType] = useState(data?.outputType || "Text");
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Output"
      color="#ef4444"
      inputs={[{ id: "value", label: "value" }]}
      outputs={[]}
    >
      <NodeField
        label="Name"
        value={currName}
        onChange={(e) => {
          setCurrName(e.target.value);
          updateNodeField(id, "outputName", e.target.value);
        }}
      />
      <NodeSelect
        label="Type"
        value={outputType}
        onChange={(e) => {
          setOutputType(e.target.value);
          updateNodeField(id, "outputType", e.target.value);
        }}
        options={[
          { value: "Text", label: "Text" },
          { value: "File", label: "File" },
          { value: "Image", label: "Image" },
        ]}
      />
    </BaseNode>
  );
};

// ─── Text Node ────────────────────────────────────────────────────────────────

const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

export const TextNode = ({ id, data }) => {
  const [text, setText] = useState(data?.text || "{{input}}");
  const [variables, setVariables] = useState([]);
  const updateNodeField = useStore((s) => s.updateNodeField);
  const textareaRef = useRef(null);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value);
    updateNodeField(id, "text", e.target.value);
  };

  const dynamicWidth = Math.max(200, Math.min(500, 200 + text.length * 1.5));

  return (
    <BaseNode
      id={id}
      title="Text"
      color="#f59e0b"
      inputs={variables}
      outputs={[{ id: "output", label: "output" }]}
      style={{ minWidth: dynamicWidth }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Type text... use {{variable}} to create inputs"
        style={{
          width: "100%",
          minHeight: "60px",
          background: "#080c14",
          border: "1px solid #1a2440",
          borderRadius: "7px",
          color: "#e8edf5",
          fontSize: "12px",
          padding: "7px 10px",
          outline: "none",
          boxSizing: "border-box",
          resize: "none",
          overflowY: "hidden",
          fontFamily: "DM Sans, sans-serif",
          lineHeight: "1.5",
        }}
        rows={1}
        onFocus={(e) => {
          e.target.style.borderColor = "#00d4ff50";
          e.target.style.boxShadow = "0 0 0 2px #00d4ff15";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#1a2440";
          e.target.style.boxShadow = "none";
        }}
      />
      {variables.length > 0 && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            color: "#3d5070",
            fontFamily: "Space Mono, monospace",
          }}
        >
          vars: {variables.map((v) => v.label).join(", ")}
        </div>
      )}
    </BaseNode>
  );
};

// ─── API Node ─────────────────────────────────────────────────────────────────

export const APINode = ({ id, data }) => {
  const [url, setUrl] = useState(data?.url || "https://api.example.com");
  const [method, setMethod] = useState(data?.method || "GET");
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="API Call"
      color="#0ea5e9"
      inputs={[{ id: "body", label: "body" }]}
      outputs={[
        { id: "response", label: "response" },
        { id: "status", label: "status" },
      ]}
    >
      <NodeSelect
        label="Method"
        value={method}
        onChange={(e) => {
          setMethod(e.target.value);
          updateNodeField(id, "method", e.target.value);
        }}
        options={[
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
        ]}
      />
      <NodeField
        label="URL"
        value={url}
        placeholder="https://..."
        onChange={(e) => {
          setUrl(e.target.value);
          updateNodeField(id, "url", e.target.value);
        }}
      />
    </BaseNode>
  );
};

// ─── Note Node ────────────────────────────────────────────────────────────────

export const NoteNode = ({ id, data }) => {
  const [note, setNote] = useState(data?.note || "Add a note...");
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Note"
      color="#eab308"
      inputs={[]}
      outputs={[]}
      style={{ minWidth: "180px" }}
    >
      <NodeTextarea
        value={note}
        placeholder="Write a note..."
        onChange={(e) => {
          setNote(e.target.value);
          updateNodeField(id, "note", e.target.value);
        }}
        style={{ minHeight: "70px" }}
      />
    </BaseNode>
  );
};

// ─── Condition Node ───────────────────────────────────────────────────────────

export const ConditionNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || "len(value) > 0");
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Condition"
      color="#8b5cf6"
      inputs={[{ id: "input", label: "input" }]}
      outputs={[
        { id: "true", label: "true" },
        { id: "false", label: "false" },
      ]}
    >
      <NodeField
        label="Condition"
        value={condition}
        placeholder="e.g. value > 0"
        onChange={(e) => {
          setCondition(e.target.value);
          updateNodeField(id, "condition", e.target.value);
        }}
      />
    </BaseNode>
  );
};

// ─── Transform Node ───────────────────────────────────────────────────────────

export const TransformNode = ({ id, data }) => {
  const [transform, setTransform] = useState(data?.transform || "uppercase");
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Transform"
      color="#f97316"
      inputs={[{ id: "input", label: "input" }]}
      outputs={[{ id: "output", label: "output" }]}
    >
      <NodeSelect
        label="Operation"
        value={transform}
        onChange={(e) => {
          setTransform(e.target.value);
          updateNodeField(id, "transform", e.target.value);
        }}
        options={[
          { value: "uppercase", label: "Uppercase" },
          { value: "lowercase", label: "Lowercase" },
          { value: "trim", label: "Trim Whitespace" },
          { value: "parse_json", label: "Parse JSON" },
          { value: "stringify", label: "Stringify" },
        ]}
      />
    </BaseNode>
  );
};

// ─── Merge Node ───────────────────────────────────────────────────────────────

export const MergeNode = ({ id, data }) => {
  const [separator, setSeparator] = useState(data?.separator || "\\n");
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Merge"
      color="#ec4899"
      inputs={[
        { id: "input1", label: "input 1" },
        { id: "input2", label: "input 2" },
        { id: "input3", label: "input 3" },
      ]}
      outputs={[{ id: "merged", label: "merged" }]}
    >
      <NodeField
        label="Separator"
        value={separator}
        placeholder="e.g. , or \n"
        onChange={(e) => {
          setSeparator(e.target.value);
          updateNodeField(id, "separator", e.target.value);
        }}
      />
    </BaseNode>
  );
};