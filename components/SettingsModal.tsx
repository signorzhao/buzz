import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { X, Server, Database, Smartphone, Info, Bell } from 'lucide-react';
import QRCode from 'qrcode';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, key: string, barkUrl: string) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [barkUrl, setBarkUrl] = useState('');
  const [qrSrc, setQrSrc] = useState<string>('');
  
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load Supabase Creds
      const storedSbUrl = localStorage.getItem('sb_url') || '';
      const storedSbKey = localStorage.getItem('sb_key') || '';
      const storedBarkUrl = localStorage.getItem('bark_url') || '';
      setSbUrl(storedSbUrl);
      setSbKey(storedSbKey);
      setBarkUrl(storedBarkUrl);
      
      // Load Base URL
      const storedBaseUrl = localStorage.getItem('buzzsync_base_url');
      if (storedBaseUrl) {
        setBaseUrl(storedBaseUrl);
      } else {
        setBaseUrl(window.location.origin + window.location.pathname);
      }
    }
  }, [isOpen]);

  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBaseUrl(val);
    localStorage.setItem('buzzsync_base_url', val);
  };

  const handleSbUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSbUrl(val);
    localStorage.setItem('sb_url', val);
  };

  const handleSbKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSbKey(val);
    localStorage.setItem('sb_key', val);
  };

  const handleBarkUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBarkUrl(val);
    localStorage.setItem('bark_url', val);
  };

  const handleTestBark = async () => {
    if (!barkUrl) return alert("Please enter a Bark URL first");
    try {
      // Bark API format: URL/Message
      let cleanUrl = barkUrl.endsWith('/') ? barkUrl.slice(0, -1) : barkUrl;
      await fetch(`${cleanUrl}/BuzzSync Test/This is a test notification?group=buzzsync`);
      alert("Sent! Check your notification center.");
    } catch (e) {
      alert("Failed to send test. Check URL.");
    }
  };

  // Generate QR Code
  useEffect(() => {
    if (!baseUrl) return;

    let finalQrUrl = baseUrl;
    if (!finalQrUrl.startsWith('http://') && !finalQrUrl.startsWith('https://')) {
       finalQrUrl = `http://${finalQrUrl}`;
    }
    
    if (sbUrl && sbKey) {
       const separator = finalQrUrl.includes('?') ? '&' : '?';
       // We only pass supabase creds, bark url is personal per device
       finalQrUrl = `${finalQrUrl}${separator}sbUrl=${encodeURIComponent(sbUrl)}&sbKey=${encodeURIComponent(sbKey)}`;
    }

    QRCode.toDataURL(finalQrUrl, { margin: 1, width: 200, color: { dark: '#000000', light: '#ffffff' } })
      .then((dataUrl: string) => {
        setQrSrc(dataUrl);
      })
      .catch((err: any) => {
        console.error(err);
      });
      
  }, [baseUrl, sbUrl, sbKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bark Section */}
        <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
          <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            iOS Native Push (Bark)
          </h4>
          <p className="text-xs text-orange-700 mb-3 leading-relaxed">
            1. Install "Bark" from App Store.<br/>
            2. Copy your unique server URL from the app.<br/>
            3. Paste it below to receive group buzzes.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="https://api.day.app/YourKey..."
              value={barkUrl}
              onChange={handleBarkUrlChange}
              className="text-xs"
            />
            <Button variant="secondary" onClick={handleTestBark} disabled={!barkUrl} className="px-3">
              Test
            </Button>
          </div>
        </div>

        {/* Supabase Section */}
        <div className="space-y-4 mb-8 border-t border-gray-100 pt-6">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <Database className="w-4 h-4" />
              1. Enable Multiplayer
            </p>
            <p className="opacity-90">
              Enter credentials here. They will be auto-saved and embedded in the QR code.
            </p>
          </div>

          <Input
            label="Supabase URL"
            placeholder="https://xyz.supabase.co"
            value={sbUrl}
            onChange={handleSbUrlChange}
          />
          <Input
            label="Supabase Key"
            placeholder="eyJh..."
            value={sbKey}
            onChange={handleSbKeyChange}
            type="password"
          />
        </div>

        {/* Mobile Access Section */}
        <div className="mb-6 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-500" />
            2. Open on Mobile
          </h4>
          
          <div className="mb-4">
            <Input 
              label="App Host Address"
              value={baseUrl}
              onChange={handleBaseUrlChange}
              placeholder="192.168.1.x:3000"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center transition-all">
            {qrSrc ? (
              <img src={qrSrc} alt="Page QR Code" className="w-40 h-40 rounded-lg shadow-sm mb-2 mix-blend-multiply" />
            ) : (
              <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center p-2 mb-2">
                Type a valid URL
              </div>
            )}
            <p className="text-xs text-gray-500 text-center max-w-[250px]">
              Scan to open App on phone with credentials pre-loaded.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => {
              localStorage.removeItem('sb_url');
              localStorage.removeItem('sb_key');
              localStorage.removeItem('bark_url');
              onSave('', '', '');
              onClose();
            }}
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            fullWidth 
            className="flex-1"
            onClick={() => {
              onSave(sbUrl, sbKey, barkUrl);
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};