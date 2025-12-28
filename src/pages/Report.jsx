import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Car, Heart, MapPin, Loader2, CheckCircle, X, 
  ChevronRight, Mic, MicOff, Camera, Image, AlertTriangle,
  Zap, TreePine, Building, Home, Factory, Truck, Bike,
  Users, Baby, Stethoscope, Pill, Brain, Bone, Droplets,
  CloudLightning, Waves, Mountain, Shield, HelpCircle,
  ArrowLeft, Volume2, Trash2, Plus, Navigation
} from 'lucide-react';
import { reportIncident, getIncidents, upvoteIncident } from '../services/api';
import AIAnalysisResult from '../components/AIAnalysisResult';
import DuplicateAlert from '../components/DuplicateAlert';
import AIAnalyzing from '../components/AIAnalyzing';

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// All incident categories with sub-types
const INCIDENT_CATEGORIES = {
  Fire: {
    icon: Flame,
    color: 'from-red-600 to-orange-600',
    hoverColor: 'hover:from-red-500 hover:to-orange-500',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500/20',
    description: 'Fire emergency',
    subTypes: [
      { id: 'building', label: 'Building Fire', icon: Building },
      { id: 'house', label: 'House Fire', icon: Home },
      { id: 'vehicle', label: 'Vehicle Fire', icon: Car },
      { id: 'forest', label: 'Forest/Bush Fire', icon: TreePine },
      { id: 'industrial', label: 'Industrial Fire', icon: Factory },
      { id: 'electrical', label: 'Electrical Fire', icon: Zap },
    ],
    templates: [
      'Fire visible with heavy smoke',
      'Small fire that is spreading',
      'Fire with people possibly trapped',
      'Smoke coming from building',
    ]
  },
  Accident: {
    icon: Car,
    color: 'from-yellow-600 to-red-600',
    hoverColor: 'hover:from-yellow-500 hover:to-red-500',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/20',
    description: 'Vehicle accident',
    subTypes: [
      { id: 'car', label: 'Car Accident', icon: Car },
      { id: 'motorcycle', label: 'Motorcycle', icon: Bike },
      { id: 'truck', label: 'Truck/Bus', icon: Truck },
      { id: 'pedestrian', label: 'Pedestrian Hit', icon: Users },
      { id: 'pileup', label: 'Multi-Vehicle', icon: Car },
      { id: 'rollover', label: 'Rollover', icon: Car },
    ],
    templates: [
      'Vehicles collided, people injured',
      'Single vehicle accident with injuries',
      'Multiple vehicles involved',
      'Person hit by vehicle',
    ]
  },
  Medical: {
    icon: Heart,
    color: 'from-pink-600 to-red-600',
    hoverColor: 'hover:from-pink-500 hover:to-red-500',
    borderColor: 'border-pink-500',
    bgColor: 'bg-pink-500/20',
    description: 'Medical emergency',
    subTypes: [
      { id: 'cardiac', label: 'Heart Attack', icon: Heart },
      { id: 'breathing', label: 'Breathing Difficulty', icon: Stethoscope },
      { id: 'unconscious', label: 'Unconscious Person', icon: Users },
      { id: 'injury', label: 'Severe Injury', icon: Bone },
      { id: 'stroke', label: 'Stroke', icon: Brain },
      { id: 'allergic', label: 'Allergic Reaction', icon: Pill },
      { id: 'child', label: 'Child Emergency', icon: Baby },
      { id: 'bleeding', label: 'Severe Bleeding', icon: Droplets },
    ],
    templates: [
      'Person collapsed, not responding',
      'Chest pain and difficulty breathing',
      'Severe bleeding from injury',
      'Allergic reaction, face swelling',
    ]
  },
  Natural: {
    icon: CloudLightning,
    color: 'from-blue-600 to-purple-600',
    hoverColor: 'hover:from-blue-500 hover:to-purple-500',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/20',
    description: 'Natural disaster',
    subTypes: [
      { id: 'flood', label: 'Flooding', icon: Waves },
      { id: 'storm', label: 'Severe Storm', icon: CloudLightning },
      { id: 'landslide', label: 'Landslide', icon: Mountain },
      { id: 'earthquake', label: 'Earthquake', icon: Mountain },
    ],
    templates: [
      'Flooding in the area, water rising',
      'Storm damage with fallen trees',
      'Building damage from earthquake',
    ]
  },
  Crime: {
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
    hoverColor: 'hover:from-slate-500 hover:to-slate-700',
    borderColor: 'border-slate-500',
    bgColor: 'bg-slate-500/20',
    description: 'Crime/Security',
    subTypes: [
      { id: 'theft', label: 'Theft/Robbery', icon: Shield },
      { id: 'assault', label: 'Assault', icon: Users },
      { id: 'suspicious', label: 'Suspicious Activity', icon: HelpCircle },
    ],
    templates: [
      'Robbery in progress',
      'Someone being attacked',
      'Suspicious person/vehicle',
    ]
  },
  Other: {
    icon: HelpCircle,
    color: 'from-gray-600 to-gray-800',
    hoverColor: 'hover:from-gray-500 hover:to-gray-700',
    borderColor: 'border-gray-500',
    bgColor: 'bg-gray-500/20',
    description: 'Other emergency',
    subTypes: [
      { id: 'trapped', label: 'Person Trapped', icon: Users },
      { id: 'hazard', label: 'Hazard', icon: AlertTriangle },
      { id: 'other', label: 'Other', icon: HelpCircle },
    ],
    templates: [
      'Person trapped and needs help',
      'Dangerous situation',
    ]
  }
};

