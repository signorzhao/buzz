import React, { useState, useEffect, useRef } from 'react';
import { User, Group, AppView, Notification } from './types';
import { COLORS } from './constants';
import { createGroup, joinGroup, sendNotification, simulateIncomingNotification, getGroup } from './services/mockBackend';
import { initSupabase, sbCreateGroup, sbJoinGroup, sbSendNotification, sbSubscribeToGroup, isSupabaseConfigured } from './services/supabaseService';
import { generateSmartMessage } from './services/geminiService';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { NotificationToast } from './components/NotificationToast';
import { SettingsModal } from './components/SettingsModal';
import { 
  Users, 
  Plus, 
  LogOut, 
  Zap, 
  Sparkles, 
  Share2, 
  ChevronLeft,
  X,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>(AppView.ONBOARDING);
  const [user, setUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  
  // App Mode State
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // UI State
  const [usernameInput, setUsernameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Notifications
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  // Audio Context (Mock Sound)
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize
  useEffect(() => {
    // 0. Check for URL Params (Auto-Sync Credentials for Mobile)
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('sbUrl');
    const keyParam = params.get('sbKey');
    
    if (urlParam && keyParam) {
      localStorage.setItem('sb_url', urlParam);
      localStorage.setItem('sb_key', keyParam);
      // Clean URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 1. Check User
    const storedUser = localStorage.getItem('buzzsync_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setView(AppView.HOME);
    }

    // 2. Check Supabase Config (load from local storage, possibly just set above)
    const sbUrl = localStorage.getItem('sb_url');
    const sbKey = localStorage.getItem('sb_key');
    if (sbUrl && sbKey) {
      const success = initSupabase(sbUrl, sbKey);
      setIsOnlineMode(success);
    }
  }, []);

  // --- Realtime / Mock Logic ---

  useEffect(() => {
    if (!currentGroup) return;

    if (isOnlineMode) {
      // --- ONLINE MODE: Supabase Subscription ---
      const unsubscribe = sbSubscribeToGroup(currentGroup.id, (notif) => {
        // Prevent duplicate toasts if we just sent it ourselves
        // (Supabase sends back our own inserts)
        if (notif.senderId !== user?.id) {
           triggerNotification(notif);
        }
        
        // Update History
        setCurrentGroup(prev => {
          if (!prev) return null;
          // Avoid duplicates in history just in case
          if (prev.history.find(h => h.id === notif.id)) return prev;
          return { ...prev, history: [notif, ...prev.history] };
        });
      });
      return () => unsubscribe();

    } else {
      // --- OFFLINE MODE: Mock Simulation ---
      const interval = setInterval(() => {
        simulateIncomingNotification(currentGroup.id, false, (notif) => {
          const updatedGroup = getGroup(currentGroup.id);
          if (updatedGroup) setCurrentGroup({ ...updatedGroup });
          triggerNotification(notif);
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentGroup, isOnlineMode, user?.id]);

  // Actions
  const playPingSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const triggerNotification = (notif: Notification) => {
    setActiveNotification(notif);
    playPingSound();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  const handleSaveSettings = (url: string, key: string) => {
    const success = initSupabase(url, key);
    setIsOnlineMode(success);
    if (!success) {
      alert("Switched to Offline Demo Mode");
    } else {
      alert("Connected to Supabase!");
    }
  };

  const handleLogin = () => {
    if (!usernameInput.trim()) return;
    const newUser: User = {
      id: crypto.randomUUID(),
      name: usernameInput.trim(),
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setUser(newUser);
    localStorage.setItem('buzzsync_user', JSON.stringify(newUser));
    setView(AppView.HOME);
  };

  const handleCreateGroup = async () => {
    if (!user || !groupNameInput.trim()) return;
    
    let group: Group | null = null;
    setIsLoading(true);

    try {
      if (isOnlineMode) {
        group = await sbCreateGroup(groupNameInput.trim(), user);
      } else {
        group = createGroup(groupNameInput.trim(), user);
      }

      if (group) {
        setGroupsList([...groupsList, group]);
        setCurrentGroup(group);
        setView(AppView.GROUP);
        setGroupNameInput('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !joinCodeInput.trim()) return;

    let group: Group | null = null;
    setIsLoading(true);

    try {
      if (isOnlineMode) {
        group = await sbJoinGroup(joinCodeInput.trim(), user);
      } else {
        group = joinGroup(joinCodeInput.trim(), user);
      }

      if (group) {
        setGroupsList((prev) => {
          if (prev.find(g => g.id === group!.id)) return prev;
          return [...prev, group!];
        });
        setCurrentGroup(group);
        setView(AppView.GROUP);
        setJoinCodeInput('');
      } else {
        alert("Invalid Code or Group not found");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuzz = async (messageOverride?: string) => {
    if (!user || !currentGroup) return;

    const message = messageOverride || "Buzzed you! 🔔";
    
    if (isOnlineMode) {
      // Online: Fire and forget (Optimistic update done via subscription or below)
      await sbSendNotification(currentGroup.id, user, message);
      // Note: We don't manually update state here because the Subscription will catch our own message 
      // BUT for immediate responsiveness, we could. However, Supabase echoes back fast enough usually.
      // To be safe and super snappy, let's optimistically update:
    } else {
      // Offline
      const notif: Notification = {
        id: crypto.randomUUID(),
        senderName: user.name,
        senderId: user.id,
        message: message,
        timestamp: Date.now(),
        type: 'buzz',
      };
      sendNotification(currentGroup.id, notif);
      setCurrentGroup((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          history: [notif, ...prev.history]
        };
      });
    }

    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleAiBuzz = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    const smartMessage = await generateSmartMessage(aiPrompt, user?.name || 'Someone');
    setIsGenerating(false);
    handleBuzz(smartMessage);
    setShowAiModal(false);
    setAiPrompt('');
  };

  const handleLogout = () => {
    localStorage.removeItem('buzzsync_user');
    setUser(null);
    setGroupsList([]);
    setView(AppView.ONBOARDING);
  };

  // --- Render Helpers ---

  const renderConnectionStatus = () => (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
      isOnlineMode ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
    }`}>
      {isOnlineMode ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isOnlineMode ? 'Online' : 'Demo Mode'}
    </div>
  );

  // --- Views ---

  const renderOnboarding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto relative">
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-blue-200 shadow-xl">
        <Zap className="w-10 h-10 text-white fill-current" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">BuzzSync</h1>
      <p className="text-center text-gray-500 mb-6">
        Instant notifications for your inner circle.
      </p>

      <div className="mb-8">
         {renderConnectionStatus()}
      </div>
      
      <div className="w-full space-y-4">
        <Input 
          placeholder="Enter your name" 
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          autoFocus
        />
        <Button fullWidth onClick={handleLogin} disabled={!usernameInput.trim()}>
          Get Started
        </Button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="min-h-screen bg-[#F2F2F7] p-4 pb-20 max-w-md mx-auto">
      <header className="flex justify-between items-center py-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm"
          >
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      <div className="flex justify-end mb-4">
         {renderConnectionStatus()}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-3">Join a Group</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="4-digit Code" 
              value={joinCodeInput} 
              onChange={(e) => setJoinCodeInput(e.target.value)}
              maxLength={4}
              className="text-center tracking-widest font-mono"
            />
            <Button onClick={handleJoinGroup} disabled={joinCodeInput.length < 4 || isLoading}>
              {isLoading ? '...' : 'Join'}
            </Button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-3">Create New Group</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="Group Name" 
              value={groupNameInput} 
              onChange={(e) => setGroupNameInput(e.target.value)}
            />
            <Button variant="secondary" onClick={handleCreateGroup} disabled={isLoading}>
              {isLoading ? '...' : <Plus className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Active Groups List */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">Your Groups</h2>
      <div className="space-y-3">
        {groupsList.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>You haven't joined any groups yet.</p>
          </div>
        ) : (
          groupsList.map((g) => (
            <div 
              key={g.id}
              onClick={() => {
                setCurrentGroup(g);
                setView(AppView.GROUP);
              }}
              className="bg-white p-4 rounded-xl shadow-sm active:scale-98 transition-transform cursor-pointer flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-blue-500`}>
                  {g.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="text-xs text-gray-400">Code: {g.code}</p>
                </div>
              </div>
              <ChevronLeft className="rotate-180 text-gray-300 w-5 h-5" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderGroup = () => {
    if (!currentGroup) return null;

    return (
      <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <button 
            onClick={() => setView(AppView.HOME)}
            className="flex items-center text-blue-600 -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-[17px]">Back</span>
          </button>
          <div className="flex flex-col items-center">
             <h1 className="font-semibold text-[17px]">{currentGroup.name}</h1>
             <span className="text-xs text-gray-400 flex items-center gap-1">
                {isOnlineMode && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                Code: {currentGroup.code}
             </span>
          </div>
          <button 
             onClick={() => {
               navigator.clipboard.writeText(currentGroup.code);
               alert("Code copied!");
             }}
             className="text-blue-600"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
          
          {/* Big Button Container */}
          <div className="relative">
             <div className="absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
             <button
              onClick={() => handleBuzz()}
              className="relative w-48 h-48 rounded-full bg-gradient-to-b from-red-500 to-red-600 shadow-[0_10px_40px_-10px_rgba(239,68,68,0.5)] active:shadow-inner active:scale-95 transition-all duration-200 flex flex-col items-center justify-center text-white border-4 border-red-400/30"
             >
               <Zap className="w-16 h-16 mb-2 fill-white" />
               <span className="text-xl font-bold tracking-wider">BUZZ</span>
             </button>
          </div>

          <p className="text-gray-400 text-sm text-center max-w-[200px]">
            {isOnlineMode 
              ? "Tap to notify everyone in the group instantly"
              : "Demo Mode: Tap to simulate locally"
            }
          </p>

          {/* AI Trigger */}
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-full font-medium text-sm hover:bg-indigo-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Send Smart Message
          </button>

        </div>

        {/* Feed / History */}
        <div className="h-1/3 bg-white border-t border-gray-200 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-center">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {currentGroup.history.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No recent buzzes.</p>
             )}
             {currentGroup.history.map((notif) => (
               <div key={notif.id} className="flex items-start gap-3 animate-fadeIn">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${COLORS[(notif.senderName?.length || 0) % COLORS.length]}`}>
                    {(notif.senderName || '?').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">{notif.senderName}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-snug">{notif.message}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* AI Modal Overlay */}
        {showAiModal && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:w-[90%] sm:rounded-2xl rounded-t-2xl p-6 animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  AI Smart Buzz
                </h3>
                <button onClick={() => setShowAiModal(false)} className="text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">What's this about?</label>
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                  {['Lunch? 🍔', 'Meeting 📅', 'Emergency 🚨', 'Party 🎉'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setAiPrompt(tag)}
                      className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <Input 
                  placeholder="e.g., 'We are late' or 'Coffee time'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  autoFocus
                />
              </div>

              <Button 
                fullWidth 
                onClick={handleAiBuzz} 
                disabled={!aiPrompt || isGenerating}
                className={isGenerating ? 'opacity-80' : ''}
              >
                {isGenerating ? 'Generating...' : 'Send to Group'}
              </Button>
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <>
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
      />

      <NotificationToast 
        notification={activeNotification} 
        onDismiss={() => setActiveNotification(null)} 
      />
      
      {view === AppView.ONBOARDING && renderOnboarding()}
      {view === AppView.HOME && renderHome()}
      {view === AppView.GROUP && renderGroup()}
    </>
  );
};

export default App;