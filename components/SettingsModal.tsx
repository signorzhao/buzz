import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { X, ChevronRight, Palette } from 'lucide-react';
import { getMyProfile, saveMyProfile, getQuickActions, saveQuickActions } from '../services/storageService';
import { ACTION_LIGHT_COLORS } from '../constants';
import { QuickActionConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [barkKey, setBarkKey] = useState('');
  const [actions, setActions] = useState<QuickActionConfig[]>([]);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const profile = getMyProfile();
      setName(profile.name);
      setBarkKey(profile.barkKey);
      setActions(getQuickActions());
    }
  }, [isOpen]);

  const handleSave = () => {
    let cleanKey = barkKey.trim();
    if (cleanKey.includes('api.day.app/')) {
       cleanKey = cleanKey.split('api.day.app/')[1].split('/')[0];
    }
    saveMyProfile({ name, barkKey: cleanKey });
    saveQuickActions(actions);
    onClose();
  };

  const updateActionColor = (id: string, colorClass: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, colorClass } : a));
  };

  const updateActionLabel = (id: string, label: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, label } : a));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#F2F2F7] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#F2F2F7] z-10 py-2">
          <h3 className="text-2xl font-bold">设置</h3>
          <button onClick={onClose} className="bg-gray-200 p-2 rounded-full text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8 pb-10">
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">个人信息</h4>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <Input label="我的昵称" placeholder="输入名字" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="p-4">
                <Input label="我的 Bark Key" placeholder="粘贴 Key" value={barkKey} onChange={(e) => setBarkKey(e.target.value)} className="font-mono text-sm" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">自定义按钮背景颜色</h4>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
              {actions.map((action) => (
                <div key={action.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.colorClass}`}>
                         <Palette className="w-5 h-5" />
                       </div>
                       <input 
                         className="font-bold text-gray-800 outline-none w-32 border-b border-transparent focus:border-blue-500"
                         value={action.label}
                         onChange={(e) => updateActionLabel(action.id, e.target.value)}
                       />
                    </div>
                    <span className="text-xs text-gray-400">点击下方选色</span>
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {ACTION_LIGHT_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => updateActionColor(action.id, color.class)}
                        className={`w-8 h-8 rounded-full shrink-0 border-2 transition-all ${color.class.split(' ')[0]} ${action.colorClass.includes(color.class.split(' ')[0]) ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent opacity-60'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Button fullWidth onClick={handleSave} className="h-14">完成并保存</Button>
        </div>
      </div>
    </div>
  );
};