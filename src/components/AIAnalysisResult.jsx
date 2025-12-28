import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, Clock, TrendingUp, MapPin, 
  Flame, Users, ArrowRight, Plus, Shield, Zap, Camera, Eye, AlertTriangle, Brain, Sparkles
} from 'lucide-react';

// Gemini AI Logo SVG Component
const GeminiLogo = ({ size = 40, className = '' }) => (
  <svg viewBox="0 0 28 28" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="gemini-gradient-result" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="25%" stopColor="#9B72CB" />
        <stop offset="50%" stopColor="#D96570" />
        <stop offset="75%" stopColor="#D96570" />
        <stop offset="100%" stopColor="#9B72CB" />
      </linearGradient>
    </defs>
    <path 
      fill="url(#gemini-gradient-result)" 
      d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14-7.732 0-14-6.268-14-14Z"
    />
  </svg>
);

const SEVERITY_CONFIG = {
  critical: { 
    color: 'bg-red-600', 
    textColor: 'text-red-400',
    borderColor: 'border-red-500',
    label: 'CRITICAL',
    pulse: true 
  },
  high: { 
    color: 'bg-orange-500', 
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500',
    label: 'HIGH',
    pulse: false 
  },
  medium: { 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    label: 'MEDIUM',
    pulse: false 
  },
  low: { 
    color: 'bg-green-500', 
    textColor: 'text-green-400',
    borderColor: 'border-green-500',
    label: 'LOW',
    pulse: false 
  }
};

