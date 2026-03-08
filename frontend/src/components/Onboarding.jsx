import React, { useState } from 'react';
import axios from 'axios';
import { Rocket, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function Onboarding({ onSuccess, initialUsername }) {
  const [username, setUsername] = useState(initialUsername || '');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !goal) return;
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/onboarding/`, null, {
        params: { username, goal }
      });
      console.log("DEBUG: Onboarding response data:", res.data);
      onSuccess(username, res.data);
    } catch (err) {
      console.error("Onboarding failed", err);
      alert("Failed to generate route. Please ensure backend is running and Claude API key is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#fdfaf3] paper-texture">
      <div className="w-full max-w-md p-10 bg-white border border-[#dee2e6] rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-700">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-slate-900 rounded-2xl shadow-lg ring-8 ring-slate-50">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-regular tracking-tighter text-slate-900 serif">Start Your Journey</h2>
          <p className="mt-2 text-slate-500 font-light">What do you want to master today?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {!initialUsername && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-[#f8f9fa] border-none rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                placeholder="e.g. Alex"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Learning Goal</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-5 py-4 bg-[#f8f9fa] border-none rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all h-40 resize-none font-medium"
              placeholder="e.g. Fullstack Web Development with Next.js and Tailwind"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Generate Roadmap
                <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
