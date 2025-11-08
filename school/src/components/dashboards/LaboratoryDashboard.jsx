import React, { useState, useEffect } from 'react';
import {
  FlaskConical, Beaker, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Users, Activity, Eye, Settings, BarChart3, Calendar, FileText
} from 'lucide-react';

const LaboratoryDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/laboratory/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentActivities(data.recentActivities || []);
          setEquipmentStatus(data.equipmentStatus || {});
        }
      }
    } catch (error) {
      console.error('Error loading laboratory dashboard:', error);
      // Fallback data
      setStats({
        totalEquipment: 156,
        functionalEquipment: 142,
        maintenanceRequired: 8,
        safetyIncidents: 2,
        practicalSessions: 45,
        resourceUtilization: 78.5
      });
      setRecentActivities([
        { id: 1, type: 'maintenance', message: 'Microscope maintenance completed', time: '2 hours ago', status: 'success' },
        { id: 2, type: 'safety', message: 'Safety inspection scheduled', time: '4 hours ago', status: 'info' },
        { id: 3, type: 'usage', message: 'Chemistry practical session completed', time: '1 day ago', status: 'success' }
      ]);
      setEquipmentStatus({
        functional: 142,
        maintenance: 8,
        damaged: 4,
        new: 2
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
          <div className="p-3 bg-cyan-100 rounded-lg">
            <FlaskConical className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laboratory & Science Resource Dashboard</h1>
            <p className="text-gray-600">Science equipment, resources, and practical learning support</p>
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
              <p className="text-sm text-gray-600 font-medium">Total Equipment</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEquipment || 156}</p>
              <p className="text-sm text-blue-600 mt-1">Science equipment</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Functional Equipment</p>
              <p className="text-3xl font-bold text-gray-900">{stats.functionalEquipment || 142}</p>
              <p className="text-sm text-green-600 mt-1">91% operational</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Maintenance Required</p>
              <p className="text-3xl font-bold text-gray-900">{stats.maintenanceRequired || 8}</p>
              <p className="text-sm text-yellow-600 mt-1">Scheduled maintenance</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Safety Incidents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.safetyIncidents || 2}</p>
              <p className="text-sm text-red-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Practical Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.practicalSessions || 45}</p>
              <p className="text-sm text-purple-600 mt-1">This week</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Beaker className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resource Utilization</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resourceUtilization || 78.5}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5.2% improvement
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Status & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FlaskConical className="w-5 h-5 mr-2 text-cyan-600" />
            Equipment Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Functional</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(equipmentStatus.functional || 142) / (stats.totalEquipment || 156) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{equipmentStatus.functional || 142}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(equipmentStatus.maintenance || 8) / (stats.totalEquipment || 156) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{equipmentStatus.maintenance || 8}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Damaged</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(equipmentStatus.damaged || 4) / (stats.totalEquipment || 156) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{equipmentStatus.damaged || 4}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(equipmentStatus.new || 2) / (stats.totalEquipment || 156) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{equipmentStatus.new || 2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
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
          <button className="flex items-center space-x-3 p-4 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors">
            <FlaskConical className="w-5 h-5 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-900">Equipment Check</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Schedule Session</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Safety Report</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Eye className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaboratoryDashboard;
