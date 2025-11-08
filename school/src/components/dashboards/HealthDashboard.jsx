import React, { useState, useEffect } from 'react';
import {
  Heart, Stethoscope, Users, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Activity, Eye, Settings, BarChart3, Calendar, FileText, Thermometer
} from 'lucide-react';

const HealthDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentVisits, setRecentVisits] = useState([]);
  const [healthTrends, setHealthTrends] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/health/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentVisits(data.recentVisits || []);
          setHealthTrends(data.healthTrends || {});
        }
      }
    } catch (error) {
      console.error('Error loading health dashboard:', error);
      // Fallback data
      setStats({
        totalStudents: 1200,
        sickBayVisits: 45,
        activeCases: 8,
        recovered: 37,
        averageRecoveryTime: 2.5,
        healthScore: 92.5
      });
      setRecentVisits([
        { id: 1, student: 'John Doe', condition: 'Fever', date: '2024-01-15', status: 'recovered' },
        { id: 2, student: 'Jane Smith', condition: 'Headache', date: '2024-01-14', status: 'active' },
        { id: 3, student: 'Mike Johnson', condition: 'Cough', date: '2024-01-13', status: 'recovered' }
      ]);
      setHealthTrends({
        healthy: 85.2,
        mild: 10.5,
        moderate: 3.8,
        severe: 0.5
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recovered': return 'text-green-600 bg-green-50';
      case 'active': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <Heart className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health / Sick Bay Dashboard</h1>
            <p className="text-gray-600">Student health care, medical records, and wellness programs</p>
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
              <p className="text-sm text-gray-600 font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents || 1200}</p>
              <p className="text-sm text-blue-600 mt-1">Under health care</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Sick Bay Visits</p>
              <p className="text-3xl font-bold text-gray-900">{stats.sickBayVisits || 45}</p>
              <p className="text-sm text-yellow-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeCases || 8}</p>
              <p className="text-sm text-orange-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Recovered</p>
              <p className="text-3xl font-bold text-gray-900">{stats.recovered || 37}</p>
              <p className="text-sm text-green-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Recovery Time</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRecoveryTime || 2.5}</p>
              <p className="text-sm text-purple-600 mt-1">Days</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Health Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.healthScore || 92.5}%</p>
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

      {/* Health Trends & Recent Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Health Trends
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Healthy</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${healthTrends.healthy || 85.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{healthTrends.healthy || 85.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mild Conditions</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${healthTrends.mild || 10.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{healthTrends.mild || 10.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Moderate</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${healthTrends.moderate || 3.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{healthTrends.moderate || 3.8}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Severe</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${healthTrends.severe || 0.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{healthTrends.severe || 0.5}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
            Recent Visits
          </h3>
          <div className="space-y-3">
            {recentVisits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Heart className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{visit.student}</p>
                    <p className="text-xs text-gray-500">{visit.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{visit.date}</p>
                  <p className={`text-xs ${getStatusColor(visit.status)}`}>{visit.status}</p>
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
          <button className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
            <Heart className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">Health Check</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Medical Record</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Health Monitor</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Thermometer className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Wellness Program</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
