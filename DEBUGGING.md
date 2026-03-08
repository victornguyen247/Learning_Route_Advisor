# 🛠 Debugging Guide for Learning Route Advisor

This guide provides deep-dive instructions for troubleshooting, debugging, and maintaining the project.

---

## 🐍 Backend (FastAPI + SQLModel)

### 1. Interactive Docs & Testing
FastAPI automatically generates a Swagger UI. This is your first stop for debugging API logic.
- **URL**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Use Case**: Testing user registration, login, and roadmap generation without using the frontend.

### 2. Database Inspection (SQLite)
The project uses `backend/learning_advisor.db`.
- **SQL Logging**: In `backend/app/models.py`, `echo=True` is enabled. You can see the exact SQL queries being executed in your terminal logs.
- **Resetting Data**: If your database state gets corrupted, simply delete `learning_advisor.db`. It will be recreated with a fresh schema when you restart the server.
- **Tools**: Use [SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer) (VS Code) or [DB Browser for SQLite](https://sqlitebrowser.org/) to view the `node`, `routemap`, and `user` tables.

### 3. AI & LLM Debugging (Gemini)
The backend uses **Google Gemini 2.5 Flash** for roadmap generation and the chat agent.
- **API Key**: Ensure `GEMINI_API_KEY` is set correctly in `backend/.env`.
- **Latency**: Roadmap generation can take 5-10 seconds. Check the backend terminal for logs like `DEBUG: Generating subtree for...`.
- **Chat Context**: The AI Advisor uses `ClaudeService.chat()`. If the advisor gives irrelevant answers, verify the `goal_context` being passed in `backend/app/main.py`.

### 4. Common Backend Errors
- **`404 Not Found`**: Usually happens if a username is passed as `null` or a `node_id` doesn't exist. Check the frontend request logs.
- **`401 Unauthorized`**: Occurs when trying to login with an incorrect password. Note: The app currently uses plain-text password comparison (development only).

---

## ⚛️ Frontend (React + Vite)

### 1. Network Debugging
- **Chrome DevTools (F12)** -> **Network Tab**.
- Look for requests to `http://localhost:8000`. 
- **CORS Issues**: If requests are blocked, ensure `CORSMiddleware` in `main.py` allows your frontend origin (`http://localhost:5173`).

### 2. ReactFlow Visuals
The roadmap uses `MapCanvas.jsx`.
- **Spectral Colors**: Arrows are color-coded by node level using a spectral palette. Logic is in `MapCanvas.jsx`.
- **Node Position**: If nodes overlap, check the `calculateLayout` logic or the `subLevel` offsets.

### 3. UI State (Landing & Profile)
- **Auth Sync**: The `Landing.jsx` component manages local view states (`dashboard`, `profile`, `login`). 
- **Sign Out Fix**: If the app stays on the dashboard after logout, ensure `setView('login')` is called inside the `useEffect` that tracks `initialUser`.

---

## 🏗 Common Troubleshooting Scenarios

### Scenario A: Frontend loads but no maps show up.
1. Check the Network tab. Is `GET /users/{username}/route-maps` returning an empty array?
2. Check the Backend console. Are there SQLite errors?
3. Verify you are logged in with the correct username.

### Scenario B: "+ Clone" button does nothing.
1. Check if the roadmap being cloned is marked as Public (`is_public: true`).
2. Verify the backend console for `IntegrityError` (Unique constraints).

### Scenario C: AI Advisor says "I'm having trouble connecting".
1. Check `backend/.env` for a valid API Key.
2. Ensure the backend is running.
3. Check the backend terminal for `google.api_core.exceptions`.

---

## 📈 Performance Tips
- Use `npm run build` to test the production bundle if the dev server feels slow.
- Keep the `learning_advisor.db` small; excessive node data can slow down initial roadmap loads.
