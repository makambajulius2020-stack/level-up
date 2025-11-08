import React, { useState } from 'react';
import { 
  Users, Plus, Edit3, Trash2, Search, Filter, BookOpen, 
  GraduationCap, MapPin, Clock, Calendar, Settings, Eye,
  UserPlus, UserMinus, BarChart3, TrendingUp, Award
} from 'lucide-react';

const ClassManagementPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClass, setNewClass] = useState({
    className: '',
    subject: '',
    level: '',
    scheduled_time: '',
    duration: 60,
    capacity: 40,
    description: '',
    teacher: '',
    room: '',
    section: ''
  });

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Classes data (start empty; populate from backend when available)
  const classes = [];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Total Classes</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>{classes.length}</p>
              <p className="text-blue-600 text-sm">Active classes</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Total Students</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>{classes.reduce((sum, cls) => sum + cls.students, 0)}</p>
              <p className="text-green-600 text-sm">Enrolled students</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Avg Performance</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>
                {(classes.reduce((sum, cls) => sum + cls.performance, 0) / classes.length).toFixed(1)}%
              </p>
              <p className="text-purple-600 text-sm">Academic average</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textSecondary}`}>Avg Attendance</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>
                {(classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length).toFixed(1)}%
              </p>
              <p className="text-orange-600 text-sm">Daily average</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div key={classItem.id} className={`${cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-lg p-3">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>{classItem.name}</h3>
                  <p className={`${textSecondary}`}>{classItem.code} • {classItem.level}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClass(classItem)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={textSecondary}>Students</span>
                <span className={`font-medium ${textPrimary}`}>{classItem.students}/{classItem.capacity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondary}>Class Teacher</span>
                <span className={`font-medium ${textPrimary}`}>{classItem.classTeacher}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondary}>Room</span>
                <span className={`font-medium ${textPrimary}`}>{classItem.room}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={textSecondary}>Performance</span>
                <span className="font-medium text-green-600">{classItem.performance}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                  Manage
                </button>
                <button className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm">
                  Students
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Online Class Management</h1>
        <p className={textSecondary}>Manage virtual classes, e-learning sessions, and student engagement</p>
      </div>

      {/* Header Controls */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
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
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </button>
        </div>

        {/* View Toggle */}
        <div className={`flex space-x-1 rounded-lg p-1 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'list', label: 'List View', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
      {activeView === 'overview' && renderOverview()}
      
      {activeView === 'list' && (
        <div className={`${cardBg} rounded-xl shadow-lg p-8 text-center`}>
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>List View</h3>
          <p className={textSecondary}>Detailed list view with advanced sorting and filtering coming soon.</p>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className={`${cardBg} rounded-xl shadow-lg p-8 text-center`}>
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>Analytics</h3>
          <p className={textSecondary}>Advanced class analytics and performance metrics coming soon.</p>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>Create New Class</h4>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewClass({
                    className: '',
                    subject: '',
                    level: '',
                    scheduled_time: '',
                    duration: 60,
                    capacity: 40,
                    description: '',
                    teacher: '',
                    room: '',
                    section: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Class Title *
                  </label>
                  <input
                    type="text"
                    value={newClass.className}
                    onChange={(e) => setNewClass(prev => ({ ...prev, className: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="e.g., Year 1 Section A"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Course *
                  </label>
                  <select
                    value={newClass.subject}
                    onChange={(e) => setNewClass(prev => ({ ...prev, subject: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  >
                    <option value="">Select course...</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Economics">Economics</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resource Management">Human Resource Management</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Year Level *
                  </label>
                  <select
                    value={newClass.level}
                    onChange={(e) => setNewClass(prev => ({ ...prev, level: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  >
                    <option value="">Select year level...</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newClass.scheduled_time}
                    onChange={(e) => setNewClass(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newClass.duration}
                    onChange={(e) => setNewClass(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    min="15"
                    max="180"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Capacity (Max Students) *
                  </label>
                  <input
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass(prev => ({ ...prev, capacity: parseInt(e.target.value) || 40 }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    min="1"
                    max="100"
                    placeholder="40"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Class Teacher
                  </label>
                  <input
                    type="text"
                    value={newClass.teacher}
                    onChange={(e) => setNewClass(prev => ({ ...prev, teacher: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Teacher name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={newClass.room}
                    onChange={(e) => setNewClass(prev => ({ ...prev, room: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="e.g., Room 101"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                  Description
                </label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  rows="3"
                  placeholder="Class description and details..."
                ></textarea>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                  Section
                </label>
                <select
                  value={newClass.section}
                  onChange={(e) => setNewClass(prev => ({ ...prev, section: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">Select section...</option>
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewClass({
                    className: '',
                    subject: '',
                    level: '',
                    scheduled_time: '',
                    duration: 60,
                    capacity: 40,
                    description: '',
                    teacher: '',
                    room: '',
                    section: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (!newClass.className || !newClass.subject || !newClass.level || !newClass.capacity) {
                    alert('Please fill in all required fields (*)');
                    return;
                  }
                  alert(`Class Created Successfully! ✅\n\nClass Title: ${newClass.className}\nCourse: ${newClass.subject}\nYear Level: ${newClass.level}\nCapacity: ${newClass.capacity}\nClass Teacher: ${newClass.teacher || 'Not assigned'}\nRoom: ${newClass.room || 'Not assigned'}`);
                  setShowCreateModal(false);
                  setNewClass({
                    className: '',
                    subject: '',
                    level: '',
                    scheduled_time: '',
                    duration: 60,
                    capacity: 40,
                    description: '',
                    teacher: '',
                    room: '',
                    section: ''
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagementPanel;
