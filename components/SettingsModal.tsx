import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { X, ChevronRight, Palette, Copy, Download, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';
import { 
  getMyProfile, 
  saveMyProfile, 
  getQuickActions, 
  saveQuickActions, 
  exportFullConfig, 
  importFullConfig 
} from '../services/storageService';
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
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const profile = getMyProfile();
      setName(profile.name);
      setBarkKey(profile.barkKey);
      setActions(getQuickActions());
      setImportError(false);
      setImportSuccess(false);
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

  const handleCopyConfig = () => {
    const config = exportFullConfig();
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportConfig = () => {
    if (!importText.trim()) return;
    const success = importFullConfig(importText.trim());
    if (success) {
      setImportSuccess(true);
      setImportError(false);
      setTimeout(() => {
        window.location.reload(); // 刷新页面以加载新配置
      }, 1000);
    } else {
      setImportError(true);
      setImportSuccess(false);
    }
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

          {/* 方案 2: 备份与恢复 */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">数据备份与恢复</h4>
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  你可以将当前的联系人和设置备份为一段代码，保存到备忘录。下次使用时粘贴回来即可恢复。
                </p>
                <Button variant="secondary" fullWidth onClick={handleCopyConfig} className="gap-2">
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  {copied ? '已复制备份代码' : '生成并复制备份代码'}
                </Button>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <textarea
                  className={`w-full bg-gray-50 rounded-xl p-3 text-xs font-mono border-2 transition-colors outline-none h-24 ${importError ? 'border-red-300' : 'border-transparent focus:border-blue-500'}`}
                  placeholder="在此粘贴备份代码以进行恢复..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
                {importError && <p className="text-xs text-red-500 mt-1 ml-1">代码无效，请检查是否完整粘贴</p>}
                {importSuccess && <p className="text-xs text-green-500 mt-1 ml-1 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> 恢复成功，正在刷新页面...</p>}
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={handleImportConfig} 
                  disabled={!importText.trim() || importSuccess}
                  className="mt-3 bg-gray-800 hover:bg-black"
                >
                  <Upload className="w-5 h-5" />
                  导入并恢复配置
                </Button>
              </div>
            </div>
          </section>

          <Button fullWidth onClick={handleSave} className="h-14">完成并保存</Button>
        </div>
      </div>
    </div>
  );
};