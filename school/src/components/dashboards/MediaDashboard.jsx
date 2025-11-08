import React, { useState, useEffect } from 'react';
import {
  Globe, Users, Eye, TrendingUp, AlertTriangle, CheckCircle, Activity,
  Settings, BarChart3, Calendar, FileText, Video, MessageSquare, Share2
} from 'lucide-react';

const MediaDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [engagementMetrics, setEngagementMetrics] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/media/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentPosts(data.recentPosts || []);
          setEngagementMetrics(data.engagementMetrics || {});
        }
      }
    } catch (error) {
      console.error('Error loading media dashboard:', error);
      // Fallback data
      setStats({
        totalPosts: 156,
        websiteViews: 12500,
        socialFollowers: 2800,
        videoViews: 45000,
        engagementRate: 78.5,
        contentApproval: 12
      });
      setRecentPosts([
        { id: 1, title: 'School Sports Day Highlights', type: 'Video', date: '2024-01-15', status: 'published', views: 1250 },
        { id: 2, title: 'Academic Excellence Awards', type: 'Article', date: '2024-01-14', status: 'pending', views: 0 },
        { id: 3, title: 'New Science Laboratory Opening', type: 'Photo', date: '2024-01-13', status: 'published', views: 890 }
      ]);
      setEngagementMetrics({
        website: 85.2,
        facebook: 78.9,
        instagram: 82.1,
        youtube: 88.5,
        twitter: 75.3
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-100 rounded-lg">
            <Globe className="w-8 h-8 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Public Relations & Media Dashboard</h1>
            <p className="text-gray-600">Communication, media management, and public relations</p>
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
              <p className="text-sm text-gray-600 font-medium">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPosts || 156}</p>
              <p className="text-sm text-blue-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Website Views</p>
              <p className="text-3xl font-bold text-gray-900">{stats.websiteViews || 12500}</p>
              <p className="text-sm text-green-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Social Followers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.socialFollowers || 2800}</p>
              <p className="text-sm text-purple-600 mt-1">Across platforms</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Video Views</p>
              <p className="text-3xl font-bold text-gray-900">{stats.videoViews || 45000}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2% growth
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Video className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Engagement Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.engagementRate || 78.5}%</p>
              <p className="text-sm text-green-600 mt-1">High engagement</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Content Approval</p>
              <p className="text-3xl font-bold text-gray-900">{stats.contentApproval || 12}</p>
              <p className="text-sm text-yellow-600 mt-1">Pending review</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics & Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Platform Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Website</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${engagementMetrics.website || 85.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{engagementMetrics.website || 85.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Facebook</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${engagementMetrics.facebook || 78.9}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{engagementMetrics.facebook || 78.9}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Instagram</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${engagementMetrics.instagram || 82.1}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{engagementMetrics.instagram || 82.1}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">YouTube</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${engagementMetrics.youtube || 88.5}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{engagementMetrics.youtube || 88.5}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Twitter</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${engagementMetrics.twitter || 75.3}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{engagementMetrics.twitter || 75.3}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-violet-600" />
            Recent Posts
          </h3>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Globe className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.title}</p>
                    <p className="text-xs text-gray-500">{post.type} • {post.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{post.views} views</p>
                  <p className={`text-xs ${getStatusColor(post.status)}`}>{post.status}</p>
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
          <button className="flex items-center space-x-3 p-4 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors">
            <Globe className="w-5 h-5 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">Create Post</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Video className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Upload Video</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Analytics</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Share2 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Social Media</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaDashboard;
