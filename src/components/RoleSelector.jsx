import React, { useState } from 'react';
import { User, Shield, Crown, ArrowRight, Zap, AlertTriangle, Lock, Eye, EyeOff, X } from 'lucide-react';

const ROLES = [
  {
    id: 'citizen',
    label: 'CITIZEN',
    description: 'Report emergencies & track status',
    icon: User,
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-600',
    glowColor: 'shadow-blue-500/30',
    borderColor: 'border-blue-500/30',
    features: ['Report incidents', 'Track status', 'Upvote reports']
  },
  {
    id: 'responder',
    label: 'RESPONDER',
    description: 'Manage & dispatch to incidents',
    icon: Shield,
    color: 'from-orange-600 to-orange-800',
    bgColor: 'bg-orange-600',
    glowColor: 'shadow-orange-500/30',
    borderColor: 'border-orange-500/30',
    features: ['View priority queue', 'Dispatch units', 'Verify incidents']
  },
  {
    id: 'admin',
    label: 'ADMIN',
    description: 'Full system control & analytics',
    icon: Crown,
    color: 'from-red-600 to-red-800',
    bgColor: 'bg-red-600',
    glowColor: 'shadow-red-500/30',
    borderColor: 'border-red-500/30',
    features: ['Full access', 'Delete incidents', 'View analytics']
  }
];

const RoleSelector = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Admin login modal states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleRoleSelect = (roleId) => {
    if (roleId === 'admin') {
      setShowAdminLogin(true);
      setAdminError('');
      setAdminUsername('');
      setAdminPassword('');
    } else {
      setSelectedRole(roleId);
    }
  };

  const handleAdminLogin = () => {
    setIsAuthenticating(true);
    setAdminError('');
    
    setTimeout(() => {
      if (adminUsername === 'Admin' && adminPassword === 'Admin@123') {
        setSelectedRole('admin');
        setShowAdminLogin(false);
        setName('Administrator');
        setIsAuthenticating(false);
      } else {
        setAdminError('Invalid credentials. Access denied.');
        setIsAuthenticating(false);
      }
    }, 800);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    setIsAnimating(true);
    
    let path = '/dashboard';
    if (selectedRole === 'admin') {
      path = '/analytics';
    } else if (selectedRole === 'responder') {
      path = '/responder';
    }
    
    setTimeout(() => {
      onLogin(selectedRole, name);
      sessionStorage.setItem('authRedirect', path);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 overflow-y-auto">
      {/* Scrollable Container */}
      <div className="min-h-full flex flex-col items-center justify-start py-6 px-4 sm:py-10 sm:justify-center">
        
        {/* Main Content Card */}
        <div className={`w-full max-w-4xl transition-all duration-500 ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
          
          {/* Logo & Title - Smaller on mobile */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 mb-3 sm:mb-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl sm:rounded-2xl shadow-xl shadow-red-500/30">
              <AlertTriangle size={28} className="sm:hidden text-white" />
              <AlertTriangle size={40} className="hidden sm:block text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
              Welcome to <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">EmergencyHub</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg">AI-Powered Emergency Response Platform</p>
          </div>

          {/* Subtitle */}
          <p className="text-center text-gray-300 mb-4 sm:mb-6 text-sm sm:text-lg">
            Select your role to continue
          </p>

          {/* Role Cards - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left touch-manipulation
                    ${isSelected 
                      ? `bg-gradient-to-br ${role.color} border-transparent shadow-xl ${role.glowColor}` 
                      : `bg-gray-800/80 ${role.borderColor} hover:bg-gray-700/80 active:bg-gray-600/80`
                    }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Mobile: Horizontal layout, Desktop: Vertical */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                    {/* Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0
                      ${isSelected ? 'bg-white/20' : `bg-gradient-to-br ${role.color}`}`}>
                      <Icon size={24} className="text-white" />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">{role.label}</h3>
                      <p className={`text-xs sm:text-sm ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        {role.description}
                      </p>

                      {/* Features - Hidden on mobile when not selected */}
                      <ul className={`mt-2 sm:mt-4 space-y-1 ${isSelected ? 'block' : 'hidden sm:block'}`}>
                        {role.features.map((feature, i) => (
                          <li key={i} className={`text-xs flex items-center gap-2 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                            <Zap size={10} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Name Input - Only show when role selected (not admin) */}
          {selectedRole && selectedRole !== 'admin' && (
            <div className="max-w-md mx-auto mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-sm text-gray-400 mb-2">Your Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-base"
                autoFocus
              />
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 touch-manipulation
                ${selectedRole
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/30 hover:scale-105 active:scale-100'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              Continue to Platform
              <ArrowRight size={20} className={selectedRole ? 'animate-pulse' : ''} />
            </button>
          </div>

          {/* Demo Note */}
          <p className="text-center text-gray-600 text-xs sm:text-sm">
            🔒 Demo authentication for presentation purposes
          </p>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all touch-manipulation"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg shadow-red-500/30">
                <Lock size={28} className="text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Admin Authentication</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Enter credentials to access admin panel</p>
            </div>

            {/* Error Message */}
            {adminError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                ⚠️ {adminError}
              </div>
            )}

            {/* Username Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">Username</label>
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full font-medium">Admin</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Admin"
                  className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-base"
                  autoFocus
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">Password</label>
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full font-medium">Admin@123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin@123"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-base"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1 touch-manipulation"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleAdminLogin}
              disabled={isAuthenticating || !adminUsername || !adminPassword}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 touch-manipulation
                ${isAuthenticating || !adminUsername || !adminPassword
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/30 active:scale-98'
                }`}
            >
              {isAuthenticating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Crown size={20} />
                  Access Admin Panel
                </>
              )}
            </button>

            {/* Hint */}
            <p className="text-center text-gray-600 text-xs mt-4">
              🔐 Authorized personnel only
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
