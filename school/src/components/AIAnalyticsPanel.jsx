import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Award, BookOpen, Users, Target, FileText, Download, BarChart3, PieChart, MessageSquare, Bot } from 'lucide-react';

const AIAnalyticsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [plagiarismStats, setPlagiarismStats] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // No demo analytics or parent samples

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // No demo data; wait for backend endpoints
      setAnalyticsData(null);
      setPlagiarismStats(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData(null);
      setPlagiarismStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      type: 'user',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, userMsg]);
    setNewMessage('');
    
    // No simulated responses in production mode
  };
  

  const analyzeStudentPerformance = async (studentId) => {
    if (!studentId) {
      setShowAnalysisForm(true);
      return;
    }
    
    setAnalysisLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const result = `
🎓 AI Performance Analysis for Student: ${studentId}

📊 Overall Performance: 78% (Good)

📈 Strengths:
• Mathematics: Excellent problem-solving skills
• Science: Strong analytical thinking
• Consistent attendance (95%)

⚠️ Areas for Improvement:
• English: Writing skills need development
• Time management during exams
• Participation in class discussions

🎯 AI Recommendations:
1. Extra tutoring in English composition
2. Practice timed exam simulations
3. Encourage active class participation
4. Consider peer study groups

📅 Predicted Performance:
• Next Term: 82% (if recommendations followed)
• Exam Readiness: 75% (Moderate)

💡 Personalized Study Plan:
• 2 hours/day focused study
• Weekly progress assessments
• Monthly progress reviews with instructors
      `.trim();
      
      setAnalysisResult(result);
      setShowAnalysisResult(true);
      setAnalysisLoading(false);
    }, 2000);
  };

  const exportCsv = (filename, headers, rows) => {
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const checkPlagiarism = async () => {
    const sampleText = prompt('Enter text to check for plagiarism (demo):');
    if (!sampleText) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/ai/plagiarism/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: 1,
          assignment_id: 'DEMO_001',
          submission_title: 'Demo Submission',
          submission_content: sampleText,
          subject: 'English'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const plagiarismResult = `
🔍 Plagiarism Check Results

📊 Similarity Score: ${result.plagiarism_score.toFixed(1)}%
${result.plagiarism_detected ? '⚠️ PLAGIARISM DETECTED' : '✅ No significant plagiarism detected'}

📚 Sources Found: ${result.sources_found.length}
👥 Similar Submissions: ${result.similar_submissions.length}

💡 Recommendations:
${result.recommendations.map(rec => `• ${rec}`).join('\n')}

🔬 Analysis Details:
• Total Sentences: ${result.detailed_analysis.total_sentences}
• Flagged Sentences: ${result.detailed_analysis.flagged_sentences}
• Suspicious Patterns: ${result.detailed_analysis.suspicious_patterns.length}
        `;
        
        alert(plagiarismResult);
      } else {
        alert(`❌ Plagiarism check failed: ${result.message}`);
      }
    } catch (error) {
      alert('Error checking plagiarism');
      console.error('Plagiarism check error:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary}`}>AI Analytics Dashboard</h1>
              <p className={`${textSecondary} mt-2`}>Advanced analytics with AI-powered insights and predictions</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`${cardBg} rounded-2xl shadow-xl mb-8`}>
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'charts', label: 'Charts & Graphs', icon: PieChart },
              { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
              { id: 'predictions', label: 'Predictions', icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : `${textSecondary} hover:${darkMode ? 'text-white' : 'text-gray-900'}`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${textMuted} text-sm font-medium`}>Total Students</p>
                    <p className={`${textPrimary} text-3xl font-bold mt-2`}>0</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${textMuted} text-sm font-medium`}>Average Performance</p>
                    <p className={`${textPrimary} text-3xl font-bold mt-2 text-green-600`}>0</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${textMuted} text-sm font-medium`}>At Risk Students</p>
                    <p className={`${textPrimary} text-3xl font-bold mt-2 text-red-600`}>0</p>
                  </div>
                  <div className="bg-red-100 rounded-full p-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${textMuted} text-sm font-medium`}>Attendance Rate</p>
                    <p className={`${textPrimary} text-3xl font-bold mt-2 text-purple-600`}>0</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            {analyticsData && (
              <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
                <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Performance Insights</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analyticsData.performance_insights?.map((insight, index) => (
                    <div key={index} className={`border rounded-xl p-6 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`font-semibold ${textPrimary}`}>{insight.student_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          insight.trend === 'improving' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {insight.trend}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={`${textSecondary}`}>Current Average:</span>
                          <span className={`font-medium ${textPrimary}`}>{insight.current_average}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${textSecondary}`}>Previous Average:</span>
                          <span className={`${textMuted}`}>{insight.previous_average}%</span>
                        </div>
                        <div>
                          <span className={`${textSecondary} text-sm`}>Recommendation:</span>
                          <p className={`${textMuted} text-sm mt-1`}>{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-8">
            {/* Performance Chart */}
            <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Subject Performance Overview</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div>
                  <h4 className={`font-medium ${textSecondary} mb-4`}>Average Scores by Subject</h4>
                  <div className="space-y-4">
                    {analyticsData?.subject_performance && Object.entries(analyticsData.subject_performance).map(([subject, data]) => (
                      <div key={subject} className="flex items-center space-x-4">
                        <div className={`w-20 text-sm ${textSecondary}`}>{subject}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${data.average}%` }}
                          />
                        </div>
                        <div className={`w-12 text-sm font-medium ${textPrimary}`}>{data.average}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie Chart Representation */}
                <div>
                  <h4 className={`font-medium ${textSecondary} mb-4`}>Pass Rate Distribution</h4>
                  <div className="space-y-4">
                    {analyticsData?.subject_performance && Object.entries(analyticsData.subject_performance).map(([subject, data]) => (
                      <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className={`font-medium ${textPrimary}`}>{subject}</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-16 h-2 bg-gray-200 rounded-full overflow-hidden`}>
                            <div 
                              className="h-full bg-green-500 transition-all duration-500"
                              style={{ width: `${data.pass_rate}%` }}
                            />
                          </div>
                          <span className={`text-sm ${textSecondary}`}>{data.pass_rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Heatmap */}
            <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Weekly Attendance Patterns</h3>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className={`text-center text-sm font-medium ${textSecondary}`}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const attendance = Math.floor(Math.random() * 40) + 60;
                  return (
                    <div
                      key={i}
                      className={`h-8 rounded ${
                        attendance >= 90 ? 'bg-green-500' : 
                        attendance >= 80 ? 'bg-yellow-500' : 
                        attendance >= 70 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      title={`${attendance}% attendance`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className={textMuted}>Low (&lt;70%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className={textMuted}>Fair (70-80%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className={textMuted}>Good (80-90%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className={textMuted}>Excellent (&gt;90%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
            <div className="flex items-center mb-6">
              <Bot className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className={`text-xl font-semibold ${textPrimary}`}>AI Analytics Assistant</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <div className={`border rounded-xl h-96 flex flex-col ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : `${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : textMuted}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me about analytics, trends, or predictions..."
                        className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className={`font-medium ${textSecondary}`}>Quick Actions</h4>
                <div className="space-y-2">
                  {[
                    'Show performance trends',
                    'Identify at-risk students',
                    'Generate attendance report',
                    'Predict exam outcomes',
                    'Analyze subject performance',
                    'Compare class averages'
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setNewMessage(action)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <span className={`text-sm ${textSecondary}`}>{action}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-8">
            {/* AI Predictions */}
            <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>AI Predictions & Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analyticsData?.ai_predictions?.map((prediction, index) => (
                  <div key={index} className={`border rounded-xl p-6 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-full ${
                        prediction.type === 'exam_performance' ? 'bg-green-100' :
                        prediction.type === 'at_risk' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {prediction.type === 'exam_performance' ? <Award className="w-5 h-5 text-green-600" /> :
                         prediction.type === 'at_risk' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                         <TrendingUp className="w-5 h-5 text-blue-600" />}
                      </div>
                      <h4 className={`font-semibold ${textPrimary} ml-3 capitalize`}>
                        {prediction.type.replace('_', ' ')}
                      </h4>
                    </div>
                    <p className={`${textSecondary} text-sm`}>{prediction.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Analysis Tool */}
            <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Student Performance Analysis</h3>
              <div className="flex items-center space-x-4 mb-6">
                <input
                  type="text"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  placeholder="Enter student ID or name"
                  className={`flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                />
                <button
                  onClick={() => analyzeStudentPerformance(selectedStudent)}
                  disabled={analysisLoading || !selectedStudent}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                >
                  {analysisLoading ? 'Analyzing...' : 'Analyze Performance'}
                </button>
              </div>
              <p className={`text-sm ${textMuted}`}>
                Enter a student ID or name to get AI-powered performance analysis, predictions, and recommendations.
              </p>
            </div>
          </div>
        )}

      {/* AI Insights Overview */}
      {analyticsData?.insights && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI Insights Dashboard
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.insights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{insight.title}</h4>
                  {insight.type === 'performance' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                  {insight.type === 'attendance' && <Users className="w-5 h-5 text-green-600" />}
                  {insight.type === 'class_overview' && <BookOpen className="w-5 h-5 text-purple-600" />}
                  {insight.type === 'academic_integrity' && <FileText className="w-5 h-5 text-red-600" />}
                </div>
                
                {insight.score !== undefined && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Score</span>
                      <span className="font-bold">{insight.score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          insight.score >= 80 ? 'bg-green-500' :
                          insight.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(insight.score, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {insight.total_students && (
                  <div className="space-y-1 text-sm">
                    <p>Total Students: <span className="font-medium">{insight.total_students}</span></p>
                    {insight.top_performers && <p>Top Performers: <span className="font-medium">{insight.top_performers}</span></p>}
                    {insight.at_risk_students && <p>At Risk: <span className="font-medium text-red-600">{insight.at_risk_students}</span></p>}
                  </div>
                )}

                {insight.plagiarism_rate !== undefined && (
                  <div className="space-y-1 text-sm">
                    <p>Plagiarism Rate: <span className="font-medium">{insight.plagiarism_rate.toFixed(1)}%</span></p>
                    <p>Total Submissions: <span className="font-medium">{insight.total_submissions}</span></p>
                    <p>Flagged: <span className="font-medium text-red-600">{insight.flagged_submissions}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Analysis Form */}
      {showAnalysisForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full max-h-[90vh] ${cardBg} rounded-lg shadow-xl flex flex-col`}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                🎓 AI Student Performance Analysis
              </h3>
              <button
                onClick={() => setShowAnalysisForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="analysis-form" className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Student ID or Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Enter student ID or full name"
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Analysis Type *
                  </label>
                  <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="">Select Analysis Type</option>
                    <option value="comprehensive">Comprehensive Analysis</option>
                    <option value="academic">Academic Performance Only</option>
                    <option value="behavioral">Behavioral Analysis</option>
                    <option value="predictive">Predictive Analysis</option>
                    <option value="comparative">Comparative Analysis</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Time Period
                  </label>
                  <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="current">Current Term</option>
                    <option value="year">This Academic Year</option>
                    <option value="semester">This Semester</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Include Subjects
                  </label>
                  <div className="space-y-2">
                    {['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'].map(subject => (
                      <label key={subject} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-2"
                        />
                        <span className={`text-sm ${textSecondary}`}>{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Additional Notes
                  </label>
                  <textarea
                    rows="3"
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Any specific areas to focus on or concerns..."
                  />
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAnalysisForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="analysis-form"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Run Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Result Modal */}
      {showAnalysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] ${cardBg} rounded-lg shadow-xl flex flex-col`}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                🎓 AI Analysis Results
              </h3>
              <button
                onClick={() => setShowAnalysisResult(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div className={`whitespace-pre-line ${textPrimary} text-sm leading-relaxed`}>
                {analysisResult}
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAnalysisResult(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([analysisResult], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'ai-analysis-result.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AIAnalyticsPanel;
