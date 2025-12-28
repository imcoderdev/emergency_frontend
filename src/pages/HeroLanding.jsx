import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, ArrowRight, Activity, Brain, Clock, Shield, 
  TrendingUp, Radio, ChevronRight, AlertTriangle,
  MapPin, Users, CheckCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Animated counter hook
const useCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
};

const StatCard = ({ value, label, suffix = '', sublabel }) => {
  const animatedValue = useCounter(value);
  
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105 hover:bg-white/10">
      <div className="text-4xl font-bold text-white mb-1">
        {animatedValue.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-400 text-sm">{label}</div>
      {sublabel && (
        <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
          <TrendingUp size={12} />
          {sublabel}
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    red: 'from-red-600 to-red-800 group-hover:from-red-500 group-hover:to-red-700',
    orange: 'from-orange-600 to-orange-800 group-hover:from-orange-500 group-hover:to-orange-700',
    purple: 'from-purple-600 to-purple-800 group-hover:from-purple-500 group-hover:to-purple-700',
    blue: 'from-blue-600 to-blue-800 group-hover:from-blue-500 group-hover:to-blue-700'
  };

  return (
    <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105 cursor-pointer">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 transition-all shadow-lg`}>
        <Icon size={28} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

const HeroLanding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Classification',
      description: 'Gemini AI automatically analyzes severity and categorizes incidents for faster response.',
      color: 'red'
    },
    {
      icon: Clock,
      title: 'Real-Time Sync',
      description: 'WebSocket-powered live updates keep all responders synchronized instantly.',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Smart De-duplication',
      description: 'AI detects duplicate reports within 500m to prevent resource waste.',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: 'Priority Queue',
      description: 'Dynamic scoring algorithm ensures critical incidents get attention first.',
      color: 'blue'
    }
  ];

  const steps = [
    { number: 1, title: 'Report', description: 'Citizen reports emergency with one tap' },
    { number: 2, title: 'Analyze', description: 'AI processes severity & location' },
    { number: 3, title: 'Prioritize', description: 'Smart queue ranks by urgency' },
    { number: 4, title: 'Dispatch', description: 'Nearest responder gets notified' }
  ];

  const techStack = [
    'React', 'Node.js', 'MongoDB', 'Socket.IO', 'Gemini AI', 'Leaflet', 'Express', 'Tailwind'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 overflow-hidden">
      {/* Animated Background Effects - Hidden on small devices for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="sm:hidden text-white" />
              <AlertTriangle size={24} className="hidden sm:block text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">EmergencyHub</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/responder')}
              className="hidden sm:block px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Responders
            </button>
            
            {/* Show different button based on auth state */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm text-gray-400">
                  {user?.role === 'admin' ? '👑' : user?.role === 'responder' ? '🛡️' : '👤'} {user?.name}
                </span>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-red-500/25 text-sm sm:text-base"
              >
                🔐 Login
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-24">
          {/* Live Badge */}
          <div className={`flex justify-center mb-6 sm:mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600/20 border border-red-500/30 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="text-red-400 text-xs sm:text-sm font-medium">LIVE EMERGENCY RESPONSE</span>
            </div>
          </div>

          {/* Hero Heading */}
          <div className={`text-center mb-6 sm:mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-2 sm:mb-4">
              AI-Powered Emergency
            </h1>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Response Platform
            </h1>
          </div>

          {/* Subtitle */}
          <p className={`text-base sm:text-xl text-gray-400 text-center max-w-2xl mx-auto mb-8 sm:mb-12 px-2 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Cutting response time by <span className="text-green-400 font-semibold">40%</span> through intelligent incident reporting, 
            real-time coordination, and AI-driven prioritization.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-20 px-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={() => navigate('/report')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-500/25 touch-manipulation"
            >
              <Zap size={20} />
              Report Emergency
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all hover:scale-105 touch-manipulation"
            >
              <Activity size={20} />
              Live Dashboard
            </button>
          </div>

          {/* Stats - Stack vertically on mobile */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-16 sm:mb-24 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <StatCard value={1247} label="Incidents Processed" />
            <StatCard value={8} label="Avg Response Time" suffix=" min" sublabel="40% faster" />
            <StatCard value={89} label="Resource Efficiency" suffix="%" />
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Powered by AI Innovation</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base px-4">
              Our platform leverages cutting-edge technology to save lives and optimize emergency response.
            </p>
          </div>

          {/* Single column on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">How It Works</h2>
            <p className="text-gray-400 text-sm sm:text-base">From report to response in under 8 minutes</p>
          </div>

          {/* Steps - 2 columns on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-red-600/50 to-transparent" />
                )}
                <div className="relative text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-red-500/30">
                    {step.number}
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Built With Modern Technology</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {techStack.map((tech, index) => (
              <div 
                key={index}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full text-gray-300 text-xs sm:text-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
              >
                {tech}
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-red-500/20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to Save Lives?</h2>
            <p className="text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
              Join our platform and help reduce emergency response times in your community.
            </p>
            <button
              onClick={() => navigate('/report')}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 touch-manipulation"
            >
              Get Started
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <AlertTriangle size={18} className="text-red-500" />
              <span>EmergencyHub © 2025</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-gray-400 text-xs sm:text-sm">
              <a href="#" className="hover:text-white transition-colors py-1">About</a>
              <a href="#" className="hover:text-white transition-colors py-1">Privacy</a>
              <a href="#" className="hover:text-white transition-colors py-1">Terms</a>
              <a href="#" className="hover:text-white transition-colors py-1">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HeroLanding;
