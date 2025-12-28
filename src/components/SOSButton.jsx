import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, CheckCircle, X, MapPin, Phone } from 'lucide-react';
import { reportIncident } from '../services/api';
import { playSound } from '../utils/soundEffects';

const SOSButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  // Only show on mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setError('Location access denied'),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Countdown timer for SOS
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown <= 0) {
      sendSOS();
      return;
    }
    
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSOSPress = () => {
    setIsOpen(true);
    playSound.criticalAlert();
  };

  const startCountdown = () => {
    setCountdown(3);
    playSound.criticalAlert();
  };

  const cancelSOS = () => {
    setCountdown(null);
    setIsOpen(false);
    setError(null);
  };

  const sendSOS = async () => {
    setIsLoading(true);
    setCountdown(null);
    
    try {
      if (!location) {
        // Try to get location again
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }

      await reportIncident({
        type: 'Medical',
        description: '🆘 EMERGENCY SOS ACTIVATED - Immediate assistance required! User activated panic button.',
        location: location || { lat: 28.6139, lng: 77.2090 }, // Fallback to Delhi
        severity: 'Critical'
      });

      playSound.success();
      setIsSuccess(true);
      setIsLoading(false);
      
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      setError('Failed to send SOS. Please try again.');
      setIsLoading(false);
      playSound.error();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={handleSOSPress}
        className="fixed bottom-24 right-4 z-50 w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 
                   rounded-full shadow-lg shadow-red-500/50 flex items-center justify-center
                   animate-pulse hover:scale-110 active:scale-95 transition-all
                   border-4 border-red-400"
      >
        <span className="text-white font-black text-lg">SOS</span>
      </button>

      {/* SOS Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-3xl w-full max-w-sm overflow-hidden border border-red-500/50 shadow-2xl shadow-red-500/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center relative">
              <button 
                onClick={cancelSOS}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
              >
                <X size={20} />
              </button>
              
              {isSuccess ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-300" />
                  <h2 className="text-2xl font-bold">Help is Coming!</h2>
                  <p className="text-white/80 text-sm mt-1">Emergency responders notified</p>
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-16 h-16 mx-auto mb-3 animate-spin" />
                  <h2 className="text-2xl font-bold">Sending SOS...</h2>
                  <p className="text-white/80 text-sm mt-1">Alerting emergency services</p>
                </>
              ) : countdown !== null ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-5xl font-bold">{countdown}</span>
                  </div>
                  <h2 className="text-2xl font-bold">Sending in {countdown}...</h2>
                  <p className="text-white/80 text-sm mt-1">Tap cancel to abort</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 mx-auto mb-3 animate-bounce" />
                  <h2 className="text-2xl font-bold">Emergency SOS</h2>
                  <p className="text-white/80 text-sm mt-1">This will alert emergency responders</p>
                </>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Location Status */}
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg mb-4">
                <MapPin className={location ? 'text-green-400' : 'text-yellow-400'} size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-300">
                    {location ? 'Location detected' : 'Getting location...'}
                  </div>
                  {location && (
                    <div className="text-xs text-gray-500">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                  )}
                </div>
                {location && <CheckCircle className="text-green-400" size={16} />}
              </div>

              {!isSuccess && !isLoading && countdown === null && (
                <>
                  {/* SOS Button */}
                  <button
                    onClick={startCountdown}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl
                             font-bold text-lg hover:from-red-500 hover:to-red-600 transition-all
                             shadow-lg shadow-red-500/30 active:scale-95"
                  >
                    🆘 ACTIVATE SOS
                  </button>

                  {/* Info */}
                  <p className="text-center text-gray-500 text-xs mt-4">
                    This will send your location and alert all nearby emergency responders immediately.
                  </p>
                </>
              )}

              {countdown !== null && (
                <button
                  onClick={cancelSOS}
                  className="w-full py-4 bg-gray-700 text-white rounded-xl font-bold text-lg
                           hover:bg-gray-600 transition-all"
                >
                  ✖ CANCEL
                </button>
              )}

              {isSuccess && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-500/20 rounded-lg mb-4">
                    <Phone className="text-green-400 animate-pulse" size={20} />
                    <span className="text-green-300">Emergency services alerted</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Stay calm. Help is on the way. Keep your phone nearby.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
