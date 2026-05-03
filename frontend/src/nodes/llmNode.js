// nodes/llmNode.js
import { useState } from "react";
import { BaseNode, NodeSelect, NodeSlider, NodeField, NodeTextarea } from "./BaseNode";
import { useStore } from "../store";

const GROQ_MODELS = [
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (fast)" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (smart)" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { value: "gemma2-9b-it", label: "Gemma 2 9B" },
];

export const LLMNode = ({ id, data }) => {
  const [model, setModel] = useState(data?.model || "llama-3.1-8b-instant");
  const [temperature, setTemperature] = useState(data?.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(data?.maxTokens || 512);
  const [systemPrompt, setSystemPrompt] = useState(
    data?.systemPrompt || "You are a helpful assistant."
  );
  const updateNodeField = useStore((s) => s.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="LLM"
      color="#6366f1"
      inputs={[
        { id: "system", label: "system" },
        { id: "prompt", label: "prompt" },
      ]}
      outputs={[{ id: "response", label: "response" }]}
    >
      <NodeSelect
        label="Model"
        value={model}
        onChange={(e) => {
          setModel(e.target.value);
          updateNodeField(id, "model", e.target.value);
        }}
        options={GROQ_MODELS}
      />
      <NodeSlider
        label="Temperature"
        value={temperature}
        min={0}
        max={1}
        step={0.1}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          setTemperature(v);
          updateNodeField(id, "temperature", v);
        }}
      />
      <NodeField
        label="Max Tokens"
        value={maxTokens}
        type="number"
        onChange={(e) => {
          const v = parseInt(e.target.value);
          setMaxTokens(v);
          updateNodeField(id, "maxTokens", v);
        }}
      />
      <NodeTextarea
        label="System Prompt"
        value={systemPrompt}
        placeholder="You are a helpful assistant."
        onChange={(e) => {
          setSystemPrompt(e.target.value);
          updateNodeField(id, "systemPrompt", e.target.value);
        }}
        style={{ minHeight: "52px" }}
      />
    </BaseNode>
  );
};