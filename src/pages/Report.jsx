import React, { useState } from 'react';
import { Flame, Car, Heart, MapPin, Loader2, CheckCircle, X } from 'lucide-react';
import { reportIncident } from '../services/api';

const Report = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const incidentTypes = [
    {
      type: 'Fire',
      icon: Flame,
      color: 'from-red-600 to-orange-600',
      hoverColor: 'hover:from-red-500 hover:to-orange-500',
      description: 'Report a fire emergency'
    },
    {
      type: 'Accident',
      icon: Car,
      color: 'from-yellow-600 to-red-600',
      hoverColor: 'hover:from-yellow-500 hover:to-red-500',
      description: 'Report a vehicle accident'
    },
    {
      type: 'Medical',
      icon: Heart,
      color: 'from-pink-600 to-red-600',
      hoverColor: 'hover:from-pink-500 hover:to-red-500',
      description: 'Report a medical emergency'
    }
  ];

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleReport = async (type) => {
    setSelectedType(type);
    setLoading(true);
    setError(null);
    setLoadingStep('gps');

    try {
      // Step 1: Get GPS location
      const location = await getLocation();
      
      // Step 2: AI Analysis
      setLoadingStep('ai');
      
      const incidentData = {
        type: type,
        description: `Emergency ${type} incident reported via quick report`,
        location: location
      };

      // Step 3: Submit report
      const response = await reportIncident(incidentData);
      
      setResponseData(response);
      setLoading(false);
      setShowSuccess(true);

    } catch (err) {
      console.error('Error reporting incident:', err);
      setError(err.message || 'Failed to report incident. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
    setResponseData(null);
    setSelectedType(null);
    setError(null);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'bg-red-500',
      High: 'bg-red-500',
      Medium: 'bg-orange-500',
      Low: 'bg-yellow-500'
    };
    return colors[severity] || 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-3xl">🚨</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Emergency Report
        </h1>
        <p className="text-gray-400 text-lg">
          Quick response starts here
        </p>
      </div>

      {/* Emergency Buttons */}
      <div className="w-full max-w-md space-y-4 mb-8">
        {incidentTypes.map((incident) => {
          const Icon = incident.icon;
          return (
            <button
              key={incident.type}
              onClick={() => handleReport(incident.type)}
              disabled={loading}
              className={`w-full bg-gradient-to-r ${incident.color} ${incident.hoverColor} 
                         text-white rounded-2xl p-8 shadow-2xl 
                         transform transition-all duration-200 
                         hover:scale-105 hover:shadow-red-500/50
                         active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         flex items-center justify-between group`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center 
                              group-hover:bg-white/30 transition-all">
                  <Icon size={32} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold mb-1">{incident.type}</h2>
                  <p className="text-sm text-white/80">{incident.description}</p>
                </div>
              </div>
              <div className="transform group-hover:translate-x-2 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Options */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2">Need to report something else?</p>
        <button className="text-red-400 hover:text-red-300 font-medium text-sm underline">
          View All Categories
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-red-600 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="mb-6">
              {loadingStep === 'gps' ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce">🛰️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Locking GPS...</h3>
                  <p className="text-gray-400">Getting your location</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4 animate-pulse">🤖</div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI Analyzing...</h3>
                  <p className="text-gray-400">Processing your report</p>
                </>
              )}
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && responseData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-500 rounded-2xl p-8 max-w-md w-full text-center relative">
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Help Sent!</h2>
              <p className="text-gray-400">Emergency services have been notified</p>
            </div>

            {/* Incident Details */}
            <div className="bg-black/40 rounded-xl p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Incident Type:</span>
                <span className="text-white font-semibold">{responseData.incident?.type}</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">AI Severity:</span>
                <span className={`px-3 py-1 rounded-full text-white font-semibold ${getSeverityColor(responseData.incident?.severity)}`}>
                  {responseData.incident?.severity}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Status:</span>
                <span className="text-yellow-400 font-semibold">{responseData.status}</span>
              </div>

              {responseData.status === 'merged' && (
                <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 rounded-lg p-3">
                  <span>⚠️</span>
                  <span>Similar incident already reported nearby</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 
                       text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
            >
              Report Another
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-500 rounded-2xl p-8 max-w-md w-full text-center relative">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-white mb-2">Error</h2>
              <p className="text-gray-400">{error}</p>
            </div>

            <button
              onClick={resetForm}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
