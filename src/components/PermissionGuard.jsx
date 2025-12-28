import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PermissionGuard = ({ 
  requiredRole, 
  children, 
  fallback = null,
  showMessage = true,
  inline = false 
}) => {
  const { hasPermission, user } = useAuth();

  // Check if user has required permission
  if (hasPermission(requiredRole)) {
    return children;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return fallback;
  }

  // If we shouldn't show a message, return null
  if (!showMessage) {
    return null;
  }

  // Permission denied message
  const roleLabels = {
    citizen: 'Citizen',
    responder: 'Responder',
    admin: 'Admin'
  };

  // Inline version for buttons/small areas
  if (inline) {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800/50 rounded-lg text-gray-500 text-sm cursor-not-allowed animate-shake">
        <Lock size={14} />
        <span>{roleLabels[requiredRole]}+ Only</span>
      </div>
    );
  }

  // Full permission denied block
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 animate-shake-once">
      <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
        <ShieldAlert size={32} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Access Restricted</h3>
      <p className="text-gray-400 text-center mb-4">
        This feature requires <span className="text-red-400 font-semibold">{roleLabels[requiredRole]}</span> access or higher.
      </p>
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm">
        <span className="text-gray-500">Current Role:</span>
        <span className="text-white font-medium capitalize">{user?.role || 'None'}</span>
      </div>

      <style jsx>{`
        @keyframes shake-once {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake-once {
          animation: shake-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// Higher-order component version
export const withPermission = (WrappedComponent, requiredRole) => {
  return function PermissionWrapper(props) {
    return (
      <PermissionGuard requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
};

// Hook for checking permissions
export const usePermission = (requiredRole) => {
  const { hasPermission } = useAuth();
  return hasPermission(requiredRole);
};

export default PermissionGuard;
