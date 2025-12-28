import React from 'react';
import { 
  AlertTriangle, Link2, MapPin, Clock, XCircle, 
  Zap, CheckCircle, ArrowUp, Shield
} from 'lucide-react';

const TYPE_ICONS = {
  Fire: '🔥',
  Accident: '🚗',
  Medical: '🏥',
  Crime: '🚨',
  Infrastructure: '🏗️',
  Other: '⚠️'
};

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const getMatchColor = (confidence) => {
  if (confidence >= 80) return 'bg-red-600 text-white';
  if (confidence >= 60) return 'bg-orange-500 text-white';
  return 'bg-yellow-500 text-black';
};

const DuplicateAlert = ({ duplicates, onLinkToDuplicate, onReportAnyway, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal - Full width on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-yellow-500/30 animate-slide-up overflow-hidden max-h-[90vh] sm:max-h-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/30 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-xl">
              <AlertTriangle size={24} className="sm:hidden text-yellow-500 animate-pulse" />
              <AlertTriangle size={32} className="hidden sm:block text-yellow-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Possible Duplicate</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Similar incident(s) found nearby</p>
            </div>
          </div>

          {/* AI Explanation Badge */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
            <Zap size={14} className="text-purple-400 flex-shrink-0" />
            <span className="text-purple-300 text-xs sm:text-sm">
              Found <strong>{duplicates.length}</strong> similar within 500m (last 2 hours)
            </span>
          </div>
        </div>

        {/* Duplicates List */}
        <div className="p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto space-y-2 sm:space-y-3">
          {duplicates.map((incident, index) => (
            <div
              key={incident._id || index}
              onClick={() => onLinkToDuplicate(incident)}
              className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer transition-all group"
            >
              {/* Top Row: Match Badge + Type + Time */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Match Percentage */}
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getMatchColor(incident.confidence || 75)}`}>
                    {incident.confidence || 75}% Match
                  </span>
                  {/* Type */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{TYPE_ICONS[incident.type] || TYPE_ICONS.Other}</span>
                    <span className="font-medium text-white">{incident.type}</span>
                  </div>
                </div>
                {/* Time */}
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock size={12} />
                  {formatTimeAgo(incident.timestamp)}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                {incident.description}
              </p>

              {/* Bottom Row: Location + Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <MapPin size={12} />
                  <span className="truncate max-w-[150px]">
                    {incident.location?.address || `${incident.location?.lat?.toFixed(4)}, ${incident.location?.lng?.toFixed(4)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {incident.verified && (
                    <div className="flex items-center gap-1 text-green-400 text-xs">
                      <CheckCircle size={12} />
                      <span>Verified</span>
                    </div>
                  )}
                  {(incident.upvotes || 0) > 0 && (
                    <div className="flex items-center gap-1 text-blue-400 text-xs">
                      <ArrowUp size={12} />
                      {incident.upvotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover indicator */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                <span className="text-xs text-blue-400 flex items-center justify-center gap-1">
                  <Link2 size={12} />
                  Click to link to this incident
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-3 sm:p-4 border-t border-slate-700 space-y-2 sm:space-y-3">
          <button
            onClick={() => onLinkToDuplicate(duplicates[0])}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-xl transition-all active:scale-[0.98] touch-manipulation"
          >
            <Link2 size={18} />
            <span className="text-sm sm:text-base">Link to Existing (Recommended)</span>
          </button>

          <button
            onClick={onReportAnyway}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-400 font-medium rounded-xl transition-all touch-manipulation"
          >
            <Shield size={18} />
            <span className="text-sm sm:text-base">Report as New</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all touch-manipulation"
          >
            <XCircle size={18} />
            Cancel
          </button>
        </div>

        {/* Info Note */}
        <div className="px-3 sm:px-4 pb-4 sm:pb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <Zap size={14} className="text-blue-400 flex-shrink-0" />
            <span className="text-blue-300 text-xs">
              Linking helps avoid duplicate dispatches
            </span>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DuplicateAlert;
