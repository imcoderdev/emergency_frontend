import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, MapPin, Plus, RefreshCw } from 'lucide-react';

const EmptyState = ({ 
  type = 'default',
  title,
  subtitle,
  actionLabel,
  actionPath,
  onAction,
  icon: CustomIcon
}) => {
  const navigate = useNavigate();

  // Preset configurations
  const presets = {
    'no-incidents': {
      icon: CheckCircle,
      title: 'All Clear!',
      subtitle: 'No active incidents at the moment. The community is safe.',
      actionLabel: 'Report Incident',
      actionPath: '/report',
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10'
    },
    'no-results': {
      icon: MapPin,
      title: 'No Results Found',
      subtitle: 'Try adjusting your filters or search criteria.',
      actionLabel: 'Clear Filters',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10'
    },
    'error': {
      icon: AlertTriangle,
      title: 'Something Went Wrong',
      subtitle: 'Unable to load data. Please try again.',
      actionLabel: 'Retry',
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10'
    },
    'default': {
      icon: MapPin,
      title: 'No Data',
      subtitle: 'Nothing to display here yet.',
      actionLabel: null,
      iconColor: 'text-gray-500',
      iconBg: 'bg-gray-500/10'
    }
  };

  const config = presets[type] || presets.default;
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayActionPath = actionPath || config.actionPath;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (displayActionPath) {
      navigate(displayActionPath);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon */}
      <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mb-6 animate-pulse`}>
        <Icon size={40} className={config.iconColor} />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-2">
        {displayTitle}
      </h3>

      {/* Subtitle */}
      <p className="text-gray-400 max-w-md mb-6">
        {displaySubtitle}
      </p>

      {/* Action Button */}
      {displayActionLabel && (
        <button
          onClick={handleAction}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-medium rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-500/20"
        >
          {type === 'error' ? <RefreshCw size={18} /> : <Plus size={18} />}
          {displayActionLabel}
        </button>
      )}
    </div>
  );
};

// Compact version for smaller spaces
export const EmptyStateCompact = ({ message = 'No data available', icon: Icon = MapPin }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Icon size={32} className="text-gray-600 mb-3" />
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

export default EmptyState;
