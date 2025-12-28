import React, { useState, useEffect } from 'react';
import { Radio, Activity, AlertTriangle } from 'lucide-react';

const LiveIndicator = ({ incidentCount, lastUpdate }) => {
  const [pulse, setPulse] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [prevCount, setPrevCount] = useState(incidentCount);

  // Detect new incidents and trigger pulse animation
  useEffect(() => {
    if (incidentCount > prevCount) {
      setPulse(true);
      setShowToast(true);
      
      // Reset pulse after animation
      const pulseTimer = setTimeout(() => setPulse(false), 1000);
      // Hide toast after 3 seconds
      const toastTimer = setTimeout(() => setShowToast(false), 3000);
      
      return () => {
        clearTimeout(pulseTimer);
        clearTimeout(toastTimer);
      };
    }
    setPrevCount(incidentCount);
  }, [incidentCount, prevCount]);

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Just now';
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <>
      {/* Main Live Indicator - Fixed Top Right (below navbar on mobile) */}
      <div 
        className={`fixed top-[70px] sm:top-20 right-3 sm:right-4 z-40 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 
          bg-black/90 backdrop-blur-md rounded-full border border-red-500/50 
          shadow-lg shadow-red-500/10 transition-all duration-300
          ${pulse ? 'scale-105 border-red-400' : 'scale-100'}
        `}
      >
        {/* LIVE Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-gray-600">
          <div className="relative">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full animate-ping" />
          </div>
          <span className="text-red-500 font-bold text-xs sm:text-sm tracking-wider">LIVE</span>
        </div>

        {/* Incident Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-gray-600">
          <Activity size={14} className="text-blue-400 sm:w-4 sm:h-4" />
          <div className="flex flex-col items-center">
            <span className={`text-lg sm:text-xl font-bold text-white leading-none transition-all duration-300 ${pulse ? 'text-red-400 scale-110' : ''}`}>
              {incidentCount}
            </span>
            <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-wider">Active</span>
          </div>
        </div>

        {/* Signal Strength Bars - Hidden on very small screens */}
        <div className="hidden xs:flex items-center gap-1">
          <Radio size={12} className="text-green-400 sm:w-3.5 sm:h-3.5" />
          <div className="flex items-end gap-0.5 h-3 sm:h-4">
            <div className="w-0.5 sm:w-1 h-1 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-0.5 sm:w-1 h-1.5 sm:h-2 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-green-400 rounded-sm animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>

      {/* New Incident Toast */}
      {showToast && (
        <div 
          className="fixed top-[120px] sm:top-32 right-3 sm:right-4 z-40 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 
            bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-xl 
            animate-slide-in-right max-w-[calc(100vw-24px)] sm:max-w-none"
        >
          <div className="p-2 bg-white/20 rounded-full">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">New Incident Reported!</p>
            <p className="text-white/80 text-xs">Real-time update received</p>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
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
    </>
  );
};

export default LiveIndicator;
