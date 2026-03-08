# Learning Route Advisor (hackAI2026)

A web application that generates interactive learning roadmaps using the Gemini API.

## Project Structure

- **backend/**: FastAPI server using SQLModel and Google Generative AI.
- **frontend/**: React application built with Vite, Tailwind CSS, and ReactFlow.

## Getting Started

### Backend
1. `cd backend`
2. `python3 -m venv venv`
3. `source venv/bin/activate`
4. `pip3 install -r requirements.txt`
5. `python3 -m uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Debugging
See the detailed [DEBUGGING.md](DEBUGGING.md) file in the root for troubleshooting tips.
