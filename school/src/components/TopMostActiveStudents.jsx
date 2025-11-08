import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, BookOpen, FileText, Award, TrendingUp, Users, Brain, Zap } from 'lucide-react';

const TopMostActiveStudents = ({ userRole, currentUser, darkMode = false, setActiveTab }) => {
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_semester');
  const [currentSemesterName, setCurrentSemesterName] = useState('Current Semester');
  const [periodName, setPeriodName] = useState('Current Semester');

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
          
          // Simple semester calculation (adjust based on your academic calendar)
          if (month >= 1 && month <= 4) {
            semesterName = `Semester 1 ${year}`;
          } else if (month >= 5 && month <= 8) {
            semesterName = `Semester 2 ${year}`;
          }
          setCurrentSemesterName(semesterName);
        }
      } catch (e) {
        console.error('Failed to fetch current semester:', e);
        // Fallback on error
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        setCurrentSemesterName(`Semester 1 ${year}`);
      }
    };
    fetchCurrentSemester();
  }, []);

  useEffect(() => {
    const loadTopActive = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || '';
        // Higher institute (adult education) system - uses semesters
        // Backend now accepts 'current_semester' directly (no mapping needed)
        const params = new URLSearchParams({
          period: selectedPeriod,
          category: 'overall'
        });
        const res = await fetch(`${baseUrl}/api/leaderboard?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const payload = await res.json();
          const list = Array.isArray(payload?.data) ? payload.data : [];
          
          // Update period name from response (preferred) or fallback to selection
          if (payload.period) {
            setPeriodName(payload.period);
          } else {
            // Set period name based on selection
            if (selectedPeriod === 'current_semester') {
              setPeriodName(currentSemesterName);
            } else if (selectedPeriod === 'last_month') {
              setPeriodName('Last Month');
            } else {
              setPeriodName('Last Semester');
            }
          }
          
          // Take top 5 and map to required fields defensively
          const top5 = list.slice(0, 5).map((s, idx) => ({
            id: s.id ?? idx,
            name: s.name ?? 'Student',
            class: s.class ?? s.className ?? s.class_code ?? '—',
            avatar: s.avatar ?? (s.name ? s.name.split(' ').map(p => p[0]).slice(0,2).join('') : 'ST'),
            engagementScore: Math.round(s.totalScore ?? s.score ?? s.overallPerformance ?? 0),
            tests: s.tests?.completed ?? (typeof s.tests === 'number' ? s.tests : 0),
            assignments: s.assignments?.completed ?? (typeof s.assignments === 'number' ? s.assignments : 0),
            projects: s.projects?.completed ?? (typeof s.projects === 'number' ? s.projects : 0),
            overallPerformance: Math.round(s.totalScore ?? s.score ?? s.overallPerformance ?? 0),
            rank: s.rank ?? idx + 1,
            streak: s.streak ?? 0
          }));
          setTopStudents(top5);
        } else {
          setTopStudents([]);
        }
      } catch (e) {
        console.error('Failed to load top active students', e);
        setTopStudents([]);
      } finally {
        setLoading(false);
      }
    };
    loadTopActive();
  }, [selectedPeriod, currentSemesterName]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Star className="w-6 h-6 text-gray-400" />;
      case 3: return <Star className="w-6 h-6 text-orange-500" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
    }
  };

  const getEngagementColor = (score) => {
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
    <div className={`${cardBg} rounded-xl shadow-lg p-6 border overflow-hidden`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Top 5 Most Active Students</h3>
            <p className={`text-sm ${textMuted}`}>
              {periodName} • Ranked by lesson engagement & performance
            </p>
          </div>
        </div>
        
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
          className={`px-3 py-1 text-sm border rounded-lg ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-700'
          }`}
        >
          <option value="current_semester">{currentSemesterName}</option>
          <option value="last_month">Last Month</option>
          <option value="last_semester">Last Semester</option>
        </select>
      </div>

      {topStudents.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className={`text-sm font-medium ${textPrimary} mb-1`}>No Active Students</h4>
          <p className={`text-xs ${textMuted}`}>
            No student data available for {periodName}
          </p>
        </div>
      ) : (
      <div className="flex flex-wrap gap-4 justify-center">
        {topStudents.map((student, index) => (
          <div
            key={student.id}
            className={`p-4 rounded-lg border transition-all hover:shadow-md w-48 flex-shrink-0 ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {/* Rank and Avatar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-shrink-0">
                {getRankIcon(student.rank)}
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {student.avatar}
              </div>
            </div>

            {/* Student Info */}
            <div className="text-center mb-3">
              <h4 className={`font-semibold ${textPrimary} text-sm mb-1`}>{student.name}</h4>
              <p className={`text-xs ${textMuted} mb-2`}>{student.class}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${getEngagementColor(student.engagementScore)}`}>
                {student.engagementScore}% engaged
              </span>
            </div>
            
            {/* Performance Stats */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span className={textMuted}>Tests</span>
                </div>
                <span className={textPrimary}>{student.tests}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 text-green-500" />
                  <span className={textMuted}>Assignments</span>
                </div>
                <span className={textPrimary}>{student.assignments}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-purple-500" />
                  <span className={textMuted}>Projects</span>
                </div>
                <span className={textPrimary}>{student.projects}</span>
              </div>
            </div>

            {/* Performance Score */}
            <div className="text-center pt-3 border-t border-gray-200">
              <div className={`text-lg font-bold ${textPrimary} mb-1`}>{student.overallPerformance}%</div>
              <div className={`text-xs ${textMuted} mb-2`}>Overall</div>
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className={`text-xs text-green-600`}>{student.streak} day streak</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Badges Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Achievement Badges</h4>
        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {['Top Performer', 'Consistent', 'Active Participant', 'High Achiever', 'Dedicated', 'Hard Worker', 'Improving', 'Rising Star'].map(badge => (
            <span
              key={badge}
              className={`px-2 py-1 text-xs rounded-full ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={() => {
            if (setActiveTab) {
              setActiveTab('leaderboard');
            } else {
              alert('Full leaderboard feature coming soon!');
            }
          }}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            darkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
};

export default TopMostActiveStudents;
