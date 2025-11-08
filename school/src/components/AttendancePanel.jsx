import React, { useState, useEffect } from 'react';
import { Clock, Users, AlertTriangle, CheckCircle, Smartphone, CreditCard, Video, Monitor, Globe } from 'lucide-react';
import apiService from '../services/api';

const AttendancePanel = ({ userRole, currentUser }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'online', 'physical'
  const [attendanceData, setAttendanceData] = useState(null);
  const [onlineAttendanceData, setOnlineAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAttendance();
        if (response.success && response.data && response.data.length > 0) {
          const attendanceRecords = response.data;
          const todayRecords = attendanceRecords.filter(record => {
            const recordDate = new Date(record.date).toDateString();
            const today = new Date().toDateString();
            return recordDate === today;
          });
          
          const presentCount = todayRecords.filter(r => r.status === 'present').length;
          const absentCount = todayRecords.filter(r => r.status === 'absent').length;
          const totalStudents = presentCount + absentCount || attendanceRecords.length;
          
          setAttendanceData({
            todayPresent: presentCount,
            todayAbsent: absentCount,
            totalStudents: totalStudents,
            attendanceRate: totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0,
            recentScans: attendanceRecords.slice(0, 10).map(record => ({
              id: record.id,
              name: record.student_name,
              time: new Date(record.check_in_time || record.date).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              method: record.method || 'Biometric',
              status: record.status
            }))
          });
        } else {
          // No data from database - show empty state
          setAttendanceData({
            todayPresent: 0,
            todayAbsent: 0,
            totalStudents: 0,
            attendanceRate: 0,
            recentScans: []
          });
        }
      } catch (error) {
        console.error('Failed to connect to Python backend:', error);
        setAttendanceData({
          todayPresent: 0,
          todayAbsent: 0,
          totalStudents: 0,
          attendanceRate: 0,
          recentScans: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchOnlineAttendance();
  }, []);

  const fetchOnlineAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      // Fetch online class attendance
      const response = await fetch(`${baseUrl}/api/online-classes/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        const todayOnlineRecords = (data.records || []).filter(record => {
          const recordDate = new Date(record.date || record.joined_at).toISOString().split('T')[0];
          return recordDate === today;
        });

        const onlinePresent = todayOnlineRecords.filter(r => r.status === 'present' || r.joined_at).length;
        const onlineAbsent = todayOnlineRecords.filter(r => r.status === 'absent').length;
        const totalOnline = onlinePresent + onlineAbsent || todayOnlineRecords.length;

        setOnlineAttendanceData({
          todayPresent: onlinePresent,
          todayAbsent: onlineAbsent,
          totalStudents: totalOnline,
          attendanceRate: totalOnline > 0 ? ((onlinePresent / totalOnline) * 100).toFixed(1) : 0,
          recentJoins: (data.records || []).slice(0, 10).map(record => ({
            id: record.id,
            name: record.student_name || record.name,
            class: record.class_name || record.class_title,
            time: new Date(record.joined_at || record.date).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            duration: record.duration || 'N/A',
            status: record.status || 'present'
          }))
        });
      } else {
        setOnlineAttendanceData({
          todayPresent: 0,
          todayAbsent: 0,
          totalStudents: 0,
          attendanceRate: 0,
          recentJoins: []
        });
      }
    } catch (error) {
      console.error('Error fetching online attendance:', error);
      setOnlineAttendanceData({
        todayPresent: 0,
        todayAbsent: 0,
        totalStudents: 0,
        attendanceRate: 0,
        recentJoins: []
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Track and manage student attendance with real-time data</p>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveView('online')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'online'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Video className="w-4 h-4 inline mr-2" />
            Online Classes
          </button>
          <button
            onClick={() => setActiveView('physical')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'physical'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            Physical
          </button>
        </div>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <>
          {/* Combined Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(attendanceData?.todayPresent || 0) + (onlineAttendanceData?.todayPresent || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {onlineAttendanceData?.todayPresent || 0} online • {attendanceData?.todayPresent || 0} physical
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent Today</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(attendanceData?.todayAbsent || 0) + (onlineAttendanceData?.todayAbsent || 0)}
                  </p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(attendanceData?.totalStudents || 0) + (onlineAttendanceData?.totalStudents || 0)}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const total = (attendanceData?.totalStudents || 0) + (onlineAttendanceData?.totalStudents || 0);
                      const present = (attendanceData?.todayPresent || 0) + (onlineAttendanceData?.todayPresent || 0);
                      return total > 0 ? ((present / total) * 100).toFixed(1) : 0;
                    })()}%
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity - Combined */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[...(attendanceData?.recentScans || []), ...(onlineAttendanceData?.recentJoins || [])]
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, 10)
                .map((scan, index) => (
                <div key={scan.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      scan.status === 'present' ? 'bg-green-500' : 
                      scan.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{scan.name}</p>
                      <p className="text-sm text-gray-500">
                        {scan.method || 'Online Class'} • {scan.class ? `${scan.class} • ` : ''}{scan.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    scan.status === 'present' ? 'bg-green-100 text-green-800' :
                    scan.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Online Attendance View */}
      {activeView === 'online' && (
        <>
          {/* Online Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Present</p>
                  <p className="text-2xl font-bold text-green-600">{onlineAttendanceData?.todayPresent || 0}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Absent</p>
                  <p className="text-2xl font-bold text-red-600">{onlineAttendanceData?.todayAbsent || 0}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Online</p>
                  <p className="text-2xl font-bold text-blue-600">{onlineAttendanceData?.totalStudents || 0}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{onlineAttendanceData?.attendanceRate || 0}%</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Online Class Attendance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Class Attendance</h3>
            <div className="space-y-3">
              {onlineAttendanceData?.recentJoins?.length > 0 ? (
                onlineAttendanceData.recentJoins.map((join, index) => (
                  <div key={join.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Video className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{join.name}</p>
                        <p className="text-sm text-gray-500">{join.class} • Joined at {join.time}</p>
                        {join.duration && (
                          <p className="text-xs text-gray-400">Duration: {join.duration}</p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Present
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No online class attendance records today</p>
                  <p className="text-sm mt-1">Attendance is automatically tracked when students join online classes</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Physical Attendance View */}
      {activeView === 'physical' && (
        <>
          {/* Physical Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Physical Present</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceData?.todayPresent || 0}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Physical Absent</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceData?.todayAbsent || 0}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Physical</p>
                  <p className="text-2xl font-bold text-blue-600">{attendanceData?.totalStudents || 0}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Physical Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{attendanceData?.attendanceRate || 0}%</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Physical Attendance Records */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Attendance Records</h3>
            <div className="space-y-3">
              {attendanceData?.recentScans?.length > 0 ? (
                attendanceData.recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        scan.status === 'present' ? 'bg-green-500' : 
                        scan.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{scan.name}</p>
                        <p className="text-sm text-gray-500">{scan.method} • {scan.time}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      scan.status === 'present' ? 'bg-green-100 text-green-800' :
                      scan.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {scan.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No physical attendance records today</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePanel;
