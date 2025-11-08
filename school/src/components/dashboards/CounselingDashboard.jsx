import React, { useState, useEffect } from 'react';
import {
  Heart, Users, MessageSquare, TrendingUp, AlertTriangle, CheckCircle,
  Calendar, FileText, Activity, Eye, Settings, BarChart3, Clock
} from 'lucide-react';

const CounselingDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentSessions, setRecentSessions] = useState([]);
  const [behaviorData, setBehaviorData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/counseling/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentSessions(data.recentSessions || []);
          setBehaviorData(data.behaviorData || {});
        }
      }
    } catch (error) {
      console.error('Error loading counseling dashboard:', error);
      // Fallback data
      setStats({
        totalStudents: 1200,
        activeCases: 45,
        resolvedCases: 28,
        pendingSessions: 12,
        averageSessions: 3.2,
        improvementRate: 78.5
      });
      setRecentSessions([
        { id: 1, student: 'John Doe', type: 'Academic Support', date: '2024-01-15', status: 'completed' },
        { id: 2, student: 'Jane Smith', type: 'Behavioral', date: '2024-01-14', status: 'scheduled' },
        { id: 3, student: 'Mike Johnson', type: 'Emotional Support', date: '2024-01-13', status: 'completed' }
      ]);
      setBehaviorData({
        excellent: 65.2,
        good: 25.8,
        needsAttention: 7.5,
        critical: 1.5
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Heart className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guidance & Counseling Dashboard</h1>
            <p className="text-gray-600">Student welfare, counseling, and behavioral support</p>
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
              <p className="text-sm text-blue-600 mt-1">Under guidance</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeCases || 45}</p>
              <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolved Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resolvedCases || 28}</p>
              <p className="text-sm text-green-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingSessions || 12}</p>
              <p className="text-sm text-orange-600 mt-1">Scheduled</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Average Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageSessions || 3.2}</p>
              <p className="text-sm text-purple-600 mt-1">Per student</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Improvement Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.improvementRate || 78.5}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5.2% improvement
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Behavior Analysis & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Behavior Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Student Behavior Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Excellent</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${behaviorData.excellent || 65.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{behaviorData.excellent || 65.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Good</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${behaviorData.good || 25.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{behaviorData.good || 25.8}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Needs Attention</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${behaviorData.needsAttention || 7.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{behaviorData.needsAttention || 7.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${behaviorData.critical || 1.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{behaviorData.critical || 1.5}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-red-600" />
            Recent Sessions
          </h3>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.student}</p>
                    <p className="text-xs text-gray-500">{session.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{session.date}</p>
                  <p className={`text-xs ${getStatusColor(session.status)}`}>{session.status}</p>
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
          <button className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Schedule Session</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Case Report</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Behavior Analysis</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Progress Tracking</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounselingDashboard;
