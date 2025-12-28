import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, Siren, ThumbsUp, 
  Shield, Clock, X, ChevronDown, ChevronUp 
} from 'lucide-react';
import { subscribeToIncidents } from '../services/socket';

const ACTIVITY_ICONS = {
  new_incident: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
  verified: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  dispatched: { icon: Siren, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  upvote: { icon: ThumbsUp, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  resolved: { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  status_update: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
};

const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
};

const ActivityItem = ({ activity }) => {
  const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.status_update;
  const Icon = config.icon;
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(activity.timestamp));

  // Update time ago every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(activity.timestamp));
    }, 10000);
    return () => clearInterval(interval);
  }, [activity.timestamp]);

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg animate-slide-in-right">
      <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{activity.message}</p>
        <p className="text-gray-500 text-xs">{timeAgo}</p>
      </div>
    </div>
  );
};

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Subscribe to real-time events
  useEffect(() => {
    const unsubscribe = subscribeToIncidents((event) => {
      let newActivity = null;

      switch (event.type) {
        case 'new_incident':
          newActivity = {
            id: Date.now(),
            type: 'new_incident',
            message: `🚨 New ${event.data.incident?.severity || ''} incident: ${event.data.incident?.type}`,
            timestamp: new Date()
          };
          break;
        case 'upvote_update':
          newActivity = {
            id: Date.now(),
            type: 'upvote',
            message: `👍 Incident received ${event.data.upvotes} upvotes`,
            timestamp: new Date()
          };
          break;
        case 'incident_updated':
          newActivity = {
            id: Date.now(),
            type: 'status_update',
            message: `📋 Incident status updated to ${event.data.status}`,
            timestamp: new Date()
          };
          break;
        default:
          break;
      }

      if (newActivity) {
        setActivities(prev => [newActivity, ...prev].slice(0, 10));
      }
    });

    // Add some demo activities on mount
    const demoActivities = [
      { id: 1, type: 'new_incident', message: '🚨 New Critical incident in Downtown', timestamp: new Date(Date.now() - 30000) },
      { id: 2, type: 'verified', message: '✅ Fire incident verified by Admin', timestamp: new Date(Date.now() - 120000) },
      { id: 3, type: 'dispatched', message: '🚑 Ambulance dispatched to Highway 101', timestamp: new Date(Date.now() - 300000) },
      { id: 4, type: 'upvote', message: '👍 Medical emergency received 5 upvotes', timestamp: new Date(Date.now() - 600000) },
      { id: 5, type: 'resolved', message: '✓ Traffic accident resolved', timestamp: new Date(Date.now() - 900000) }
    ];
    setActivities(demoActivities);

    return () => unsubscribe();
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-40 w-80 transition-all duration-300 ${isMinimized ? 'h-12' : 'max-h-96'}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-t-xl px-4 py-3 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white font-medium text-sm">Live Activity</span>
          <span className="px-2 py-0.5 bg-gray-800 rounded-full text-gray-400 text-xs">
            {activities.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isMinimized ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Activity List */}
      {!isMinimized && (
        <div className="bg-gray-900/95 backdrop-blur-xl border-x border-b border-gray-700 rounded-b-xl overflow-hidden">
          <div className="max-h-72 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LiveActivityFeed;
