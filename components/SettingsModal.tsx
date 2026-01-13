import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { X, Copy, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { getMyProfile, saveMyProfile } from '../services/storageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [barkKey, setBarkKey] = useState('');
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (isOpen) {
      const profile = getMyProfile();
      setName(profile.name);
      setBarkKey(profile.barkKey);
    }
  }, [isOpen]);

  // Generate QR for MY key so others can scan it
  useEffect(() => {
    if (barkKey) {
      // We generate a QR containing the KEY. 
      // In a more advanced version, this could be a deep link.
      // For now, it's just the key text or full URL.
      const content = `https://api.day.app/${barkKey}`;
      QRCode.toDataURL(content, { margin: 1, width: 200 })
        .then(setQrSrc)
        .catch(console.error);
    } else {
      setQrSrc('');
    }
  }, [barkKey]);

  const handleSave = () => {
    // Extract key if URL pasted
    let cleanKey = barkKey.trim();
    if (cleanKey.includes('api.day.app/')) {
       cleanKey = cleanKey.split('api.day.app/')[1].split('/')[0];
    }
    saveMyProfile(name, cleanKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">我的名片</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl text-center">
             {qrSrc ? (
               <img src={qrSrc} alt="My Key QR" className="w-32 h-32 mx-auto mix-blend-multiply mb-2" />
             ) : (
               <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center text-gray-400 text-xs">
                 暂无 Key
               </div>
             )}
             <p className="text-xs text-blue-800 font-medium">
               出示二维码给朋友添加
             </p>
          </div>

          <Input
            label="我的昵称"
            placeholder="输入你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <div>
            <Input
              label="我的 Bark Key / 链接"
              placeholder="从 Bark App 粘贴..."
              value={barkKey}
              onChange={(e) => setBarkKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-1 ml-1">
              方便朋友扫描或复制添加你
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
           <Button fullWidth onClick={handleSave}>
             保存并关闭
           </Button>
        </div>
      </div>
    </div>
  );
};