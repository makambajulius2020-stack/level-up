import React, { useState, useEffect } from 'react';
import { Calendar, Users, Award, Clock, MapPin, Star, Trophy, Target } from 'lucide-react';

const ActivitiesPanel = ({ userRole, currentUser }) => {
  const [activities, setActivities] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('available');

  useEffect(() => {
    fetchActivities();
  }, [activeView]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      if (activeView === 'available') {
        const response = await fetch(`${baseUrl}/api/activities/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        } else {
          setActivities([]);
        }
      } else {
        const response = await fetch(`${baseUrl}/api/activities/my-activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setMyActivities(data.activities || []);
        } else {
          setMyActivities([]);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      if (activeView === 'available') {
        setActivities([]);
      } else {
        setMyActivities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const joinActivity = async (activityId) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/activities/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activity_id: activityId })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Successfully joined the activity!');
        fetchActivities();
      } else {
        alert(`❌ Failed to join activity: ${result.message}`);
      }
    } catch (error) {
      alert('Error joining activity');
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
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Co-curricular Activities
          </h3>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveView('available')}
            className={`pb-2 px-1 ${
              activeView === 'available'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Available Activities
          </button>
          
          <button
            onClick={() => setActiveView('my-activities')}
            className={`pb-2 px-1 ${
              activeView === 'my-activities'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Star className="w-4 h-4 inline mr-1" />
            My Activities
          </button>
        </div>
      </div>

      {/* Available Activities */}
      {activeView === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{activity.name}</h4>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {activity.category}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.status === 'active' ? 'bg-green-100 text-green-800' :
                  activity.status === 'recruiting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{activity.description}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{activity.schedule}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{activity.current_participants}/{activity.max_participants} participants</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Teacher In-charge:</p>
                <p className="text-sm text-gray-600">{activity.teacher_incharge}</p>
              </div>

              {activity.achievements && activity.achievements.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recent Achievements:</p>
                  <div className="flex flex-wrap gap-1">
                    {activity.achievements.slice(0, 2).map((achievement, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activity.next_event && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Next Event:</p>
                  <p className="text-sm text-blue-600">{activity.next_event}</p>
                </div>
              )}

              <button
                onClick={() => joinActivity(activity.id)}
                disabled={activity.current_participants >= activity.max_participants}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  activity.current_participants >= activity.max_participants
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {activity.current_participants >= activity.max_participants ? 'Full' : 'Join Activity'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My Activities */}
      {activeView === 'my-activities' && (
        <div className="space-y-6">
          {myActivities.length > 0 ? (
            myActivities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{activity.activity_name}</h4>
                    <p className="text-sm text-gray-600">Role: {activity.role}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Joined Date:</p>
                    <p className="text-sm text-gray-600">{new Date(activity.joined_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Attendance Rate:</p>
                    <p className="text-sm text-gray-600">{activity.attendance_rate}%</p>
                  </div>
                </div>

                {activity.achievements && activity.achievements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">My Achievements:</p>
                    <div className="flex flex-wrap gap-1">
                      {activity.achievements.map((achievement, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          <Award className="w-3 h-3 inline mr-1" />
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activity.upcoming_events && activity.upcoming_events.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-1">Upcoming Events:</p>
                    {activity.upcoming_events.map((event, index) => (
                      <p key={index} className="text-sm text-green-600">{event}</p>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">No Activities Yet</h4>
              <p className="text-gray-600 mb-4">Join co-curricular activities to enhance your school experience!</p>
              <button
                onClick={() => setActiveView('available')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Activities
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">Activity Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-blue-700">Total Activities</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-green-700">Total Participants</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-yellow-700">Achievements</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-purple-700">Upcoming Events</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPanel;
