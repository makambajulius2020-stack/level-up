import React, { useState } from 'react';
import { 
  Clock, Users, Calendar, CheckCircle, XCircle, AlertTriangle, 
  Search, Filter, Download, Upload, BarChart3, TrendingUp, 
  Eye, MessageSquare, Phone, Mail, Plus, Edit, Save, X
} from 'lucide-react';

const EnhancedAttendancePanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('mark');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const classes = [];

  const students = [];

  const attendanceStats = {
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    averageAttendance: 0
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'P': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'A': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'L': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = () => {
    // Save attendance logic here
    setIsEditing(false);
    // Show success message
  };

  const renderMarkAttendance = () => (
    <div className="space-y-6">
      {/* Class Selection and Date */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Mark Attendance</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{attendanceStats.totalStudents}</div>
            <div className="text-sm text-blue-700">Total Students</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{attendanceStats.presentToday}</div>
            <div className="text-sm text-green-700">Present Today</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">{attendanceStats.absentToday}</div>
            <div className="text-sm text-red-700">Absent Today</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-900">{attendanceStats.lateToday}</div>
            <div className="text-sm text-yellow-700">Late Today</div>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Student Attendance</h4>
            {isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={saveAttendance}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Mark All Present
                </button>
              </div>
            )}
          </div>

          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.studentId}</div>
                </div>
                <div className={`px-2 py-1 text-xs font-bold rounded ${getAttendanceColor(student.attendance.percentage)}`}>
                  {student.attendance.percentage}%
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Recent Pattern */}
                <div className="flex space-x-1">
                  {student.recentPattern.map((status, index) => (
                    <div key={index} className="w-6 h-6 flex items-center justify-center">
                      {getStatusIcon(status)}
                    </div>
                  ))}
                </div>

                {/* Attendance Buttons */}
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'P')}
                      className={`p-2 rounded-lg transition-colors ${
                        attendanceData[student.id] === 'P' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'L')}
                      className={`p-2 rounded-lg transition-colors ${
                        attendanceData[student.id] === 'L' 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'A')}
                      className={`p-2 rounded-lg transition-colors ${
                        attendanceData[student.id] === 'A' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    {student.attendance.percentage < 80 && (
                      <button className="text-orange-600 hover:text-orange-800">
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAttendanceReports = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Class Average</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">87%</div>
            <div className="text-sm text-gray-600">Overall Attendance</div>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+3% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">At Risk Students</h3>
          <div className="space-y-3">
            {students.filter(s => s.attendance.percentage < 80).map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={student.photo} alt={student.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium">{student.name}</span>
                </div>
                <span className="text-sm text-red-600 font-bold">{student.attendance.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Perfect Attendance</h3>
          <div className="space-y-3">
            {students.filter(s => s.attendance.percentage >= 95).map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={student.photo} alt={student.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium">{student.name}</span>
                </div>
                <span className="text-sm text-green-600 font-bold">{student.attendance.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Detailed Attendance Report</h3>
          <div className="flex space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>This Week</option>
              <option>This Month</option>
              <option>This semester</option>
            </select>
            <button 
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Present</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Absent</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Late</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Percentage</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-green-600 font-medium">
                    {student.attendance.present}
                  </td>
                  <td className="text-center py-3 px-4 text-red-600 font-medium">
                    {student.attendance.absent}
                  </td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-medium">
                    {student.attendance.late}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 text-sm font-bold rounded ${getAttendanceColor(student.attendance.percentage)}`}>
                      {student.attendance.percentage}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {student.attendance.percentage < 80 && (
                        <button className="text-orange-600 hover:text-orange-800">
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAttendanceAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Trends Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Attendance trends chart would be displayed here</p>
            </div>
          </div>
        </div>

        {/* Daily Patterns */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Patterns</h3>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
              <div key={day} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{day}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${85 + index * 2}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{85 + index * 2}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">92%</div>
            <div className="text-sm text-gray-600">September</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">89%</div>
            <div className="text-sm text-gray-600">August</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">85%</div>
            <div className="text-sm text-gray-600">July</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">91%</div>
            <div className="text-sm text-gray-600">June</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Tracking</h1>
        <p className="text-gray-600">Monitor and manage student attendance with real-time insights</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'mark', label: 'Mark Attendance', icon: CheckCircle },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'mark' && renderMarkAttendance()}
      {activeTab === 'reports' && renderAttendanceReports()}
      {activeTab === 'analytics' && renderAttendanceAnalytics()}
    </div>
  );
};

export default EnhancedAttendancePanel;
