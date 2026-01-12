import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { Bell, X } from 'lucide-react';

interface Props {
  notification: Notification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<Props> = ({ notification, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      // iOS default notification duration
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300); // wait for animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification && !visible) return null;

  return (
    <div 
      className={`fixed top-2 left-2 right-2 z-50 transition-all duration-300 ease-out transform ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white/80 backdrop-blur-md text-black p-4 rounded-2xl shadow-lg border border-gray-200/50 flex items-start gap-3">
        <div className="bg-red-500 p-2 rounded-xl shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-[15px] truncate pr-2">{notification?.senderName || 'BuzzSync'}</h3>
            <span className="text-xs text-gray-400">now</span>
          </div>
          <p className="text-[15px] text-gray-700 leading-snug break-words">
            {notification?.message}
          </p>
        </div>
      </div>
    </div>
  );
};