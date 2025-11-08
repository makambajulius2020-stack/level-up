import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Star, Medal, Crown, User, ChevronRight } from 'lucide-react';

const TopPerformingStudents = ({ userRole, darkMode = false }) => {
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dark mode styles
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    fetchTopStudents();
  }, []);

  const fetchTopStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/analytics/top-performing-students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTopStudents(data.students || []);
      } else {
        // No demo data - show empty state
        setTopStudents([]);
      }
    } catch (error) {
      console.error('Error fetching top students:', error);
      // No demo data on error - show empty state
      setTopStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-500" />;
      default:
        return <Star className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  if (loading) {
    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base font-semibold ${textPrimary} flex items-center`}>
          <Award className="w-4 h-4 mr-2 text-yellow-600" />
          Top 5 Students
        </h3>
        <button className={`text-xs ${textSecondary} hover:${textPrimary} transition-colors flex items-center`}>
          View All
          <ChevronRight className="w-3 h-3 ml-1" />
        </button>
      </div>

      {topStudents.length > 0 ? (
        <div className="space-y-3">
          {topStudents.map((student, index) => (
            <div key={student.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-full ${getRankColor(index + 1)} flex items-center justify-center text-white font-bold text-xs shadow-lg flex-shrink-0 mt-0.5`}>
                {index + 1}
              </div>

              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <h4 className={`font-semibold ${textPrimary} text-sm leading-tight`}>{student.name}</h4>
                  <div className="flex items-center space-x-1 mt-0.5">
                    {getRankIcon(index + 1)}
                    <p className={`text-xs ${textSecondary}`}>{student.class}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`font-medium ${textPrimary}`}>
                    GPA: {student.gpa}
                  </span>
                  <span className={`font-medium text-green-600`}>
                    {student.attendance}%
                  </span>
                  <span className={`font-medium text-blue-600 flex items-center`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {student.improvement}
                  </span>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="text-right flex-shrink-0 mt-0.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  student.gpa >= 4.0 ? 'bg-green-100 text-green-600' :
                  student.gpa >= 3.5 ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className={`${textSecondary}`}>No performance data available</p>
          <p className={`text-xs ${textMuted}`}>Student performance data will appear here once available</p>
        </div>
      )}

      {/* Summary Stats */}
      {topStudents.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className={`text-lg font-bold ${textPrimary}`}>
                {(topStudents.reduce((sum, s) => sum + s.gpa, 0) / topStudents.length).toFixed(1)}
              </p>
              <p className={`text-xs ${textMuted}`}>Avg GPA</p>
            </div>
            <div>
              <p className={`text-lg font-bold ${textPrimary}`}>
                {Math.round(topStudents.reduce((sum, s) => sum + s.attendance, 0) / topStudents.length)}%
              </p>
              <p className={`text-xs ${textMuted}`}>Avg Attend</p>
            </div>
            <div>
              <p className={`text-lg font-bold text-green-600`}>
                {Math.round(topStudents.reduce((sum, s) => sum + parseFloat(s.improvement), 0) / topStudents.length * 10) / 10}
              </p>
              <p className={`text-xs ${textMuted}`}>Avg Improve</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopPerformingStudents;
