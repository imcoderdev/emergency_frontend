import React from 'react';
import { 
  Flame, Car, AlertTriangle, Stethoscope, Shield, 
  HelpCircle, Clock, MapPin, ThumbsUp, CheckCircle,
  ChevronRight, Users
} from 'lucide-react';

const INCIDENT_ICONS = {
  fire: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/20' },
  accident: { icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  crime: { icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/20' },
  medical: { icon: Stethoscope, color: 'text-green-500', bg: 'bg-green-500/20' },
  natural_disaster: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  infrastructure: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-500/20' },
  other: { icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-500/20' }
};

const SEVERITY_STYLES = {
  critical: { 
    strip: 'bg-red-600', 
    badge: 'bg-red-600/20 text-red-400 border-red-500/30',
    pulse: true 
  },
  high: { 
    strip: 'bg-orange-500', 
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    pulse: false 
  },
  medium: { 
    strip: 'bg-yellow-500', 
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    pulse: false 
  },
  low: { 
    strip: 'bg-green-500', 
    badge: 'bg-green-500/20 text-green-400 border-green-500/30',
    pulse: false 
  }
};

const STATUS_BADGES = {
  pending: { label: 'Pending', class: 'bg-gray-600/20 text-gray-400 border-gray-500/30' },
  'in-progress': { label: 'In Progress', class: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
  resolved: { label: 'Resolved', class: 'bg-green-600/20 text-green-400 border-green-500/30' }
};

// Time ago helper
const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const IncidentCard = ({ 
  incident, 
  onClick, 
  onUpvote,
  showActions = true,
  isSelected = false,
  variant = 'default' // 'default' | 'compact' | 'detailed'
}) => {
  const { 
    _id, type, description, severity, status, 
    timestamp, upvotes = 0, verified = false,
    location, ai_analysis 
  } = incident;

  const typeConfig = INCIDENT_ICONS[type] || INCIDENT_ICONS.other;
  const severityConfig = SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium;
  const statusConfig = STATUS_BADGES[status] || STATUS_BADGES.pending;
  const Icon = typeConfig.icon;

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (onUpvote) onUpvote(_id);
  };

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
          ${isSelected ? 'bg-red-600/20 border border-red-500/50' : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'}
          ${severityConfig.pulse ? 'animate-pulse' : ''}`}
      >
        <div className={`w-2 h-8 rounded-full ${severityConfig.strip}`} />
        <div className={`w-8 h-8 rounded-lg ${typeConfig.bg} flex items-center justify-center`}>
          <Icon size={16} className={typeConfig.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate capitalize">
            {type.replace('_', ' ')} Emergency
          </p>
          <p className="text-gray-500 text-xs truncate">{description}</p>
        </div>
        <span className="text-gray-500 text-xs whitespace-nowrap">{timeAgo(timestamp)}</span>
      </div>
    );
  }

  // Default card variant
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl transition-all cursor-pointer
        ${isSelected ? 'ring-2 ring-red-500 bg-gray-800' : 'bg-gray-800/70 hover:bg-gray-800'}
        ${severityConfig.pulse ? 'animate-pulse' : ''}`}
    >
      {/* Severity Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${severityConfig.strip}`} />

      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${typeConfig.bg} flex items-center justify-center`}>
              <Icon size={20} className={typeConfig.color} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold capitalize">
                  {type.replace('_', ' ')}
                </h3>
                {verified && (
                  <CheckCircle size={14} className="text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Clock size={12} />
                <span>{timeAgo(timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${severityConfig.badge}`}>
              {severity}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs border ${statusConfig.class}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* AI Summary if available */}
        {ai_analysis?.summary && variant === 'detailed' && (
          <div className="bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">🤖 AI Analysis</p>
            <p className="text-gray-300 text-sm">{ai_analysis.summary}</p>
          </div>
        )}

        {/* Location */}
        {location?.address && (
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
            <MapPin size={12} />
            <span className="truncate">{location.address}</span>
          </div>
        )}

        {/* Footer Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
            <button
              onClick={handleUpvote}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              <ThumbsUp size={14} />
              <span>{upvotes}</span>
              <span className="text-xs text-gray-600">confirm</span>
            </button>

            <button className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors text-sm">
              <span>Details</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Grid of cards with loading state
export const IncidentCardGrid = ({ 
  incidents, 
  loading, 
  onCardClick, 
  onUpvote,
  selectedId 
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!incidents?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
        <p>No incidents reported</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {incidents.map(incident => (
        <IncidentCard
          key={incident._id}
          incident={incident}
          onClick={() => onCardClick?.(incident)}
          onUpvote={onUpvote}
          isSelected={incident._id === selectedId}
        />
      ))}
    </div>
  );
};

export default IncidentCard;
