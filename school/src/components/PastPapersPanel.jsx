import React, { useState } from 'react';
import { 
  FileText, Download, Eye, Calendar, Clock, Award, 
  Search, Filter, Star, TrendingUp, BarChart3, Target,
  CheckCircle, AlertTriangle, Brain, Zap, User, BookOpen, 
  GraduationCap, Send, X
} from 'lucide-react';

const PastPapersPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('papers');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [predictionForm, setPredictionForm] = useState({
    studentName: currentUser?.name || '',
    currentClass: '',
    targetSubjects: [],
    examDate: '',
    studyHoursPerDay: '',
    weakAreas: [],
    strongAreas: [],
    previousScores: {},
    studyGoals: ''
  });

  const pastPapers = [];

  const analytics = {
    totalAttempted: 0,
    totalPapers: 0,
    averageScore: 0,
    bestSubject: '-',
    weakestSubject: '-',
    totalTimeSpent: '0m',
    improvementRate: 0
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score, average) => {
    if (!score) return 'text-gray-500';
    if (score >= average + 10) return 'text-green-600';
    if (score >= average) return 'text-blue-600';
    return 'text-red-600';
  };

  const handleFormChange = (field, value) => {
    setPredictionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    setPredictionForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const [showPredictionResults, setShowPredictionResults] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);
  const [showAnalysisReport, setShowAnalysisReport] = useState(false);

  const handleSubmitPrediction = () => {
    // Simulate AI prediction generation
    const results = {
      focusAreas: [
        { subject: 'Business Administration', topics: ['Management Principles', 'Strategic Planning'], priority: 'High' },
        { subject: 'Accounting', topics: ['Financial Accounting', 'Cost Accounting'], priority: 'High' },
        { subject: 'Computer Science', topics: ['Programming', 'Data Structures'], priority: 'Medium' },
        { subject: 'Economics', topics: ['Microeconomics', 'Macroeconomics'], priority: 'Medium' }
      ],
      studySchedule: '3 hours daily',
      predictedImprovement: '15-20% score increase',
      recommendations: [
        'Focus on weak areas identified in your profile',
        'Practice past papers for Business Administration and Accounting',
        'Review programming concepts thoroughly',
        'Create flashcards for economic terminology'
      ],
      examStrategy: [
        'Allocate 45 minutes per section',
        'Start with easier questions to build confidence',
        'Review answers before submitting',
        'Manage time effectively across all subjects'
      ]
    };
    
    setPredictionResults(results);
    setShowPredictionResults(true);
    setShowPredictionForm(false);
  };

  const filteredPapers = pastPapers.filter(paper => {
    const matchesYear = selectedYear === 'all' || paper.year.toString() === selectedYear;
    const matchesSubject = selectedSubject === 'all' || paper.subject === selectedSubject;
    return matchesYear && matchesSubject;
  });

  const renderPapersTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
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
          
          <div className="text-sm text-gray-600">
            Showing {filteredPapers.length} of {pastPapers.length} papers
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPapers.map((paper) => (
          <div key={paper.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{paper.title}</h3>
                <p className="text-sm text-gray-600">{paper.year} • Paper {paper.paper}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(paper.difficulty)}`}>
                {paper.difficulty}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{paper.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{paper.marks} marks</span>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{paper.downloadCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Avg: {paper.averageScore}%</span>
              </div>
            </div>

            {/* Topics */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</div>
              <div className="flex flex-wrap gap-2">
                {paper.topics.map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Score Display */}
            {paper.attempted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Completed</span>
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      {paper.completionDate} • {paper.timeSpent}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(paper.myScore, paper.averageScore)}`}>
                      {paper.myScore}%
                    </div>
                    <div className="text-xs text-gray-500">Your Score</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Not Attempted</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              {!paper.attempted && (
                <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.totalAttempted}</div>
          <div className="text-sm text-gray-600">Papers Completed</div>
          <div className="text-xs text-gray-500 mt-1">of {analytics.totalPapers} total</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{analytics.averageScore}%</div>
          <div className="text-sm text-gray-600">Average Score</div>
          <div className="text-xs text-green-600 mt-1">+{analytics.improvementRate}% improvement</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.bestSubject}</div>
          <div className="text-sm text-gray-600">Best Course</div>
          <div className="text-xs text-purple-600 mt-1">92% average</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{analytics.totalTimeSpent}</div>
          <div className="text-sm text-gray-600">Time Spent</div>
          <div className="text-xs text-orange-600 mt-1">This month</div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Course Performance</h3>
        <div className="space-y-4">
          {['Business Administration', 'Accounting', 'Computer Science', 'Economics'].map((subject) => {
            const subjectPapers = pastPapers.filter(p => p.subject === subject && p.attempted);
            const avgScore = subjectPapers.length > 0 
              ? Math.round(subjectPapers.reduce((sum, p) => sum + p.myScore, 0) / subjectPapers.length)
              : 0;
            
            return (
              <div key={subject} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{subject}</div>
                    <div className="text-sm text-gray-600">{subjectPapers.length} papers completed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{avgScore}%</div>
                  <div className="text-xs text-gray-500">Average</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Progress Over Time</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>Progress chart would be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8" />
          <h2 className="text-xl font-semibold">AI Recommendations</h2>
        </div>
        <p className="text-purple-100">Get personalized predictions based on your academic profile</p>
        
        <div className="mt-4">
          <button 
            onClick={() => setShowPredictionForm(true)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
          >
            <Brain className="w-5 h-5" />
            <span>Get Full Predictions</span>
          </button>
        </div>
      </div>

      {/* Prediction Form Modal */}
      {showPredictionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">AI Prediction Form</h3>
                <button 
                  onClick={() => setShowPredictionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Fill in your details to get personalized exam predictions</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    value={predictionForm.studentName}
                    onChange={(e) => handleFormChange('studentName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Year Level</label>
                  <select
                    value={predictionForm.currentClass}
                    onChange={(e) => handleFormChange('currentClass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Year Level</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              {/* Target Courses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Courses</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Business Administration', 'Accounting', 'Computer Science', 'Economics', 'Marketing', 'Finance', 'Human Resource Management', 'Information Technology'].map(subject => (
                    <label key={subject} className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={predictionForm.targetSubjects.includes(subject)}
                        onChange={() => handleArrayChange('targetSubjects', subject)}
                        className="rounded"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exam Date and Study Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={predictionForm.examDate}
                    onChange={(e) => handleFormChange('examDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Study Hours Per Day</label>
                  <select
                    value={predictionForm.studyHoursPerDay}
                    onChange={(e) => handleFormChange('studyHoursPerDay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Hours</option>
                    <option value="1-2">1-2 hours</option>
                    <option value="2-3">2-3 hours</option>
                    <option value="3-4">3-4 hours</option>
                    <option value="4-5">4-5 hours</option>
                    <option value="5+">5+ hours</option>
                  </select>
                </div>
              </div>

              {/* Weak and Strong Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weak Areas</label>
                  <div className="space-y-2">
                    {['Financial Accounting', 'Management Principles', 'Programming Fundamentals', 'Database Management', 'Marketing Strategies', 'Business Law', 'Economics Theory', 'Project Management'].map(area => (
                      <label key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={predictionForm.weakAreas.includes(area)}
                          onChange={() => handleArrayChange('weakAreas', area)}
                          className="rounded"
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strong Areas</label>
                  <div className="space-y-2">
                    {['Financial Accounting', 'Management Principles', 'Programming Fundamentals', 'Database Management', 'Marketing Strategies', 'Business Law', 'Economics Theory', 'Project Management'].map(area => (
                      <label key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={predictionForm.strongAreas.includes(area)}
                          onChange={() => handleArrayChange('strongAreas', area)}
                          className="rounded"
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Study Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Study Goals</label>
                <textarea
                  value={predictionForm.studyGoals}
                  onChange={(e) => handleFormChange('studyGoals', e.target.value)}
                  placeholder="Describe your study goals and what you want to achieve..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowPredictionForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitPrediction}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Generate Predictions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Priority Papers</h3>
          </div>
          <div className="text-sm text-gray-500">No priority papers yet.</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Study Strategy</h3>
          </div>
          <div className="text-sm text-gray-500">No study strategy tips yet.</div>
        </div>
      </div>

      {/* Analysis Report Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Analysis Report</h3>
          </div>
          <button 
            onClick={() => setShowAnalysisReport(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Analysis Report</span>
          </button>
        </div>
        <div className="text-sm text-gray-500">No analysis available yet.</div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Past Papers</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Practice with UNEB past examination papers</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'papers', label: 'Past Papers', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'recommendations', label: 'AI Recommendations', icon: Brain }
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

      {activeTab === 'papers' && renderPapersTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'recommendations' && renderRecommendationsTab()}

      {/* Prediction Results Modal */}
      {showPredictionResults && predictionResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>AI Prediction Results</span>
                </h3>
                <button 
                  onClick={() => setShowPredictionResults(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Personalized exam predictions based on your profile</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Focus Areas */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Focus Areas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictionResults.focusAreas.map((area, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      area.priority === 'High' ? 'bg-red-50 border-red-200' :
                      area.priority === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{area.subject}</h5>
                        <span className={`px-2 py-1 text-xs rounded ${
                          area.priority === 'High' ? 'bg-red-100 text-red-800' :
                          area.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {area.priority} Priority
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>Topics:</strong> {area.topics.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2">Recommended Study Schedule</h5>
                  <p className="text-blue-800">{predictionResults.studySchedule}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-900 mb-2">Predicted Improvement</h5>
                  <p className="text-green-800">{predictionResults.predictedImprovement}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Study Recommendations</h4>
                <div className="space-y-2">
                  {predictionResults.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Strategy */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Exam Strategy</h4>
                <div className="space-y-2">
                  {predictionResults.examStrategy.map((strategy, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowPredictionResults(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowPredictionResults(false);
                  // Could add functionality to save to dashboard
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Report Modal */}
      {showAnalysisReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <span>Analysis Report</span>
                </h3>
                <button 
                  onClick={() => setShowAnalysisReport(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Detailed analysis of past papers and curriculum patterns</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-900">Topic Frequency Analysis</div>
                  <div className="text-xs text-green-700 mt-1">Algebra appears in 85% of papers</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-900">Difficulty Trends</div>
                  <div className="text-xs text-blue-700 mt-1">Increasing complexity over years</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-900">Pattern Recognition</div>
                  <div className="text-xs text-purple-700 mt-1">Similar question structures identified</div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Topic Frequency Analysis (Past 5 Years)</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Business Administration: Management Principles (85%), Strategic Planning (72%), Organizational Behavior (68%)</li>
                      <li>• Accounting: Financial Accounting (78%), Cost Accounting (75%), Auditing (65%)</li>
                      <li>• Computer Science: Programming (82%), Data Structures (70%), Algorithms (68%)</li>
                      <li>• Economics: Microeconomics (80%), Macroeconomics (75%), Econometrics (70%)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Difficulty Trend Analysis</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Overall difficulty has increased by 15% over the past 3 years</li>
                      <li>• Business Administration questions are becoming more case-study based</li>
                      <li>• Accounting problems require more complex financial analysis</li>
                      <li>• Computer Science questions focus more on practical programming applications</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Question Pattern Recognition</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Multiple-choice questions follow specific distribution patterns</li>
                      <li>• Essay questions often require diagram drawing and explanation</li>
                      <li>• Calculation questions typically have 3-4 sub-parts</li>
                      <li>• Practical questions appear in 30% of papers</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Curriculum Alignment Scores</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Business Administration: 92% alignment with current curriculum</li>
                      <li>• Accounting: 88% alignment with current curriculum</li>
                      <li>• Computer Science: 90% alignment with current curriculum</li>
                      <li>• Economics: 85% alignment with current curriculum</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Recommended Study Focus Areas</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• High Priority: Management Principles, Financial Accounting, Programming, Microeconomics</li>
                      <li>• Medium Priority: Strategic Planning, Cost Accounting, Data Structures, Macroeconomics</li>
                      <li>• Low Priority: Organizational Behavior, Auditing, Algorithms, Econometrics</li>
                      <li>• Practice Areas: Problem-solving techniques, time management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAnalysisReport(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowAnalysisReport(false);
                  // Could add functionality to save to dashboard
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastPapersPanel;
