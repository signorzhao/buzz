import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { X, Server, Database, Smartphone, Info } from 'lucide-react';
import QRCode from 'qrcode';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, key: string) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [qrSrc, setQrSrc] = useState<string>('');
  
  // This is the URL base (http://ip:port) that the user can edit
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // 1. Load Supabase Creds
      const storedSbUrl = localStorage.getItem('sb_url') || '';
      const storedSbKey = localStorage.getItem('sb_key') || '';
      setSbUrl(storedSbUrl);
      setSbKey(storedSbKey);
      
      // 2. Load Base URL (User preference or default to window location)
      const storedBaseUrl = localStorage.getItem('buzzsync_base_url');
      if (storedBaseUrl) {
        setBaseUrl(storedBaseUrl);
      } else {
        // Default: Strip search params to get clean origin+path
        setBaseUrl(window.location.origin + window.location.pathname);
      }
    }
  }, [isOpen]);

  // Handle Base URL Changes
  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBaseUrl(val);
    localStorage.setItem('buzzsync_base_url', val);
  };

  // Handle Credential Changes (Auto-save to prevent data loss)
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

  // Generate QR Code whenever base URL or credentials change
  useEffect(() => {
    if (!baseUrl) return;

    let finalQrUrl = baseUrl;
    
    // Ensure protocol exists for valid QR scanning
    if (!finalQrUrl.startsWith('http://') && !finalQrUrl.startsWith('https://')) {
       finalQrUrl = `http://${finalQrUrl}`;
    }
    
    if (sbUrl && sbKey) {
       const separator = finalQrUrl.includes('?') ? '&' : '?';
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

        {/* Supabase Section */}
        <div className="space-y-4 mb-8">
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
            <p className="text-[10px] text-gray-400 mt-1 ml-1 flex items-start gap-1">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              <span>
                Your phone needs this to load the <b>App Interface</b>. <br/>
                Once loaded, the App connects to Supabase directly via internet.
              </span>
            </p>
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
              // Clear credentials to use Offline Mode
              localStorage.removeItem('sb_url');
              localStorage.removeItem('sb_key');
              onSave('', '');
              onClose();
            }}
            className="flex-1"
          >
            Reset / Offline
          </Button>
          <Button 
            fullWidth 
            className="flex-1"
            onClick={() => {
              // Trigger onSave to refresh App state with current inputs
              onSave(sbUrl, sbKey);
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