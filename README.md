# 🚀 Learning Route Advisor

An elegant, AI-powered platform for generating and tracking personalized learning journeys. Build your own roadmap or discover community paths, all while interacting with an intelligent AI Advisor to guide your growth.

## ✨ Features

- **AI-Generated Roadmaps**: Instantly generate structured learning paths for any goal using Google Gemini.
- **Interactive Mind Map**: Visualize your journey using a dynamic, color-coded ReactFlow canvas.
- **AI Advisor Bot**: A real-time chat agent to explain concepts and suggest resources.
- **Progress Tracking**: Mark nodes as completed, track resource usage, and unlock new levels.
- **Community Discovery**: Search for and clone public roadmaps from other explorers.
- **Elegant Paper Aesthetic**: A premium UI designed with a beige-white "paper note" theme.

## 🛠 Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
- **AI Engine**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **API**: RESTful architecture with automatic Swagger documentation.

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Visuals**: [ReactFlow](https://reactflow.dev/) for interactive mapping.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom design system.
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏃 Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_api_key_here
```
Run the server:
```bash
python3 -m uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔍 Debugging
For detailed troubleshooting, logs, and common issues, please refer to the [DEBUGGING.md](DEBUGGING.md) guide.
