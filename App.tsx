import React, { useState, useEffect } from 'react';
import { Contact, QuickActionConfig } from './types';
import { BARK_SERVER, AVATAR_COLORS } from './constants';
import { getContacts, saveContact, deleteContact, getMyProfile, getQuickActions } from './services/storageService';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { SettingsModal } from './components/SettingsModal';
import { 
  Plus, Zap, Settings, Trash2, CheckCircle2, UserPlus, X, 
  Coffee, Cigarette, Utensils, Beer, Gamepad2, Timer, Car, 
  HelpCircle, Beef, Ban, Brain, Loader2, Check, Minus
} from 'lucide-react';

const IconMap: Record<string, React.FC<any>> = {
  Coffee, Cigarette, Utensils, Beer, Gamepad2, Timer, Car, HelpCircle, Beef, CheckCircle2, Ban, Brain
};

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quickActions, setQuickActions] = useState<QuickActionConfig[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');

  useEffect(() => {
    const loadedContacts = getContacts();
    setContacts(loadedContacts);
    setQuickActions(getQuickActions());
    setSelectedIds(new Set(loadedContacts.map(c => c.id)));
  }, [showSettings]); // Reload when settings modal closes

  const handleAddContact = () => {
    if (!newName || !newKey) return;
    const newContact = saveContact(newName, newKey);
    setContacts(prev => [...prev, newContact]);
    setSelectedIds(prev => new Set(prev).add(newContact.id));
    setNewName('');
    setNewKey('');
    setShowAddModal(false);
  };

  const handleDeleteContact = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('确定要删除这位联系人吗？')) {
      const updated = deleteContact(id);
      setContacts(updated);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const toggleSelection = (id: string) => {
    if (isEditMode) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const broadcast = async (msgContent: string) => {
    const targets = contacts.filter(c => selectedIds.has(c.id));
    if (targets.length === 0) return alert("请至少选择一个人！");

    setIsSending(true);
    setSendSuccess(false);
    const myProfile = getMyProfile();
    const senderName = myProfile.name || '好友';
    const encodedMsg = encodeURIComponent(msgContent);
    const encodedTitle = encodeURIComponent(senderName);
    const icon = encodeURIComponent('https://api.iconify.design/lucide:zap.svg?color=%23ef4444');

    const promises = targets.map(target => {
      const url = `${BARK_SERVER}/${target.barkKey}/${encodedTitle}/${encodedMsg}?icon=${icon}&group=BuzzSync`;
      return fetch(url, { mode: 'no-cors' }).catch(e => console.error(e));
    });

    try {
      await Promise.all(promises);
      setSendSuccess(true);
      setLastSentMessage(msgContent);
      if (navigator.vibrate) navigator.vibrate([50, 50, 200]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        setSendSuccess(false);
        setLastSentMessage(null);
      }, 2500);
    }
  };

  const handleQuickAction = (action: QuickActionConfig) => {
    if (isSending || sendSuccess) return;
    const randomMsg = action.messages[Math.floor(Math.random() * action.messages.length)];
    broadcast(randomMsg);
  };

  return (
    <>
      <div className="h-full w-full bg-[#F2F2F7] flex flex-col max-w-md mx-auto overflow-hidden">
        <header className="bg-white/90 backdrop-blur-md px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] border-b border-gray-200 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600 fill-current" /> BuzzSync
          </h1>
          <div className="flex gap-4">
             <button onClick={() => setIsEditMode(!isEditMode)} className={`text-[17px] font-medium ${isEditMode ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
               {isEditMode ? '完成' : '编辑'}
             </button>
             <button onClick={() => setShowSettings(true)}><Settings className="w-6 h-6 text-gray-500" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest">接收列表 ({selectedIds.size})</h2>
             <button onClick={() => selectedIds.size === contacts.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(contacts.map(c => c.id)))} className="text-blue-600 text-sm font-medium">
               {selectedIds.size === contacts.length ? '取消' : '全选'}
             </button>
          </div>
          
          <div className="grid grid-cols-4 gap-x-4 gap-y-6 pb-4">
            <button onClick={() => setShowAddModal(true)} className="aspect-square rounded-2xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-gray-400">
              <Plus className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase">添加</span>
            </button>

            {contacts.map(contact => {
              const isSelected = selectedIds.has(contact.id);
              return (
                <div key={contact.id} className="relative flex flex-col items-center gap-1.5 group">
                  <button
                    onClick={() => toggleSelection(contact.id)}
                    className={`
                      relative w-full aspect-square rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md transition-all duration-300
                      ${contact.avatarColor}
                      ${isSelected ? 'scale-105' : 'opacity-40 grayscale-[0.3] scale-90'}
                      ${isEditMode ? 'animate-wiggle' : ''}
                    `}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                    {isSelected && !isEditMode && (
                      <div className="absolute -top-1.5 -right-1.5 bg-blue-600 rounded-full p-0.5 border-2 border-[#F2F2F7] shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                  <span className="text-[11px] font-bold text-gray-700 truncate w-full text-center">{contact.name}</span>

                  {isEditMode && (
                    <button 
                      onPointerDown={(e) => handleDeleteContact(e, contact.id)}
                      className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg active:scale-75 z-[60] border-2 border-white pointer-events-auto"
                      aria-label="Delete contact"
                    >
                      <Minus className="w-5 h-5 stroke-[4px]" />
                      <div className="absolute inset-[-10px] bg-transparent" /> {/* Hit area expansion */}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 p-4 pb-[calc(env(safe-area-inset-bottom)+20px)] shrink-0 shadow-[0_-5px_30px_rgba(0,0,0,0.05)] z-20">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {quickActions.map(action => {
              const Icon = IconMap[action.iconName] || Zap;
              return (
                <button 
                  key={action.id} 
                  onClick={() => handleQuickAction(action)} 
                  disabled={isSending || sendSuccess || selectedIds.size === 0} 
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all active:scale-90 ${action.colorClass} ${isSending || sendSuccess || selectedIds.size === 0 ? 'opacity-30 grayscale' : 'hover:brightness-95'}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold truncate w-full text-center">{action.label}</span>
                </button>
              );
            })}
          </div>

          <Button fullWidth onClick={() => broadcast("紧急呼叫! ⚡️")} disabled={isSending || sendSuccess || selectedIds.size === 0} className={`h-14 text-lg transition-all duration-300 relative overflow-hidden ${sendSuccess ? 'bg-green-500 hover:bg-green-500 shadow-green-200 scale-[1.02]' : 'shadow-blue-200'} ${isSending ? 'bg-blue-500' : ''}`}>
            {isSending ? (
              <div className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /><span>发送中...</span><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" /></div>
            ) : sendSuccess ? (
              <div className="flex items-center gap-2 animate-in zoom-in duration-300"><Check className="w-6 h-6" /><span>发送成功</span></div>
            ) : (
              <div className="flex items-center gap-2"><span>一键提醒</span><Zap className="w-5 h-5 fill-white" /></div>
            )}
          </Button>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={() => setShowSettings(false)} />

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#F2F2F7] w-full max-w-sm rounded-t-[32px] sm:rounded-2xl p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">添加联系人</h3>
              <button onClick={() => setShowAddModal(false)} className="bg-gray-200 p-1.5 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <Input placeholder="昵称 (老王)" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Bark Key 或 链接" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
              <Button fullWidth onClick={handleAddContact} disabled={!newName || !newKey}>保存联系人</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }
        .animate-wiggle { animation: wiggle 0.25s ease-in-out infinite; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default App;