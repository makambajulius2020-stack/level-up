import React, { useState, useEffect } from 'react';
import {
  Activity, Trophy, Users, Calendar, TrendingUp, Award, Clock,
  CheckCircle, AlertTriangle, Target, Eye, Settings, BarChart3, Star
} from 'lucide-react';

const SportsDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sports/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setUpcomingEvents(data.upcomingEvents || []);
          setTeamPerformance(data.teamPerformance || {});
        }
      }
    } catch (error) {
      console.error('Error loading sports dashboard:', error);
      // Fallback data
      setStats({
        totalStudents: 450,
        activeTeams: 12,
        totalEvents: 28,
        wins: 18,
        participationRate: 85.2,
        injuries: 3
      });
      setUpcomingEvents([
        { id: 1, sport: 'Football', event: 'Inter-school Match', date: '2024-01-20', time: '14:00', venue: 'School Field' },
        { id: 2, sport: 'Basketball', event: 'District Tournament', date: '2024-01-25', time: '10:00', venue: 'District Stadium' },
        { id: 3, sport: 'Athletics', event: 'Track & Field', date: '2024-01-30', time: '09:00', venue: 'School Track' }
      ]);
      setTeamPerformance({
        football: 85.2,
        basketball: 78.9,
        volleyball: 82.1,
        athletics: 88.5,
        tennis: 75.3
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Activity className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Games & Sports Dashboard</h1>
            <p className="text-gray-600">Sports activities, physical education, and athletic programs</p>
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
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents || 450}</p>
              <p className="text-sm text-blue-600 mt-1">In sports programs</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Teams</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeTeams || 12}</p>
              <p className="text-sm text-green-600 mt-1">Competitive teams</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvents || 28}</p>
              <p className="text-sm text-purple-600 mt-1">This season</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Wins</p>
              <p className="text-3xl font-bold text-gray-900">{stats.wins || 18}</p>
              <p className="text-sm text-green-600 mt-1">64% win rate</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Participation Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.participationRate || 85.2}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3.2% improvement
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
              <p className="text-sm text-gray-600 font-medium">Injuries</p>
              <p className="text-3xl font-bold text-gray-900">{stats.injuries || 3}</p>
              <p className="text-sm text-orange-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Team Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Football</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${teamPerformance.football || 85.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{teamPerformance.football || 85.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Basketball</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${teamPerformance.basketball || 78.9}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{teamPerformance.basketball || 78.9}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Volleyball</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${teamPerformance.volleyball || 82.1}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{teamPerformance.volleyball || 82.1}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Athletics</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${teamPerformance.athletics || 88.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{teamPerformance.athletics || 88.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tennis</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${teamPerformance.tennis || 75.3}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{teamPerformance.tennis || 75.3}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Activity className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.sport} • {event.venue}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{event.date}</p>
                  <p className="text-xs text-gray-500">{event.time}</p>
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
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
            <Activity className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Schedule Event</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Team Selection</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Performance</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Training</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SportsDashboard;
