import React, { useState, useEffect } from 'react';
import {
  Monitor, Server, Database, Wifi, Shield, Activity, AlertTriangle,
  CheckCircle, Clock, Users, HardDrive, Cpu, Zap, Eye, Settings
} from 'lucide-react';

const ICTDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ict/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setSystemAlerts(data.systemAlerts || []);
          setSystemHealth(data.systemHealth || {});
        }
      }
    } catch (error) {
      console.error('Error loading ICT dashboard:', error);
      // Fallback data
      setStats({
        totalDevices: 450,
        activeConnections: 380,
        serverUptime: 99.8,
        storageUsed: 78.5,
        networkSpeed: 95.2,
        securityScore: 92.1
      });
      setSystemAlerts([
        { id: 1, type: 'warning', message: 'Database backup scheduled for tonight', time: '2 hours ago', status: 'info' },
        { id: 2, type: 'error', message: 'High CPU usage detected on server-02', time: '4 hours ago', status: 'warning' },
        { id: 3, type: 'success', message: 'Security patch installed successfully', time: '1 day ago', status: 'success' }
      ]);
      setSystemHealth({
        database: 98.5,
        server: 99.2,
        network: 97.8,
        storage: 95.2,
        security: 92.1
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Monitor className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ICT & Data Management Dashboard</h1>
            <p className="text-gray-600">Digital systems, databases, and technology infrastructure</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated:</span>
          <span className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Devices</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDevices || 450}</p>
              <p className="text-sm text-green-600 mt-1">Connected devices</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Connections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeConnections || 380}</p>
              <p className="text-sm text-green-600 mt-1">84% utilization</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Server Uptime</p>
              <p className="text-3xl font-bold text-gray-900">{stats.serverUptime || 99.8}%</p>
              <p className="text-sm text-green-600 mt-1">Excellent performance</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Server className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">{stats.storageUsed || 78.5}%</p>
              <p className="text-sm text-yellow-600 mt-1">21.5% available</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Network Speed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.networkSpeed || 95.2}%</p>
              <p className="text-sm text-green-600 mt-1">Optimal performance</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Security Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.securityScore || 92.1}%</p>
              <p className="text-sm text-green-600 mt-1">High security</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemHealth.database || 98.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemHealth.database || 98.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemHealth.server || 99.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemHealth.server || 99.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${systemHealth.network || 97.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemHealth.network || 97.8}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${systemHealth.storage || 95.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemHealth.storage || 95.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Security</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemHealth.security || 92.1}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{systemHealth.security || 92.1}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            System Alerts
          </h3>
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${getStatusColor(alert.status)}`}>
                  {getStatusIcon(alert.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
            <Database className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Backup Database</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Security Scan</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">System Monitor</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Cpu className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Performance</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ICTDashboard;
