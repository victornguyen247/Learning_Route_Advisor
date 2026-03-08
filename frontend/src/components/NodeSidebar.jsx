import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, ExternalLink, Loader2, PlayCircle, BookOpen, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function NodeSidebar({ node, username, isCompleted, onClose, onUpdate }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);

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

  const handleExpand = async () => {
    setExpandLoading(true);
    try {
      await axios.post(`${API_BASE}/nodes/${node.id}/expand`);
      onUpdate();
      alert("Concepts expanded! Check the roadmap.");
    } catch (err) {
      console.error("Failed to expand nodes", err);
      alert("Could not expand concepts. Check if backend is running.");
    } finally {
      setExpandLoading(false);
    }
  };

  return (
    <div className="absolute top-20 right-4 bottom-4 w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-20 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-800 flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Topic Overview</span>
          <h3 className="text-2xl font-bold text-white mt-1">{node.title}</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-tight">Big Picture</h4>
          <p className="text-slate-300 leading-relaxed text-lg">
            {node.description}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-tight">Actions</h4>
          <button
            onClick={handleExpand}
            disabled={expandLoading}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-md group"
          >
            {expandLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Expand Details
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-800/50 border-t border-slate-800">
        <button
          onClick={toggleComplete}
          disabled={actionLoading}
          className={`w-full py-4 flex items-center justify-center gap-3 rounded-2xl font-bold transition-all shadow-lg text-white ${
            isCompleted 
              ? "bg-red-600 hover:bg-red-500 shadow-red-900/20" 
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
          }`}
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isCompleted ? <X className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              Done
            </>
          )}
        </button>
      </div>
    </div>
  );
}
