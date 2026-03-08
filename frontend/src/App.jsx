import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import MapCanvas from './components/MapCanvas';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/${user}/progress`);
      setProgress(res.data);
    } catch (err) {
      console.error("Error fetching progress", err);
    }
  };

  const handleOnboardingComplete = (route) => {
    setCurrentRoute(route);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden">
      {!user || !currentRoute ? (
        <Onboarding 
          onSuccess={(username, route) => {
            setUser(username);
            localStorage.setItem('username', username);
            setCurrentRoute(route);
          }} 
        />
      ) : (
        <div className="h-screen w-full relative">
          <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-slate-800/50 backdrop-blur-md border-b border-slate-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {currentRoute.goal}
            </h1>
            <div className="flex items-center gap-4">
               <span className="text-slate-400">User: {user}</span>
               <button 
                onClick={() => {
                  setUser(null);
                  setCurrentRoute(null);
                  localStorage.removeItem('username');
                }}
                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
               >
                 Switch Goal
               </button>
            </div>
          </header>
          
          <MapCanvas 
            routeId={currentRoute.id} 
            username={user} 
            progress={progress} 
            onProgressUpdate={fetchProgress}
          />
        </div>
      )}
    </div>
  );
}

export default App;
