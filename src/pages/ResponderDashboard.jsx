import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Shield, AlertTriangle, CheckCircle, Clock, Flame, MapPin,
  Users, TrendingUp, Bell, Volume2, VolumeX, RefreshCw,
  ChevronRight, Eye, Trash2, CheckSquare
} from 'lucide-react';
import { getIncidentStats, getPriorityQueue, getIncidents, updateIncidentStatus, verifyIncident, deleteIncident } from '../services/api';
import { subscribeToIncidents } from '../services/socket';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createMarkerIcon = (severity, isSelected) => {
  const colors = {
    Critical: '#dc2626',
    High: '#ea580c',
    Medium: '#ca8a04',
    Low: '#16a34a'
  };
  const color = colors[severity] || '#3b82f6';
  const size = isSelected ? 20 : 14;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px; 
      height: ${size}px; 
      background: ${color}; 
      border: 3px solid white;
      border-radius: 50%; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ${isSelected ? 'animation: pulse 1s infinite;' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Type icons
const typeIcons = {
  Fire: '🔥',
  Accident: '🚗',
  Medical: '🏥',
  Crime: '🚨',
  Infrastructure: '🏗️'
};

// Map component to fly to selected incident
const MapController = ({ selectedIncident }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedIncident && selectedIncident.location) {
      map.flyTo([selectedIncident.location.lat, selectedIncident.location.lng], 15, {
        duration: 1
      });
    }
  }, [selectedIncident, map]);
  
  return null;
};

