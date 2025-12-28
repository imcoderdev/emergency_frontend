import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, CheckCircle, TrendingUp, 
  Brain, Flame, ArrowUp, ArrowDown, Activity
} from 'lucide-react';
import { getIncidentStats } from '../services/api';

const AnimatedNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + diff * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
};

const StatCard = ({ icon: Icon, label, value, change, trend, color, bgColor, pulse }) => (
  <div className={`relative overflow-hidden rounded-xl p-4 ${bgColor} border border-gray-700/50 transition-all hover:scale-105 hover:shadow-lg cursor-pointer`}>
    {/* Background Glow */}
    {pulse && (
      <div className={`absolute inset-0 ${color} opacity-20 animate-pulse`} />
    )}
    
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white">
            <AnimatedNumber value={value} />
          </span>
          {change !== undefined && (
            <span className={`flex items-center text-xs font-medium ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend === 'up' ? <ArrowUp size={12} /> : trend === 'down' ? <ArrowDown size={12} /> : null}
              {change}%
            </span>
          )}
        </div>
      </div>
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const StatsOverview = ({ className = '' }) => {
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    avgResponseTime: 0,
    resolved: 0,
    aiAccuracy: 94
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getIncidentStats();
        setStats({
          total: data.total || 0,
          critical: data.critical || 0,
          avgResponseTime: data.avgResponseTime || 8,
          resolved: data.resolved || 0,
          aiAccuracy: 94 // Demo value
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      icon: Activity,
      label: 'Active Incidents',
      value: stats.total,
      change: 12,
      trend: 'up',
      color: 'bg-blue-600',
      bgColor: 'bg-gray-800/50'
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: stats.avgResponseTime,
      suffix: 'm',
      change: 15,
      trend: 'up',
      color: 'bg-green-600',
      bgColor: 'bg-gray-800/50'
    },
    {
      icon: Flame,
      label: 'Critical Alerts',
      value: stats.critical,
      change: stats.critical > 0 ? undefined : undefined,
      color: 'bg-red-600',
      bgColor: 'bg-gray-800/50',
      pulse: stats.critical > 0
    },
    {
      icon: Brain,
      label: 'AI Accuracy',
      value: stats.aiAccuracy,
      suffix: '%',
      color: 'bg-purple-600',
      bgColor: 'bg-gray-800/50'
    },
    {
      icon: CheckCircle,
      label: 'Resolved Today',
      value: stats.resolved,
      change: 8,
      trend: 'up',
      color: 'bg-emerald-600',
      bgColor: 'bg-gray-800/50'
    }
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${className}`}>
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsOverview;
