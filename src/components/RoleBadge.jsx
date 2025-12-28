import React, { useState } from 'react';
import { User, Shield, Crown, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  citizen: {
    icon: User,
    label: 'Citizen',
    color: 'bg-blue-600',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
    borderColor: 'border-blue-500/30'
  },
  responder: {
    icon: Shield,
    label: 'Responder',
    color: 'bg-orange-600',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-600/20',
    borderColor: 'border-orange-500/30'
  },
  admin: {
    icon: Crown,
    label: 'Admin',
    color: 'bg-red-600',
    textColor: 'text-red-400',
    bgColor: 'bg-red-600/20',
    borderColor: 'border-red-500/30'
  }
};

const RoleBadge = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated || !user) return null;

  const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.citizen;
  const Icon = config.icon;

  return (
    <div className="relative">
      {/* Badge Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:scale-105 ${config.bgColor} ${config.borderColor}`}
      >
        <Icon size={16} className={config.textColor} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
        <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''} ${config.textColor}`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-500 text-sm capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Role Permissions */}
            <div className="p-3 border-b border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Permissions</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-gray-300">Report Incidents</span>
                </div>
                {(user.role === 'responder' || user.role === 'admin') && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-gray-300">Verify & Dispatch</span>
                  </div>
                )}
                {user.role === 'admin' && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-gray-300">Full Admin Access</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-600/10 transition-colors"
            >
              <LogOut size={18} />
              <span>Switch Role / Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleBadge;
