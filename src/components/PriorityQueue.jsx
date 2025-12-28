import React, { useMemo } from 'react';
import { 
  Flame, Clock, MapPin, TrendingUp, AlertTriangle, 
  CheckCircle, ArrowUp, Zap, Shield, Eye
} from 'lucide-react';

const SEVERITY_CONFIG = {
  Critical: { score: 100, color: 'bg-red-600', textColor: 'text-red-400', borderColor: 'border-red-500' },
  High: { score: 70, color: 'bg-orange-500', textColor: 'text-orange-400', borderColor: 'border-orange-500' },
  Medium: { score: 40, color: 'bg-yellow-500', textColor: 'text-yellow-400', borderColor: 'border-yellow-500' },
  Low: { score: 10, color: 'bg-green-500', textColor: 'text-green-400', borderColor: 'border-green-500' }
};

const TYPE_ICONS = {
  Fire: '🔥',
  Accident: '🚗',
  Medical: '🏥',
  Crime: '🚨',
  Infrastructure: '🏗️',
  Other: '⚠️'
};

// Calculate dynamic priority score
const calculatePriorityScore = (incident) => {
  let score = 0;

  // Base severity score
  const severityConfig = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.Medium;
  score += severityConfig.score;

  // Time decay: More recent = higher priority (max 30 points)
  const minutesAgo = (Date.now() - new Date(incident.timestamp).getTime()) / 60000;
  const timeBonus = Math.max(0, 30 - Math.floor(minutesAgo / 10) * 5);
  score += timeBonus;

  // Upvote boost: Each upvote adds 2 points (max 20)
  const upvoteBonus = Math.min(20, (incident.upvotes || 0) * 2);
  score += upvoteBonus;

  // Verification bonus: +15 if verified
  if (incident.verified) {
    score += 15;
  }

  // Status reduction
  if (incident.status === 'In Progress' || incident.status === 'Dispatched') {
    score = Math.floor(score * 0.7); // Reduce by 30%
  } else if (incident.status === 'Resolved' || incident.status === 'Closed') {
    score = Math.floor(score * 0.3); // Reduce by 70%
  }

  return Math.min(100, Math.max(0, score));
};

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const getRankStyle = (rank) => {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-500 to-amber-600 text-black';
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-black';
  if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white';
  return 'bg-gray-700 text-gray-300';
};

const PriorityQueue = ({ incidents, onSelectIncident, selectedId }) => {
  // Calculate scores and sort by priority
  const sortedIncidents = useMemo(() => {
    return [...incidents]
      .map(incident => ({
        ...incident,
        calculatedPriority: calculatePriorityScore(incident)
      }))
      .sort((a, b) => b.calculatedPriority - a.calculatedPriority);
  }, [incidents]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      critical: incidents.filter(i => i.severity === 'Critical').length,
      active: incidents.filter(i => ['Reported', 'Verified', 'In Progress', 'Dispatched'].includes(i.status)).length,
      pending: incidents.filter(i => i.status === 'Reported').length
    };
  }, [incidents]);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-red-900/50 to-orange-900/50">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="text-orange-500 animate-pulse" size={24} />
          <h2 className="text-xl font-bold text-white">Priority Queue</h2>
          <div className="ml-auto px-2 py-1 bg-purple-600/30 rounded text-purple-300 text-xs flex items-center gap-1">
            <Zap size={12} />
            AI-Powered
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-2 text-xs">
          <div className="px-2 py-1 bg-red-600/30 rounded-full text-red-300 flex items-center gap-1">
            <AlertTriangle size={12} />
            {stats.critical} Critical
          </div>
          <div className="px-2 py-1 bg-orange-600/30 rounded-full text-orange-300 flex items-center gap-1">
            <TrendingUp size={12} />
            {stats.active} Active
          </div>
          <div className="px-2 py-1 bg-blue-600/30 rounded-full text-blue-300 flex items-center gap-1">
            <Clock size={12} />
            {stats.pending} Pending
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircle size={48} className="mb-3 opacity-50" />
            <p className="text-sm">No active incidents</p>
          </div>
        ) : (
          sortedIncidents.map((incident, index) => {
            const rank = index + 1;
            const severityConfig = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.Medium;
            const isSelected = selectedId === incident._id;
            const isCritical = incident.severity === 'Critical';

            return (
              <div
                key={incident._id}
                onClick={() => onSelectIncident(incident)}
                className={`relative p-3 rounded-xl cursor-pointer transition-all duration-200 
                  ${isSelected 
                    ? 'bg-blue-600/30 border-2 border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600'
                  }
                  ${isCritical ? 'ring-1 ring-red-500/50' : ''}
                `}
              >
                {/* Severity Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${severityConfig.color}`} />

                {/* Rank Badge - Top Left */}
                <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${getRankStyle(rank)}`}>
                  #{rank}
                </div>

                {/* Priority Score - Top Right */}
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-600 rounded-full text-white text-xs font-bold shadow-lg">
                  {incident.calculatedPriority}
                </div>

                {/* Urgent Badge for Critical */}
                {isCritical && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 rounded text-white text-[10px] font-bold animate-pulse flex items-center gap-1">
                    <AlertTriangle size={10} />
                    URGENT
                  </div>
                )}

                {/* Content */}
                <div className="pl-4 pt-2">
                  {/* Type & Time */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TYPE_ICONS[incident.type] || TYPE_ICONS.Other}</span>
                      <span className="font-semibold text-white">{incident.type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock size={12} />
                      {formatTimeAgo(incident.timestamp)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {incident.description}
                  </p>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin size={12} />
                      <span className="truncate max-w-[100px]">
                        {incident.location?.address || `${incident.location?.lat?.toFixed(3)}, ${incident.location?.lng?.toFixed(3)}`}
                      </span>
                    </div>

                    {/* Status & Badges */}
                    <div className="flex items-center gap-2">
                      {incident.verified && (
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle size={12} />
                        </div>
                      )}
                      {(incident.upvotes || 0) > 0 && (
                        <div className="flex items-center gap-1 text-blue-400 text-xs">
                          <ArrowUp size={12} />
                          {incident.upvotes}
                        </div>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${severityConfig.color}`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="p-3 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-gray-400 font-mono">1-9</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-gray-400 font-mono">V</kbd>
            Verify
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-gray-400 font-mono">D</kbd>
            Dispatch
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriorityQueue;
