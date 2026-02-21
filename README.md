# VectorShift Pipeline Builder

A drag-and-drop AI pipeline editor built with React and FastAPI.

## Features
- Drag and drop nodes onto a canvas
- 9 node types: Input, Output, LLM, Text, API, Note, Condition, Transform, Merge
- Dynamic Text node with {{variable}} handle generation
- Auto-resizing Text node
- DAG validation via FastAPI backend

## Tech Stack
- React, ReactFlow, Zustand
- FastAPI, Python

## How to Run

**Frontend:**
cd frontend
npm install
npm start

**Backend:**
cd backend
pip install fastapi uvicorn
python -m uvicorn main:app --reload