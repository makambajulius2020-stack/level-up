import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import AIInsightsPanel from './AIInsightsPanel';
import RequiredActions from './components/RequiredActions';
import TopPerformingStudents from './components/TopPerformingStudents';
import { 
  Users, User, Clock, DollarSign, UserPlus, CheckCircle, AlertTriangle,
  Settings, Shield, BarChart3, TrendingUp, Target, Bell, Calendar,
  BookOpen, GraduationCap, Fingerprint, FileText, Award, Activity,
  Database, Server, Globe, Lock, Eye, Edit, Trash2, Plus
} from 'lucide-react';

const AdminDashboard = ({ aiInsights, setActiveTab, darkMode = false }) => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    systemHealth: 'good',
    storageUsed: 0,
    lastBackup: null
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [adminActiveTab, setAdminActiveTab] = useState('overview'); // overview, management, analytics, system

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    loadSystemStats();
    loadRecentActivities();
    loadSystemAlerts();
  }, []);

  const loadSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/system-stats');
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.data);
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/recent-activities');
      const data = await response.json();
      if (data.success) {
        setRecentActivities(data.data || []);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const loadSystemAlerts = async () => {
    try {
      const response = await fetch('/api/admin/system-alerts');
      const data = await response.json();
      if (data.success) {
        setSystemAlerts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading system alerts:', error);
    }
  };

  return (
    <div className="space-y-6">
      <RequiredActions userRole="admin" setActiveTab={setActiveTab} darkMode={darkMode} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Students" value="0" icon={Users} trend="0%" color="blue" />
        <DashboardCard title="Active Teachers" value="0" icon={User} trend="0%" color="green" />
        <DashboardCard title="Attendance Rate" value="0%" icon={Clock} trend="0%" color="orange" />
        <DashboardCard title="Revenue (UGX)" value="0" icon={DollarSign} trend="0%" color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIInsightsPanel aiInsights={aiInsights} />
        <TopPerformingStudents userRole="admin" darkMode={darkMode} />
        <div className={`${cardBg} rounded-xl shadow-lg p-6 overflow-hidden`}>
          <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Recent Activities</h3>
          <div className="space-y-3">
            <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50'}`}>
              <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
              <div className="min-w-0">
                <p className={`text-sm font-medium ${textPrimary} truncate`}>New teacher registered</p>
                <p className={`text-xs ${textSecondary} break-words`}>0</p>
              </div>
            </div>
            <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50'}`}>
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div className="min-w-0">
                <p className={`text-sm font-medium ${textPrimary} truncate`}>Fees payment received</p>
                <p className={`text-xs ${textSecondary} break-words`}>UGX 0 via MTN Mobile Money</p>
              </div>
            </div>
            <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50'}`}>
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div className="min-w-0">
                <p className={`text-sm font-medium ${textPrimary} truncate`}>AI Alert: At-risk student</p>
                <p className={`text-xs ${textSecondary} break-words`}>0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
