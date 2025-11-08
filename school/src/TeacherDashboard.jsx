import React, { useState } from 'react';
import DashboardCard from './DashboardCard';
import AIInsightsPanel from './AIInsightsPanel';
import RequiredActions from './components/RequiredActions';
import TopPerformingStudents from './components/TopPerformingStudents';
import AITutorForm from './components/AITutorForm';
import { 
  BookOpen, Users, FileText, Clock, Award, TrendingUp, CheckCircle, 
  AlertTriangle, Calendar, MessageSquare, Download, Upload, Eye,
  Shield, BarChart3, Target, Star, Bell, Search, Filter, Plus,
  GraduationCap, Brain, Zap, ChevronRight, Settings, PieChart
} from 'lucide-react';

const TeacherDashboard = ({ aiInsights, setActiveTab, darkMode }) => {
  const [showAITutorForm, setShowAITutorForm] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  // Dashboard data (empty defaults; populate from backend when available)
  const teacherData = {
    classes: [],
    pendingTasks: {
      grading: 0,
      lessonPlans: 0,
      attendanceReports: 0,
      parentMeetings: 0
    },
    recentActivity: [],
    upcomingDeadlines: []
  };

  return (
    <div className="space-y-6">
      <RequiredActions userRole="teacher" setActiveTab={setActiveTab} darkMode={darkMode} />
      
      {/* Conduct Online Class Button */}
      <div className="flex justify-center">
        <button 
          onClick={() => setActiveTab && setActiveTab('online-class')}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Conduct Online Class</span>
        </button>
      </div>
      
      {/* Clean Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="My Classes" 
          value={teacherData.classes.length} 
          icon={BookOpen} 
          color="blue"
          subtitle="Active classes"
        />
        <DashboardCard 
          title="Total Students" 
          value={teacherData.classes.reduce((sum, cls) => sum + cls.students, 0)} 
          icon={Users} 
          color="green"
          subtitle="Across all classes"
        />
        <DashboardCard 
          title="Pending Grades" 
          value={teacherData.pendingTasks.grading} 
          icon={FileText} 
          color="orange"
          subtitle="Assignments to grade"
        />
        <DashboardCard 
          title="Deadlines" 
          value={teacherData.upcomingDeadlines.length} 
          icon={Clock} 
          color="purple"
          subtitle="This week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Today's Schedule
              </h3>
              <button 
                onClick={() => setActiveTab && setActiveTab('class-schedules')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Full Timetable
              </button>
            </div>
            <div className="space-y-4">
              {teacherData.classes.map((cls, index) => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-blue-100 text-blue-600' :
                      index === 1 ? 'bg-green-100 text-green-600' :
                      index === 2 ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-600">{cls.room} • {cls.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      index === 0 ? 'text-blue-600' :
                      index === 1 ? 'text-green-600' :
                      index === 2 ? 'text-purple-600' :
                      'text-orange-600'
                    }`}>
                      {cls.time}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{cls.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab && setActiveTab('grading')}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all group"
              >
                <Upload className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-blue-800">Upload Marks</p>
              </button>
              <button 
                onClick={() => setActiveTab && setActiveTab('attendance')}
                className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all group"
              >
                <Clock className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-green-800">View Attendance</p>
              </button>
              <button 
                onClick={() => setActiveTab && setActiveTab('lesson-planning')}
                className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all group"
              >
                <FileText className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-purple-800">Create Lesson</p>
              </button>
              <button 
                onClick={() => setActiveTab && setActiveTab('teacher-feedback')}
                className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg hover:shadow-md transition-all group"
              >
                <MessageSquare className="w-6 h-6 text-pink-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-pink-800">Feedback</p>
              </button>
            </div>
          </div>

          {/* Feedback & Certificates - Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Feedback Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Student Feedback</h3>
                    <p className="text-gray-600 text-sm">Reviews & Q&A</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4 text-sm">
                View student reviews, ratings, and answer questions from your students. Engage with feedback and improve your teaching.
              </p>
              <button 
                onClick={() => setActiveTab && setActiveTab('teacher-feedback')}
                className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>View Feedback & Q&A</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Certificates Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Certificates</h3>
                    <p className="text-gray-600 text-sm">Auto-generate completion certificates</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4 text-sm">
                Automatically generate professional course completion certificates for students. Replace traditional reports with digital certificates.
              </p>
              <button 
                onClick={() => setActiveTab && setActiveTab('reports')}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>Manage Certificates</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>


          {/* AI Tutor Button */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">AI Teaching Assistant</h3>
                    <p className="text-purple-100 text-sm">Enhanced with video & audio features for higher education</p>
                    <p className="text-purple-200 text-xs mt-1">Interactive video lessons, audio explanations, and intelligent tutoring</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAITutorForm(true)}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Try AI Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <AIInsightsPanel aiInsights={aiInsights} />
          
          {/* Top Performing Students */}
          <TopPerformingStudents userRole="teacher" darkMode={darkMode} />
          
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              {teacherData.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{deadline.task}</p>
                    <p className="text-xs text-gray-600">{deadline.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    deadline.priority === 'high' ? 'bg-red-100 text-red-800' :
                    deadline.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {deadline.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {teacherData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Tutor Form */}
      <AITutorForm 
        userRole="teacher" 
        isOpen={showAITutorForm} 
        onClose={() => setShowAITutorForm(false)} 
      />
    </div>
  );
};

export default TeacherDashboard;