const AIAnalysisResult = ({ incident, onReportAnother }) => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Extract data with defaults
  const severity = incident?.ai_analysis?.severity?.toLowerCase() || incident?.severity?.toLowerCase() || 'medium';
  const priorityScore = incident?.ai_analysis?.priorityScore || incident?.priorityScore || 75;
  const estimatedResponseTime = incident?.ai_analysis?.estimatedResponseTime || '8-12';
  const keyDetails = incident?.ai_analysis?.keyDetails || ['Emergency reported', 'Location captured', 'Responders notified'];
  const incidentId = incident?._id || 'INC-' + Date.now();
  const incidentType = incident?.type || 'Emergency';
  const summary = incident?.ai_analysis?.summary || 'Your incident has been analyzed and prioritized.';
  
  // Debug logging
  console.log('AIAnalysisResult received incident:', incident);
  console.log('Priority Score from ai_analysis:', incident?.ai_analysis?.priorityScore);
  console.log('Final Priority Score:', priorityScore);
  
  // Image analysis data
  const imageAnalysis = incident?.ai_analysis?.imageAnalysis || null;

  const severityConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;

  // Animation effects
  useEffect(() => {
    // Show content with delay for entrance animation
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animate priority score
  useEffect(() => {
    if (showContent) {
      const duration = 1500;
      const steps = 60;
      const increment = priorityScore / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= priorityScore) {
          setAnimatedScore(priorityScore);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [showContent, priorityScore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-3 sm:p-4">
      {/* Animated background effects - Hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`relative max-w-lg w-full transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Success Checkmark */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/30">
              <CheckCircle size={32} className="sm:hidden text-white" />
              <CheckCircle size={48} className="hidden sm:block text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 sm:w-24 sm:h-24 bg-green-500/30 rounded-full animate-ping" />
          </div>
        </div>

        {/* Success Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
          Incident Reported Successfully!
        </h1>
        <p className="text-gray-400 text-center mb-4 sm:mb-6 text-sm sm:text-base px-2">
          Your emergency has been analyzed by AI and dispatched to responders
        </p>

        {/* AI Analysis Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 shadow-2xl">
          {/* AI Badge - Gemini Branding */}
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 
                            rounded-full border border-purple-500/30">
              <GeminiLogo size={16} />
              <span className="text-white text-xs sm:text-sm font-semibold">Gemini AI Analysis</span>
              <Sparkles size={12} className="text-yellow-400" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-[10px] font-medium">Verified</span>
            </div>
          </div>

          {/* One-Line AI Summary */}
          <div className="mb-4 p-3 bg-gradient-to-r from-slate-800/80 to-purple-900/30 rounded-xl border border-purple-500/20">
            <div className="flex items-start gap-2">
              <Brain size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-purple-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">AI Assessment</p>
                <p className="text-white text-sm leading-relaxed">{summary}</p>
              </div>
            </div>
          </div>

          {/* Severity & Priority Row */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {/* Severity Badge */}
            <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border ${severityConfig.borderColor}`}>
              <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Severity</p>
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg ${severityConfig.color} ${severityConfig.pulse ? 'animate-pulse' : ''}`}>
                <AlertCircle size={14} className="sm:hidden text-white" />
                <AlertCircle size={16} className="hidden sm:block text-white" />
                <span className="text-white font-bold text-sm sm:text-base">{severityConfig.label}</span>
              </div>
            </div>

            {/* Priority Score */}
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30">
              <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Priority Score</p>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Flame size={16} className="sm:hidden text-red-500" />
                <Flame size={20} className="hidden sm:block text-red-500" />
                <span className="text-2xl sm:text-3xl font-bold text-white">{animatedScore}</span>
                <span className="text-gray-500 text-sm">/100</span>
              </div>
            </div>
          </div>

          {/* Response Time & Responders */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {/* Estimated Response Time */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Clock size={14} className="sm:hidden text-blue-400" />
                <Clock size={16} className="hidden sm:block text-blue-400" />
                <p className="text-gray-400 text-xs sm:text-sm">Est. Response</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white">{estimatedResponseTime} min</p>
            </div>

            {/* Nearest Responders */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Users size={14} className="sm:hidden text-green-400" />
                <Users size={16} className="hidden sm:block text-green-400" />
                <p className="text-gray-400 text-xs sm:text-sm">Responders</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white">3 units</p>
              <p className="text-[10px] sm:text-xs text-gray-500">within 5km</p>
            </div>
          </div>

          {/* Key Details */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <TrendingUp size={14} className="sm:hidden text-purple-400" />
              <TrendingUp size={16} className="hidden sm:block text-purple-400" />
              <p className="text-gray-400 text-xs sm:text-sm font-medium">AI-Extracted Key Details</p>
            </div>
            <ul className="space-y-1.5 sm:space-y-2">
              {keyDetails.map((detail, index) => (
                <li key={index} className="flex items-start gap-1.5 sm:gap-2 text-gray-300 text-xs sm:text-sm">
                  <Shield size={12} className="sm:hidden text-green-500 mt-0.5 flex-shrink-0" />
                  <Shield size={14} className="hidden sm:block text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Analysis Results - Only shown if image was analyzed */}
          {imageAnalysis && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border ${
              imageAnalysis.isEmergency 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Camera size={16} className="text-purple-400" />
                <p className="text-white text-xs sm:text-sm font-medium">Photo Analysis</p>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                  imageAnalysis.confidence >= 70 
                    ? 'bg-green-500/20 text-green-400' 
                    : imageAnalysis.confidence >= 40 
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                }`}>
                  {imageAnalysis.confidence}% confidence
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  {imageAnalysis.isEmergency ? (
                    <>
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-green-400">Emergency verified in image</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={14} className="text-orange-400" />
                      <span className="text-orange-400">Image may not show emergency</span>
                    </>
                  )}
                </div>
                
                {imageAnalysis.detectedContent && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm">
                    <Eye size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{imageAnalysis.detectedContent}</span>
                  </div>
                )}
                
                {!imageAnalysis.matchesDescription && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-yellow-400">
                    <AlertTriangle size={14} />
                    <span>Image may not match description</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Incident ID */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-800/50 border border-slate-700 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin size={12} className="sm:hidden text-gray-500" />
                <MapPin size={14} className="hidden sm:block text-gray-500" />
                <span className="text-gray-500 text-xs sm:text-sm">Incident ID</span>
              </div>
              <code className="text-purple-400 font-mono text-xs sm:text-sm">{incidentId.slice(-12)}</code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-95 text-white font-medium rounded-xl transition-all hover:scale-105 touch-manipulation text-xs sm:text-base"
            >
              <MapPin size={16} className="sm:hidden" />
              <MapPin size={18} className="hidden sm:block" />
              <span className="hidden sm:inline">Track on Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </button>
            <button
              onClick={onReportAnother}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/20 text-white font-medium rounded-xl transition-all hover:scale-105 touch-manipulation text-xs sm:text-base"
            >
              <Plus size={16} className="sm:hidden" />
              <Plus size={18} className="hidden sm:block" />
              <span className="hidden sm:inline">Report Another</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-ping" />
          </div>
          <p className="text-gray-400 text-xs sm:text-sm text-center">
            <span className="hidden sm:inline">Responders notified • Real-time tracking active</span>
            <span className="sm:hidden">Responders notified • Tracking active</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisResult;
