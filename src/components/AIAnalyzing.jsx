import React, { useState, useEffect } from 'react';
import { Brain, Cpu, CheckCircle, Loader2, Zap, Shield, Bell, Search, Camera, Image, Sparkles } from 'lucide-react';

// Gemini AI Logo SVG Component
const GeminiLogo = ({ size = 40, className = '' }) => (
  <svg viewBox="0 0 28 28" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="25%" stopColor="#9B72CB" />
        <stop offset="50%" stopColor="#D96570" />
        <stop offset="75%" stopColor="#D96570" />
        <stop offset="100%" stopColor="#9B72CB" />
      </linearGradient>
    </defs>
    <path 
      fill="url(#gemini-gradient)" 
      d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14-7.732 0-14-6.268-14-14Z"
    />
  </svg>
);

const ANALYSIS_STEPS = [
  { 
    id: 1, 
    text: 'Gemini Vision analyzing photo...', 
    textNoImage: 'Reading incident description...',
    icon: Camera,
    duration: 2500,
    color: 'text-blue-400',
    hasImage: true
  },
  { 
    id: 2, 
    text: 'AI detecting emergency severity...', 
    textNoImage: 'AI detecting emergency severity...',
    icon: Search,
    duration: 2000,
    color: 'text-purple-400',
    hasImage: false
  },
  { 
    id: 3, 
    text: 'Calculating AI priority score...', 
    textNoImage: 'Calculating AI priority score...',
    icon: Zap,
    duration: 2000,
    color: 'text-orange-400',
    hasImage: false
  },
  { 
    id: 4, 
    text: 'Alerting nearby responders...', 
    textNoImage: 'Alerting nearby responders...',
    icon: Bell,
    duration: 1500,
    color: 'text-green-400',
    hasImage: false
  }
];

// AI Analysis phrases that will cycle through - showing what Gemini is doing
const AI_PHRASES = [
  "Extracting visual features from image...",
  "Identifying emergency type and severity...",
  "Analyzing scene for potential hazards...",
  "Cross-referencing with incident database...",
  "Computing response priority matrix...",
  "Evaluating required resources...",
  "Detecting location-based risk factors...",
  "Calculating optimal response time...",
  "Generating AI severity assessment...",
  "Preparing smart recommendations..."
];

const AIAnalyzing = ({ onComplete, incidentType = 'Emergency', hasPhoto = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [aiPhrase, setAiPhrase] = useState(AI_PHRASES[0]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showTyping, setShowTyping] = useState('');

  // Cycle through AI phrases
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % AI_PHRASES.length);
      setAiPhrase(AI_PHRASES[(phraseIndex + 1) % AI_PHRASES.length]);
    }, 1500);
    return () => clearInterval(phraseInterval);
  }, [phraseIndex]);

  // Typing animation for AI phrase
  useEffect(() => {
    setShowTyping('');
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < aiPhrase.length) {
        setShowTyping(aiPhrase.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, [aiPhrase]);

  useEffect(() => {
    const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    // Progress each step
    const runSteps = async () => {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setCurrentStep(i);
        
        // Update progress during this step
        const stepDuration = ANALYSIS_STEPS[i].duration;
        const progressInterval = setInterval(() => {
          elapsed += 50;
          setProgress((elapsed / totalDuration) * 100);
        }, 50);

        // Wait for step duration
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        
        clearInterval(progressInterval);
        setCompletedSteps(prev => [...prev, i]);
      }

      // Complete
      setProgress(100);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    };

    runSteps();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900">
        {/* Neural Network Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-500/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
          
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            {[...Array(10)].map((_, i) => (
              <line
                key={i}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="rgb(168, 85, 247)"
                strokeWidth="1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </svg>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 flex flex-col items-center">
        {/* Gemini AI Badge - PROMINENT */}
        <div className="flex items-center justify-center gap-3 mb-6 w-full">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 
                          rounded-full border border-white/20 backdrop-blur-sm">
            <GeminiLogo size={24} />
            <span className="text-white font-bold text-lg">Powered by Gemini AI</span>
            <Sparkles size={18} className="text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* AI Brain Icon */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
            <GeminiLogo size={40} className="animate-pulse sm:hidden" />
            <GeminiLogo size={50} className="animate-pulse hidden sm:block" />
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s' }}>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-center">
          🧠 Gemini AI Analyzing
        </h2>
        <p className="text-gray-400 mb-4 text-center text-sm sm:text-base">
          Processing your <span className="text-purple-400 font-semibold">{incidentType}</span> incident
          {hasPhoto && <span className="text-blue-400 font-semibold"> with photo</span>}
        </p>

        {/* Photo Analysis Indicator */}
        {hasPhoto && (
          <div className="w-full flex items-center justify-center gap-2 mb-6 p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <Camera size={20} className="text-blue-400 animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">Gemini Vision is analyzing your photo</span>
            <Image size={16} className="text-blue-400" />
          </div>
        )}

        {/* AI Thinking - One Line Analysis */}
        <div className="w-full mb-6 p-4 bg-gradient-to-r from-slate-800/80 to-purple-900/40 rounded-xl border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-purple-400" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">AI Analysis</span>
          </div>
          <div className="text-white font-mono text-sm min-h-[24px] text-left">
            <span className="text-green-400">{'>'}</span>{' '}
            <span className="text-gray-300">{showTyping}</span>
            <span className="animate-pulse text-purple-400">|</span>
          </div>
        </div>

        {/* Steps */}
        <div className="w-full space-y-3 mb-6">
          {ANALYSIS_STEPS.map((step, index) => {
            // Skip image step if no photo
            if (step.hasImage && !hasPhoto && index === 0) {
              return null;
            }
            
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index && !isCompleted;
            const stepText = hasPhoto ? step.text : step.textNoImage;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-600/20 border border-green-500/30' 
                    : isCurrent
                      ? 'bg-purple-600/20 border border-purple-500/30'
                      : 'bg-gray-800/30 border border-gray-700/30 opacity-50'
                }`}
                style={{
                  transform: index <= currentStep ? 'translateX(0)' : 'translateX(20px)',
                  opacity: index <= currentStep ? 1 : 0.3
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-600' : isCurrent ? 'bg-purple-600' : 'bg-gray-700'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={18} className="text-white" />
                  ) : isCurrent ? (
                    <Loader2 size={18} className="text-white animate-spin" />
                  ) : (
                    <Icon size={18} className="text-gray-400" />
                  )}
                </div>
                <span className={`flex-1 text-sm ${isCompleted ? 'text-green-400' : isCurrent ? step.color : 'text-gray-500'}`}>
                  {stepText}
                </span>
                {isCompleted && (
                  <span className="text-green-400 text-sm">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full relative h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-sm transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="w-full flex items-center justify-between mt-2">
          <p className="text-gray-500 text-sm">{Math.round(progress)}% Complete</p>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <GeminiLogo size={12} />
            <span>gemini-2.5-flash</span>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AIAnalyzing;
