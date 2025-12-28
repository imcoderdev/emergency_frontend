import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Shield, AlertTriangle, CheckCircle, Clock, Flame, MapPin,
  Users, TrendingUp, Bell, Volume2, VolumeX, RefreshCw,
  ChevronRight, Eye, Trash2, CheckSquare, Siren, MessageSquare, Save,
  ChevronUp, ChevronDown, X, List, Sparkles, ShieldCheck, Zap
} from 'lucide-react';
import { getIncidentStats, getPriorityQueue, getIncidents, updateIncidentStatus, verifyIncident, deleteIncident } from '../services/api';
import { subscribeToIncidents } from '../services/socket';
import PriorityQueue from '../components/PriorityQueue';
import LoadingSpinner from '../components/LoadingSpinner';
import PermissionGuard from '../components/PermissionGuard';
import LiveActivityFeed from '../components/LiveActivityFeed';
import { playSound } from '../utils/soundEffects';

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

const ResponderDashboardContent = () => {
  const [stats, setStats] = useState({
    total: 0, critical: 0, high: 0, inProgress: 0, resolved: 0, pending: 0, last24h: 0
  });
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotification, setShowNotification] = useState(null);
  const [responderNotes, setResponderNotes] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);

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
    playSound.criticalAlert();
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
        <LoadingSpinner size="xl" text="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Stats Bar */}
      <div className="bg-black/50 border-b border-gray-800 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="text-red-500" size={24} />
              <h1 className="text-lg sm:text-2xl font-bold">Responder Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Priority Queue Toggle */}
              <button
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="lg:hidden p-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg ${soundEnabled ? 'bg-green-600' : 'bg-gray-700'}`}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={fetchData}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                <RefreshCw size={18} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Cards - Scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 md:grid-cols-6 sm:gap-3 scrollbar-hide">
            <div className="flex-shrink-0 w-28 sm:w-auto bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
              <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Total</div>
            </div>
            <div className="flex-shrink-0 w-28 sm:w-auto bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4 border-red-500">
              <div className="text-2xl sm:text-3xl font-bold text-red-500">{stats.critical}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Critical</div>
            </div>
            <div className="flex-shrink-0 w-28 sm:w-auto bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4 border-yellow-500">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Pending</div>
            </div>
            <div className="flex-shrink-0 w-28 sm:w-auto bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4 border-orange-500">
              <div className="text-2xl sm:text-3xl font-bold text-orange-500">{stats.inProgress}</div>
              <div className="text-gray-400 text-xs sm:text-sm">In Progress</div>
            </div>
            <div className="flex-shrink-0 w-28 sm:w-auto bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
              <div className="text-2xl sm:text-3xl font-bold text-green-500">{stats.resolved}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Resolved</div>
            </div>
            <div className="flex-shrink-0 w-28 sm:w-auto bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4 border-purple-500">
              <div className="text-2xl sm:text-3xl font-bold text-purple-500">{stats.last24h}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Last 24h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Priority Queue Drawer */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${mobileDrawerOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/80 transition-opacity ${mobileDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileDrawerOpen(false)}
        />
        {/* Drawer */}
        <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 shadow-2xl ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Priority Queue
            </h2>
            <button 
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          <div className="h-[calc(100%-60px)] overflow-y-auto">
            <PriorityQueue 
              incidents={priorityQueue} 
              onSelectIncident={(incident) => {
                setSelectedIncident(incident);
                setMobileDrawerOpen(false);
                setMobileDetailsOpen(true);
              }} 
              selectedId={selectedIncident?._id}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
        {/* Column 1: Priority Queue (Desktop Only) */}
        <div className="hidden lg:block w-1/4 h-full border-r border-gray-800">
          <PriorityQueue 
            incidents={priorityQueue} 
            onSelectIncident={setSelectedIncident} 
            selectedId={selectedIncident?._id}
          />
        </div>

        {/* Column 2: Map - Full width on mobile */}
        <div className="w-full lg:w-1/2 h-[40vh] sm:h-[50vh] lg:h-full relative">
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
          
          {/* Mobile: Floating button to show details */}
          {selectedIncident && (
            <button
              onClick={() => setMobileDetailsOpen(true)}
              className="lg:hidden absolute bottom-4 right-4 z-[30] flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg animate-bounce"
            >
              <Eye size={18} />
              View Details
            </button>
          )}
        </div>

        {/* Column 3: Incident Details (Desktop) */}
        <div className="hidden lg:block w-1/4 bg-gray-900 border-l border-gray-800 overflow-y-auto">
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

              {/* Status Update - Enhanced */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="text-sm text-gray-400 font-medium flex items-center gap-2">
                  <Clock size={14} />
                  Update Status
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {['Reported', 'Verified', 'In Progress', 'Dispatched', 'Resolved', 'Closed'].map((status) => {
                    const isActive = selectedIncident.status === status;
                    const statusColors = {
                      'Reported': 'bg-blue-600',
                      'Verified': 'bg-purple-600',
                      'In Progress': 'bg-yellow-600',
                      'Dispatched': 'bg-orange-600',
                      'Resolved': 'bg-green-600',
                      'Closed': 'bg-gray-600'
                    };
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedIncident._id, status)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive 
                            ? `${statusColors[status]} text-white ring-2 ring-white/30` 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 font-medium flex items-center gap-2 mb-2">
                  <MessageSquare size={14} />
                  Responder Notes
                </h4>
                <textarea
                  value={responderNotes}
                  onChange={(e) => setResponderNotes(e.target.value)}
                  placeholder="Add internal notes for this incident..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white text-sm placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  rows={3}
                />
                <button
                  onClick={() => {
                    setShowSaveSuccess(true);
                    setTimeout(() => setShowSaveSuccess(false), 2000);
                  }}
                  className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <Save size={14} />
                  {showSaveSuccess ? 'Saved!' : 'Save Notes'}
                </button>
              </div>

              {/* Action Buttons - Enhanced */}
              <div className="space-y-2">
                {/* Dispatch Button - Prominent */}
                <button
                  onClick={() => handleStatusUpdate(selectedIncident._id, 'Dispatched')}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02]"
                >
                  <Siren size={24} className="animate-pulse" />
                  DISPATCH RESPONDERS
                </button>

                {/* Verify Button */}
                {!selectedIncident.verified && (
                  <button
                    onClick={() => handleVerify(selectedIncident._id)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-medium transition-all"
                  >
                    <CheckSquare size={18} />
                    Verify Incident
                  </button>
                )}

                {/* Verified Badge */}
                {selectedIncident.verified && (
                  <div className="w-full flex items-center justify-center gap-2 bg-green-600/20 border border-green-500/30 text-green-400 py-3 rounded-lg font-medium">
                    <CheckCircle size={18} />
                    Incident Verified
                  </div>
                )}

                {/* Delete Button - Bottom */}
                <button
                  onClick={() => handleDelete(selectedIncident._id)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 py-2 rounded-lg text-sm font-medium border border-gray-700 hover:border-red-600/50 transition-all"
                >
                  <Trash2 size={16} />
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

      {/* Mobile Incident Details Modal */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${mobileDetailsOpen && selectedIncident ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/80 transition-opacity ${mobileDetailsOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileDetailsOpen(false)}
        />
        {/* Bottom Sheet */}
        <div className={`absolute left-0 right-0 bottom-0 max-h-[85vh] bg-gray-900 rounded-t-3xl border-t border-gray-700 transform transition-transform duration-300 shadow-2xl ${mobileDetailsOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>
          
          {selectedIncident && (
            <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{typeIcons[selectedIncident.type]}</span>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedIncident.type}</h3>
                    <p className="text-sm text-gray-400">{formatTimeAgo(selectedIncident.timestamp)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileDetailsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Description */}
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-sm">{selectedIncident.description}</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedIncident._id, 'Dispatched');
                    setMobileDetailsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 py-4 rounded-xl font-bold transition-all"
                >
                  <Siren size={20} />
                  DISPATCH
                </button>
                {!selectedIncident.verified ? (
                  <button
                    onClick={() => {
                      handleVerify(selectedIncident._id);
                      setMobileDetailsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 bg-purple-600 py-4 rounded-xl font-bold transition-all"
                  >
                    <CheckSquare size={20} />
                    Verify
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 bg-green-600/20 border border-green-500/30 text-green-400 py-4 rounded-xl font-medium">
                    <CheckCircle size={20} />
                    Verified
                  </div>
                )}
              </div>

              {/* Status Update Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['Reported', 'In Progress', 'Dispatched', 'Resolved'].map((status) => {
                  const isActive = selectedIncident.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedIncident._id, status)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Incident Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-red-600 text-white p-4 rounded-lg shadow-2xl animate-bounce z-50 max-w-sm">
          <div className="flex items-center gap-3">
            <Bell className="animate-pulse" />
            <div>
              <div className="font-bold">New {showNotification.severity} Incident!</div>
              <div className="text-sm">{showNotification.type} reported</div>
            </div>
          </div>
        </div>
      )}

      {/* Live Activity Feed */}
      <LiveActivityFeed />

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

// Wrap with PermissionGuard - requires responder or admin role
const ResponderDashboard = () => {
  return (
    <PermissionGuard 
      requiredRole="responder" 
      showMessage={true}
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Responder Access Required</h2>
            <p className="text-gray-400">You need responder or admin privileges to access this dashboard.</p>
          </div>
        </div>
      }
    >
      <ResponderDashboardContent />
    </PermissionGuard>
  );
};

export default ResponderDashboard;
