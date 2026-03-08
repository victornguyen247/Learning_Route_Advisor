import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rocket, Sparkles, LogIn, Plus, BookOpen, User as UserIcon, Loader2, ArrowRight, Trash2, Key, UserPlus, Fingerprint, LogOut, Settings, Save, X, Globe, Lock, Eye, EyeOff, Hash, Copy, Search, Linkedin } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function Landing({ onLogin, onStartNew, onLogout, initialUser }) {
  const [username, setUsername] = useState(initialUser || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [socialLink, setSocialLink] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [userProfile, setUserProfile] = useState(null);
  const [existingMaps, setExistingMaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(initialUser ? 'dashboard' : 'login'); // 'login', 'register', 'dashboard', 'profile'
  
  // Custom Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, routeId: null, goal: '' });
  
  // Search & Clone State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [authError, setAuthError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    if (initialUser) {
        fetchUserData(initialUser);
        setView('dashboard');
    } else {
        setView('login');
        setUserProfile(null);
        setExistingMaps([]);
    }
  }, [initialUser]);

  const fetchUserData = async (uname) => {
    setLoading(true);
    try {
        const [profileRes, mapsRes] = await Promise.all([
            axios.get(`${API_BASE}/users/${uname}`),
            axios.get(`${API_BASE}/users/${uname}/route-maps`)
        ]);
        setUserProfile(profileRes.data);
        setExistingMaps(mapsRes.data);
        setFirstName(profileRes.data.first_name || '');
        setLastName(profileRes.data.last_name || '');
        setLinkedin(profileRes.data.linkedin || '');
        setSocialLink(profileRes.data.social_link || '');
    } catch (err) {
        console.error("Failed to fetch user data", err);
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoading(true);
    setAuthError('');
    try {
      await axios.post(`${API_BASE}/login`, null, {
        params: { username, password }
      });
      await fetchUserData(username);
      setView('dashboard');
      onLogin(username);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Login failed", err);
      setAuthError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    if (!username || !password || !firstName || !lastName) return;

    setLoading(true);
    setAuthError('');
    setRegSuccess(false);
    try {
      await axios.post(`${API_BASE}/register`, null, {
        params: { 
            username, 
            password, 
            first_name: firstName, 
            last_name: lastName,
            linkedin: linkedin || undefined,
            social_link: socialLink || undefined
        }
      });
      setRegSuccess(true);
      setTimeout(() => {
          setView('login');
          setRegSuccess(false);
          setPassword(''); 
          setConfirmPassword('');
      }, 1500);
    } catch (err) {
      console.error("Registration failed", err);
      setAuthError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    setLoading(true);
    try {
        const res = await axios.put(`${API_BASE}/users/${username}`, null, {
            params: {
                first_name: firstName,
                last_name: lastName,
                linkedin: linkedin || undefined,
                social_link: socialLink || undefined,
                password: password || undefined
            }
        });
        setUserProfile(res.data);
        alert("Profile updated successfully!");
        setView('dashboard');
        setPassword('');
        setConfirmPassword('');
    } catch (err) {
        console.error("Update failed", err);
        alert("Failed to update profile");
    } finally {
        setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearching(true);
    setSearchError('');
    setSearchResults(null);
    try {
        const res = await axios.get(`${API_BASE}/users/search/${searchQuery}`);
        setSearchResults(res.data);
    } catch (err) {
        setSearchError(err.response?.status === 404 ? "User does not exist" : "Failed to search");
    } finally {
        setSearching(false);
    }
  };

  const handleClone = async (routeId) => {
    setLoading(true);
    try {
        await axios.post(`${API_BASE}/route-maps/${routeId}/clone`, null, {
            params: { current_username: username }
        });
        alert("Route map cloned successfully!");
        // Refresh maps
        const mapsRes = await axios.get(`${API_BASE}/users/${username}/route-maps`);
        setExistingMaps(mapsRes.data);
        setSearchResults(null);
        setSearchQuery('');
    } catch (err) {
        console.error("Clone failed", err);
        alert("Failed to clone map");
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteMap = (e, map) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, routeId: map.id, goal: map.goal });
  };

  const confirmDelete = async () => {
    const { routeId } = deleteConfirm;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/route-maps/${routeId}`);
      setExistingMaps(prev => prev.filter(m => m.id !== routeId));
      setDeleteConfirm({ show: false, routeId: null, goal: '' });
    } catch (err) {
      console.error("Failed to delete map", err);
      alert("Failed to delete the map.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (e, routeId) => {
    e.stopPropagation();
    console.log("DEBUG: Toggling visibility for map:", routeId);
    try {
      const res = await axios.post(`${API_BASE}/route-maps/${routeId}/toggle-visibility`);
      console.log("DEBUG: New visibility status:", res.data.is_public);
      setExistingMaps(prev => prev.map(m => m.id == routeId ? { ...m, is_public: res.data.is_public } : m));
    } catch (err) {
      console.error("Failed to toggle visibility", err);
    }
  };

  if (view === 'login' || view === 'register') {
      return (
        <div className="min-h-screen bg-[#fdfaf3] flex items-center justify-center p-6 paper-texture">
          <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-[#dee2e6] shadow-2xl p-10 space-y-10">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-[#f1f3f5] rounded-2xl shadow-lg ring-8 ring-white">
                  <Sparkles className="w-8 h-8 text-slate-900" />
                </div>
                <h1 className="text-4xl font-regular tracking-tighter text-slate-900 serif">Roadmap Advisor</h1>
                <p className="text-slate-500 font-light">Your journey, elegantly mapped.</p>
              </div>

              {view === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  {authError && (
                      <div className="flex items-center justify-center gap-2 text-red-500 font-bold uppercase tracking-tighter text-[10px] animate-in slide-in-from-top-2 duration-300 mb-2">
                          <X className="w-3 h-3" />
                          {authError}
                      </div>
                  )}
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Username" 
                      className="w-full bg-[#f8f9fa] border border-transparent rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input 
                      type={showPass ? "text" : "password"}
                      placeholder="Password" 
                      className={`w-full bg-[#f8f9fa] border rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                          authError 
                          ? 'border-red-500 ring-4 ring-red-500/10' 
                          : 'border-transparent focus:ring-slate-200'
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {view === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  {(authError || regSuccess) && (
                      <div className={`flex items-center justify-center gap-2 font-bold uppercase tracking-tighter text-[10px] animate-in slide-in-from-top-2 duration-300 mb-2 ${
                          regSuccess ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                          {regSuccess ? <Sparkles className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {regSuccess ? "Registration Successful!" : authError}
                      </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                      <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-4 bg-[#f8f9fa] border border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                          placeholder="First Name"
                          required
                      />
                      <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-4 bg-[#f8f9fa] border border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                          placeholder="Last Name"
                          required
                      />
                  </div>
                  
                  <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full px-4 py-4 bg-[#f8f9fa] border rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium ${
                          authError && authError.toLowerCase().includes('username')
                          ? 'border-red-500 ring-4 ring-red-500/10'
                          : regSuccess 
                            ? 'border-emerald-500 ring-4 ring-emerald-500/10 text-emerald-600'
                            : 'border-transparent focus:ring-slate-200'
                      }`}
                      placeholder="Username (Alex123)"
                      required
                  />

                  <div className="relative group">
                      <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-4 py-4 bg-[#f8f9fa] border rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium ${
                              regSuccess 
                              ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                              : 'border-transparent focus:ring-slate-200'
                          }`}
                          placeholder="Secure Password"
                          required
                      />
                      <button 
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-900"
                      >
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                  </div>

                  <div className="relative group">
                      <input
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-4 bg-[#f8f9fa] border rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium ${
                               regSuccess 
                               ? 'border-emerald-500 ring-4 ring-emerald-500/10' 
                               : 'border-transparent focus:ring-slate-200'
                          }`}
                          placeholder="Confirm Password"
                          required
                      />
                      <button 
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-900"
                      >
                          {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || regSuccess}
                    className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg mt-2 ${
                        regSuccess 
                        ? 'bg-emerald-500 text-white shadow-emerald-900/20' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : regSuccess ? (
                        <>
                            Welcome Aboard!
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </>
                    ) : (
                      <>
                        Create Account
                        <Plus className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-6 border-t border-[#dee2e6] text-center">
                {view === 'login' ? (
                  <button 
                      onClick={() => setView('register')}
                      className="text-slate-500 hover:text-slate-900 font-bold transition-colors flex items-center gap-2 mx-auto"
                  >
                      <UserPlus className="w-4 h-4" />
                      Create New Account
                  </button>
                ) : (
                  <button 
                      onClick={() => setView('login')}
                      className="text-slate-500 hover:text-slate-900 font-bold transition-colors"
                  >
                      Already have an account? Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
  }

  if (view === 'profile') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#fdfaf3]">
            <div className="w-full max-w-md p-8 bg-white border border-[#dee2e6] rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
                        <p className="mt-2 text-slate-500 font-medium">Update your account settings</p>
                    </div>
                    <button 
                        onClick={() => setView('dashboard')}
                        className="p-2 bg-[#f1f3f5] text-slate-500 hover:text-slate-900 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-4 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-4 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">LinkedIn URL</label>
                            <input
                                type="url"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                                className="w-full px-4 py-4 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium placeholder:text-slate-300"
                                placeholder="e.g. linkedin.com/in/username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Other Social</label>
                            <input
                                type="url"
                                value={socialLink}
                                onChange={(e) => setSocialLink(e.target.value)}
                                className="w-full px-4 py-4 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium placeholder:text-slate-300"
                                placeholder="e.g. github.com/username"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2 relative group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password (Optional)</label>
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-4 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                                placeholder="Leave blank to keep current"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute bottom-4 right-4 text-slate-500 hover:text-slate-900"
                            >
                                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="space-y-2 relative group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <input
                                type={showConfirmPass ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-4 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                                placeholder="Retype new password"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute bottom-4 right-4 text-slate-500 hover:text-slate-900"
                            >
                                {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/20 mt-4"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Save Changes
                                <Save className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf3] flex paper-texture">
      {/* Modern Elegant Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-[#dee2e6] flex flex-col p-8 space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-xl shadow-md">
              <Rocket className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-regular tracking-tighter text-slate-900 serif">Advisor</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              view === 'dashboard' ? 'bg-[#f8f9fa] text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setView('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              view === 'profile' ? 'bg-[#f8f9fa] text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            Profile
          </button>
        </nav>

        <div className="pt-8 border-t border-[#dee2e6] space-y-6">
          <div className="flex items-center gap-3 group px-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-slate-100">
                  {username?.[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">@{username}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Free Plan</span>
              </div>
          </div>
          <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Welcome Back</span>
              <h2 className="text-5xl font-regular text-slate-900 mt-2 tracking-tight serif">{(userProfile?.first_name || username)}'s Journeys</h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                  onClick={onStartNew}
                  className="flex items-center gap-2 px-6 py-3 bg-[#fdfaf3] hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 rounded-2xl font-bold transition-all shadow-sm whitespace-nowrap"
              >
                  <Plus className="w-5 h-5" />
                  New Roadmap
              </button>
            </div>
          </div>

          {/* 🔍 Discovery & Search Section */}
          <div className="mb-12 max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-1 pl-6 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  </div>
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-40 py-5 bg-white/50 backdrop-blur-sm border border-[#dee2e6] rounded-3xl text-slate-900 focus:outline-none focus:border-slate-900 shadow-sm focus:shadow-xl transition-all font-medium placeholder:text-slate-400"
                      placeholder="Search username to discover roadmaps..."
                  />
                  <button 
                      type="submit"
                      disabled={searching}
                      className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Discover"}
                  </button>
              </form>

              {searchError && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-red-400 font-black uppercase tracking-tighter text-xs animate-in slide-in-from-top-2 duration-300">
                      <X className="w-4 h-4" />
                      {searchError}
                  </div>
              )}
              {searchResults && (
                  <div className="mt-8 bg-white border border-[#dee2e6] rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                      
                      <div className="flex items-center justify-between mb-8 border-b border-[#e9ecef] pb-8 relative z-10">
                          <div className="flex items-center gap-6">
                              <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center border border-white shadow-xl">
                                  <UserIcon className="w-10 h-10 text-white" />
                              </div>
                              <div>
                                  <h3 className="text-3xl font-regular text-slate-900 tracking-tighter serif">@{searchResults.user.username}</h3>
                                  <div className="flex gap-4 mt-2">
                                      {searchResults.user.linkedin && (
                                          <a href={searchResults.user.linkedin} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors uppercase">
                                              <Linkedin className="w-3.5 h-3.5" /> Linkedin
                                          </a>
                                      )}
                                      {searchResults.user.social_link && (
                                          <a href={searchResults.user.social_link} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors uppercase">
                                              <Globe className="w-3.5 h-3.5" /> Portfolio
                                          </a>
                                      )}
                                  </div>
                              </div>
                          </div>
                          <button 
                              onClick={() => setSearchResults(null)}
                              className="p-3 bg-[#f1f3f5] hover:bg-white text-slate-500 hover:text-slate-900 rounded-2xl transition-all"
                          >
                              <X className="w-6 h-6" />
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                          {searchResults.public_maps.map(map => (
                              <div key={map.id} className="group p-6 bg-[#fdfaf3]/40 border border-[#e9ecef] rounded-2xl flex items-start justify-between hover:border-slate-950 transition-all hover:translate-y-[-2px]">
                                  <div className="flex-1 min-w-0 pr-4">
                                      <h4 className="font-bold text-slate-900 uppercase tracking-tighter text-base serif break-words">{map.goal}</h4>
                                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                                          {!map.root_map_id && (
                                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                                  <Copy className="w-3 h-3 text-slate-400" />
                                                  {map.clones_count} Clones
                                              </div>
                                          )}
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => handleClone(map.id)}
                                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 shrink-0"
                                  >
                                      <Plus className="w-3 h-3" />
                                      Clone
                                  </button>
                              </div>
                          ))}
                          {searchResults.public_maps.length === 0 && (
                              <div className="col-span-2 text-center py-12 border-2 border-dashed border-[#e9ecef] rounded-3xl">
                                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Public Maps Available</p>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>

          {loading && !existingMaps.length ? (
              <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing your progress...</p>
              </div>
          ) : existingMaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {existingMaps.map((map) => (
                  <div
                      key={map.id}
                      onClick={() => onLogin(username, map)}
                      className="flex flex-col items-start p-8 bg-white border border-[#e9ecef] hover:border-blue-500/50 rounded-[2.5rem] transition-all group relative overflow-hidden text-left cursor-pointer"
                  >
                      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12"></div> {/* Spacer for BookOpen symbol underneath */}
                              <button
                                  type="button"
                                  onClick={(e) => handleToggleVisibility(e, map.id)}
                                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] border shadow-sm ${
                                      map.is_public 
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 opacity-100" 
                                      : "bg-[#f1f3f5] text-slate-500 border-[#e9ecef] opacity-60 group-hover:opacity-100"
                                  } hover:scale-105 active:scale-95`}
                              >
                                  {map.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  <span>{map.is_public ? "Public" : "Private"}</span>
                              </button>
                          </div>

                          <div className="flex gap-4 items-center">
                              <button
                                  type="button"
                                  onClick={(e) => handleDeleteMap(e, map)}
                                  className="p-2 bg-[#f1f3f5] hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                  <Trash2 className="w-5 h-5" />
                              </button>
                              <ArrowRight className="w-6 h-6 text-blue-400 -rotate-45 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </div>
                      </div>
                  
                      <div className="p-3 bg-blue-500/10 rounded-2xl mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors relative z-0">
                          <BookOpen className="w-6 h-6 text-blue-400 group-hover:text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{map.goal}</h3>
                      <p className="text-slate-500 font-medium">Click to resume your learning path</p>
                      
                      <div className="mt-6 flex flex-col gap-4 w-full">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                              <span>Review Roadmap</span>
                              <div className="flex-1 h-[1px] bg-[#e9ecef]"></div>
                              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-[#e9ecef]/50">
                              {!map.root_map_id && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-[#f1f3f5]/40 rounded-lg border border-[#e9ecef]/30">
                                      <Copy className="w-3 h-3 text-slate-500" />
                                      <span className="text-[10px] font-bold text-slate-500">{map.clones_count || 0} Clones</span>
                                  </div>
                              )}
                              
                              <div className="flex items-center gap-1.5 text-blue-400/80">
                                  <Hash className="w-3 h-3" />
                                  <span className="text-[10px] font-black tracking-wider group-hover:text-blue-400 transition-colors">
                                      {map.creator_username || username}
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 border-2 border-dashed border-[#e9ecef] rounded-[3rem]">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-[#f1f3f5] rounded-3xl">
                <Rocket className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">No journeys found yet</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">Create your first AI-generated learning roadmap to get started.</p>
               <button 
                 onClick={onStartNew}
                 className="mt-8 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/10"
               >
                 Create My First Map
               </button>
            </div>
          )}
        </div>
      </div>

      {/* 🗑️ Premium Delete Confirmation Modal */}
      {deleteConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/40 animate-in fade-in duration-300">
              <div 
                className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
              >
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/20">
                      <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-white text-center mb-2">Erase Journey?</h3>
                  <p className="text-slate-400 text-center font-medium mb-8">
                      Are you sure you want to permanently delete <span className="text-white font-bold">"{deleteConfirm.goal}"</span>? This action cannot be undone.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                        onClick={confirmDelete}
                        disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                      >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Erase Journey"}
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ show: false, routeId: null, goal: '' })}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
