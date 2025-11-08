import React, { useState, useEffect } from 'react';
import { 
  Star, Users, BarChart3, TrendingUp, Award, Clock, 
  CheckCircle, AlertTriangle, MessageSquare, Eye, Filter,
  Search, Calendar, BookOpen, Target, ThumbsUp, ThumbsDown
} from 'lucide-react';

const TeacherRatingsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Backend-provided teacher ratings
  const [teacherRatings, setTeacherRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${baseUrl}/api/teacher-ratings/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTeacherRatings(Array.isArray(data?.teachers) ? data.teachers : []);
        } else {
          setTeacherRatings([]);
        }
      } catch (e) {
        console.error('Failed to fetch teacher ratings', e);
        setTeacherRatings([]);
      } finally {
        setLoading(false);
      }
    };
    loadRatings();
  }, []);

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teacher Ratings</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>View detailed teacher ratings and feedback</p>
      </div>

      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teacher Ratings Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teacherRatings.length === 0 && (
            <div className={`p-4 rounded-lg border text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No ratings available yet.</p>
            </div>
          )}
          {teacherRatings.map((teacher) => (
            <div key={teacher.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-lg">{teacher.avatar || (teacher.name?.[0] || '?')}</span>
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{teacher.name}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{teacher.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(teacher.overallRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className={`font-bold ${(teacher.overallRating || 0) >= 4.0 ? 'text-green-600' : (teacher.overallRating || 0) >= 3.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {(teacher.overallRating || 0).toFixed ? teacher.overallRating : Number(teacher.overallRating || 0).toFixed(1)}
                </span>
              </div>
              
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {(teacher.totalRatings || 0)} reviews
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherRatingsPanel;
