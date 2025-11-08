import React, { useState } from 'react';
import { 
  Calendar, Clock, BookOpen, MapPin, User, 
  ChevronLeft, ChevronRight, Download, Printer,
  AlertCircle, CheckCircle, Coffee, FileText, 
  Upload, Eye, Plus, Edit, Target, Star, 
  TrendingUp, Bell, CheckSquare, Square
} from 'lucide-react';

const ClassTimetablePanel = ({ userRole, currentUser, darkMode = false, setActiveTab }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Assignments start empty; populated from backend when available
  const assignments = [
    
  ];

  // Empty timetable; waits for backend-provided data
  const classTimetable = {
    class: '',
    semester: '',
    weeks: []
  };

  const getSubjectColor = (type) => {
    switch (type) {
      case 'core': return darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'elective': return darkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 'activity': return darkMode ? 'bg-purple-900 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'break': return darkMode ? 'bg-orange-900 text-orange-200 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200';
      case 'study': return darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300';
      case 'assembly': return darkMode ? 'bg-indigo-900 text-indigo-200 border-indigo-700' : 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'guidance': return darkMode ? 'bg-teal-900 text-teal-200 border-teal-700' : 'bg-teal-100 text-teal-800 border-teal-200';
      default: return darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'completed': return darkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return darkMode ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return darkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
      default: return darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'high': return <Star className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Square className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckSquare className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Square className="w-4 h-4 text-gray-600" />;
    }
  };

  const hasWeeks = Array.isArray(classTimetable.weeks) && classTimetable.weeks.length > 0;
  const currentWeek = hasWeeks ? classTimetable.weeks[selectedWeek] : null;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Class Timetable</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {(classTimetable.class || '').trim()} {classTimetable.semester ? `• ${classTimetable.semester}` : ''}
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className={`rounded-xl shadow-lg mb-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                disabled={!hasWeeks || selectedWeek === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {hasWeeks ? `Week ${currentWeek.weekNumber}` : 'No timetable'}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hasWeeks ? `${new Date(currentWeek.startDate).toLocaleDateString()} - ${new Date(currentWeek.endDate).toLocaleDateString()}` : ''}
                </p>
              </div>
              <button 
                onClick={() => setSelectedWeek(Math.min(classTimetable.weeks.length - 1, selectedWeek + 1))}
                disabled={!hasWeeks || selectedWeek === classTimetable.weeks.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded border ${getSubjectColor('core')}`}>Core</span>
              <span className={`px-2 py-1 rounded border ${getSubjectColor('elective')}`}>Elective</span>
              <span className={`px-2 py-1 rounded border ${getSubjectColor('activity')}`}>Activity</span>
              <span className={`px-2 py-1 rounded border ${getSubjectColor('break')}`}>Break</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map((day) => (
          <div key={day} className={`rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="p-4 border-b border-gray-200">
              <h3 className={`text-lg font-semibold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {day}
              </h3>
              <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {(currentWeek?.schedule?.[day] || []).length} periods
              </p>
            </div>
            
            <div className="p-4 space-y-2">
              {(currentWeek?.schedule?.[day] || []).map((period, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedDay({ day, period, index })}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getSubjectColor(period.type)}`}
                >
                  <div className="text-xs font-medium mb-1">{period.time}</div>
                  <div className="text-sm font-semibold mb-1">{period.subject}</div>
                  {period.teacher && (
                    <div className="text-xs opacity-80 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {period.teacher}
                    </div>
                  )}
                  {period.room && (
                    <div className="text-xs opacity-80 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {period.room}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Quick Actions */}
      <div className={`mt-8 rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assignment Quick Actions</h3>
          </div>
          <div className="flex space-x-2">
            {userRole !== 'student' && (
              <button 
                onClick={() => setShowAssignmentModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Assignment</span>
              </button>
            )}
            <button 
              onClick={() => setActiveTab && setActiveTab('assignments')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>View All</span>
            </button>
          </div>
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {assignments.filter(a => a.status === 'pending').length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pending</div>
          </div>
          <div className={`p-4 rounded-lg border text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-red-200'}`}>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {assignments.filter(a => a.status === 'overdue').length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overdue</div>
          </div>
          <div className={`p-4 rounded-lg border text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {assignments.filter(a => a.status === 'completed').length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed</div>
          </div>
          <div className={`p-4 rounded-lg border text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {assignments.reduce((sum, a) => sum + a.points, 0)}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Points</div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button 
            onClick={() => setActiveTab && setActiveTab('submit-assignment')}
            className={`p-4 rounded-lg border transition-colors flex items-center space-x-3 ${
              darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Upload className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Submit Assignment</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upload your work</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('assignments')}
            className={`p-4 rounded-lg border transition-colors flex items-center space-x-3 ${
              darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-green-50 border-green-200 hover:bg-green-100'
            }`}
          >
            <Eye className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>View Assignments</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>See all assignments</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('exam-schedule')}
            className={`p-4 rounded-lg border transition-colors flex items-center space-x-3 ${
              darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-purple-50 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Bell className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Due Dates</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Check deadlines</div>
            </div>
          </button>
        </div>

        {/* Recent Assignments */}
        <div>
          <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Assignments</h4>
          <div className="space-y-3">
            {assignments.slice(0, 3).map((assignment) => (
              <div 
                key={assignment.id}
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowAssignmentModal(true);
                }}
                className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                  darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(assignment.status)}
                    <div>
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {assignment.title}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {assignment.subject} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(assignment.priority)}
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getAssignmentStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.points} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Detail Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedAssignment ? 'Assignment Details' : 'New Assignment'}
              </h3>
              <button 
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedAssignment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {selectedAssignment ? (
              <div className="space-y-6">
                <div>
                  <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAssignment.title}
                  </h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getAssignmentStatusColor(selectedAssignment.status)}`}>
                      {selectedAssignment.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedAssignment.priority)}`}>
                      {getPriorityIcon(selectedAssignment.priority)} {selectedAssignment.priority} priority
                    </span>
                    <span className="text-sm text-gray-600">{selectedAssignment.points} points</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Course</h5>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedAssignment.subject}</p>
                  </div>
                  <div>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teacher</h5>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedAssignment.teacher}</p>
                  </div>
                  <div>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Due Date</h5>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Points</h5>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedAssignment.points}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Description</h5>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedAssignment.description}</p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setActiveTab && setActiveTab('submit-assignment');
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Submit Work</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setActiveTab && setActiveTab('exam-schedule');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Set Reminder</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Enter assignment title"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Course
                    </label>
                    <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option>Business Administration</option>
                      <option>Accounting</option>
                      <option>Computer Science</option>
                      <option>Economics</option>
                      <option>Marketing</option>
                      <option>Finance</option>
                      <option>Human Resource Management</option>
                      <option>Information Technology</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    rows="4"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Enter assignment description"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Create Assignment
                  </button>
                  <button 
                    onClick={() => setShowAssignmentModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTimetablePanel;
