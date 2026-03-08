import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, ExternalLink, Loader2, PlayCircle, BookOpen, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function NodeSidebar({ node, username, isCompleted, onClose, onUpdate }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [node.id]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/nodes/${node.id}/resources`);
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/nodes/${node.id}/toggle-complete`, null, {
        params: { username }
      });
      onUpdate();
    } catch (err) {
      console.error("Failed to toggle completion", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="absolute top-20 right-4 bottom-4 w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-20 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-800 flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Topic Details</span>
          <h3 className="text-2xl font-bold text-white mt-1">{node.title}</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-tight">Description</h4>
          <p className="text-slate-300 leading-relaxed text-lg">
            {node.description}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-tight">Learning Resources</h4>
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm animate-pulse italic">Claude is researching for you...</p>
             </div>
          ) : (
            <div className="space-y-4">
              {resources.map((res, i) => (
                <a 
                  key={i}
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block p-4 bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-700 group-hover:bg-blue-500/10 rounded-lg group-hover:text-blue-400 transition-colors">
                      {res.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold group-hover:text-blue-400 transition-colors">{res.title}</span>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{res.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-slate-800/50 border-t border-slate-800">
        <button
          onClick={toggleComplete}
          disabled={actionLoading}
          className={`w-full py-4 flex items-center justify-center gap-3 rounded-2xl font-bold transition-all shadow-lg ${
            isCompleted 
              ? "bg-emerald-500 text-white hover:bg-emerald-400" 
              : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              {isCompleted ? "Mark as Incomplete" : "Mark as Finished"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
