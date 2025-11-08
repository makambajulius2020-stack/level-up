import React, { useState, useEffect } from 'react';
import {
  UserCheck, Users, Clock, TrendingUp, AlertTriangle, CheckCircle,
  Calendar, FileText, Award, Activity, Eye, Settings, BarChart3
} from 'lucide-react';

const HRDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/hr/dashboard', {
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
          setAttendanceData(data.attendanceData || {});
        }
      }
    } catch (error) {
      console.error('Error loading HR dashboard:', error);
      // Fallback data
      setStats({
        totalStaff: 85,
        presentToday: 78,
        onLeave: 5,
        lateArrivals: 2,
        averageAttendance: 94.2,
        pendingApprovals: 8
      });
      setRecentActivities([
        { id: 1, type: 'attendance', message: 'John Doe checked in late', time: '30 minutes ago', status: 'warning' },
        { id: 2, type: 'leave', message: 'Jane Smith leave request approved', time: '2 hours ago', status: 'success' },
        { id: 3, type: 'payroll', message: 'Monthly payroll processed', time: '1 day ago', status: 'info' }
      ]);
      setAttendanceData({
        present: 78,
        absent: 7,
        late: 2,
        onLeave: 5
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
          <div className="p-3 bg-pink-100 rounded-lg">
            <UserCheck className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Human Resource Dashboard</h1>
            <p className="text-gray-600">Staff management, payroll, and human resource operations</p>
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
              <p className="text-sm text-gray-600 font-medium">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStaff || 85}</p>
              <p className="text-sm text-blue-600 mt-1">Teachers & non-teaching</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Present Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.presentToday || 78}</p>
              <p className="text-sm text-green-600 mt-1">91.8% attendance</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">On Leave</p>
              <p className="text-3xl font-bold text-gray-900">{stats.onLeave || 5}</p>
              <p className="text-sm text-yellow-600 mt-1">Approved leave</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Late Arrivals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.lateArrivals || 2}</p>
              <p className="text-sm text-orange-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Average Attendance</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageAttendance || 94.2}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.1% improvement
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals || 8}</p>
              <p className="text-sm text-yellow-600 mt-1">Leave requests</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Overview & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Today's Attendance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Present</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(attendanceData.present || 78) / (stats.totalStaff || 85) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{attendanceData.present || 78}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Absent</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(attendanceData.absent || 7) / (stats.totalStaff || 85) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{attendanceData.absent || 7}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Late</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(attendanceData.late || 2) / (stats.totalStaff || 85) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{attendanceData.late || 2}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Leave</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(attendanceData.onLeave || 5) / (stats.totalStaff || 85) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{attendanceData.onLeave || 5}</span>
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
          <button className="flex items-center space-x-3 p-4 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors">
            <UserCheck className="w-5 h-5 text-pink-600" />
            <span className="text-sm font-medium text-pink-900">Add Staff</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Leave Requests</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Payroll</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Eye className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
