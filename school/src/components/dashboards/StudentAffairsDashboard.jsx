import React, { useState, useEffect } from 'react';
import {
  Award, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Activity,
  Eye, Settings, BarChart3, FileText, Star, Target, MessageSquare
} from 'lucide-react';

const StudentAffairsDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [clubPerformance, setClubPerformance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/student-affairs/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentActivities(data.recentActivities || []);
          setClubPerformance(data.clubPerformance || {});
        }
      }
    } catch (error) {
      console.error('Error loading student affairs dashboard:', error);
      // Fallback data
      setStats({
        totalStudents: 1200,
        activeClubs: 15,
        totalEvents: 28,
        leadershipRoles: 45,
        volunteerHours: 1250,
        participationRate: 85.2
      });
      setRecentActivities([
        { id: 1, type: 'event', message: 'Science Club organized lab visit', time: '2 hours ago', status: 'completed' },
        { id: 2, type: 'leadership', message: 'New student council elections', time: '4 hours ago', status: 'ongoing' },
        { id: 3, type: 'volunteer', message: 'Community service project completed', time: '1 day ago', status: 'success' }
      ]);
      setClubPerformance({
        scienceClub: 92.5,
        dramaClub: 88.3,
        sportsClub: 95.1,
        musicClub: 89.7,
        debateClub: 91.2,
        artClub: 87.8
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'ongoing': return 'text-blue-600 bg-blue-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'ongoing': return <Activity className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-100 rounded-lg">
            <Award className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Affairs & Clubs Dashboard</h1>
            <p className="text-gray-600">Student activities, clubs, leadership, and extracurricular programs</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated:</span>
          <span className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents || 1200}</p>
              <p className="text-sm text-blue-600 mt-1">In activities</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Clubs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeClubs || 15}</p>
              <p className="text-sm text-green-600 mt-1">Student clubs</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvents || 28}</p>
              <p className="text-sm text-purple-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Leadership Roles</p>
              <p className="text-3xl font-bold text-gray-900">{stats.leadershipRoles || 45}</p>
              <p className="text-sm text-yellow-600 mt-1">Student leaders</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Volunteer Hours</p>
              <p className="text-3xl font-bold text-gray-900">{stats.volunteerHours || 1250}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2% increase
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Participation Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.participationRate || 85.2}%</p>
              <p className="text-sm text-green-600 mt-1">High engagement</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Club Performance & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Club Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Club Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Science Club</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${clubPerformance.scienceClub || 92.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{clubPerformance.scienceClub || 92.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Drama Club</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${clubPerformance.dramaClub || 88.3}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{clubPerformance.dramaClub || 88.3}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sports Club</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${clubPerformance.sportsClub || 95.1}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{clubPerformance.sportsClub || 95.1}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Music Club</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${clubPerformance.musicClub || 89.7}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{clubPerformance.musicClub || 89.7}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Debate Club</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${clubPerformance.debateClub || 91.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{clubPerformance.debateClub || 91.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Art Club</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${clubPerformance.artClub || 87.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{clubPerformance.artClub || 87.8}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
            <Award className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-medium text-rose-900">Create Club</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Schedule Event</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Activity Report</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Student Feedback</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAffairsDashboard;
