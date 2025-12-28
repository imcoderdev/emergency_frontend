import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  showText = true,
  variant = 'emergency' 
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'emergency') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Emergency Siren Animation */}
        <div className="relative">
          {/* Outer pulse rings */}
          <div className={`${sizes[size]} absolute animate-ping rounded-full bg-red-500/30`} />
          <div className={`${sizes[size]} absolute animate-ping rounded-full bg-red-500/20`} style={{ animationDelay: '0.3s' }} />
          
          {/* Main siren icon */}
          <div className={`${sizes[size]} relative flex items-center justify-center`}>
            <div className="w-full h-full bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
              <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-3xl'}`}>
                🚨
              </span>
            </div>
          </div>
        </div>

        {showText && (
          <p className={`${textSizes[size]} text-gray-400 font-medium animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        {showText && (
          <p className={`${textSizes[size]} text-gray-400`}>{text}</p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-gray-700 border-t-red-500 rounded-full animate-spin`} />
      {showText && (
        <p className={`${textSizes[size]} text-gray-400`}>{text}</p>
      )}
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
      <LoadingSpinner size="lg" text={text} />
    </div>
  </div>
);

// Inline skeleton loader for cards
export const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-xl p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-700 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
      </div>
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-3 bg-gray-700 rounded" />
      <div className="h-3 bg-gray-700 rounded w-5/6" />
    </div>
  </div>
);

export default LoadingSpinner;
