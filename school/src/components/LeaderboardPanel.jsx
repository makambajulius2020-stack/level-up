import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, TrendingUp, Users, Target, BookOpen, FileText, Calendar, Zap, Crown, Flame } from 'lucide-react';

const LeaderboardPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_semester');
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedClass, setSelectedClass] = useState('all');
  const [currentSemesterName, setCurrentSemesterName] = useState('Current Semester');
  const [periodName, setPeriodName] = useState('Current Semester');
  const [availableClasses, setAvailableClasses] = useState([]);

  // Fetch current semester
  useEffect(() => {
    const fetchCurrentSemester = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${baseUrl}/api/semesters/current`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.semester && data.semester.name) {
            setCurrentSemesterName(data.semester.name);
          }
        } else {
          // Fallback if endpoint fails
          const currentDate = new Date();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          let semesterName = 'Current Semester';
          
          if (month >= 1 && month <= 4) {
            semesterName = `Semester 1 ${year}`;
          } else if (month >= 5 && month <= 8) {
            semesterName = `Semester 2 ${year}`;
          }
          setCurrentSemesterName(semesterName);
        }
      } catch (e) {
        console.error('Failed to fetch current semester:', e);
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        setCurrentSemesterName(`Semester 1 ${year}`);
      }
    };
    fetchCurrentSemester();
  }, []);

  // Fetch available classes (exclude A-Level/high school classes)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${baseUrl}/api/classes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.classes) {
            // Higher institute system (adult education) - exclude high school classes
            // Supported levels: Year 1, Year 2, Year 3, Year 4, Graduate, Postgraduate
            // Exclude: O-Level and A-Level (both are high school/secondary education)
            const highSchoolLevels = ['O-Level', 'A-Level']; // High school levels to exclude
            const higherInstituteClasses = data.classes.filter(
              cls => cls.is_active !== false && !highSchoolLevels.includes(cls.level)
            );
            setAvailableClasses(higherInstituteClasses);
          }
        }
      } catch (e) {
        console.error('Failed to fetch classes:', e);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || '';
        // Higher institute (adult education) system - uses semesters directly
        const params = new URLSearchParams({
          period: selectedPeriod,
          category: selectedCategory,
          class: selectedClass,
        });
        const response = await fetch(`${baseUrl}/api/leaderboard?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const payload = await response.json();
          const data = Array.isArray(payload?.data) ? payload.data : [];
          setLeaderboardData(data);
          
          // Update period name from response
          if (payload.period) {
            setPeriodName(payload.period);
          } else {
            if (selectedPeriod === 'current_semester') {
              setPeriodName(currentSemesterName);
            } else if (selectedPeriod === 'last_month') {
              setPeriodName('Last Month');
            } else {
              setPeriodName('Last Semester');
            }
          }
        } else {
          setLeaderboardData([]);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedPeriod, selectedCategory, selectedClass, currentSemesterName]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-500" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <span className="w-4 h-4 text-gray-400">—</span>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary}`}>School Leaderboard</h1>
              <p className={`${textSecondary}`}>
                {periodName} • Track student performance and achievements
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                // Update period name immediately
                if (e.target.value === 'current_semester') {
                  setPeriodName(currentSemesterName);
                } else if (e.target.value === 'last_month') {
                  setPeriodName('Last Month');
                } else {
                  setPeriodName('Last Semester');
                }
              }}
              className={`px-4 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="current_semester">{currentSemesterName}</option>
              <option value="last_month">Last Month</option>
              <option value="last_semester">Last Semester</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="overall">Overall Performance</option>
              <option value="tests">Test Scores</option>
              <option value="assignments">Assignments</option>
              <option value="attendance">Attendance</option>
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="all">All Classes</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.code}>{cls.name}</option>
              ))}
              {availableClasses.length === 0 && (
                <option value="" disabled>No higher institute classes available</option>
              )}
            </select>
          </div>
        </div>

        {/* Leaderboard */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              {selectedCategory === 'overall' ? 'Overall Performance' : 
               selectedCategory === 'tests' ? 'Test Scores' :
               selectedCategory === 'assignments' ? 'Assignment Scores' :
               'Attendance Records'}
            </h2>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className={`text-sm ${textMuted}`}>Live Rankings</span>
            </div>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Students Found</h3>
              <p className={textSecondary}>
                No student data available for {periodName}. Try selecting a different period or category.
              </p>
            </div>
          ) : (
          <div className="space-y-4">
            {leaderboardData.map((student, index) => (
              <div
                key={student.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                  darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                } ${student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : ''}`}
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(student.rank)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {student.avatar}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h3 className={`font-semibold ${textPrimary} truncate`}>{student.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(student.totalScore || student.score)}`}>
                      {student.totalScore || student.score} points
                    </span>
                    {getTrendIcon(student.trend)}
                  </div>
                  <p className={`text-sm ${textMuted}`}>{student.class}</p>
                  
                  {/* Detailed Stats for Overall */}
                  {selectedCategory === 'overall' && (
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span className={`text-xs ${textMuted}`}>
                          {typeof student.tests === 'object' ? student.tests.completed : student.tests || 0} tests
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3 text-green-500" />
                        <span className={`text-xs ${textMuted}`}>
                          {typeof student.assignments === 'object' ? student.assignments.completed : student.assignments || 0} assignments
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3 text-purple-500" />
                        <span className={`text-xs ${textMuted}`}>
                          {typeof student.projects === 'object' ? student.projects.completed : student.projects || 0} projects
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-orange-500" />
                        <span className={`text-xs ${textMuted}`}>{student.attendance || 0}% attendance</span>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  {student.badges && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {student.badges.slice(0, 3).map((badge, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 text-xs rounded-full ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                      {student.badges.length > 3 && (
                        <span className={`text-xs ${textMuted}`}>+{student.badges.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Performance Score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${textPrimary}`}>
                    {selectedCategory === 'overall' ? (student.totalScore || student.score || 0) :
                     selectedCategory === 'tests' ? (typeof student.tests === 'object' ? student.tests.average : student.tests || 0) :
                     selectedCategory === 'assignments' ? (typeof student.assignments === 'object' ? student.assignments.average : student.assignments || 0) :
                     (student.attendance || 0)}
                  </div>
                  <div className={`text-sm ${textMuted}`}>
                    {selectedCategory === 'overall' ? 'Total Points' :
                     selectedCategory === 'tests' ? 'Avg Score' :
                     selectedCategory === 'assignments' ? 'Avg Score' :
                     'Attendance %'}
                  </div>
                  {student.streak && student.streak > 0 && (
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className={`text-xs text-yellow-600`}>{student.streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Summary Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{leaderboardData.length}</div>
                <div className="text-sm text-blue-700">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {leaderboardData.length > 0 
                    ? Math.round(leaderboardData.reduce((sum, s) => sum + (s.totalScore || s.score || 0), 0) / leaderboardData.length)
                    : 0}
                </div>
                <div className="text-sm text-green-700">Average Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {leaderboardData.filter(s => s.trend === 'up').length}
                </div>
                <div className="text-sm text-purple-700">Improving</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {leaderboardData.length > 0
                    ? Math.max(...leaderboardData.map(s => s.streak || 0), 0)
                    : 0}
                </div>
                <div className="text-sm text-orange-700">Best Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;
