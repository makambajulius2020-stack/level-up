import React, { useState, useEffect } from 'react';
import {
  Utensils, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, Activity,
  Eye, Settings, BarChart3, Calendar, FileText, ShoppingCart, Heart
} from 'lucide-react';

const CateringDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [mealDistribution, setMealDistribution] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/catering/dashboard', {
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
          setMealDistribution(data.mealDistribution || {});
        }
      }
    } catch (error) {
      console.error('Error loading catering dashboard:', error);
      // Fallback data
      setStats({
        totalStudents: 1200,
        mealsServed: 3600,
        dailyMeals: 1200,
        budgetUsed: 78.5,
        foodWaste: 5.2,
        satisfactionRate: 92.8
      });
      setRecentActivities([
        { id: 1, type: 'meal', message: 'Breakfast served to 400 students', time: '2 hours ago', status: 'success' },
        { id: 2, type: 'supply', message: 'Food supplies delivered', time: '4 hours ago', status: 'info' },
        { id: 3, type: 'waste', message: 'Food waste reduced by 2%', time: '1 day ago', status: 'success' }
      ]);
      setMealDistribution({
        breakfast: 400,
        lunch: 450,
        dinner: 350,
        snacks: 200
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Utensils className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catering & Nutrition Dashboard</h1>
            <p className="text-gray-600">Food services, nutrition planning, and meal management</p>
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
              <p className="text-sm text-blue-600 mt-1">Meal recipients</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Meals Served</p>
              <p className="text-3xl font-bold text-gray-900">{stats.mealsServed || 3600}</p>
              <p className="text-sm text-green-600 mt-1">This week</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Utensils className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Daily Meals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.dailyMeals || 1200}</p>
              <p className="text-sm text-purple-600 mt-1">Today</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Budget Used</p>
              <p className="text-3xl font-bold text-gray-900">{stats.budgetUsed || 78.5}%</p>
              <p className="text-sm text-yellow-600 mt-1">Monthly budget</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Food Waste</p>
              <p className="text-3xl font-bold text-gray-900">{stats.foodWaste || 5.2}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                -2.1% reduction
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Satisfaction Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.satisfactionRate || 92.8}%</p>
              <p className="text-sm text-green-600 mt-1">Student satisfaction</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Heart className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Meal Distribution & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Daily Meal Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Breakfast</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(mealDistribution.breakfast || 400) / (stats.totalStudents || 1200) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{mealDistribution.breakfast || 400}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lunch</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(mealDistribution.lunch || 450) / (stats.totalStudents || 1200) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{mealDistribution.lunch || 450}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dinner</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(mealDistribution.dinner || 350) / (stats.totalStudents || 1200) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{mealDistribution.dinner || 350}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Snacks</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(mealDistribution.snacks || 200) / (stats.totalStudents || 1200) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{mealDistribution.snacks || 200}</span>
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
          <button className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
            <Utensils className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">Meal Planning</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Order Supplies</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Nutrition Report</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Heart className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Dietary Plans</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CateringDashboard;
