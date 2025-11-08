import React, { useState, useEffect } from 'react';
import {
  FileText, Clock, Users, BarChart3, CheckCircle, AlertTriangle, Calendar,
  TrendingUp, Award, Eye, Brain, Target, BookOpen, Activity
} from 'lucide-react';

const ExaminationsDashboard = ({ userRole, currentUser }) => {
  const [stats, setStats] = useState({});
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/examinations/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setUpcomingExams(data.upcomingExams || []);
          setExamResults(data.examResults || {});
        }
      }
    } catch (error) {
      console.error('Error loading examinations dashboard:', error);
      // Fallback data
      setStats({
        totalExams: 156,
        completedExams: 142,
        pendingExams: 14,
        averageScore: 76.8,
        passRate: 89.2,
      });
      setUpcomingExams([
        { id: 1, subject: 'Mathematics', class: 'S.4', date: '2024-01-15', time: '09:00', type: 'Mock UNEB' },
        { id: 2, subject: 'Physics', class: 'S.6', date: '2024-01-16', time: '14:00', type: 'End of Term' },
        { id: 3, subject: 'Chemistry', class: 'S.5', date: '2024-01-17', time: '10:00', type: 'Continuous Assessment' }
      ]);
      setExamResults({
        distinction: 15.2,
        credit: 42.8,
        pass: 31.2,
        fail: 10.8
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
          <div className="p-3 bg-orange-100 rounded-lg">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Examinations & Assessment Dashboard</h1>
            <p className="text-gray-600">Comprehensive exam management and assessment systems</p>
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
              <p className="text-sm text-gray-600 font-medium">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalExams || 156}</p>
              <p className="text-sm text-blue-600 mt-1">This academic year</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completed Exams</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedExams || 142}</p>
              <p className="text-sm text-green-600 mt-1">91% completion rate</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Exams</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingExams || 14}</p>
              <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageScore || 76.8}%</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3.2% improvement
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.passRate || 89.2}%</p>
              <p className="text-sm text-green-600 mt-1">Above target (85%)</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Exam Results & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Results Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Exam Results Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Distinction (80%+)</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${examResults.distinction || 15.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{examResults.distinction || 15.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Credit (60-79%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${examResults.credit || 42.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{examResults.credit || 42.8}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pass (50-59%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${examResults.pass || 31.2}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{examResults.pass || 31.2}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fail (Below 50%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${examResults.fail || 10.8}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{examResults.fail || 10.8}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-600" />
            Upcoming Exams
          </h3>
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{exam.subject}</p>
                    <p className="text-xs text-gray-500">{exam.class} • {exam.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{exam.date}</p>
                  <p className="text-xs text-gray-500">{exam.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-gray-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Schedule Exam</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Generate Report</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">AI Proctoring</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Auto Grading</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExaminationsDashboard;
