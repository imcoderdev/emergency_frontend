import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getIncidents } from '../services/api';
import { subscribeToIncidents } from '../services/socket';
import LiveIndicator from '../components/LiveIndicator';
import HeatmapLayer from '../components/HeatmapLayer';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Flame, Layers } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on severity
const createCustomIcon = (severity) => {
  const colors = {
    Critical: '#ef4444', // red
    High: '#ef4444',     // red
    Medium: '#f97316',   // orange
    Low: '#eab308'       // yellow
  };
  
  const color = colors[severity] || '#3b82f6';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="absolute inset-0 animate-ping rounded-full" style="background-color: ${color}; opacity: 0.4;"></div>
        <div class="relative w-6 h-6 rounded-full border-2 border-white shadow-lg" style="background-color: ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Incident type icons
const typeIcons = {
  Fire: '🔥',
  Accident: '🚗',
  Medical: '🏥',
  Crime: '🚨',
  Infrastructure: '🏗️'
};

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIncidentIds, setNewIncidentIds] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Convert incidents to heatmap points
  const heatmapPoints = incidents.map(incident => {
    // Intensity based on severity
    const intensityMap = {
      'Critical': 1.0,
      'High': 0.8,
      'Medium': 0.5,
      'Low': 0.3
    };
    const intensity = intensityMap[incident.severity] || 0.5;
    
    return [
      incident.location.lat,
      incident.location.lng,
      intensity
    ];
  });

  // Fetch initial incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setIncidents(data.incidents || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToIncidents((event) => {
      if (event.type === 'new_incident') {
        const newIncident = event.data.incident;
        setIncidents((prev) => [newIncident, ...prev]);
        setLastUpdate(Date.now());
        
        // Track new incident for animation
        setNewIncidentIds((prev) => [...prev, newIncident._id]);
        setTimeout(() => {
          setNewIncidentIds((prev) => prev.filter(id => id !== newIncident._id));
        }, 1000);
      } else if (event.type === 'upvote_update') {
        setIncidents((prev) =>
          prev.map((incident) =>
            incident._id === event.data.incidentId
              ? { ...incident, upvotes: event.data.upvotes }
              : incident
          )
        );
      }
    });

    return () => unsubscribe();
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'bg-red-500 text-white',
      High: 'bg-red-500 text-white',
      Medium: 'bg-orange-500 text-white',
      Low: 'bg-yellow-500 text-black'
    };
    return colors[severity] || 'bg-blue-500 text-white';
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-gray-900">
      {/* Live Indicator - Fixed Top Right */}
      <LiveIndicator incidentCount={incidents.length} lastUpdate={lastUpdate} />

      {/* Map Section - Full width on mobile, 65% on desktop */}
      <div className="w-full lg:w-[65%] h-[50vh] lg:h-full relative order-1">
        {/* Heatmap Toggle Button */}
        <div className="absolute top-4 left-4 z-[1000]">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all shadow-lg text-sm sm:text-base ${
              showHeatmap 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {showHeatmap ? <Flame size={18} /> : <Layers size={18} />}
            <span className="hidden sm:inline">{showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <div className="text-white text-xl">Loading map...</div>
          </div>
        ) : (
          <MapContainer
            center={[20.5937, 78.9629]} // Center of India
            zoom={5}
            className="h-full w-full"
            style={{ background: '#1f2937' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Heatmap Layer */}
            {showHeatmap && heatmapPoints.length > 0 && (
              <HeatmapLayer 
                points={heatmapPoints}
                options={{
                  radius: 30,
                  blur: 20,
                  maxZoom: 17,
                  minOpacity: 0.4
                }}
              />
            )}
            
            {incidents.map((incident) => (
              <Marker
                key={incident._id}
                position={[incident.location.lat, incident.location.lng]}
                icon={createCustomIcon(incident.severity)}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{typeIcons[incident.type]}</span>
                      <h3 className="font-bold text-lg">{incident.type}</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="text-sm font-medium">👍 {incident.upvotes}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(incident.timestamp).toLocaleString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Feed Section - Full width on mobile, 35% on desktop */}
      <div className="w-full lg:w-[35%] h-[50vh] lg:h-full bg-black/80 backdrop-blur-lg border-t lg:border-t-0 lg:border-l border-gray-700 overflow-hidden flex flex-col order-2">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Live Incidents</h2>
          <p className="text-gray-400 text-sm">{incidents.length} active reports</p>
        </div>

        {/* Incident Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" text="Loading incidents..." />
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <EmptyState type="no-incidents" />
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident._id}
                className={`bg-gray-800/60 backdrop-blur rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all ${
                  newIncidentIds.includes(incident._id)
                    ? 'animate-slide-in-top'
                    : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{typeIcons[incident.type]}</span>
                    <div>
                      <h3 className="text-white font-semibold">{incident.type}</h3>
                      <p className="text-gray-400 text-xs">
                        {new Date(incident.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {incident.description}
                </p>

                {/* AI Analysis Tags */}
                {incident.ai_analysis?.tags && incident.ai_analysis.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {incident.ai_analysis.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-yellow-400 font-medium">{incident.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white font-medium">
                    <span>👍</span>
                    <span>{incident.upvotes}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-top {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-top {
          animation: slide-in-top 0.5s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
