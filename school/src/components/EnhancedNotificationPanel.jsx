import React, { useState, useEffect } from 'react';
import { 
  Bell, Clock, Calendar, BookOpen, Users, AlertTriangle, 
  CheckCircle, Mail, Smartphone, Settings, Eye, EyeOff,
  Video, MessageSquare, FileText, Award, GraduationCap,
  Filter, Search, MoreVertical, Trash2, Archive
} from 'lucide-react';
import NotificationService from '../services/NotificationService';

const EnhancedNotificationPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  
  const notificationService = NotificationService();
  const { 
    notifications, 
    settings, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    updateSettings,
    notificationTypes,
    channels
  } = notificationService;

  // Filter notifications based on current user and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesUser = notification.userId === currentUser?.id || 
                      notification.userRole === userRole;
    const matchesTab = activeTab === 'all' || notification.type === activeTab;
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         (filter === 'high' && notification.priority === 'high');
    const matchesSearch = searchTerm === '' || 
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesUser && matchesTab && matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case notificationTypes.ONLINE_LESSON:
        return <Video className="w-4 h-4 text-blue-600" />;
      case notificationTypes.ASSIGNMENT:
        return <FileText className="w-4 h-4 text-green-600" />;
      case notificationTypes.EVENT:
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case notificationTypes.TASK:
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      case notificationTypes.SCHEDULE:
        return <Clock className="w-4 h-4 text-indigo-600" />;
      case notificationTypes.FEE_REMINDER:
        return <Award className="w-4 h-4 text-red-600" />;
      case notificationTypes.EXAM:
        return <GraduationCap className="w-4 h-4 text-yellow-600" />;
      case notificationTypes.MEETING:
        return <Users className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case channels.EMAIL:
        return <Mail className="w-3 h-3 text-blue-500" />;
      case channels.SMS:
        return <Smartphone className="w-3 h-3 text-green-500" />;
      case channels.PUSH:
        return <Bell className="w-3 h-3 text-purple-500" />;
      case channels.SYSTEM:
        return <Settings className="w-3 h-3 text-gray-500" />;
      default:
        return <Bell className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return time.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'markRead':
        selectedNotifications.forEach(id => markAsRead(id));
        setSelectedNotifications([]);
        break;
      case 'delete':
        selectedNotifications.forEach(id => deleteNotification(id));
        setSelectedNotifications([]);
        break;
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: filteredNotifications.length },
    { id: notificationTypes.ONLINE_LESSON, label: 'Lessons', count: notifications.filter(n => n.type === notificationTypes.ONLINE_LESSON).length },
    { id: notificationTypes.ASSIGNMENT, label: 'Assignments', count: notifications.filter(n => n.type === notificationTypes.ASSIGNMENT).length },
    { id: notificationTypes.EVENT, label: 'Events', count: notifications.filter(n => n.type === notificationTypes.EVENT).length },
    { id: notificationTypes.TASK, label: 'Tasks', count: notifications.filter(n => n.type === notificationTypes.TASK).length },
  ];

  return (
    <div className={`max-w-6xl mx-auto p-6 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Stay updated with important school activities and reminders
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {unreadCount} unread
              </span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className={`rounded-xl shadow-lg p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="high">High Priority</option>
            </select>
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('markRead')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`rounded-xl shadow-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : darkMode 
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className={`rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeTab === 'all' ? 'All Notifications' : `${tabs.find(t => t.id === activeTab)?.label} Notifications`}
            </h3>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark All as Read
            </button>
          </div>

          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                    notification.read 
                      ? darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                      : getPriorityColor(notification.priority)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTime(notification.timestamp)}</span>
                          <div className="flex items-center space-x-1">
                            {getChannelIcon(notification.channel)}
                            <span>{notification.channel}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications([...selectedNotifications, notification.id]);
                          } else {
                            setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  No notifications found
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                  {searchTerm ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Notification Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'hover:text-gray-300' : ''}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notification Channels
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.email}
                      onChange={(e) => updateSettings({ email: e.target.checked })}
                      className="mr-3"
                    />
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Notifications
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.sms}
                      onChange={(e) => updateSettings({ sms: e.target.checked })}
                      className="mr-3"
                    />
                    <Smartphone className="w-4 h-4 mr-2 text-green-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      SMS Notifications
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.push}
                      onChange={(e) => updateSettings({ push: e.target.checked })}
                      className="mr-3"
                    />
                    <Bell className="w-4 h-4 mr-2 text-purple-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Push Notifications
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Online Lesson Reminders
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Before Start (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.onlineLessons.beforeStart}
                      onChange={(e) => updateSettings({
                        onlineLessons: {
                          ...settings.onlineLessons,
                          beforeStart: parseInt(e.target.value)
                        }
                      })}
                      className={`w-full p-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      After Start (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.onlineLessons.afterStart}
                      onChange={(e) => updateSettings({
                        onlineLessons: {
                          ...settings.onlineLessons,
                          afterStart: parseInt(e.target.value)
                        }
                      })}
                      className={`w-full p-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => setShowSettings(false)}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNotificationPanel;
