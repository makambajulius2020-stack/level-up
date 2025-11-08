import React, { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Star, Calendar, Download, Plus, Edit, Trash2 } from 'lucide-react';

const StudentAchievements = ({ studentId, userRole, darkMode = false }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    achievement_type: 'academic',
    title: '',
    description: '',
    achievement_date: '',
    award_level: 'school'
  });

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';

  useEffect(() => {
    fetchAchievements();
  }, [studentId]);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/achievements/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAchievement = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/achievements/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newAchievement,
          student_id: studentId
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Achievement added successfully!');
        fetchAchievements();
        setShowAddModal(false);
        setNewAchievement({
          achievement_type: 'academic',
          title: '',
          description: '',
          achievement_date: '',
          award_level: 'school'
        });
      } else {
        alert(`❌ Failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
      alert('Failed to add achievement');
    }
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'academic': return <Award className="w-6 h-6 text-blue-600" />;
      case 'sports': return <Trophy className="w-6 h-6 text-yellow-600" />;
      case 'leadership': return <Star className="w-6 h-6 text-purple-600" />;
      case 'arts': return <Medal className="w-6 h-6 text-pink-600" />;
      default: return <Award className="w-6 h-6 text-gray-600" />;
    }
  };

  const getAwardLevelColor = (level) => {
    switch (level) {
      case 'international': return 'bg-purple-100 text-purple-800';
      case 'national': return 'bg-blue-100 text-blue-800';
      case 'regional': return 'bg-green-100 text-green-800';
      case 'district': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const stats = {
    total: achievements.length,
    academic: achievements.filter(a => a.achievement_type === 'academic').length,
    sports: achievements.filter(a => a.achievement_type === 'sports').length,
    leadership: achievements.filter(a => a.achievement_type === 'leadership').length,
    totalPoints: achievements.reduce((sum, a) => sum + (a.points_awarded || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondary}`}>Total Achievements</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{stats.total}</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondary}`}>Academic</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{stats.academic}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondary}`}>Sports</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{stats.sports}</p>
            </div>
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${textSecondary}`}>Total Points</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{stats.totalPoints}</p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${textPrimary} flex items-center`}>
            <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
            Achievements & Awards
          </h3>
          {userRole === 'teacher' || userRole === 'admin' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </button>
          ) : null}
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className={textSecondary}>No achievements yet</p>
            <p className="text-sm text-gray-400 mt-2">Keep working hard and achievements will appear here!</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getAchievementIcon(achievement.achievement_type)}
                  <div>
                    <h4 className={`font-semibold ${textPrimary}`}>{achievement.title}</h4>
                    <p className={`text-sm ${textSecondary}`}>{achievement.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getAwardLevelColor(achievement.award_level)}`}>
                  {achievement.award_level}
                </span>
              </div>

              {achievement.description && (
                <p className={`text-sm ${textSecondary} mb-3`}>{achievement.description}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(achievement.achievement_date).toLocaleDateString()}
                </div>
                {achievement.certificate_issued && (
                  <span className="flex items-center text-green-600">
                    <Award className="w-4 h-4 mr-1" />
                    Certified
                  </span>
                )}
              </div>

              {achievement.points_awarded > 0 && (
                <div className="mt-2 text-sm font-medium text-blue-600">
                  +{achievement.points_awarded} points
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Add Achievement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4`}>
            <h4 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Add New Achievement</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Type</label>
                  <select
                    value={newAchievement.achievement_type}
                    onChange={(e) => setNewAchievement({...newAchievement, achievement_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="leadership">Leadership</option>
                    <option value="arts">Arts</option>
                    <option value="community_service">Community Service</option>
                    <option value="attendance">Attendance</option>
                    <option value="behavior">Behavior</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Award Level</label>
                  <select
                    value={newAchievement.award_level}
                    onChange={(e) => setNewAchievement({...newAchievement, award_level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="school">School</option>
                    <option value="district">District</option>
                    <option value="regional">Regional</option>
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Title</label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Best Student Award"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Achievement details..."
                ></textarea>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Achievement Date</label>
                <input
                  type="date"
                  value={newAchievement.achievement_date}
                  onChange={(e) => setNewAchievement({...newAchievement, achievement_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addAchievement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Achievement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAchievements;
