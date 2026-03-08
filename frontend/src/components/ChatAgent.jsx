import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function ChatAgent({ goalContext }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hi! I'm your Learning Advisor. I'm here to help you master "${goalContext}". What's on your mind?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE}/chat`, {
                messages: [...messages, userMsg],
                goal_context: goalContext
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to my knowledge base. Could you try again in a moment?" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-start">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-lg border relative z-50 ${
                    isOpen 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20' 
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-900 shadow-sm'
                }`}
            >
                {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5 text-blue-500" />}
                <span>{isOpen ? 'Close Advisor' : 'Ask Advisor'}</span>
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                )}
            </button>

            {/* Chat Container */}
            <div className={`mt-4 w-96 bg-white border border-[#dee2e6] rounded-[2rem] shadow-2xl transition-all duration-500 origin-top overflow-hidden flex flex-col ${
                isOpen ? 'max-h-[500px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 pointer-events-none'
            }`}>
                {/* Header */}
                <div className="p-5 border-b border-[#f1f3f5] bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-none">AI Advisor</h3>
                            <span className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Online</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#fdfaf3]/40 scrollbar-hide min-h-[300px]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm transition-all animate-in slide-in-from-bottom-2 duration-300 ${
                                msg.role === 'user' 
                                ? 'bg-slate-900 text-white rounded-tr-none' 
                                : 'bg-white border border-[#e9ecef] text-slate-800 rounded-tl-none'
                            }`}>
                                <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase font-bold">
                                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                    {msg.role === 'user' ? 'You' : 'Advisor'}
                                </div>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-[#e9ecef] p-4 rounded-2xl rounded-tl-none shadow-sm animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#f1f3f5] flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a concept..."
                        className="flex-1 px-4 py-3 bg-[#f8f9fa] border-none rounded-xl text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
