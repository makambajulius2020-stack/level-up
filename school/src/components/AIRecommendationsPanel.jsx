import React, { useState } from 'react';
import { 
  Brain, Zap, Target, TrendingUp, BookOpen, Clock, 
  Star, Award, AlertTriangle, CheckCircle, Eye, 
  MessageSquare, Calendar, Users, FileText, Download
} from 'lucide-react';

const AIRecommendationsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeCategory, setActiveCategory] = useState('academic');

  const recommendations = { academic: [], study: [], career: [], wellness: [] };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'improvement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'strength': return 'bg-green-100 text-green-800 border-green-200';
      case 'optimization': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'technique': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'opportunity': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'preparation': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'health': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'stress': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      case 'improvement': return <TrendingUp className="w-5 h-5" />;
      case 'strength': return <Star className="w-5 h-5" />;
      case 'optimization': return <Zap className="w-5 h-5" />;
      case 'technique': return <Brain className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      case 'preparation': return <Calendar className="w-5 h-5" />;
      case 'health': return <Clock className="w-5 h-5" />;
      case 'stress': return <Users className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const renderRecommendationCard = (rec) => (
    <div key={rec.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${getTypeColor(rec.type)}`}>
            {getTypeIcon(rec.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(rec.type)}`}>
              {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${getImpactColor(rec.impact)}`}>
            {rec.impact} Impact
          </div>
          <div className="text-xs text-gray-500">AI: {rec.aiConfidence}% confident</div>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{rec.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-sm">
          <span className="font-medium text-gray-600">Time Required:</span>
          <span className="ml-2 text-gray-900">{rec.timeRequired}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Difficulty:</span>
          <span className="ml-2 text-gray-900">{rec.difficulty}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Deadline:</span>
          <span className="ml-2 text-gray-900">{rec.deadline}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Progress:</span>
          <span className="ml-2 text-gray-900">{rec.progress}%</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-600">{rec.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${rec.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Action Steps:</h4>
          <ul className="space-y-1">
            {rec.actions.map((action, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Recommended Resources:</h4>
          <div className="flex flex-wrap gap-2">
            {rec.resources.map((resource, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                {resource}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            <Eye className="w-4 h-4 inline mr-1" />
            View Details
          </button>
          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
            <Download className="w-4 h-4 inline mr-1" />
            Save Plan
          </button>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors">
            Later
          </button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
            Start Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Recommendations</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Personalized insights and actionable recommendations powered by AI</p>
      </div>

      {/* AI Insights Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white mb-8 hidden">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8" />
          <h2 className="text-xl font-semibold">AI Analysis Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-purple-100 text-sm">Active Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-purple-100 text-sm">Urgent Actions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">89%</div>
            <div className="text-purple-100 text-sm">AI Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">+15%</div>
            <div className="text-purple-100 text-sm">Predicted Improvement</div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'academic', label: 'Academic', icon: BookOpen, count: 0 },
              { id: 'study', label: 'Study Methods', icon: Brain, count: 0 },
              { id: 'career', label: 'Career Guidance', icon: Target, count: 0 },
              { id: 'wellness', label: 'Wellness', icon: Users, count: 0 }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeCategory === category.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations[activeCategory]?.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center col-span-2">
            <p className="text-gray-600">No recommendations yet</p>
          </div>
        ) : (
          recommendations[activeCategory].map(renderRecommendationCard)
        )}
      </div>

      {/* AI Learning Note */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Zap className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">How AI Creates These Recommendations</h3>
        </div>
        <p className="text-blue-800 text-sm mb-3">
          Our AI analyzes your performance data, study patterns, attendance, assignment submissions, and test results 
          to generate personalized recommendations. The system continuously learns from your progress and adjusts 
          suggestions accordingly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">Performance Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">Learning Style Detection</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">Predictive Modeling</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationsPanel;
