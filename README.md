# ⚡ FlowForge — AI Pipeline Builder

> Build, visualize, and execute AI workflows with a drag-and-drop canvas. Connect LLMs, APIs, transformers, and logic nodes into powerful pipelines — and watch them execute in real time.

![FlowForge](https://img.shields.io/badge/FlowForge-AI%20Pipeline%20Builder-6ee7f7?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![Groq](https://img.shields.io/badge/Groq-LLM%20API-f55036?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🌐 Live Demo

**Frontend:** [flowforge-pipeline.vercel.app](https://flowforge-pipeline.vercel.app)  
**Backend API:** [flowforge-api-rmqa.onrender.com](https://flowforge-api-rmqa.onrender.com)

---

## ✨ Features

### 🎨 Visual Pipeline Builder
- Drag-and-drop node canvas powered by React Flow
- 9 node types: Input, Output, LLM, Text, API, Transform, Merge, Condition, Note
- Smart connection handles with validation (prevents invalid connections)
- Right-click context menu to add nodes exactly where you want
- Node search/filter in the toolbar
- Minimap for navigation on large pipelines

### ⚡ Real-Time Execution
- Full pipeline execution via FastAPI backend
- **Server-Sent Events (SSE) streaming** — watch each node execute live
- Topological sort (Kahn's algorithm) ensures correct execution order
- DAG validation — detects cycles before execution
- Per-node visual states: idle → running (pulse) → done (green) → error (red)
- Output preview directly on each node after execution

### 🤖 LLM Integration
- Powered by **Groq API** (ultra-fast inference)
- 4 models: Llama 3.1 8B, Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B
- Configurable temperature, max tokens, and system prompt per node
- Graceful fallback to mock responses if API key is not set

### 💾 Save & Load
- Save pipelines to backend with a shareable slug URL
- Load from 4 built-in example pipelines (Sentiment Analyser, Text Transformer, Translation Chain, Text Summarizer)
- Export pipeline as JSON file
- Import pipeline from JSON file
- **Persistent storage** — saved pipelines survive backend restarts

### 🎛️ Power User Features
- **Undo/Redo** with 50-step history (Ctrl+Z / Ctrl+Y)
- **Keyboard shortcuts** (Ctrl+S save, Ctrl+E export, ? for shortcuts panel)
- **Dark/Light theme** toggle with animated glassmorphism design
- **Execution history** — last 10 runs with timestamps and outputs
- **Error recovery** — retry button on failed nodes without re-running the full pipeline
- Delete nodes/edges with Delete or Backspace key

### 🎨 UI Design
- Glassmorphism aesthetic with `backdrop-filter` frosted panels
- Animated mesh gradient background
- Custom fonts: Outfit (body) + JetBrains Mono (labels)
- Fully themed CSS variables for instant dark/light switching
- Glowing node handles and accent bars

---

## 🏗️ Architecture

```
FlowForge/
├── backend/               # FastAPI Python backend
│   ├── main.py            # API routes + pipeline execution engine
│   ├── pipelines.json     # Persistent pipeline storage
│   └── requirements.txt
└── frontend/              # React frontend
    └── src/
        ├── nodes/
        │   ├── BaseNode.js      # Shared glassmorphism node component
        │   ├── llmNode.js       # LLM node with Groq models
        │   └── allNodes.js      # Input, Output, Text, API, Transform, etc.
        ├── store.js             # Zustand state (undo/redo, execution, import/export)
        ├── header.js            # Toolbar + shortcuts + load/save modals
        ├── bottomBar.js         # Run/Validate + execution history
        ├── ui.js                # ReactFlow canvas + context menu
        ├── draggableNode.js     # Draggable toolbar nodes
        └── index.css            # Glassmorphism theme + dark/light variables
```

---

## 🔧 How It Works

### Pipeline Execution Engine
1. Frontend sends nodes + edges to `POST /pipelines/execute`
2. Backend runs **Kahn's topological sort** to determine execution order
3. Each node executes in order — outputs flow into downstream node inputs
4. Results stream back via **Server-Sent Events** in real time
5. Frontend updates node states live as events arrive

### Node Types
| Node | Purpose |
|------|---------|
| **Input** | Entry point — provides a value to the pipeline |
| **LLM** | Calls Groq API with configurable model + prompt |
| **Text** | Template with `{{variable}}` interpolation |
| **Transform** | uppercase, lowercase, trim, parse JSON, stringify |
| **API** | HTTP GET/POST/PUT/DELETE to any endpoint |
| **Condition** | Routes to `true` or `false` branch based on expression |
| **Merge** | Combines multiple inputs with a configurable separator |
| **Output** | Collects final pipeline result |
| **Note** | Documentation node (no execution) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 16+
- Python 3.9+
- A free [Groq API key](https://console.groq.com)

### Backend
```bash
cd backend
pip install -r requirements.txt

# Set your Groq API key
# Windows:
set GROQ_API_KEY=your_key_here
# Mac/Linux:
export GROQ_API_KEY=your_key_here

uvicorn main:app --reload
# API running at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env

npm start
# App running at http://localhost:3000
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/pipelines/parse` | Validate DAG, count nodes/edges |
| `POST` | `/pipelines/execute` | Execute pipeline (SSE stream) |
| `POST` | `/pipelines/save` | Save pipeline, returns slug |
| `GET` | `/pipelines` | List all saved pipelines |
| `GET` | `/pipelines/{slug}` | Load a saved pipeline |
| `DELETE` | `/pipelines/{slug}` | Delete a pipeline |

---

## ☁️ Deployment

### Frontend — Vercel
1. Connect GitHub repo to Vercel
2. Set Root Directory: `frontend`
3. Add environment variable: `REACT_APP_BACKEND_URL=https://your-render-url.onrender.com`
4. Deploy

### Backend — Render
1. New Web Service → connect GitHub repo
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `GROQ_API_KEY=your_key_here`
6. Deploy

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Flow, Zustand |
| Styling | CSS Variables, Glassmorphism, Custom animations |
| Backend | FastAPI, Python 3.11 |
| AI | Groq API (Llama 3, Mixtral, Gemma) |
| Streaming | Server-Sent Events (SSE) |
| Algorithms | Kahn's Topological Sort, DFS cycle detection |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📝 Resume Bullets

```
• Built FlowForge, a full-stack AI pipeline builder with React + FastAPI featuring
  real-time SSE streaming execution, topological sort DAG engine, and Groq LLM integration

• Implemented undo/redo history stack, JSON export/import, persistent storage,
  glassmorphism UI with dark/light theming, and per-node error recovery with retry
```

---

## 📄 License

MIT © 2026 — Built with ⚡ by Darshana Krishna