const ResponderDashboard = () => {
  const [stats, setStats] = useState({
    total: 0, critical: 0, high: 0, inProgress: 0, resolved: 0, pending: 0, last24h: 0
  });
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotification, setShowNotification] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [statsData, queueData] = await Promise.all([
        getIncidentStats(),
        getPriorityQueue({ limit: 20 })
      ]);
      setStats(statsData);
      setPriorityQueue(queueData.incidents || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToIncidents((event) => {
      if (event.type === 'new_incident') {
        // Play sound for critical incidents
        if (soundEnabled && event.data.incident?.severity === 'Critical') {
          playNotificationSound();
        }
        setShowNotification(event.data.incident);
        setTimeout(() => setShowNotification(null), 5000);
        fetchData();
      } else if (event.type === 'upvote_update' || event.type === 'incident_updated') {
        fetchData();
      }
    });

    return () => unsubscribe();
  }, [soundEnabled, fetchData]);

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleA8YTq3jw4F6Fjax1d99bQ==');
    audio.play().catch(() => {});
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateIncidentStatus(id, newStatus);
      fetchData();
      if (selectedIncident?._id === id) {
        setSelectedIncident(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle verify
  const handleVerify = async (id) => {
    try {
      await verifyIncident(id);
      fetchData();
      if (selectedIncident?._id === id) {
        setSelectedIncident(prev => ({ ...prev, verified: true, status: 'Verified' }));
      }
    } catch (error) {
      console.error('Error verifying:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) return;
    try {
      await deleteIncident(id);
      fetchData();
      if (selectedIncident?._id === id) {
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'bg-red-600',
      High: 'bg-orange-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-green-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Reported': 'text-blue-400',
      'Verified': 'text-purple-400',
      'In Progress': 'text-yellow-400',
      'Dispatched': 'text-orange-400',
      'Resolved': 'text-green-400',
      'Closed': 'text-gray-400'
    };
    return colors[status] || 'text-gray-400';
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <RefreshCw className="animate-spin" />
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Stats Bar */}
      <div className="bg-black/50 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="text-red-500" size={28} />
              <h1 className="text-2xl font-bold">Responder Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg ${soundEnabled ? 'bg-green-600' : 'bg-gray-700'}`}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total Incidents</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
              <div className="text-3xl font-bold text-red-500">{stats.critical}</div>
              <div className="text-gray-400 text-sm">Critical</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-gray-400 text-sm">Pending</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="text-3xl font-bold text-orange-500">{stats.inProgress}</div>
              <div className="text-gray-400 text-sm">In Progress</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
              <div className="text-gray-400 text-sm">Resolved</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="text-3xl font-bold text-purple-500">{stats.last24h}</div>
              <div className="text-gray-400 text-sm">Last 24h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Column 1: Priority Queue */}
        <div className="w-1/4 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              Priority Queue
            </h2>
          </div>
          <div className="p-2 space-y-2">
            {priorityQueue.map((incident, index) => (
              <div
                key={incident._id}
                onClick={() => setSelectedIncident(incident)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedIncident?._id === incident._id
                    ? 'bg-red-600/30 border border-red-500'
                    : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcons[incident.type]}</span>
                    <span className="font-medium">{incident.type}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityColor(incident.severity)}`}>
                    {incident.priority || '--'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{formatTimeAgo(incident.timestamp)}</span>
                  <span className={`${getStatusColor(incident.status)}`}>{incident.status}</span>
                </div>
                {incident.verified && (
                  <div className="mt-1 flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle size={12} />
                    Verified
                  </div>
                )}
              </div>
            ))}
            {priorityQueue.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No active incidents
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Map */}
        <div className="w-1/2 relative">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full"
            style={{ background: '#1a1a2e' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapController selectedIncident={selectedIncident} />
            
            {priorityQueue.map((incident) => (
              <Marker
                key={incident._id}
                position={[incident.location.lat, incident.location.lng]}
                icon={createMarkerIcon(incident.severity, selectedIncident?._id === incident._id)}
                eventHandlers={{
                  click: () => setSelectedIncident(incident)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{typeIcons[incident.type]}</span>
                      <span className="font-bold">{incident.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                    <div className="text-xs text-gray-500">
                      Priority Score: {incident.priority}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Column 3: Incident Details */}
        <div className="w-1/4 bg-gray-900 border-l border-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Eye size={20} />
              Incident Details
            </h2>
          </div>
          
          {selectedIncident ? (
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{typeIcons[selectedIncident.type]}</span>
                  <div>
                    <h3 className="text-xl font-bold">{selectedIncident.type}</h3>
                    <p className="text-sm text-gray-400">{formatTimeAgo(selectedIncident.timestamp)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded font-bold ${getSeverityColor(selectedIncident.severity)}`}>
                  {selectedIncident.severity}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-sm text-gray-400 mb-1">Description</h4>
                <p className="text-sm">{selectedIncident.description}</p>
              </div>

              {/* AI Analysis */}
              {selectedIncident.ai_analysis && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <h4 className="text-sm text-gray-400 mb-2">AI Analysis</h4>
                  <p className="text-sm mb-2">{selectedIncident.ai_analysis.summary}</p>
                  {selectedIncident.ai_analysis.tags && (
                    <div className="flex flex-wrap gap-1">
                      {selectedIncident.ai_analysis.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{selectedIncident.upvotes}</div>
                  <div className="text-xs text-gray-400">Upvotes</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{selectedIncident.priority || '--'}</div>
                  <div className="text-xs text-gray-400">Priority</div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-sm text-gray-400 mb-2">Update Status</h4>
                <select
                  value={selectedIncident.status}
                  onChange={(e) => handleStatusUpdate(selectedIncident._id, e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                >
                  <option value="Reported">Reported</option>
                  <option value="Verified">Verified</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!selectedIncident.verified && (
                  <button
                    onClick={() => handleVerify(selectedIncident._id)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-medium"
                  >
                    <CheckSquare size={18} />
                    Verify Incident
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate(selectedIncident._id, 'Dispatched')}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 py-3 rounded-lg font-medium"
                >
                  <TrendingUp size={18} />
                  Dispatch Resource
                </button>
                <button
                  onClick={() => handleDelete(selectedIncident._id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 py-3 rounded-lg font-medium border border-red-600/50"
                >
                  <Trash2 size={18} />
                  Delete Incident
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MapPin size={48} className="mb-4" />
              <p>Select an incident to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* New Incident Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-2xl animate-bounce z-50 max-w-sm">
          <div className="flex items-center gap-3">
            <Bell className="animate-pulse" />
            <div>
              <div className="font-bold">New {showNotification.severity} Incident!</div>
              <div className="text-sm">{showNotification.type} reported</div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ResponderDashboard;
