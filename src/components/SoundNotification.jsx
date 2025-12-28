import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, Rocket, CheckCircle } from 'lucide-react';
import { soundControls } from '../utils/soundEffects';

const NOTIFICATION_ICONS = {
  critical: AlertTriangle,
  dispatched: Rocket,
  resolved: CheckCircle
};

const NOTIFICATION_COLORS = {
  critical: 'from-red-600 to-red-700 border-red-500',
  dispatched: 'from-blue-600 to-blue-700 border-blue-500',
  resolved: 'from-green-600 to-green-700 border-green-500'
};

const SoundNotification = () => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification
  const addNotification = useCallback((type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Remove a notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Register callback with sound manager
  useEffect(() => {
    soundControls.setOnSoundPlay(addNotification);
    return () => soundControls.setOnSoundPlay(null);
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[200] space-y-2">
      {notifications.map((notification) => {
        const Icon = NOTIFICATION_ICONS[notification.type] || AlertTriangle;
        const colors = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.critical;

        return (
          <div
            key={notification.id}
            className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${colors} 
                       text-white rounded-xl shadow-lg border animate-slide-in-right
                       min-w-[250px] max-w-[350px]`}
          >
            <Icon size={20} className="flex-shrink-0 animate-pulse" />
            <span className="flex-1 font-medium text-sm">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SoundNotification;
