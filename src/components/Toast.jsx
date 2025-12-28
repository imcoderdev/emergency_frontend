import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast types configuration
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
    border: 'border-green-500/50',
    iconColor: 'text-white'
  },
  error: {
    icon: XCircle,
    bg: 'bg-gradient-to-r from-red-600 to-rose-600',
    border: 'border-red-500/50',
    iconColor: 'text-white'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-gradient-to-r from-yellow-600 to-orange-600',
    border: 'border-yellow-500/50',
    iconColor: 'text-white'
  },
  info: {
    icon: Info,
    bg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    border: 'border-blue-500/50',
    iconColor: 'text-white'
  }
};

// Individual Toast Component
const Toast = ({ id, type = 'info', message, title, onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-sm
        ${config.bg} ${config.border}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-slide-in-right
      `}
      style={{ minWidth: '300px', maxWidth: '400px' }}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        <Icon size={22} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-white text-sm mb-0.5">{title}</h4>
        )}
        <p className="text-white/90 text-sm">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback({
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Stack */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            title={t.title}
            duration={t.duration}
            onClose={removeToast}
          />
        ))}
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// Custom Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op toast if not within provider
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    };
  }
  return context;
};

// Standalone toast function (for use outside React components)
let toastRef = null;

export const setToastRef = (ref) => {
  toastRef = ref;
};

export const showToast = {
  success: (message, options) => toastRef?.success(message, options),
  error: (message, options) => toastRef?.error(message, options),
  warning: (message, options) => toastRef?.warning(message, options),
  info: (message, options) => toastRef?.info(message, options)
};

export default Toast;
