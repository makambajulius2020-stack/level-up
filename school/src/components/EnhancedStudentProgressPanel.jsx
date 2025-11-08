import React, { useState } from 'react';
import { 
  TrendingUp, BarChart3, Users, Award, Target, Brain, 
  CheckCircle, AlertTriangle, Eye, MessageSquare, Download,
  Calendar, Clock, Star, BookOpen, FileText, Search, Filter
} from 'lucide-react';

const EnhancedStudentProgressPanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const classes = [];

  const progressData = {
    classAverage: 0,
    improvement: 0,
    topPerformers: 0,
    needsAttention: 0,
    recentTests: []
  };

  const students = [];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-blue-900">{progressData.classAverage}%</div>
          <div className="text-sm text-blue-700">Class Average</div>
          <div className="mt-2 flex items-center justify-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">+{progressData.improvement}%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-yellow-900">{progressData.topPerformers}</div>
          <div className="text-sm text-yellow-700">Top Performers</div>
          <div className="text-xs text-gray-500 mt-1">Above 85%</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-red-900">{progressData.needsAttention}</div>
          <div className="text-sm text-red-700">Needs Attention</div>
          <div className="text-xs text-gray-500 mt-1">Below 70%</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-purple-900">{students.length}</div>
          <div className="text-sm text-purple-700">Total Students</div>
          <div className="text-xs text-gray-500 mt-1">Active learners</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Test Performance</h3>
          <div className="space-y-4">
            {progressData.recentTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{test.name}</div>
                  <div className="text-sm text-gray-600">{test.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{test.average}%</div>
                  <div className="text-xs text-gray-500">Class Average</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Progress Distribution</h3>
          {students.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Excellent (85-100%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">0 students</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Good (75-84%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">0 students</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Average (65-74%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">0 students</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Below Average (&lt;65%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">0 students</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No student data available.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderIndividualProgress = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Individual Student Progress</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search students..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Students</option>
              <option>Top Performers</option>
              <option>Needs Attention</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {students.map((student) => (
            <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">{student.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${
                    student.currentGrade >= 85 ? 'text-green-600' :
                    student.currentGrade >= 75 ? 'text-blue-600' :
                    student.currentGrade >= 65 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {student.currentGrade}%
                  </span>
                  <TrendingUp className={`w-4 h-4 ${
                    student.trend === 'up' ? 'text-green-600' :
                    student.trend === 'down' ? 'text-red-600 transform rotate-180' :
                    'text-blue-600 transform rotate-90'
                  }`} />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {student.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{subject.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{subject.grade}%</span>
                      <TrendingUp className={`w-3 h-3 ${
                        subject.trend === 'up' ? 'text-green-600' :
                        subject.trend === 'down' ? 'text-red-600 transform rotate-180' :
                        'text-blue-600 transform rotate-90'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedStudent(student)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Progress Analytics</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>Progress analytics chart would be displayed here</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Analytics</h3>
        <p className="text-sm text-gray-600">No analytics data available yet.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Progress Tracking</h1>
        <p className="text-gray-600">Monitor student performance and learning outcomes with AI insights</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Class Overview', icon: BarChart3 },
              { id: 'individual', label: 'Individual Progress', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: Brain }
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

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'individual' && renderIndividualProgress()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default EnhancedStudentProgressPanel;