const SEVERITY_LEVELS = [
  { id: 'critical', label: 'Life Threatening', color: 'bg-red-600', description: 'Immediate danger to life' },
  { id: 'high', label: 'Urgent', color: 'bg-orange-500', description: 'Serious but stable' },
  { id: 'medium', label: 'Standard', color: 'bg-yellow-500', description: 'Needs attention' },
];

const Report = () => {
  // Step management
  const [step, setStep] = useState(1); // 1 = category, 2 = details, 3 = submitting
  
  // Form state
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSubType, setSelectedSubType] = useState(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('high');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // UI state
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [showAIAnalyzing, setShowAIAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [pendingIncident, setPendingIncident] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [existingIncidents, setExistingIncidents] = useState([]);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Primary categories (shown on main screen) - 4 main options
  const primaryCategories = ['Fire', 'Accident', 'Medical', 'Other'];

  // Fetch existing incidents and location on mount
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setExistingIncidents(data.incidents || []);
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
      }
    };
    fetchIncidents();
    
    // Get location early
    getLocation().then(loc => {
      setLocation(loc);
      // Try to get address
      reverseGeocode(loc.lat, loc.lng);
    }).catch(console.error);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';
      
      recog.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev + ' ' + finalTranscript.trim());
        }
      };
      
      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recog.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recog);
    }
  }, []);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setLocationAddress(data.display_name.split(',').slice(0, 3).join(','));
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert('Voice input is not supported in your browser');
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handlePhotoCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleCategorySelect = (type) => {
    setSelectedType(type);
    setShowAllCategories(false);
    setStep(2);
  };

  const handleTemplateSelect = (template) => {
    setDescription(prev => prev ? prev + ' ' + template : template);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedType(null);
      setSelectedSubType(null);
      setDescription('');
      setSeverity('high');
      removePhoto();
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    setError(null);
    setLoadingStep('gps');

    try {
      // Get fresh location if needed
      let currentLocation = location;
      if (!currentLocation) {
        currentLocation = await getLocation();
        setLocation(currentLocation);
      }
      
      setLoadingStep('ai');
      
      // Build description
      let fullDescription = description || `Emergency ${selectedType} incident`;
      if (selectedSubType) {
        const subType = INCIDENT_CATEGORIES[selectedType].subTypes.find(s => s.id === selectedSubType);
        if (subType) {
          fullDescription = `[${subType.label}] ${fullDescription}`;
        }
      }
      
      // Create FormData to include the photo
      const formData = new FormData();
      formData.append('type', selectedType);
      formData.append('description', fullDescription);
      formData.append('location', JSON.stringify(currentLocation));
      
      // Add photo if available - this will be analyzed by AI
      if (photo) {
        formData.append('media', photo);
        console.log('Photo attached for AI analysis:', photo.name);
      }
      
      const incidentData = photo ? formData : {
        type: selectedType,
        description: fullDescription,
        location: currentLocation,
        severity: severity === 'critical' ? 'Critical' : severity === 'high' ? 'High' : 'Medium'
      };

      // Check for duplicates
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      const nearbyDuplicates = existingIncidents.filter(incident => {
        if (incident.type !== selectedType) return false;
        if (new Date(incident.timestamp).getTime() < twoHoursAgo) return false;
        const distance = calculateDistance(
          currentLocation.lat, currentLocation.lng,
          incident.location.lat, incident.location.lng
        );
        if (distance > 500) return false;
        if (['Resolved', 'Closed'].includes(incident.status)) return false;
        return true;
      }).map(incident => {
        const distance = calculateDistance(
          currentLocation.lat, currentLocation.lng,
          incident.location.lat, incident.location.lng
        );
        const timeDiff = Date.now() - new Date(incident.timestamp).getTime();
        const distanceScore = Math.max(0, 100 - (distance / 5));
        const timeScore = Math.max(0, 100 - (timeDiff / (2 * 60 * 60 * 10)));
        const confidence = Math.round((distanceScore + timeScore) / 2);
        return { ...incident, confidence, distance };
      }).sort((a, b) => b.confidence - a.confidence);

      if (nearbyDuplicates.length > 0) {
        setDuplicates(nearbyDuplicates);
        setPendingIncident(incidentData);
        setLoading(false);
        setShowDuplicateAlert(true);
        return;
      }

      // Submit report with AI animation
      setShowAIAnalyzing(true);
      setLoading(false);
      
      // Start API call in background while animation plays
      const apiPromise = reportIncident(incidentData);
      
      // Store promise for later use when animation completes
      setPendingIncident({ ...incidentData, apiPromise });

    } catch (err) {
      console.error('Error reporting incident:', err);
      setError(err.message || 'Failed to report incident');
      setLoading(false);
    }
  };

  // Handle AI animation complete
  const handleAIAnalysisComplete = async () => {
    try {
      // Get the response from the stored promise
      const response = await pendingIncident.apiPromise;
      setResponseData(response);
      setShowAIAnalyzing(false);
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error completing report:', err);
      setError(err.message || 'Failed to report incident');
      setShowAIAnalyzing(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedSubType(null);
    setDescription('');
    setSeverity('high');
    removePhoto();
    setShowAIAnalyzing(false);
    setShowAnalysis(false);
    setShowDuplicateAlert(false);
    setDuplicates([]);
    setPendingIncident(null);
    setResponseData(null);
    setError(null);
  };

  const handleLinkToDuplicate = async (incident) => {
    try {
      await upvoteIncident(incident._id);
      setResponseData({
        status: 'linked',
        incident: { ...incident, upvotes: (incident.upvotes || 0) + 1 }
      });
      setShowDuplicateAlert(false);
      setShowAnalysis(true);
    } catch (err) {
      setError('Failed to link to incident');
      setShowDuplicateAlert(false);
    }
  };

  const handleReportAnyway = async () => {
    if (!pendingIncident) return;
    setShowDuplicateAlert(false);
    setShowAIAnalyzing(true);
    
    // Start API call in background while animation plays
    const apiPromise = reportIncident(pendingIncident);
    setPendingIncident({ ...pendingIncident, apiPromise });
  };

  // Show AI Analyzing Animation
  if (showAIAnalyzing) {
    return (
      <AIAnalyzing 
        incidentType={selectedType}
        hasPhoto={!!photo}
        onComplete={handleAIAnalysisComplete}
      />
    );
  }

  // Show AI Analysis Result
  if (showAnalysis && responseData) {
    return <AIAnalysisResult incident={responseData.incident} onReportAnother={resetForm} />;
  }

  const categoryData = selectedType ? INCIDENT_CATEGORIES[selectedType] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900">
      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-3xl sm:text-4xl">🚨</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              Emergency Report
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Select the type of emergency
            </p>
          </div>

          {/* Primary Emergency Buttons */}
          <div className="w-full max-w-md space-y-4 sm:space-y-5 mb-8 px-2">
            {primaryCategories.map((type) => {
              const category = INCIDENT_CATEGORIES[type];
              const Icon = category.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleCategorySelect(type)}
                  className={`w-full bg-gradient-to-r ${category.color} ${category.hoverColor} 
                             text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl 
                             transform transition-all duration-200 
                             hover:scale-105 hover:shadow-red-500/50
                             active:scale-[0.98] active:brightness-110
                             flex items-center justify-between group
                             min-h-[100px] sm:min-h-[120px] touch-manipulation`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center 
                                  group-hover:bg-white/30 transition-all flex-shrink-0">
                      <Icon size={28} className="sm:hidden" />
                      <Icon size={32} className="hidden sm:block" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{type}</h2>
                      <p className="text-xs sm:text-sm text-white/80">{category.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>

          {/* View All Categories */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">Need to report something else?</p>
            <button 
              onClick={() => setShowAllCategories(true)}
              className="text-red-400 hover:text-red-300 font-medium text-sm underline py-2 px-4 touch-manipulation"
            >
              View All Categories
            </button>
          </div>

          {/* Location Indicator */}
          {location && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm">
              <Navigation size={14} className="text-green-400 animate-pulse" />
              <span className="text-gray-400">Location ready</span>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Details Form */}
      {step === 2 && categoryData && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className={`bg-gradient-to-r ${categoryData.color} p-4 sm:p-6 sticky top-0 z-10`}>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBack}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors touch-manipulation"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    {React.createElement(categoryData.icon, { size: 24 })}
                    {selectedType} Emergency
                  </h1>
                  <p className="text-white/80 text-sm">Add details for faster response</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-4 sm:p-6 pb-32">
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Sub-type Selection */}
              <div>
                <label className="text-white font-medium mb-3 block">What type of {selectedType.toLowerCase()}?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoryData.subTypes.map((subType) => {
                    const SubIcon = subType.icon;
                    return (
                      <button
                        key={subType.id}
                        onClick={() => setSelectedSubType(selectedSubType === subType.id ? null : subType.id)}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation flex flex-col items-center gap-2
                          ${selectedSubType === subType.id 
                            ? `${categoryData.borderColor} ${categoryData.bgColor}` 
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                      >
                        <SubIcon size={24} className={selectedSubType === subType.id ? 'text-white' : 'text-gray-400'} />
                        <span className={`text-xs sm:text-sm text-center ${selectedSubType === subType.id ? 'text-white' : 'text-gray-300'}`}>
                          {subType.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Selection */}
              <div>
                <label className="text-white font-medium mb-3 block">How urgent is this?</label>
                <div className="grid grid-cols-3 gap-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSeverity(level.id)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation
                        ${severity === level.id 
                          ? `border-white ${level.color}` 
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                    >
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${level.color}`} />
                      <p className="text-white text-xs sm:text-sm font-medium text-center">{level.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description with Voice */}
              <div>
                <label className="text-white font-medium mb-3 block flex items-center justify-between">
                  <span>Describe the emergency</span>
                  <span className="text-gray-500 text-xs font-normal">Optional but helpful</span>
                </label>
                
                {/* Quick Templates */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {categoryData.templates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTemplateSelect(template)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full transition-colors touch-manipulation"
                    >
                      + {template.slice(0, 25)}...
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's happening? (You can also use voice input)"
                    rows={4}
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl p-4 pr-14 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={toggleRecording}
                    className={`absolute right-3 top-3 w-10 h-10 rounded-full flex items-center justify-center transition-all touch-manipulation
                      ${isRecording 
                        ? 'bg-red-600 animate-pulse' 
                        : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>
                {isRecording && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <Volume2 size={16} className="animate-pulse" />
                    Listening... Speak now
                  </p>
                )}
              </div>

              {/* Photo Capture */}
              <div>
                <label className="text-white font-medium mb-3 block flex items-center justify-between">
                  <span>Add a photo</span>
                  <span className="text-gray-500 text-xs font-normal">Helps responders prepare</span>
                </label>
                
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                      onClick={removePhoto}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center touch-manipulation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-6 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl hover:border-gray-500 transition-colors touch-manipulation flex flex-col items-center gap-2"
                    >
                      <Camera size={28} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">Take Photo</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl hover:border-gray-500 transition-colors touch-manipulation flex flex-col items-center gap-2"
                    >
                      <Image size={28} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">Upload Photo</span>
                    </button>
                  </div>
                )}
                
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>

              {/* Location Preview */}
              {location && (
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">Location Detected</p>
                      <p className="text-gray-400 text-sm truncate">
                        {locationAddress || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-gradient-to-r ${categoryData.color} text-white font-bold text-lg py-5 rounded-2xl 
                           shadow-2xl transform transition-all hover:scale-[1.02] active:scale-[0.98] 
                           disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
                           flex items-center justify-center gap-3`}
              >
                <AlertTriangle size={24} />
                Send Emergency Report
              </button>
              <p className="text-gray-500 text-xs text-center mt-2">
                Your location and details will be shared with emergency responders
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Categories Modal */}
      {showAllCategories && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-gray-900 w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
              <h2 className="text-xl font-bold text-white">All Emergency Types</h2>
              <button
                onClick={() => setShowAllCategories(false)}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 touch-manipulation"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(INCIDENT_CATEGORIES).map(([type, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => handleCategorySelect(type)}
                      className={`p-4 rounded-xl bg-gradient-to-br ${category.color} hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation flex flex-col items-center gap-2`}
                    >
                      <Icon size={32} className="text-white" />
                      <span className="text-white font-medium">{type}</span>
                      <span className="text-white/70 text-xs">{category.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-red-600 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="mb-6">
              {loadingStep === 'gps' ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce">🛰️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Locking GPS...</h3>
                  <p className="text-gray-400">Getting your precise location</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4 animate-pulse">🤖</div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI Analyzing...</h3>
                  <p className="text-gray-400">Processing with Gemini AI</p>
                </>
              )}
            </div>
            <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
          </div>
        </div>
      )}

      {/* Duplicate Alert */}
      {showDuplicateAlert && duplicates.length > 0 && (
        <DuplicateAlert
          duplicates={duplicates}
          onLinkToDuplicate={handleLinkToDuplicate}
          onReportAnyway={handleReportAnyway}
          onCancel={() => { setShowDuplicateAlert(false); setDuplicates([]); setPendingIncident(null); }}
        />
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-red-500 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={resetForm}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all touch-manipulation"
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
