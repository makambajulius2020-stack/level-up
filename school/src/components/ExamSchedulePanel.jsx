import React, { useState } from 'react';
import { 
  Calendar, Clock, BookOpen, AlertTriangle, CheckCircle, 
  Eye, Download, Bell, MapPin, Users, Star, Target,
  Brain, Zap, TrendingUp, Award, FileText
} from 'lucide-react';

const ExamSchedulePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('assignments');
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showPracticeTestModal, setShowPracticeTestModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showPracticeTestForm, setShowPracticeTestForm] = useState(false);
  const [showContactTeacherForm, setShowContactTeacherForm] = useState(false);
  const [showCheckUpdatesForm, setShowCheckUpdatesForm] = useState(false);
  const [showAssignmentDetailsModal, setShowAssignmentDetailsModal] = useState(false);
  const [showSubmitAssignmentModal, setShowSubmitAssignmentModal] = useState(false);
  const [studySchedule, setStudySchedule] = useState({});
  const [studyGoals, setStudyGoals] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const examSchedule = [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'today': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPreparationColor = (level) => {
    if (level >= 85) return 'text-green-600 bg-green-100';
    if (level >= 70) return 'text-blue-600 bg-blue-100';
    if (level >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'graded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleViewAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentDetailsModal(true);
  };

  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitAssignmentModal(true);
  };

  const submitAssignment = async (assignmentId) => {
    try {
      // Simulate API call
      alert(`✅ Assignment "${selectedAssignment?.title}" submitted successfully!`);
      setShowSubmitAssignmentModal(false);
      setSelectedAssignment(null);
      
      // Update assignment status in local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: 'submitted' }
          : assignment
      ));
    } catch (error) {
      alert('❌ Failed to submit assignment. Please try again.');
    }
  };

  const renderAssignments = () => (
    <div className="space-y-6">
      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardBg} rounded-xl shadow p-6 text-center`}>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {assignments.filter(a => a.status === 'pending').length}
          </div>
          <div className={`text-sm ${textSecondary}`}>Pending</div>
        </div>
        <div className={`${cardBg} rounded-xl shadow p-6 text-center`}>
          <div className="text-2xl font-bold text-red-600 mb-1">
            {assignments.filter(a => a.status === 'overdue').length}
          </div>
          <div className={`text-sm ${textSecondary}`}>Overdue</div>
        </div>
        <div className={`${cardBg} rounded-xl shadow p-6 text-center`}>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {assignments.filter(a => a.status === 'submitted').length}
          </div>
          <div className={`text-sm ${textSecondary}`}>Submitted</div>
        </div>
        <div className={`${cardBg} rounded-xl shadow p-6 text-center`}>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {assignments.filter(a => a.status === 'graded').length}
          </div>
          <div className={`text-sm ${textSecondary}`}>Graded</div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className={`${cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>{assignment.title}</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`${textSecondary}`}>{assignment.subject}</span>
                  <span className={`${textSecondary}`}>•</span>
                  <span className={`${textSecondary}`}>{assignment.teacher}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getAssignmentStatusColor(assignment.status)}`}>
                  {assignment.status}
                </span>
                <span className={`text-sm font-bold ${getPriorityColor(assignment.priority)}`}>
                  {assignment.priority}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className={textSecondary}>Due: {assignment.dueDate} at {assignment.dueTime}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="w-4 h-4 text-green-600" />
                <span className={textSecondary}>{assignment.description}</span>
              </div>
              {assignment.attachments.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <Download className="w-4 h-4 text-purple-600" />
                  <span className={textSecondary}>Attachments: {assignment.attachments.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewAssignmentDetails(assignment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </button>
                {assignment.status !== 'submitted' && assignment.status !== 'graded' && (
                  <button 
                    onClick={() => handleSubmitAssignment(assignment)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Submit Assignment
                  </button>
                )}
              </div>
              {assignment.grade && (
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    assignment.grade >= 80 ? 'text-green-600' :
                    assignment.grade >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {assignment.grade}%
                  </div>
                  <div className={`text-xs ${textSecondary}`}>Grade</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUpcomingExams = () => (
    <div className="space-y-6">
      {/* Countdown Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Examinations </h3>
            <p className="text-blue-100">Your final examinations are approaching</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">0</div>
            <div className="text-blue-100 text-sm">Days Remaining</div>
          </div>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examSchedule.filter(exam => exam.status === 'upcoming').length === 0 ? (
          <div className={`${cardBg} rounded-xl shadow p-8 text-center col-span-2`}>
            <p className={textSecondary}>No upcoming exams</p>
          </div>
        ) : (
          examSchedule.filter(exam => exam.status === 'upcoming').map((exam) => (
          <div key={exam.id} className={`${cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary}`}>{exam.subject}</h3>
                <p className={`text-sm ${textSecondary}`}>{exam.paper}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(exam.status)}`}>
                  {exam.daysRemaining} days
                </span>
                <span className={`text-sm font-bold ${getDifficultyColor(exam.difficulty)}`}>
                  {exam.difficulty}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className={textSecondary}>{exam.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-green-600" />
                <span className={textSecondary}>{exam.time} ({exam.duration})</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className={textSecondary}>{exam.venue}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-orange-600" />
                <span className={textSecondary}>{exam.supervisor}</span>
              </div>
            </div>

            {/* Preparation Level */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className={`font-medium ${textPrimary}`}>Preparation Level</span>
                <span className={`font-bold ${getPreparationColor(exam.preparationLevel).split(' ')[0]}`}>
                  {exam.preparationLevel}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getPreparationColor(exam.preparationLevel).split(' ')[1]}`}
                  style={{ width: `${exam.preparationLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Syllabus Topics */}
            <div className="mb-4">
              <div className={`text-sm font-medium ${textPrimary} mb-2`}>Syllabus Coverage:</div>
              <div className="flex flex-wrap gap-1">
                {exam.syllabus.map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Instructions</span>
              </div>
              <p className="text-sm text-yellow-800">{exam.instructions}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={() => setSelectedExam(exam)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Details</span>
              </button>
              <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCompletedExams = () => (
    <div className="space-y-6">
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <h3 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Completed Examinations</h3>
        
        <div className="space-y-4">
          {examSchedule.filter(exam => exam.status === 'completed').map((exam) => (
            <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className={`font-medium ${textPrimary}`}>{exam.subject} - {exam.paper}</div>
                  <div className={`text-sm ${textSecondary}`}>{exam.date} • {exam.venue}</div>
                  {exam.feedback && (
                    <div className="text-sm text-green-600 mt-1">{exam.feedback}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{exam.score}%</div>
                <div className="text-sm text-green-600">Grade {exam.grade}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudyPlan = () => (
    <div className="space-y-6">
      {/* Study Progress Overview */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Study Progress Overview</h3>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Loading...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-blue-800">Overall Readiness</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-green-800">Hours Studied</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-purple-800">Practice Tests</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">--</div>
            <div className="text-sm text-orange-800">Days Remaining</div>
          </div>
        </div>
      </div>

      {/* AI Study Recommendations */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <h3 className={`text-lg font-semibold mb-6 ${textPrimary}`}>AI Study Recommendations</h3>
        
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className={`text-lg font-medium mb-2 ${textPrimary}`}>No Study Data Available</h4>
          <p className={`${textSecondary} mb-6`}>Start by taking practice tests or completing assignments to get personalized study recommendations.</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setShowPracticeTestModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Practice Test
            </button>
            <button 
              onClick={() => setShowAssignmentsModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Assignments
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Study Calendar */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <h3 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Weekly Study Calendar</h3>
        
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className={`text-lg font-medium mb-2 ${textPrimary}`}>No Study Schedule</h4>
          <p className={`${textSecondary} mb-6`}>Create a personalized study schedule to track your daily study activities.</p>
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Study Schedule
          </button>
        </div>
      </div>

      {/* Study Goals & Milestones */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <h3 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Study Goals & Milestones</h3>
        
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className={`text-lg font-medium mb-2 ${textPrimary}`}>No Goals Set</h4>
          <p className={`${textSecondary} mb-6`}>Set study goals and track your progress to stay motivated and organized.</p>
          <button 
            onClick={() => setShowGoalsModal(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Set Study Goals
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${textPrimary}`}>Exam Schedule</h1>
        <p className={textSecondary}>Track your upcoming examinations and preparation progress</p>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg mb-6`}>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'upcoming', label: 'Upcoming Exams', icon: Calendar },
              { id: 'completed', label: 'Results', icon: Award },
              { id: 'study-plan', label: 'Study Plan', icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === tab.id
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

      {activeView === 'assignments' && renderAssignments()}
      {activeView === 'upcoming' && renderUpcomingExams()}
      {activeView === 'completed' && renderCompletedExams()}
      {activeView === 'study-plan' && renderStudyPlan()}

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Exam Details</h3>
              <button 
                onClick={() => setSelectedExam(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium ${textPrimary}`}>{selectedExam.subject}</h4>
                <p className={textSecondary}>{selectedExam.paper}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={textMuted}>Date:</span>
                  <div className={`font-medium ${textPrimary}`}>{selectedExam.date}</div>
                </div>
                <div>
                  <span className={textMuted}>Time:</span>
                  <div className={`font-medium ${textPrimary}`}>{selectedExam.time}</div>
                </div>
                <div>
                  <span className={textMuted}>Venue:</span>
                  <div className={`font-medium ${textPrimary}`}>{selectedExam.venue}</div>
                </div>
                <div>
                  <span className={textMuted}>Total Marks:</span>
                  <div className={`font-medium ${textPrimary}`}>{selectedExam.totalMarks}</div>
                </div>
              </div>

              <div>
                <span className={`text-sm ${textMuted}`}>Syllabus Topics:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedExam.syllabus.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Set Reminder
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Study Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Test Modal */}
      {showPracticeTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Take Practice Test</h3>
              <button 
                onClick={() => setShowPracticeTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className={`text-lg font-medium mb-2 ${textPrimary}`}>No Practice Tests Available</h4>
              <p className={`${textSecondary} mb-6`}>Practice tests will be available once your teachers create them. Check back later or contact your teachers for available tests.</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    setShowPracticeTestModal(false);
                    setShowPracticeTestForm(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Practice Test
                </button>
                <button 
                  onClick={() => {
                    setShowPracticeTestModal(false);
                    setShowContactTeacherForm(true);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Contact Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Assignments Modal */}
      {showAssignmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>View Assignments</h3>
              <button 
                onClick={() => setShowAssignmentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className={`text-lg font-medium mb-2 ${textPrimary}`}>No Assignments Available</h4>
              <p className={`${textSecondary} mb-6`}>You don't have any assignments at the moment. New assignments will appear here when your teachers create them.</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    setShowAssignmentsModal(false);
                    setShowCheckUpdatesForm(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check for Updates
                </button>
                <button 
                  onClick={() => {
                    setShowAssignmentsModal(false);
                    setShowContactTeacherForm(true);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Contact Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Study Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Create Study Schedule</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              alert('✅ Study Schedule Created!\n\nYour personalized study schedule has been generated and will help you stay organized.');
              setShowScheduleModal(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Study Duration (hours per day)</label>
                    <select name="duration" className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="5">5+ hours</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Preferred Study Time</label>
                    <select name="time" className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option value="morning">Morning (6-9 AM)</option>
                      <option value="afternoon">Afternoon (2-5 PM)</option>
                      <option value="evening">Evening (7-10 PM)</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Courses to Focus On</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Business Administration', 'Accounting', 'Computer Science', 'Economics', 'Marketing', 'Finance'].map(subject => (
                      <label key={subject} className="flex items-center">
                        <input type="checkbox" name="subjects" value={subject} className="mr-2" />
                        <span className={textSecondary}>{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Study Goals</label>
                  <textarea 
                    name="goals"
                    rows="3"
                    placeholder="What do you want to achieve with this study schedule?"
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-blue-900">AI-Powered Schedule</h4>
                      <p className="text-sm text-blue-700">Your schedule will be optimized based on your preferences and learning patterns.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Study Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Set Study Goals</h3>
              <button 
                onClick={() => setShowGoalsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              alert('✅ Study Goals Set!\n\nYour goals have been saved and will help track your progress.');
              setShowGoalsModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Goal Title</label>
                  <input 
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Master Quadratic Equations"
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Subject</label>
                  <select name="subject" className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="">Select Course</option>
                    <option value="business-administration">Business Administration</option>
                    <option value="accounting">Accounting</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="economics">Economics</option>
                    <option value="marketing">Marketing</option>
                    <option value="finance">Finance</option>
                    <option value="human-resource-management">Human Resource Management</option>
                    <option value="information-technology">Information Technology</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Target Date</label>
                    <input 
                      type="date"
                      name="targetDate"
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Priority Level</label>
                    <select name="priority" className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Goal Description</label>
                  <textarea 
                    name="description"
                    rows="3"
                    placeholder="Describe what you want to achieve..."
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Action Steps</label>
                  <textarea 
                    name="actionSteps"
                    rows="3"
                    placeholder="List the specific steps you'll take to achieve this goal..."
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-green-900">Goal Tracking</h4>
                      <p className="text-sm text-green-700">Your progress will be tracked automatically based on completed assignments and test scores.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowGoalsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Set Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Practice Test Request Form */}
      {showPracticeTestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full max-h-[90vh] ${cardBg} rounded-lg shadow-xl flex flex-col`}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                📝 Request Practice Test
              </h3>
              <button
                onClick={() => setShowPracticeTestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="practice-test-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Simulate form submission
                alert(`✅ Practice Test Request Sent!\n\nSubject: ${data.subject}\nTest Type: ${data.testType}\nDifficulty: ${data.difficulty}\n\nYour request has been sent to your teachers. You'll be notified when practice tests are available.`);
                setShowPracticeTestForm(false);
              }} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Subject *
                  </label>
                  <select name="subject" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="english">English</option>
                    <option value="science">Science</option>
                    <option value="history">History</option>
                    <option value="geography">Geography</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Test Type *
                  </label>
                  <select name="testType" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="">Select Test Type</option>
                    <option value="quiz">Quick Quiz (10-15 questions)</option>
                    <option value="practice">Practice Test (20-30 questions)</option>
                    <option value="mock">Mock Exam (Full length)</option>
                    <option value="topic">Topic-specific Test</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Difficulty Level
                  </label>
                  <select name="difficulty" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="mixed">Mixed Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="exam-level">Exam Level</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Specific Topics (Optional)
                  </label>
                  <textarea
                    name="topics"
                    rows="3"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="List specific topics you want to focus on..."
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Any additional requirements or notes..."
                  />
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPracticeTestForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="practice-test-form"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Teacher Form */}
      {showContactTeacherForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full max-h-[90vh] ${cardBg} rounded-lg shadow-xl flex flex-col`}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                📧 Contact Teacher
              </h3>
              <button
                onClick={() => setShowContactTeacherForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="contact-teacher-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Simulate form submission
                alert(`✅ Message Sent!\n\nTeacher: ${data.teacher}\nMethod: ${data.contactMethod}\nSubject: ${data.subject}\n\nYour message has been sent successfully. You'll receive a response soon.`);
                setShowContactTeacherForm(false);
              }} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Select Teacher *
                  </label>
                  <select name="teacher" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="">Select Teacher</option>
                    <option value="all">All Teachers</option>
                    <option value="homeroom">Homeroom Teacher</option>
                    <option value="business-administration">Business Administration Lecturer</option>
                    <option value="accounting">Accounting Lecturer</option>
                    <option value="computer-science">Computer Science Lecturer</option>
                    <option value="economics">Economics Lecturer</option>
                    <option value="marketing">Marketing Lecturer</option>
                    <option value="finance">Finance Lecturer</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Contact Method *
                  </label>
                  <select name="contactMethod" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="">Select Method</option>
                    <option value="message">Send Message</option>
                    <option value="meeting">Schedule Meeting</option>
                    <option value="email">Email Teacher</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Brief subject line"
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Priority Level
                  </label>
                  <select name="priority" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="followUp"
                    id="follow-up"
                    className="mr-2"
                  />
                  <label htmlFor="follow-up" className={`text-sm ${textSecondary}`}>
                    Request follow-up response
                  </label>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactTeacherForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="contact-teacher-form"
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Check for Updates Form */}
      {showCheckUpdatesForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full max-h-[90vh] ${cardBg} rounded-lg shadow-xl flex flex-col`}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                🔄 Check for Updates
              </h3>
              <button
                onClick={() => setShowCheckUpdatesForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="check-updates-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Simulate form submission
                alert(`✅ Update Check Complete!\n\nUpdate Type: ${data.updateType}\nSubject Filter: ${data.subjectFilter || 'All'}\nDate Range: ${data.dateRange}\n\nYour preferences have been saved. You'll be notified of any new updates.`);
                setShowCheckUpdatesForm(false);
              }} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Update Type *
                  </label>
                  <select name="updateType" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="">Select Update Type</option>
                    <option value="assignments">New Assignments</option>
                    <option value="exams">Exam Schedule Updates</option>
                    <option value="grades">Grade Updates</option>
                    <option value="announcements">Announcements</option>
                    <option value="all">All Updates</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Course Filter
                  </label>
                  <select name="subjectFilter" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="">All Courses</option>
                    <option value="business-administration">Business Administration</option>
                    <option value="accounting">Accounting</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="economics">Economics</option>
                    <option value="marketing">Marketing</option>
                    <option value="finance">Finance</option>
                    <option value="human-resource-management">Human Resource Management</option>
                    <option value="information-technology">Information Technology</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Date Range
                  </label>
                  <select name="dateRange" className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="term">This semester</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Notification Preferences
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="emailNotifications" defaultChecked className="mr-2" />
                      <span className={`text-sm ${textSecondary}`}>Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="inAppNotifications" defaultChecked className="mr-2" />
                      <span className={`text-sm ${textSecondary}`}>In-app notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="smsNotifications" className="mr-2" />
                      <span className={`text-sm ${textSecondary}`}>SMS notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="autoRefresh" defaultChecked className="mr-2" />
                      <span className={`text-sm ${textSecondary}`}>Auto-refresh dashboard</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Any specific information you're looking for..."
                  />
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCheckUpdatesForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="check-updates-form"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Check for Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Details Modal */}
      {showAssignmentDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Assignment Details</h3>
                <button 
                  onClick={() => setShowAssignmentDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{selectedAssignment.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment.subject} • {selectedAssignment.teacher}</p>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                <p className="text-gray-700">{selectedAssignment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Due Date</h5>
                  <p className="text-gray-700">{selectedAssignment.dueDate} at {selectedAssignment.dueTime}</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Priority</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${getAssignmentStatusColor(selectedAssignment.priority)}`}>
                    {selectedAssignment.priority}
                  </span>
                </div>
              </div>

              {selectedAssignment.instructions && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Instructions</h5>
                  <p className="text-gray-700">{selectedAssignment.instructions}</p>
                </div>
              )}

              {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Attachments</h5>
                  <div className="space-y-1">
                    {selectedAssignment.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-blue-600">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssignment.grade && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-1">Grade</h5>
                  <div className={`text-2xl font-bold ${
                    selectedAssignment.grade >= 80 ? 'text-green-600' :
                    selectedAssignment.grade >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedAssignment.grade}%
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAssignmentDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedAssignment.status !== 'submitted' && selectedAssignment.status !== 'graded' && (
                <button 
                  onClick={() => {
                    setShowAssignmentDetailsModal(false);
                    handleSubmitAssignment(selectedAssignment);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Assignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Submit Assignment</h3>
                <button 
                  onClick={() => setShowSubmitAssignmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FileText className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">{selectedAssignment.title}</h4>
                <p className="text-sm text-blue-800">Due: {selectedAssignment.dueDate} at {selectedAssignment.dueTime}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submission Notes (Optional)</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any notes about your submission..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Choose Files
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-900">Important</h5>
                    <p className="text-sm text-yellow-800 mt-1">
                      Please ensure all files are properly uploaded before submitting. 
                      You cannot modify your submission after it's been submitted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowSubmitAssignmentModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => submitAssignment(selectedAssignment.id)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSchedulePanel;
