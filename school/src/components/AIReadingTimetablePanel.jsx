import React, { useState } from 'react';
import { 
  Calendar, Clock, BookOpen, Brain, Zap, Target, 
  CheckCircle, Star, TrendingUp, Eye, Download, 
  Plus, Edit, Save, RefreshCw, AlertTriangle
} from 'lucide-react';

const AIReadingTimetablePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);

  const aiTimetable = {
    weekly: {},
    preferences: { peakHours: [], weakSubjects: [], strongSubjects: [], studyStyle: '', breakPreference: '', weeklyGoal: '', dailyTarget: '' },
    analytics: { weeklyProgress: 0, completedSessions: 0, totalSessions: 0, averageScore: 0, improvementRate: 0, consistencyScore: 0 }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'intensive': return <Zap className="w-4 h-4 text-orange-600" />;
      case 'focused': return <Target className="w-4 h-4 text-blue-600" />;
      case 'review': return <BookOpen className="w-4 h-4 text-green-600" />;
      case 'practical': return <Star className="w-4 h-4 text-purple-600" />;
      case 'assessment': return <CheckCircle className="w-4 h-4 text-red-600" />;
      case 'quiz': return <Target className="w-4 h-4 text-indigo-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const generateNewTimetable = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Simulate AI regeneration
    }, 3000);
  };

  // Simple quiz generator based on session subject/topic
  const buildQuizForSession = (session) => {
    const base = [
      { q: 'Quick recall: What is 2 + 2?', options: ['3', '4', '5', '6'], answer: 1 },
      { q: 'Concept check: Define a vector quantity.', options: ['Has magnitude only', 'Has magnitude and direction', 'A scalar multiple', 'A unitless value'], answer: 1 },
      { q: 'Exam tip: Best way to revise?', options: ['Only read notes', 'Active recall & spaced practice', 'Cram night before', 'Skip weak areas'], answer: 1 },
    ];
    if (session?.subject?.toLowerCase().includes('math')) {
      base.unshift({ q: 'Derivative of x^2 is?', options: ['x', '2x', 'x^2', '2'], answer: 1 });
    }
    if (session?.subject?.toLowerCase().includes('physics')) {
      base.unshift({ q: 'SI unit of force?', options: ['Pascal', 'Joule', 'Newton', 'Watt'], answer: 2 });
    }
    if (session?.subject?.toLowerCase().includes('chem')) {
      base.unshift({ q: 'Avogadro number approx?', options: ['6.02e23', '9.81', '3.14', '1.6e-19'], answer: 0 });
    }
    if (session?.subject?.toLowerCase().includes('bio')) {
      base.unshift({ q: 'DNA stands for?', options: ['Deoxyribo Nucleic Acid', 'Di-nitro Acid', 'Deoxygen Acid', 'Ribo Nucleic Acid'], answer: 0 });
    }
    return base.slice(0, 5);
  };

  const startQuiz = () => {
    const qs = buildQuizForSession(selectedDay?.session || {});
    setQuizQuestions(qs);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setQuizActive(true);
  };

  const submitQuizAnswer = async () => {
    if (selectedOption === null) return;
    const correct = quizQuestions[quizIndex].answer === selectedOption;
    if (correct) setQuizScore((s) => s + 1);
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      // quiz finished
      const finalScore = quizScore + (correct ? 1 : 0);
      const percentage = (finalScore / quizQuestions.length) * 100;
      
      // Add to quiz history
      const quizResult = {
        id: Date.now(),
        subject: selectedDay?.session?.subject || 'General',
        topic: selectedDay?.session?.topic || 'Study Session',
        score: finalScore,
        total: quizQuestions.length,
        percentage: percentage.toFixed(1),
        date: new Date().toISOString()
      };
      setQuizHistory([quizResult, ...quizHistory]);
      setQuizActive(false);
      
      // Persist result to backend using new AI quiz API
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || '';
        
        // First create the quiz record
        const createResponse = await fetch(`${baseUrl}/api/ai-quizzes/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student_id: currentUser?.id,
            subject: selectedDay?.session?.subject || 'General',
            topic: selectedDay?.session?.topic || 'Study Session',
            difficulty_level: 'medium',
            quiz_type: 'multiple_choice',
            total_questions: quizQuestions.length,
            max_score: quizQuestions.length,
            questions: quizQuestions.map((q, idx) => ({
              question_text: q.q,
              question_type: 'multiple_choice',
              options: q.options,
              correct_answer: q.options[q.answer],
              points: 1,
              difficulty: 'medium'
            }))
          })
        });

        const createResult = await createResponse.json();
        
        if (createResult.success) {
          // Submit the quiz with answers
          const answers = {};
          quizQuestions.forEach((q, idx) => {
            answers[idx] = selectedOption === q.answer ? q.options[q.answer] : 'wrong';
          });

          await fetch(`${baseUrl}/api/ai-quizzes/${createResult.quiz_id}/submit`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answers })
          });
        }
      } catch (e) {
        console.error('Failed to save quiz result', e);
      }
      
      alert(`🎯 Quiz completed!\n\nScore: ${finalScore} / ${quizQuestions.length}\nPercentage: ${percentage.toFixed(1)}%\n\n${percentage >= 80 ? '🌟 Excellent!' : percentage >= 60 ? '👍 Good job!' : '📚 Keep practicing!'}`);
    }
  };

  const renderWeeklyView = () => (
    <div className="space-y-6">
      {/* AI Generation Controls */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">AI-Generated Reading Timetable</h3>
            <p className="text-purple-100">Personalized schedule based on your performance and learning patterns</p>
          </div>
          <button 
            onClick={generateNewTimetable}
            disabled={isGenerating}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {Object.entries(aiTimetable.weekly).length === 0 ? (
          <div className={`rounded-xl shadow p-8 text-center col-span-7 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>No AI timetable yet</p>
          </div>
        ) : (
        Object.entries(aiTimetable.weekly).map(([day, sessions]) => (
          <div key={day} className={`rounded-xl shadow-lg p-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="text-center mb-4">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{day}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{sessions.length} sessions</p>
            </div>
            
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getPriorityColor(session.priority)}`}
                  onClick={() => setSelectedDay({ day, session, index })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{session.time}</span>
                    {getTypeIcon(session.type)}
                  </div>
                  <div className="text-sm font-medium mb-1">{session.subject}</div>
                  <div className="text-xs opacity-80">{session.topic}</div>
                  <div className="text-xs mt-2 flex items-center justify-between">
                    <span>{session.duration} min</span>
                    <span className="capitalize">{session.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
        )}
      </div>

      {/* Weekly Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Progress</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{aiTimetable.analytics.weeklyProgress}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${aiTimetable.analytics.weeklyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Study Sessions</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed:</span>
              <span className="font-medium text-green-600">{aiTimetable.analytics.completedSessions}</span>
            </div>
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining:</span>
              <span className="font-medium text-orange-600">{aiTimetable.analytics.totalSessions - aiTimetable.analytics.completedSessions}</span>
            </div>
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total:</span>
              <span className="font-medium text-blue-600">{aiTimetable.analytics.totalSessions}</span>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Score:</span>
              <span className="font-medium text-blue-600">{aiTimetable.analytics.averageScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Improvement:</span>
              <span className="font-medium text-green-600">+{aiTimetable.analytics.improvementRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Consistency:</span>
              <span className="font-medium text-purple-600">{aiTimetable.analytics.consistencyScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDailyView = () => (
    <div className="space-y-6">
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Today's Reading Schedule</h3>
        <div className="space-y-4">
          {(Object.entries(aiTimetable.weekly).length === 0 ? [] : (aiTimetable.weekly.Monday || [])).map((session, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{session.time.split('-')[0]}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{session.duration}m</div>
                </div>
                <div className={`w-px h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{session.subject}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{session.topic}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(session.type)}
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(session.priority)}`}>
                      {session.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-800">
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuizzesView = () => (
    <div className="space-y-6">
      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total Quizzes</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{quizHistory.length}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Average Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {quizHistory.length > 0 
                ? (quizHistory.reduce((sum, q) => sum + parseFloat(q.percentage), 0) / quizHistory.length).toFixed(1)
                : 0}%
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Performance</div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Best Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {quizHistory.length > 0 
                ? Math.max(...quizHistory.map(q => parseFloat(q.percentage))).toFixed(1)
                : 0}%
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Highest Achievement</div>
          </div>
        </div>
      </div>

      {/* Quiz History */}
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quiz History</h3>
        
        {quizHistory.length === 0 ? (
          <div className="text-center py-12">
            <Target className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No quizzes completed yet</p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
              Complete study sessions with quizzes to see your results here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizHistory.map((quiz) => (
              <div 
                key={quiz.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{quiz.subject}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{quiz.topic}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      {new Date(quiz.date).toLocaleDateString()} at {new Date(quiz.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${
                      parseFloat(quiz.percentage) >= 80 ? 'text-green-600' :
                      parseFloat(quiz.percentage) >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {quiz.percentage}%
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {quiz.score}/{quiz.total} correct
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Learning Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Study Patterns</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Peak Hours:</span>
                <span className="font-medium">{aiTimetable.preferences.peakHours.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Study Style:</span>
                <span className="font-medium">{aiTimetable.preferences.studyStyle}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Break Preference:</span>
                <span className="font-medium">{aiTimetable.preferences.breakPreference}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily Target:</span>
                <span className="font-medium">{aiTimetable.preferences.dailyTarget}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Subject Focus</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-red-700">Weak Subjects:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {aiTimetable.preferences.weakSubjects.map((subject, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-green-700">Strong Subjects:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {aiTimetable.preferences.strongSubjects.map((subject, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-6 p-4 rounded-lg border ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h4 className={`font-medium ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>AI Optimization Tips</h4>
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            <li>• Schedule intensive subjects during your peak hours (6-8 AM)</li>
            <li>• Focus 40% more time on weak subjects (Physics, Statistics)</li>
            <li>• Use visual learning methods for better retention</li>
            <li>• Take regular breaks to maintain concentration</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Reading Timetable</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Personalized study schedule optimized by artificial intelligence</p>
      </div>

      <div className={`rounded-xl shadow-lg mb-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'weekly', label: 'Weekly View', icon: Calendar },
              { id: 'daily', label: 'Today', icon: Clock },
              { id: 'quizzes', label: 'My Quizzes', icon: Target },
              { id: 'preferences', label: 'AI Preferences', icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeView === 'weekly' && renderWeeklyView()}
      {activeView === 'daily' && renderDailyView()}
      {activeView === 'quizzes' && renderQuizzesView()}
      {activeView === 'preferences' && renderPreferences()}

      {/* Session Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-xl p-6 max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Session Details</h3>
              <button 
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Static session details when not a quiz or before starting quiz */}
              {!quizActive && (
                <>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDay.session.subject}</span>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedDay.session.topic}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time:</span>
                      <div className="font-medium">{selectedDay.session.time}</div>
                    </div>
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration:</span>
                      <div className="font-medium">{selectedDay.session.duration} minutes</div>
                    </div>
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority:</span>
                      <div className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPriorityColor(selectedDay.session.priority)}`}>
                        {selectedDay.session.priority}
                      </div>
                    </div>
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type:</span>
                      <div className="font-medium capitalize">{selectedDay.session.type}</div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {/* If this is a quiz session, allow starting the quiz */}
                    {selectedDay.session.type === 'quiz' ? (
                      <button onClick={startQuiz} className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        Start Quiz
                      </button>
                    ) : (
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Start Session
                      </button>
                    )}
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      Reschedule
                    </button>
                  </div>
                </>
              )}

              {/* Quiz UI */}
              {quizActive && (
                <div className="space-y-4">
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Question {quizIndex + 1} of {quizQuestions.length}</div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{quizQuestions[quizIndex]?.q}</div>
                  <div className="space-y-2">
                    {quizQuestions[quizIndex]?.options.map((opt, idx) => (
                      <label key={idx} className={`flex items-center space-x-2 p-2 rounded border cursor-pointer ${selectedOption === idx ? 'border-indigo-500 bg-indigo-50' : (darkMode ? 'border-gray-700' : 'border-gray-200')}`}>
                        <input type="radio" name="quizopt" className="hidden" onChange={() => setSelectedOption(idx)} />
                        <span className={`w-4 h-4 inline-block rounded-full border ${selectedOption === idx ? 'bg-indigo-500 border-indigo-500' : (darkMode ? 'border-gray-500' : 'border-gray-400')}`}></span>
                        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score: {quizScore}</div>
                    <button onClick={submitQuizAnswer} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                      {quizIndex + 1 === quizQuestions.length ? 'Finish' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReadingTimetablePanel;
