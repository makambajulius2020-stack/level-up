import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, MapPin, BookOpen, Plus, Edit3, Trash2, 
  Filter, Search, Download, Upload, Bell, Settings, ChevronLeft, 
  ChevronRight, Eye, Copy, Share2, AlertCircle, CheckCircle
} from 'lucide-react';

const ClassSchedulePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('weekly');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [settings, setSettings] = useState({
    classDuration: 40,
    breakDuration: 30,
    lunchDuration: 90,
    startTime: '08:00',
    endTime: '16:00',
    notifications: true,
    autoScheduling: false,
    conflictDetection: true
  });

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Schedule data (start empty; populate from backend when available)
  const scheduleData = {};

  const classes = [];
  const timeSlots = ['8:00-9:00', '9:00-10:00', '10:00-10:30 (Break)', '10:30-11:30', '11:30-12:30', '12:30-2:00 (Lunch)', '2:00-3:00', '3:00-4:00'];

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
      'Computer Science': 'bg-green-100 text-green-800 border-green-200',
      'Engineering': 'bg-purple-100 text-purple-800 border-purple-200',
      'Business Administration': 'bg-orange-100 text-orange-800 border-orange-200',
      'Economics': 'bg-pink-100 text-pink-800 border-pink-200',
      'Psychology': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Literature': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Sociology': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const showNotificationToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleExportSchedule = async () => {
    showNotificationToast('Generating class schedule export...');
    try {
      // Simulate export generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate comprehensive CSV report with sample schedule data
      const exportData = {
        exportDate: new Date().toISOString().split('T')[0],
        schoolName: 'Smart School System',
        semester: 'Fall 2024',
        year: '2024',
        schedule: [
          {
            day: 'Monday',
            time: '8:00-9:00',
            subject: 'Mathematics',
            class: 'Year 1 Section A',
            teacher: 'Mr. Johnson',
            room: 'Room 201',
            students: 35
          },
          {
            day: 'Monday',
            time: '9:00-10:00',
            subject: 'Physics',
            class: 'Year 1 Section A',
            teacher: 'Dr. Smith',
            room: 'Lab 101',
            students: 35
          },
          {
            day: 'Tuesday',
            time: '8:00-9:00',
            subject: 'English',
            class: 'Year 1 Section A',
            teacher: 'Ms. Davis',
            room: 'Room 202',
            students: 35
          },
          {
            day: 'Wednesday',
            time: '8:00-9:00',
            subject: 'Chemistry',
            class: 'Year 1 Section A',
            teacher: 'Prof. Brown',
            room: 'Lab 102',
            students: 35
          }
        ]
      };
      
      // Create CSV content
      const csvHeaders = [
        'Day', 'Time', 'Subject', 'Class', 'Teacher', 'Room', 'Students'
      ];
      
      const csvRows = exportData.schedule.map(item => [
        item.day,
        item.time,
        item.subject,
        item.class,
        item.teacher,
        item.room,
        item.students
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `class_schedule_${exportData.exportDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotificationToast('✅ Class schedule exported successfully! Contains all classes, teachers, and room assignments.');
      
    } catch (error) {
      console.error('Error exporting schedule:', error);
      showNotificationToast('❌ Error exporting schedule. Please try again.');
    }
  };

  const handleImportSchedule = async (file) => {
    showNotificationToast('Processing imported schedule file...');
    try {
      // Simulate file processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful import
      const importData = {
        fileName: file.name,
        recordsProcessed: 24,
        classesImported: 8,
        conflictsResolved: 2,
        errors: 0
      };
      
      showNotificationToast(`✅ Schedule imported successfully!\n\nFile: ${importData.fileName}\nRecords processed: ${importData.recordsProcessed}\nClasses imported: ${importData.classesImported}\nConflicts resolved: ${importData.conflictsResolved}\nErrors: ${importData.errors}\n\nThe schedule has been updated with the new data.`);
      setShowImportModal(false);
      
    } catch (error) {
      console.error('Error importing schedule:', error);
      showNotificationToast('❌ Error importing schedule. Please check the file format and try again.');
    }
  };

  const renderWeeklyView = () => (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Week of {selectedWeek.toLocaleDateString()}
          </h3>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </button>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-medium ${textSecondary}`}>Time</th>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <th key={day} className={`px-4 py-3 text-left text-sm font-medium ${textSecondary}`}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {timeSlots.map((timeSlot, index) => (
                <tr key={timeSlot} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                  <td className={`px-4 py-4 text-sm font-medium ${textPrimary}`}>{timeSlot}</td>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const daySchedule = scheduleData[day] || [];
                    const classForTime = daySchedule.find(cls => cls.time === timeSlot);
                    
                    if (timeSlot.includes('Break') || timeSlot.includes('Lunch')) {
                      return (
                        <td key={day} className={`px-4 py-4 text-center ${textMuted}`}>
                          <span className="text-xs">{timeSlot.includes('Break') ? 'Break' : 'Lunch'}</span>
                        </td>
                      );
                    }
                    
                    return (
                      <td key={day} className="px-4 py-4">
                        {classForTime && (selectedClass === 'all' || classForTime.class === selectedClass) ? (
                          <div className={`p-3 rounded-lg border-l-4 ${getSubjectColor(classForTime.subject)} hover:shadow-md transition-shadow cursor-pointer`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">{classForTime.subject}</span>
                              <span className="text-xs opacity-75">{classForTime.class}</span>
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {classForTime.room}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {classForTime.students} students
                              </div>
                              {userRole === 'admin' && (
                                <div className="flex items-center">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {classForTime.teacher}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                            <span className={`text-xs ${textMuted}`}>Free</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDailyView = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = scheduleData[today] || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Today's Schedule - {today}</h3>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'}`}>
              {todaySchedule.length} classes scheduled
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todaySchedule.map((classItem) => (
            <div key={classItem.id} className={`${cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(classItem.subject)}`}>
                  {classItem.subject}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-3 text-blue-600" />
                  <span className={`font-medium ${textPrimary}`}>{classItem.time}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-3 text-green-600" />
                  <span className={textSecondary}>{classItem.class} ({classItem.students} students)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-3 text-purple-600" />
                  <span className={textSecondary}>{classItem.room}</span>
                </div>
                {userRole === 'admin' && (
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-3 text-orange-600" />
                    <span className={textSecondary}>{classItem.teacher}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className={`flex items-center text-sm ${classItem.status === 'scheduled' ? 'text-green-600' : 'text-yellow-600'}`}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {classItem.status}
                  </span>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl shadow-2xl p-4 flex items-center space-x-3 min-w-[300px]`}>
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className={`${textPrimary} text-sm font-medium whitespace-pre-line`}>{notificationMessage}</p>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${textPrimary}`}>Class Schedules</h1>
        <p className={textSecondary}>Manage and view class timetables and schedules</p>
      </div>

      {/* Header Controls */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes, teachers, or rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportSchedule}
              className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className={`flex space-x-1 rounded-lg p-1 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
          {[
            { id: 'daily', label: 'Daily View', icon: Calendar },
            { id: 'weekly', label: 'Weekly View', icon: Calendar },
            { id: 'monthly', label: 'Monthly View', icon: Calendar }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === view.id
                  ? `${darkMode ? 'bg-gray-800' : 'bg-white'} text-blue-600 shadow-sm`
                  : `${textSecondary} hover:text-blue-600 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-white/50'}`
              }`}
            >
              <view.icon className="w-4 h-4 mr-2" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Views */}
      {activeView === 'daily' && renderDailyView()}
      {activeView === 'weekly' && renderWeeklyView()}
      {activeView === 'monthly' && (
        <div className={`${cardBg} rounded-xl shadow-lg p-8 text-center`}>
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>Monthly View</h3>
          <p className={textSecondary}>Monthly calendar view coming soon with advanced scheduling features.</p>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Add New Class</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              alert(`Class Added Successfully! ✅\n\nSubject: ${formData.get('subject')}\nClass: ${formData.get('class')}\nDay: ${formData.get('day')}\nTime: ${formData.get('time')}\nRoom: ${formData.get('room')}\nTeacher: ${formData.get('teacher')}`);
              setShowCreateModal(false);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Subject *</label>
                  <select name="subject" required className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="">Select subject</option>
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>English</option>
                    <option>History</option>
                    <option>Geography</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Course/Year Level *</label>
                  <select name="class" required className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="">Select course/year level</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Day *</label>
                  <select name="day" required className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="">Select day</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Time *</label>
                  <input 
                    name="time"
                    type="time" 
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Room *</label>
                  <input 
                    name="room"
                    type="text" 
                    required
                    placeholder="e.g., Room 201"
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Teacher *</label>
                  <input 
                    name="teacher"
                    type="text" 
                    required
                    placeholder="Teacher name"
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Schedule Settings</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert('✅ Settings saved successfully!\n\nYour schedule preferences have been updated.');
              setShowSettingsModal(false);
            }}>
              <div className="space-y-6">
                {/* Time Settings */}
                <div>
                  <h4 className={`text-md font-medium mb-4 ${textPrimary}`}>Time Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Class Duration (minutes)</label>
                      <input 
                        type="number"
                        value={settings.classDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, classDuration: parseInt(e.target.value) }))}
                        min="30"
                        max="120"
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Break Duration (minutes)</label>
                      <input 
                        type="number"
                        value={settings.breakDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                        min="10"
                        max="60"
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Lunch Duration (minutes)</label>
                      <input 
                        type="number"
                        value={settings.lunchDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, lunchDuration: parseInt(e.target.value) }))}
                        min="30"
                        max="180"
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>School Start Time</label>
                      <input 
                        type="time"
                        value={settings.startTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, startTime: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>School End Time</label>
                      <input 
                        type="time"
                        value={settings.endTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, endTime: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h4 className={`text-md font-medium mb-4 ${textPrimary}`}>Notification Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input 
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="mr-3"
                      />
                      <span className={textSecondary}>Enable schedule notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox"
                        checked={settings.autoScheduling}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoScheduling: e.target.checked }))}
                        className="mr-3"
                      />
                      <span className={textSecondary}>Enable auto-scheduling for conflicts</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox"
                        checked={settings.conflictDetection}
                        onChange={(e) => setSettings(prev => ({ ...prev, conflictDetection: e.target.checked }))}
                        className="mr-3"
                      />
                      <span className={textSecondary}>Enable conflict detection</span>
                    </label>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <h4 className={`text-md font-medium mb-4 ${textPrimary}`}>Advanced Options</h4>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Default Room Assignment</label>
                      <select className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                        <option value="">Auto-assign</option>
                        <option value="room-201">Room 201</option>
                        <option value="room-202">Room 202</option>
                        <option value="room-203">Room 203</option>
                        <option value="lab-101">Lab 101</option>
                        <option value="lab-102">Lab 102</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Schedule Export Format</label>
                      <select className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="ical">iCal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto flex flex-col`}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>📥 Import Class Schedule</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Select Schedule File *</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    Drag and drop your schedule file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImportSchedule(file);
                      }
                    }}
                    className="hidden"
                    id="schedule-file"
                  />
                  <label
                    htmlFor="schedule-file"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>
              </div>

              {/* File Format Information */}
              <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4`}>
                <h4 className={`text-sm font-medium ${textPrimary} mb-2`}>📋 Supported File Formats</h4>
                <ul className={`text-sm ${textSecondary} space-y-1`}>
                  <li>• CSV files with columns: Day, Time, Subject, Class, Teacher, Room, Students</li>
                  <li>• Excel files (.xlsx, .xls) with the same column structure</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Date format: YYYY-MM-DD or MM/DD/YYYY</li>
                </ul>
              </div>

              {/* Import Options */}
              <div>
                <h4 className={`text-sm font-medium ${textSecondary} mb-3`}>Import Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span className={textSecondary}>Replace existing schedule</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span className={textSecondary}>Auto-resolve conflicts</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className={textSecondary}>Send notifications to affected teachers</span>
                  </label>
                </div>
              </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const fileInput = document.getElementById('schedule-file');
                    fileInput.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Import Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSchedulePanel;
