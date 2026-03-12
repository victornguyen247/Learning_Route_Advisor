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
- **AI Engine**: [Google Gemini 2.5 Flash,Google Gemini 3 pro](https://ai.google.dev/)
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

## 📖 How to Use

### 1. Create Your First Roadmap
When you log in for the first time, you'll be greeted by the Onboarding screen. Simply describe what you want to learn (e.g., "I want to become a Full-Stack Web Developer" or "Learn the basics of Machine Learning"). Our AI will generate a personalized roadmap customized to your goals.

<img width="1147" height="698" alt="Screenshot 2026-03-12 at 10 29 59 AM" src="https://github.com/user-attachments/assets/540af59c-a307-40d7-b502-8f83cc33a914" />
<img width="1148" height="694" alt="Screenshot 2026-03-12 at 10 31 01 AM" src="https://github.com/user-attachments/assets/3fd2cc2b-6c0d-423b-b2f5-4b37e68d204d" />



### 2. Navigate the Interactive Mind Map
Your generated learning path is displayed as a beautiful, interactive node graph. 
- **Zoom & Pan**: Use your mouse or trackpad to explore the canvas.
- **Node Status**: Nodes represent topics. Gray nodes are locked until you complete prerequisites. Blue nodes are ready to learn. Green nodes are completed.

<img width="1149" height="694" alt="Screenshot 2026-03-12 at 10 44 39 AM" src="https://github.com/user-attachments/assets/5030eee6-c252-402b-bb54-32231f657f86" />


### 3. Expand Topics
If a topic is broad, click **"Expand"** in the sidebar. The AI will break it down into smaller, more manageable sub-topics and dynamically add them to your map, allowing you to dive as deep as you need into specific concepts.

<img width="1147" height="693" alt="Screenshot 2026-03-12 at 10 35 31 AM" src="https://github.com/user-attachments/assets/b23c580c-d50c-4728-884e-6cccf8585515" />


### 4. Discover Learning Resources
Clicking on any unlocked node opens the **Resource Sidebar**. The AI automatically curates the best web resources (YouTube videos, official documentation, articles) specifically tailored to that node's topic. You can also add your own custom resources.

<img width="1148" height="693" alt="Screenshot 2026-03-12 at 10 37 45 AM" src="https://github.com/user-attachments/assets/c542bcb3-cee6-4610-8404-07fca4c57e4c" />


### 5. Chat with the AI Advisor
Stuck on a concept? Need curriculum advice? Click the **Chat window** in the bottom right corner to talk directly to your personalized Learning Advisor AI. It has context on your current goal and can guide you through difficult topics.

<img width="1148" height="694" alt="Screenshot 2026-03-12 at 10 38 26 AM" src="https://github.com/user-attachments/assets/5f0d22eb-b55d-4b55-9c73-8ab747a91781" />


### 6. Explore Community Maps
Looking for inspiration? Use the top navigation bar to search for other users by username. You can view their public roadmaps and hit the **Clone** button to copy their learning journey to your own dashboard.

<img width="1148" height="697" alt="Screenshot 2026-03-12 at 10 39 19 AM" src="https://github.com/user-attachments/assets/ab009195-dd22-4ff5-b047-c7615a69627d" />


---

## 🔍 Debugging
For detailed troubleshooting, logs, and common issues, please refer to the [DEBUGGING.md](DEBUGGING.md) guide.
