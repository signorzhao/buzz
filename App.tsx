import React, { useState, useEffect } from 'react';
import { Contact } from './types';
import { BARK_SERVER } from './constants';
import { getContacts, saveContact, deleteContact, getMyProfile } from './services/storageService';
import { generateSmartMessage } from './services/geminiService';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { SettingsModal } from './components/SettingsModal';
import { 
  Plus, 
  Zap, 
  Sparkles, 
  Settings,
  Trash2,
  CheckCircle2,
  Circle,
  UserPlus,
  X
} from 'lucide-react';

const App: React.FC = () => {
  // Data State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Input State
  const [message, setMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // New Contact Inputs
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');

  // Initial Load
  useEffect(() => {
    const loaded = getContacts();
    setContacts(loaded);
    // Default Select All
    setSelectedIds(new Set(loaded.map(c => c.id)));
  }, []);

  // --- Actions ---

  const handleAddContact = () => {
    if (!newName || !newKey) return;
    const newContact = saveContact(newName, newKey);
    setContacts(prev => [...prev, newContact]);
    // Auto select new contact
    setSelectedIds(prev => new Set(prev).add(newContact.id));
    
    // Reset & Close
    setNewName('');
    setNewKey('');
    setShowAddModal(false);
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Remove this person?')) {
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
    if (isEditMode) return; // Don't toggle selection in edit mode
    
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id))); // Select all
    }
  };

  const broadcast = async (msgOverride?: string) => {
    const finalMessage = msgOverride || message || "BUZZ! ⚡️";
    const targets = contacts.filter(c => selectedIds.has(c.id));

    if (targets.length === 0) {
      alert("Select at least one person!");
      return;
    }

    setIsSending(true);

    // Get my name for context
    const myProfile = getMyProfile();
    const senderName = myProfile.name || 'Friend';
    
    // Encode Message
    const encodedMsg = encodeURIComponent(finalMessage);
    const encodedTitle = encodeURIComponent(`${senderName} via BuzzSync`);
    const icon = encodeURIComponent('https://api.iconify.design/lucide:zap.svg?color=%23ef4444');

    // Fire requests in parallel
    const promises = targets.map(target => {
      // Bark Format: https://api.day.app/{key}/{title}/{body}?icon=...
      const url = `${BARK_SERVER}/${target.barkKey}/${encodedTitle}/${encodedMsg}?icon=${icon}&group=BuzzSync`;
      return fetch(url, { mode: 'no-cors' }) // no-cors is fine for Bark (fire & forget)
        .catch(e => console.error(`Failed to send to ${target.name}`, e));
    });

    await Promise.all(promises);

    setIsSending(false);
    setMessage(''); // Clear message after send
    if (navigator.vibrate) navigator.vibrate([50, 50, 200]);
    alert(`Sent to ${targets.length} people!`);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    const myProfile = getMyProfile();
    const generated = await generateSmartMessage(aiPrompt, myProfile.name || 'Sender');
    setMessage(generated);
    setAiPrompt('');
    setIsAiGenerating(false);
  };

  useEffect(() => {
    if (aiPrompt && !isAiGenerating) {
      handleAiGenerate();
    }
  }, [aiPrompt]);

  // --- Renders ---

  return (
    <>
      {/* Main View */}
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col max-w-md mx-auto relative">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] border-b border-gray-200 flex items-center justify-between transition-all">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600 fill-current" />
            BuzzSync
          </h1>
          <div className="flex gap-3">
             <button 
               onClick={() => setIsEditMode(!isEditMode)}
               className={`text-sm font-medium ${isEditMode ? 'text-red-500' : 'text-gray-500'}`}
             >
               {isEditMode ? 'Done' : 'Edit'}
             </button>
             <button onClick={() => setShowSettings(true)}>
               <Settings className="w-6 h-6 text-gray-500" />
             </button>
          </div>
        </header>

        {/* Contacts Grid */}
        <div className="flex-1 p-4 overflow-y-auto pb-48">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
               Receivers ({selectedIds.size})
             </h2>
             <button onClick={handleSelectAll} className="text-blue-600 text-sm font-medium">
               {selectedIds.size === contacts.length ? 'None' : 'All'}
             </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {/* Add Button */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="aspect-square rounded-2xl bg-gray-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-gray-500"
            >
              <Plus className="w-8 h-8" />
              <span className="text-[10px] font-medium">Add</span>
            </button>

            {/* List */}
            {contacts.map(contact => {
              const isSelected = selectedIds.has(contact.id);
              return (
                <div key={contact.id} className="relative flex flex-col items-center gap-1">
                  <button
                    onClick={() => toggleSelection(contact.id)}
                    className={`
                      relative w-full aspect-square rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm transition-all
                      ${contact.avatarColor}
                      ${isSelected ? 'ring-4 ring-blue-500/30 scale-105' : 'opacity-60 grayscale-[0.5] scale-95'}
                    `}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                    
                    {/* Selection Indicator */}
                    {isSelected && !isEditMode && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-0.5 border-2 border-[#F2F2F7]">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                  <span className="text-[11px] font-medium text-gray-600 truncate w-full text-center">
                    {contact.name}
                  </span>

                  {/* Delete Button (Edit Mode) */}
                  {isEditMode && (
                    <button 
                      onClick={() => handleDeleteContact(contact.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md animate-bounce"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {contacts.length === 0 && (
             <div className="text-center mt-10 text-gray-400">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No contacts yet.<br/>Add your friends' Bark keys.</p>
             </div>
          )}
        </div>

        {/* Bottom Control Panel */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 max-w-md mx-auto rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
          
          {/* AI Helper Toggle */}
          <div className="mb-3 flex gap-2">
             <div className="relative flex-1">
               <input
                 className="w-full bg-gray-100 rounded-xl px-4 py-3 pr-10 text-[15px] outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                 placeholder="Message (optional)..."
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && broadcast()}
               />
               <button 
                 onClick={() => setAiPrompt(message || 'Hurry up')}
                 className="absolute right-2 top-2 p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                 title="AI Magic"
               >
                 <Sparkles className="w-5 h-5" />
               </button>
             </div>
          </div>

          {/* AI Expand Area */}
          {aiPrompt && (
             <div className="mb-3 flex items-center gap-2 animate-fadeIn bg-indigo-50 p-2 rounded-lg">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="text-xs text-indigo-700 font-medium">AI: Generating smart text...</span>
                <div className="flex-1"></div>
             </div>
          )}

          <Button 
            fullWidth 
            onClick={() => broadcast()}
            disabled={isSending || selectedIds.size === 0}
            className={`h-14 text-lg shadow-blue-300 shadow-lg ${isSending ? 'opacity-80' : ''}`}
          >
            {isSending ? 'Sending...' : `Buzz ${selectedIds.size} People`}
            {!isSending && <Zap className="w-5 h-5 fill-white" />}
          </Button>
        </div>

      </div>

      {/* Settings Modal (My Profile) */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onSave={() => setShowSettings(false)}
      />

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Input 
                placeholder="Name (e.g. Jack)" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div>
                <Input 
                  placeholder="Bark Key or URL" 
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  Paste the full link from their Bark app
                </p>
              </div>
              <Button fullWidth onClick={handleAddContact} disabled={!newName || !newKey}>
                Save Contact
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;