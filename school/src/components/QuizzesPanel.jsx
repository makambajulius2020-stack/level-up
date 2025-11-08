import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, CheckCircle, XCircle, Award, TrendingUp, 
  Play, Eye, Calendar, Filter, Search, Target, Brain, Star
} from 'lucide-react';

const QuizzesPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    fetchQuizzes();
    fetchQuizResults();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setQuizzes([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setLoading(false);
    }
  };

  const fetchQuizResults = async () => {
    try {
      // TODO: Replace with actual API call
      setQuizResults([]);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const submitQuiz = async () => {
    try {
      const score = calculateScore();
      // TODO: Submit to backend
      alert(`Quiz completed! Score: ${score.correct}/${score.total} (${score.percentage}%)`);
      setActiveQuiz(null);
      fetchQuizResults();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correct++;
    });
    return {
      correct,
      total: activeQuiz.questions.length,
      percentage: ((correct / activeQuiz.questions.length) * 100).toFixed(1)
    };
  };

  const stats = {
    total: quizResults.length,
    completed: quizResults.filter(r => r.status === 'completed').length,
    avgScore: quizResults.length > 0 
      ? (quizResults.reduce((sum, r) => sum + r.score_percentage, 0) / quizResults.length).toFixed(1)
      : 0,
    pending: quizzes.filter(q => !quizResults.find(r => r.quiz_id === q.id)).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestion];
    const isLastQuestion = currentQuestion === activeQuiz.questions.length - 1;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${cardBg} rounded-xl shadow-xl p-8`}>
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>{activeQuiz.title}</h2>
            <div className="flex items-center justify-between">
              <p className={textSecondary}>{activeQuiz.subject} - {activeQuiz.topic}</p>
              <span className={`text-sm ${textMuted}`}>
                Question {currentQuestion + 1} of {activeQuiz.questions.length}
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / activeQuiz.questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="mb-8">
            <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>{question.question_text}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    answers[currentQuestion] === option
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                      : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={() => handleAnswer(currentQuestion, option)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className={`ml-3 ${textPrimary}`}>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={submitQuiz}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Quizzes & Tests</h1>
        <p className={textSecondary}>Practice and test your knowledge</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textMuted}`}>Total Quizzes</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>{quizzes.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textMuted}`}>Completed</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>{stats.completed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textMuted}`}>Average Score</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>{stats.avgScore}%</p>
            </div>
            <Award className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textMuted}`}>Pending</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-8`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              />
            </div>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-3 border rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
          >
            <option value="all">All Quizzes</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high_score">High Score</option>
          </select>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="space-y-6">
        {quizzes.length === 0 ? (
          <div className={`${cardBg} rounded-xl shadow-lg p-12 text-center`}>
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>No Quizzes Available</h3>
            <p className={textSecondary}>Check back later for new quizzes and tests</p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const result = quizResults.find(r => r.quiz_id === quiz.id);
            const isCompleted = !!result;

            return (
              <div key={quiz.id} className={`${cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-xl font-bold ${textPrimary}`}>{quiz.title}</h3>
                      {isCompleted && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <p className={`${textSecondary} mb-4`}>{quiz.subject} - {quiz.topic}</p>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <span className={`flex items-center ${textMuted}`}>
                        <FileText className="w-4 h-4 mr-1" />
                        {quiz.total_questions} questions
                      </span>
                      <span className={`flex items-center ${textMuted}`}>
                        <Clock className="w-4 h-4 mr-1" />
                        {quiz.time_limit || 30} minutes
                      </span>
                      <span className={`flex items-center ${textMuted}`}>
                        <Target className="w-4 h-4 mr-1" />
                        {quiz.difficulty_level}
                      </span>
                    </div>

                    {isCompleted && (
                      <div className="mt-4 flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className={`text-sm ${textMuted} mr-2`}>Score:</span>
                          <span className="text-lg font-bold text-blue-600">{result.score_percentage}%</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm ${textMuted} mr-2`}>Completed:</span>
                          <span className={`text-sm ${textSecondary}`}>
                            {new Date(result.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {isCompleted ? (
                      <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>Review</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startQuiz(quiz)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Play className="w-5 h-5" />
                        <span>Start Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent Results */}
      {quizResults.length > 0 && (
        <div className="mt-8">
          <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>Recent Results</h2>
          <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Quiz</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Score</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quizResults.slice(0, 5).map((result) => (
                  <tr key={result.id}>
                    <td className={`px-6 py-4 whitespace-nowrap ${textPrimary}`}>{result.quiz_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${result.score_percentage >= 70 ? 'text-green-600' : result.score_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {result.score_percentage}%
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${textSecondary}`}>
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPanel;
