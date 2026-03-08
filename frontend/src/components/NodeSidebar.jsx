import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, ExternalLink, Loader2, PlayCircle, BookOpen, Clock, Youtube, FileText, AlertCircle, Check } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function NodeSidebar({ node, username, isCompleted, onClose, onUpdate }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [expandLoading, setExpandLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [resources, setResources] = useState([]);
  const [loadingRes, setLoadingRes] = useState(false);

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

  const handleExpandUI = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      if (resources.length === 0) {
        setLoadingRes(true);
        try {
          const res = await axios.get(`${API_BASE}/nodes/${node.id}/resources`, {
            params: { username }
          });
          console.log("DEBUG: Resources received:", res.data);
          setResources(res.data);
        } catch (err) {
          console.error("Failed to fetch resources", err);
        } finally {
          setLoadingRes(false);
        }
      }
    } else {
      setIsExpanded(false);
    }
  };

  const toggleResource = async (e, resourceUrl) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.post(`${API_BASE}/nodes/${node.id}/toggle-resource`, null, {
        params: { username, resource_url: resourceUrl }
      });
      // Update local state to show change instantly
      setResources(prev => prev.map(r => 
        r.url === resourceUrl ? { ...r, is_completed: res.data.is_completed } : r
      ));
    } catch (err) {
      console.error("Failed to toggle resource", err);
    }
  };

  const handleGraphExpand = async () => {
    setExpandLoading(true);
    try {
      await axios.post(`${API_BASE}/nodes/${node.id}/expand`);
      onUpdate();
    } catch (err) {
      console.error("Failed to expand nodes", err);
    } finally {
      setExpandLoading(false);
    }
  };

  return (
    <div className={`absolute top-24 right-6 bottom-6 bg-[#fdfaf3] border border-[#dee2e6] rounded-2xl shadow-xl z-20 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'left-6 w-auto' : 'w-[420px]'} animate-in slide-in-from-right`}>
      <div className="p-8 border-b border-[#dee2e6] flex justify-between items-start bg-white/50 backdrop-blur-sm">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Topic Overview</span>
          <h3 className="text-3xl font-regular tracking-tight text-slate-900 mt-2 serif">{node.title}</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className={`grid transition-all duration-500 ${isExpanded ? 'grid-cols-2 gap-16' : 'grid-cols-1 gap-12'}`}>
          {/* Left Column: Description & Main Buttons */}
          <div className="space-y-10">
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-[0.15em]">Description</h4>
              <p className="text-slate-800 leading-relaxed text-lg font-light">
                {node.description}
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-[0.15em]">Management</h4>
              <div className="flex gap-4">
                <button
                  onClick={handleExpandUI}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all border ${
                    isExpanded 
                      ? "bg-slate-900 text-white border-slate-900" 
                      : "bg-white text-slate-900 border-slate-200 hover:border-slate-900 shadow-sm"
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {isExpanded ? "Hide Details" : "Expand Details"}
                </button>

                <button
                  onClick={toggleComplete}
                  disabled={actionLoading}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-3 rounded-xl font-medium transition-all shadow-sm ${
                    isCompleted 
                      ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" 
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isCompleted ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {isCompleted ? "Reset Path" : "Complete Topic"}
                    </>
                  )}
                </button>
              </div>
              
              {!isExpanded && (
                <button
                  onClick={handleGraphExpand}
                  disabled={expandLoading}
                  className="w-full py-3 text-[11px] text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest font-bold"
                >
                  {expandLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explore sub-topics"}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Learning Resources (only visible when expanded) */}
          {isExpanded && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
              {loadingRes ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
                  <p className="animate-pulse">Curating the best resources for you...</p>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Youtube className="w-5 h-5 text-slate-800" />
                      </div>
                      Video Learning
                    </h4>
                    <div className="space-y-6">
                      {resources.filter(r => r.type?.toLowerCase() === 'video').map((res, i) => (
                        <div className="relative group/card">
                            <a 
                            key={i} 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`block p-6 border rounded-xl transition-all overflow-hidden ${
                                res.is_completed 
                                ? "bg-slate-50 border-slate-200" 
                                : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-400 shadow-sm"
                            }`}
                            >
                            <div className="flex justify-between items-start mb-3">
                                <h5 className={`font-medium transition-colors ${
                                    res.is_completed ? "text-slate-400 line-through" : "text-slate-900 group-hover/card:text-slate-600"
                                }`}>{res.title}</h5>
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                                res.is_alive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                                }`}>
                                {res.is_alive ? 'Available' : 'Possible Link Issue'}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{res.description}</p>
                            </a>
                            <button 
                                onClick={(e) => toggleResource(e, res.url)}
                                className={`absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border bg-white flex items-center justify-center transition-all z-10 shadow-sm hover:scale-110 ${
                                    res.is_completed 
                                    ? "border-emerald-500 text-emerald-500 opacity-100" 
                                    : "border-slate-200 text-slate-300 opacity-0 group-hover/card:opacity-100"
                                }`}
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                      ))}
                      {resources.filter(r => r.type.toLowerCase() === 'video').length === 0 && (
                        <p className="text-slate-500 italic text-sm">No video resources found for this topic.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-800" />
                      </div>
                      Reading Materials
                    </h4>
                    <div className="space-y-6">
                      {resources.filter(r => r.type?.toLowerCase() !== 'video').map((res, i) => (
                        <div className="relative group/card">
                            <a 
                            key={i} 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`block p-6 border rounded-xl transition-all overflow-hidden ${
                                res.is_completed 
                                ? "bg-slate-50 border-slate-200" 
                                : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-400 shadow-sm"
                            }`}
                            >
                            <h5 className={`font-medium transition-colors mb-3 ${
                                res.is_completed ? "text-slate-400 line-through" : "text-slate-900 group-hover/card:text-slate-600"
                            }`}>{res.title}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{res.description}</p>
                            </a>
                            <button 
                                onClick={(e) => toggleResource(e, res.url)}
                                className={`absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border bg-white flex items-center justify-center transition-all z-10 shadow-sm hover:scale-110 ${
                                    res.is_completed 
                                    ? "border-emerald-500 text-emerald-500 opacity-100" 
                                    : "border-slate-200 text-slate-300 opacity-0 group-hover/card:opacity-100"
                                }`}
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                      ))}
                      {resources.filter(r => r.type.toLowerCase() !== 'video').length === 0 && (
                        <p className="text-slate-500 italic text-sm">No articles found for this topic.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
