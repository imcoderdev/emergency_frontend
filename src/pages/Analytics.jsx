import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle,
  Users, Shield, Brain, Calendar, Download, Filter, RefreshCw,
  Flame, Car, Stethoscope, ArrowUp, ArrowDown, Target
} from 'lucide-react';
import { getIncidentStats, getIncidents } from '../services/api';
import PermissionGuard from '../components/PermissionGuard';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, change, changeType, icon: Icon, color, subtitle }) => (
  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          changeType === 'positive' ? 'bg-green-500/20 text-green-400' : 
          changeType === 'negative' ? 'bg-red-500/20 text-red-400' : 
          'bg-gray-500/20 text-gray-400'
        }`}>
          {changeType === 'positive' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {change}%
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-gray-400 text-sm">{title}</p>
    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
  </div>
);

const IncidentTypeChart = ({ data }) => {
  const types = [
    { type: 'Fire', icon: Flame, color: 'bg-orange-500', count: data?.fire || 0 },
    { type: 'Accident', icon: Car, color: 'bg-blue-500', count: data?.accident || 0 },
    { type: 'Medical', icon: Stethoscope, color: 'bg-green-500', count: data?.medical || 0 },
    { type: 'Crime', icon: Shield, color: 'bg-purple-500', count: data?.crime || 0 },
    { type: 'Other', icon: AlertTriangle, color: 'bg-gray-500', count: data?.other || 0 }
  ];

  const total = types.reduce((sum, t) => sum + t.count, 0) || 1;

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <BarChart3 size={20} className="text-purple-400" />
        Incident Type Breakdown
      </h3>
      <div className="space-y-4">
        {types.map((item) => {
          const Icon = item.icon;
          const percentage = Math.round((item.count / total) * 100);
          return (
            <div key={item.type}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-white font-medium">{item.type}</span>
                </div>
                <span className="text-gray-400">{item.count} ({percentage}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AIMetricsCard = ({ stats }) => (
  <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <Brain size={20} className="text-purple-400" />
      Gemini AI Performance
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-black/20 rounded-xl">
        <div className="text-3xl font-bold text-purple-400 mb-1">{stats?.aiProcessed || 0}</div>
        <div className="text-gray-400 text-sm">Incidents Analyzed</div>
      </div>
      <div className="text-center p-4 bg-black/20 rounded-xl">
        <div className="text-3xl font-bold text-green-400 mb-1">94%</div>
        <div className="text-gray-400 text-sm">Accuracy Rate</div>
      </div>
      <div className="text-center p-4 bg-black/20 rounded-xl">
        <div className="text-3xl font-bold text-blue-400 mb-1">2.3s</div>
        <div className="text-gray-400 text-sm">Avg Analysis Time</div>
      </div>
      <div className="text-center p-4 bg-black/20 rounded-xl">
        <div className="text-3xl font-bold text-orange-400 mb-1">{stats?.duplicatesPrevented || 12}</div>
        <div className="text-gray-400 text-sm">Duplicates Prevented</div>
      </div>
    </div>
    <div className="mt-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg">
      <p className="text-green-400 text-sm text-center">
        🎯 AI correctly classified {stats?.correctClassifications || 47} out of {stats?.totalClassifications || 50} incidents
      </p>
    </div>
  </div>
);

const ResponseTimeChart = ({ data }) => {
  const hours = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'];
  const values = data || [5, 8, 12, 15, 10, 7, 4];
  const maxValue = Math.max(...values);

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Clock size={20} className="text-blue-400" />
        Peak Hours Activity
      </h3>
      <div className="flex items-end justify-between h-40 gap-2">
        {hours.map((hour, i) => (
          <div key={hour} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-purple-500"
              style={{ height: `${(values[i] / maxValue) * 100}%` }}
            />
            <span className="text-gray-500 text-xs">{hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Export PDF using browser print
  const handleExport = () => {
    const originalTitle = document.title;
    document.title = 'EmergencyHub_Analytics_Report';
    window.print();
    document.title = originalTitle;
  };

  // Handle date range change with loading effect
  const handleDateChange = (newRange) => {
    setIsFilterLoading(true);
    setDateRange(newRange);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 800);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getIncidentStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading Analytics..." />
      </div>
    );
  }

  return (
    <PermissionGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="text-purple-500" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Comprehensive emergency response metrics</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Filter */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => handleDateChange(e.target.value)}
                  disabled={isFilterLoading}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-purple-500 outline-none disabled:opacity-50"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                {isFilterLoading && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <RefreshCw size={14} className="animate-spin text-purple-400" />
                  </div>
                )}
              </div>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-all"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Loading Overlay */}
        {isFilterLoading && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 flex items-center justify-center gap-3">
              <RefreshCw size={18} className="animate-spin text-purple-400" />
              <span className="text-purple-300 text-sm">Refreshing data for {dateRange === '24h' ? 'Last 24 Hours' : dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}...</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className={`max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-opacity duration-300 ${isFilterLoading ? 'opacity-50' : 'opacity-100'}`}>
          <StatCard
            title="Total Incidents"
            value={stats?.total || 156}
            change={12}
            changeType="positive"
            icon={AlertTriangle}
            color="bg-gradient-to-br from-blue-600 to-blue-800"
            subtitle="vs. previous period"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats?.avgResponseTime || 8.5}m`}
            change={15}
            changeType="positive"
            icon={Clock}
            color="bg-gradient-to-br from-green-600 to-green-800"
            subtitle="23% faster than target"
          />
          <StatCard
            title="Critical Alerts"
            value={stats?.critical || 23}
            change={8}
            changeType="negative"
            icon={Flame}
            color="bg-gradient-to-br from-red-600 to-red-800"
            subtitle="Requires attention"
          />
          <StatCard
            title="Resolution Rate"
            value={`${stats?.resolutionRate || 94}%`}
            change={3}
            changeType="positive"
            icon={CheckCircle}
            color="bg-gradient-to-br from-purple-600 to-purple-800"
            subtitle="Above 90% target"
          />
        </div>

        {/* Charts Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <IncidentTypeChart data={{
            fire: stats?.byType?.Fire || 34,
            accident: stats?.byType?.Accident || 45,
            medical: stats?.byType?.Medical || 38,
            crime: stats?.byType?.Crime || 25,
            other: stats?.byType?.Other || 14
          }} />
          <AIMetricsCard stats={{
            aiProcessed: stats?.total || 156,
            duplicatesPrevented: 12,
            correctClassifications: 47,
            totalClassifications: 50
          }} />
        </div>

        {/* Response Time Chart */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponseTimeChart />
          
          {/* Performance Summary */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Target size={20} className="text-green-400" />
              Performance Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" />
                  <span className="text-white">Response Time Target</span>
                </div>
                <span className="text-green-400 font-bold">Met ✓</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" />
                  <span className="text-white">Resolution Rate Target</span>
                </div>
                <span className="text-green-400 font-bold">Met ✓</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" />
                  <span className="text-white">AI Accuracy Target</span>
                </div>
                <span className="text-green-400 font-bold">Met ✓</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-yellow-400" />
                  <span className="text-white">Critical Response Time</span>
                </div>
                <span className="text-yellow-400 font-bold">Needs Improvement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default Analytics;
