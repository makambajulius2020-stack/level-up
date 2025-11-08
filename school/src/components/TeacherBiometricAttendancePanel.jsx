import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, Clock, Users, CheckCircle, XCircle, AlertTriangle, 
  Calendar, Filter, Download, Eye, TrendingUp, BarChart3, 
  RefreshCw, Search, Calendar as CalendarIcon, User
} from 'lucide-react';

const TeacherBiometricAttendancePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, selectedClass]);

  useEffect(() => {
    filterData();
  }, [attendanceData, searchTerm]);

  const showNotificationToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    showNotificationToast('Refreshing attendance data...');
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedClass) params.append('class', selectedClass);

      const response = await fetch(`${baseUrl}/api/attendance/teacher/biometric?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => null);

      if (response && response.ok) {
        const payload = await response.json();
        const records = Array.isArray(payload?.records) ? payload.records : [];
        setAttendanceData(records);
        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const late = records.filter(r => r.status === 'late').length;
        const absent = records.filter(r => r.status === 'absent').length;
        setStats({
          totalStudents: total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
        });
        showNotificationToast('✅ Attendance data refreshed successfully.');
      } else {
        setAttendanceData([]);
        setStats({ totalStudents: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 });
        showNotificationToast('ℹ️ No attendance data available for the selected filters.');
      }
      
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setAttendanceData([]);
      setStats({ totalStudents: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 });
      showNotificationToast('❌ Error refreshing attendance data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    // Enforce biometric-only attendance
    let filtered = (attendanceData || []).filter(rec => (rec.method || 'biometric') === 'biometric');
    
    if (searchTerm) {
      filtered = filtered.filter(student => 
        (student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (student.student_id || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportAttendance = () => {
    const csvContent = [
      ['Student ID', 'Name', 'Class', 'Status', 'Check-in Time', 'Method'],
      ...filteredData.map(student => [
        student.student_id,
        student.name,
        student.class_name,
        student.status,
        student.check_in_time,
        student.method
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-6 space-y-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl shadow-2xl p-4 flex items-center space-x-3 min-w-[300px]`}>
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className={`${textPrimary} text-sm font-medium whitespace-pre-line`}>{notificationMessage}</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            Biometric Attendance Records
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            View student attendance from biometric scans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAttendanceData}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300 transition-colors`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportAttendance}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">All Classes</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
              <option value="Graduate">Graduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${textPrimary}`}>
              Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={filterData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Total Students</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Present</p>
              <p className={`text-2xl font-bold text-green-600`}>{stats.present}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Absent</p>
              <p className={`text-2xl font-bold text-red-600`}>{stats.absent}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Late</p>
              <p className={`text-2xl font-bold text-yellow-600`}>{stats.late}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Attendance Rate</p>
              <p className={`text-2xl font-bold text-blue-600`}>{stats.attendanceRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Attendance Records - {selectedDate}
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className={textSecondary}>Loading attendance data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <Fingerprint className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className={`text-lg font-medium ${textPrimary}`}>No attendance records found</p>
            <p className={textSecondary}>No biometric scans recorded for the selected date and class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                    Student
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                    Class
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                    Check-in Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                    Method
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                {filteredData.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          student.status === 'present' ? 'bg-green-100' :
                          student.status === 'absent' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          <User className={`w-5 h-5 ${
                            student.status === 'present' ? 'text-green-600' :
                            student.status === 'absent' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${textPrimary}`}>
                            {student.name}
                          </div>
                          <div className={`text-sm ${textSecondary}`}>
                            {student.student_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.class_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(student.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(student.status)}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.check_in_time || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
                        biometric
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherBiometricAttendancePanel;
