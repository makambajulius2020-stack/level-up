import React, { useState, useEffect } from 'react';
import {
  Home, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, Activity,
  Eye, Settings, BarChart3, Calendar, FileText, Shield, UserCheck
} from 'lucide-react';

const BoardingDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [dormitoryStatus, setDormitoryStatus] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/boarding/dashboard', {
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
          setDormitoryStatus(data.dormitoryStatus || {});
        }
      }
    } catch (error) {
      console.error('Error loading boarding dashboard:', error);
      // Fallback data
      setStats({
        totalStudents: 450,
        presentStudents: 420,
        absentStudents: 25,
        lateStudents: 5,
        dormitoryCapacity: 500,
        occupancyRate: 90.0
      });
      setRecentActivities([
        { id: 1, type: 'checkin', message: 'John Doe checked into dormitory', time: '2 hours ago', status: 'success' },
        { id: 2, type: 'curfew', message: 'Curfew violation - 3 students', time: '4 hours ago', status: 'warning' },
        { id: 3, type: 'maintenance', message: 'Dormitory A maintenance completed', time: '1 day ago', status: 'info' }
      ]);
      setDormitoryStatus({
        dormitoryA: 95.2,
        dormitoryB: 88.5,
        dormitoryC: 92.1,
        dormitoryD: 85.8
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
          <div className="p-3 bg-teal-100 rounded-lg">
            <Home className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Boarding & Dormitory Dashboard</h1>
            <p className="text-gray-600">Residential facilities, student accommodation, and boarding life</p>
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
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents || 450}</p>
              <p className="text-sm text-blue-600 mt-1">Boarding students</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Present Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.presentStudents || 420}</p>
              <p className="text-sm text-green-600 mt-1">93.3% present</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Absent Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.absentStudents || 25}</p>
              <p className="text-sm text-yellow-600 mt-1">5.6% absent</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Late Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.lateStudents || 5}</p>
              <p className="text-sm text-orange-600 mt-1">Curfew violations</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Dormitory Capacity</p>
              <p className="text-3xl font-bold text-gray-900">{stats.dormitoryCapacity || 500}</p>
              <p className="text-sm text-purple-600 mt-1">Total capacity</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.occupancyRate || 90.0}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Optimal occupancy
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Dormitory Status & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dormitory Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Dormitory Occupancy
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dormitory A</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${dormitoryStatus.dormitoryA || 95.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dormitoryStatus.dormitoryA || 95.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dormitory B</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${dormitoryStatus.dormitoryB || 88.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dormitoryStatus.dormitoryB || 88.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dormitory C</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${dormitoryStatus.dormitoryC || 92.1}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dormitoryStatus.dormitoryC || 92.1}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dormitory D</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${dormitoryStatus.dormitoryD || 85.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dormitoryStatus.dormitoryD || 85.8}%</span>
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
          <button className="flex items-center space-x-3 p-4 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
            <Home className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-teal-900">Room Assignment</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Check-in/out</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Monitor Activity</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Discipline Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardingDashboard;
