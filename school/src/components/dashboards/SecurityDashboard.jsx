import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, Activity,
  Eye, Settings, BarChart3, Calendar, FileText, Camera, UserCheck
} from 'lucide-react';

const SecurityDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [securityMetrics, setSecurityMetrics] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/security/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentIncidents(data.recentIncidents || []);
          setSecurityMetrics(data.securityMetrics || {});
        }
      }
    } catch (error) {
      console.error('Error loading security dashboard:', error);
      // Fallback data
      setStats({
        totalGuards: 12,
        activePatrols: 8,
        incidentsToday: 2,
        resolvedIncidents: 1,
        accessViolations: 3,
        securityScore: 94.5
      });
      setRecentIncidents([
        { id: 1, type: 'unauthorized', message: 'Unauthorized access attempt at Gate A', time: '2 hours ago', status: 'resolved' },
        { id: 2, type: 'late', message: 'Student late entry detected', time: '4 hours ago', status: 'investigating' },
        { id: 3, type: 'patrol', message: 'Night patrol completed successfully', time: '6 hours ago', status: 'completed' }
      ]);
      setSecurityMetrics({
        cctv: 98.5,
        accessControl: 96.2,
        patrols: 92.8,
        responseTime: 89.3
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'investigating': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Shield className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Department Dashboard</h1>
            <p className="text-gray-600">Campus security, access control, and safety management</p>
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
              <p className="text-sm text-gray-600 font-medium">Total Guards</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalGuards || 12}</p>
              <p className="text-sm text-blue-600 mt-1">Security personnel</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Patrols</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activePatrols || 8}</p>
              <p className="text-sm text-green-600 mt-1">On duty</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Incidents Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.incidentsToday || 2}</p>
              <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolved Incidents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resolvedIncidents || 1}</p>
              <p className="text-sm text-green-600 mt-1">Today</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Access Violations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.accessViolations || 3}</p>
              <p className="text-sm text-orange-600 mt-1">This week</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Security Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.securityScore || 94.5}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.1% improvement
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Metrics & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Security Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CCTV Coverage</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${securityMetrics.cctv || 98.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{securityMetrics.cctv || 98.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Access Control</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${securityMetrics.accessControl || 96.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{securityMetrics.accessControl || 96.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Patrol Coverage</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${securityMetrics.patrols || 92.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{securityMetrics.patrols || 92.8}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${securityMetrics.responseTime || 89.3}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{securityMetrics.responseTime || 89.3}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-600" />
            Recent Incidents
          </h3>
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${getStatusColor(incident.status)}`}>
                  {getStatusIcon(incident.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{incident.message}</p>
                  <p className="text-xs text-gray-500">{incident.time}</p>
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
          <button className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Security Report</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Camera className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">CCTV Monitor</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <UserCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Access Control</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Eye className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Patrol Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
