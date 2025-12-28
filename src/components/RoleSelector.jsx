import React, { useState } from 'react';
import { User, Shield, Crown, ArrowRight, Zap, AlertTriangle, Lock, Eye, EyeOff, X } from 'lucide-react';

const ROLES = [
  {
    id: 'citizen',
    label: 'CITIZEN',
    description: 'Report emergencies & track status',
    icon: User,
    color: 'from-blue-600 to-blue-800',
    hoverColor: 'group-hover:from-blue-500 group-hover:to-blue-700',
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
    hoverColor: 'group-hover:from-orange-500 group-hover:to-orange-700',
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
    hoverColor: 'group-hover:from-red-500 group-hover:to-red-700',
    glowColor: 'shadow-red-500/30',
    borderColor: 'border-red-500/30',
    features: ['Full access', 'Delete incidents', 'View analytics']
  }
];

const RoleSelector = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  
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
    
    // Simulate authentication delay for effect
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
    
    // Determine redirect path based on role
    let path = '/dashboard';
    if (selectedRole === 'admin') {
      path = '/analytics';
    } else if (selectedRole === 'responder') {
      path = '/responder';
    }
    
    setTimeout(() => {
      onLogin(selectedRole, name);
      // Store redirect path for after auth completes
      sessionStorage.setItem('authRedirect', path);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0yNiAzNGgtMnYtNGgydjR6bTAtNnYtNGgtMnY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className={`relative z-10 w-full max-w-4xl mx-4 transition-all duration-500 ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-2xl shadow-red-500/30">
            <AlertTriangle size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">EmergencyHub</span>
          </h1>
          <p className="text-gray-400 text-lg">AI-Powered Emergency Response Platform</p>
        </div>

        {/* Subtitle */}
        <p className="text-center text-gray-300 mb-8 text-lg">
          Select your role to continue
        </p>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                  ${isSelected 
                    ? `bg-gradient-to-br ${role.color} border-transparent shadow-2xl ${role.glowColor} scale-105` 
                    : `bg-gray-900/50 backdrop-blur-xl ${role.borderColor} hover:border-opacity-100 hover:scale-105`
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

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all
                  ${isSelected ? 'bg-white/20' : `bg-gradient-to-br ${role.color}`}`}>
                  <Icon size={28} className="text-white" />
                </div>

                {/* Label */}
                <h3 className="text-xl font-bold text-white mb-1">{role.label}</h3>
                <p className={`text-sm mb-4 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-1">
                  {role.features.map((feature, i) => (
                    <li key={i} className={`text-xs flex items-center gap-2 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                      <Zap size={10} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Name Input */}
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-sm text-gray-400 mb-2">Your Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
          />
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300
              ${selectedRole
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/30 hover:scale-105 hover:shadow-red-500/50'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
          >
            Continue to Platform
            <ArrowRight size={20} className={selectedRole ? 'animate-pulse' : ''} />
          </button>
        </div>

        {/* Demo Note */}
        <p className="text-center text-gray-600 text-sm mt-6">
          🔒 This is a demo authentication for presentation purposes
        </p>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-8 animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg shadow-red-500/30">
                <Lock size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Authentication</h2>
              <p className="text-gray-400 text-sm">Enter your credentials to access admin panel</p>
            </div>

            {/* Error Message */}
            {adminError && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center animate-pulse">
                ⚠️ {adminError}
              </div>
            )}

            {/* Username Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  autoFocus
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleAdminLogin}
              disabled={isAuthenticating || !adminUsername || !adminPassword}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300
                ${isAuthenticating || !adminUsername || !adminPassword
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/30 hover:scale-[1.02]'
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
