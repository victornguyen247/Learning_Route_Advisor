# Debugging Guide for hackAI2026

This guide provides instructions on how to debug and troubleshoot the `hackAI2026` project, covering both the FastAPI backend and React frontend.

---

## Backend (FastAPI)

The backend is built with FastAPI and uses SQLModel for database interactions.

### 1. Running the Server Locally
Make sure you are in the `backend` directory. If you are seeing "externally-managed-environment" errors, you may need to recreate your virtual environment:

```bash
cd backend
# Remove old venv if it's broken
rm -rf venv
# Create a fresh one
python3 -m venv venv
```

Activate the environment:
```bash
source venv/bin/activate  # On macOS/Linux
```

Install the dependencies using the venv's pip:
```bash
./venv/bin/pip install -r requirements.txt
```

Start the server with `uvicorn`:
```bash
python3 -m uvicorn app.main:app --reload
```
The `--reload` flag ensures the server restarts whenever you make changes to the code.

### 2. Interactive API Documentation (Swagger)
FastAPI provides a built-in interactive UI to test your endpoints:
- Go to: [http://localhost:8000/docs](http://localhost:8000/docs)
- You can trigger requests and see the exact JSON response and error messages.

### 3. Database Inspection
The app uses SQLite (`learning_advisor.db`).
- Use a tool like **DB Browser for SQLite** or the VS Code extension **SQLite Viewer** to inspect the tables (`user`, `routemap`, `node`, `userprogress`).
- If you need to reset the database, you can delete the `.db` file, and it will be recreated on the next startup.

### 4. Common Backend Issues
- **Missing Environment Variables**: Check that `.env` exists in the `backend/` root and contains your `ANTHROPIC_API_KEY`.
- **Port Conflict**: If port 8000 is taken, use `uvicorn app.main:app --reload --port 8001`.

---

## Frontend (React + Vite)

The frontend is a React application powered by Vite and Tailwind CSS.

### 1. Running the Dev Server
From the `frontend` directory:
```bash
cd frontend
npm install  # If you haven't already
npm run dev
```
By default, this runs on [http://localhost:5173](http://localhost:5173).

### 2. Browser Developer Tools
- **Console**: Check for JavaScript errors or failed network requests (CORS issues, 404s).
- **Network Tab**: Ensure requests to `http://localhost:8000` are succeeding. Look at the "Response" tab for detailed error messages from FastAPI.
- **React DevTools**: Highly recommended for inspecting component state and props (e.g., checking if the `nodes` are correctly passed to `ReactFlow`).

### 3. Common Frontend Issues
- **Missing Vite Plugins**: If you see `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@tailwindcss/vite'`, run:
  ```bash
  npm install @tailwindcss/vite@latest --save-dev
  ```
- **Styling Issues**: The project uses **Tailwind CSS**. If styles aren't appearing, ensure `npm run dev` is running.

---

## Troubleshooting Connectivity

If the Frontend cannot talk to the Backend:

1. **Verify Backend Status**: Open [http://localhost:8000/docs](http://localhost:8000/docs). If it doesn't load, the backend is down.
2. **CORS Errors**: If you see "Blocked by CORS policy" in the browser console, check `backend/app/main.py`. The `CORSMiddleware` configuration should allow the frontend origin.
3. **API URL**: Ensure the frontend is calling the correct URL (usually `http://localhost:8000`).
