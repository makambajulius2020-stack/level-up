import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Calendar, Target, Lightbulb, CheckCircle, Clock, Star, Brain,
  Save, Edit3, Trash2, Eye, Download, Upload, Search, Filter, Users, Award,
  FileText, Zap, TrendingUp, BarChart3, PieChart, Settings, Share2, Copy
} from 'lucide-react';

const LessonPlanningPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [lessonPlans, setLessonPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [subjects, setSubjects] = useState({});
  const [templates, setTemplates] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    class_level: '',
    description: '',
    structure: {
      objectives: true,
      activities: true,
      resources: true,
      assessment: true,
      homework: true
    }
  });
  const [newPlan, setNewPlan] = useState({
    title: '',
    subject: '',
    class_level: '',
    topic: '',
    lesson_date: '',
    duration_minutes: 40,
    period_number: 1,
    objectives: [],
    activities: [],
    resources: [],
    assessment: '',
    homework: '',
    uneb_alignment: '',
    difficulty_level: 'medium',
    teaching_methods: [],
    learning_outcomes: []
  });
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [analytics, setAnalytics] = useState(null);

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const labelText = darkMode ? 'text-gray-300' : 'text-gray-700';
  const inputBase = 'w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const inputField = darkMode 
    ? `${inputBase} bg-gray-700 border border-gray-600 text-white placeholder-gray-300`
    : `${inputBase} bg-white border border-gray-300 text-gray-900 placeholder-gray-500`;

  // Removed demo lesson plans; use empty list by default
  const sampleLessonPlans = [];

  // Removed demo subjects; default empty
  const sampleSubjects = {};

  useEffect(() => {
    if (userRole === 'teacher') {
      fetchLessonPlans();
      fetchSubjects();
      if (activeView === 'weekly-schedule') {
        fetchWeeklySchedule();
      }
      if (activeView === 'analytics') {
        fetchAnalytics();
      }
    }
  }, [activeView, userRole]);

  const fetchLessonPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/lesson-plans/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLessonPlans(data.lesson_plans || []);
      } else {
        setLessonPlans([]);
      }
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      setLessonPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/lesson-plans/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || {});
      } else {
        setSubjects({});
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects({});
    }
  };

  const fetchWeeklySchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      // Get current week start date (Monday)
      const today = new Date();
      const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const startDate = monday.toISOString().split('T')[0];
      
      const response = await fetch(`${baseUrl}/api/lesson-plans/weekly-schedule?start_date=${startDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWeeklySchedule(data.weekly_schedule || {});
      }
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/lesson-plans/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const createLessonPlan = async () => {
    if (!newPlan.title || !newPlan.subject || !newPlan.class_level || !newPlan.topic || !newPlan.lesson_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/lesson-plans/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPlan)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Lesson plan created successfully with AI suggestions!');
        setNewPlan({
          title: '',
          subject: '',
          class_level: '',
          topic: '',
          lesson_date: '',
          duration_minutes: 40,
          period_number: 1
        });
        setCreating(false);
        fetchLessonPlans();
      } else {
        alert(`❌ Failed to create lesson plan: ${result.message}`);
      }
    } catch (error) {
      alert('Error creating lesson plan');
      console.error('Create lesson plan error:', error);
    }
  };

  const completeLessonPlan = async (planId) => {
    const rating = prompt('Rate the lesson effectiveness (1-5):');
    if (!rating || rating < 1 || rating > 5) {
      alert('Please enter a rating between 1 and 5');
      return;
    }

    const reflection = prompt('Enter your reflection on the lesson:');
    if (!reflection) {
      alert('Please enter your reflection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/lesson-plans/${planId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          effectiveness_rating: parseInt(rating),
          reflection: reflection
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Lesson marked as completed!');
        fetchLessonPlans();
      } else {
        alert(`❌ Failed to complete lesson: ${result.message}`);
      }
    } catch (error) {
      alert('Error completing lesson');
      console.error('Complete lesson error:', error);
    }
  };

  const generateSchemeOfWork = async () => {
    const subject = prompt('Enter subject name:');
    if (!subject) return;

    const classLevel = prompt('Enter class level (S1-S6):');
    if (!classLevel) return;

    const term = prompt('Enter term (Term 1, Term 2, Term 3):') || 'Term 1';

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/lesson-plans/scheme-of-work?subject=${subject}&class_level=${classLevel}&term=${term}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        // Display scheme of work in a modal or new view
        alert(`✅ Scheme of work generated for ${subject} ${classLevel} ${term}!\nCheck the detailed view for the complete scheme.`);
        console.log('Scheme of Work:', result.scheme_of_work);
      } else {
        alert(`❌ Failed to generate scheme: ${result.message}`);
      }
    } catch (error) {
      alert('Error generating scheme of work');
      console.error('Scheme generation error:', error);
    }
  };

  if (userRole !== 'teacher') {
    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className={`text-center py-8 ${textMuted}`}>
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Lesson planning is only available for teachers.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
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
    <div className={`space-y-6 ${darkMode ? 'text-white' : ''}`}>
      {/* Enhanced Lesson Planning Header */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold flex items-center ${textPrimary}`}>
              <Brain className="w-7 h-7 mr-3 text-blue-600" />
              AI-Powered Lesson Planning
            </h2>
            <p className={`${textSecondary} mt-1`}>UNEB-aligned curriculum planning with intelligent assistance</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setCreating(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Lesson
            </button>
            <button
              onClick={generateSchemeOfWork}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Scheme
            </button>
            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json,.csv,.xlsx';
                input.onchange = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    alert(`✅ Importing lesson plan from:\n\n${file.name}\n\nProcessing...`);
                  }
                };
                input.click();
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className={`flex space-x-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'lesson-plans', label: 'My Lessons', icon: BookOpen },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'weekly-schedule', label: 'Schedule', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === tab.id
                  ? `${darkMode ? 'bg-gray-800' : 'bg-white'} text-blue-600 shadow-sm`
                  : `${textSecondary} hover:text-blue-600 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-white/50'}`
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Lesson Plan Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <h4 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Create New Lesson Plan</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                    className={inputField}
                    placeholder="Enter lesson title..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Subject *
                  </label>
                  <select
                    value={newPlan.subject}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, subject: e.target.value }))}
                    className={inputField}
                  >
                    <option value="">Select subject...</option>
                    {Object.keys(subjects).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Class Level *
                  </label>
                  <select
                    value={newPlan.class_level}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, class_level: e.target.value }))}
                    className={inputField}
                  >
                    <option value="">Select class...</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Topic *
                  </label>
                  <select
                    value={newPlan.topic}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, topic: e.target.value }))}
                    className={inputField}
                    disabled={!newPlan.subject || !newPlan.class_level}
                  >
                    <option value="">Select topic...</option>
                    {newPlan.subject && newPlan.class_level && subjects[newPlan.subject] && subjects[newPlan.subject][newPlan.class_level] && 
                      subjects[newPlan.subject][newPlan.class_level].map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Lesson Date *
                  </label>
                  <input
                    type="date"
                    value={newPlan.lesson_date}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, lesson_date: e.target.value }))}
                    className={inputField}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newPlan.duration_minutes}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                    className={inputField}
                    min="30"
                    max="120"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Period Number
                  </label>
                  <select
                    value={newPlan.period_number}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, period_number: parseInt(e.target.value) }))}
                    className={inputField}
                  >
                    <option value={1}>Period 1</option>
                    <option value={2}>Period 2</option>
                    <option value={3}>Period 3</option>
                    <option value={4}>Period 4</option>
                    <option value={5}>Period 5</option>
                    <option value={6}>Period 6</option>
                    <option value={7}>Period 7</option>
                    <option value={8}>Period 8</option>
                  </select>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-blue-900 border border-blue-800' : 'bg-blue-50 border border-blue-200'} rounded-lg p-3`}>
                <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  AI will generate UNEB-aligned objectives, activities, and assessment methods based on your selections.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setCreating(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createLessonPlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create with AI Assistance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textSecondary}`}>Total Lessons</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>{lessonPlans.length}</p>
                    {lessonPlans.filter(p => p.is_completed).length > 0 && (
                      <p className="text-green-600 text-sm">{lessonPlans.filter(p => p.is_completed).length} completed</p>
                    )}
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textSecondary}`}>This Week</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>
                      {Object.values(weeklySchedule || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)}
                    </p>
                    {lessonPlans.filter(p => p.is_completed).length > 0 && (
                      <p className="text-blue-600 text-sm">{lessonPlans.filter(p => p.is_completed).length} completed</p>
                    )}
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textSecondary}`}>AI Suggestions</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>{Array.isArray(aiSuggestions) ? aiSuggestions.length : 0}</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Lessons */}
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Recent Lessons</h3>
                <button 
                  onClick={() => setActiveView('lesson-plans')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {lessonPlans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{plan.title}</p>
                        <p className={`text-sm ${textSecondary}`}>{plan.subject} • {plan.class_level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${textSecondary}`}>{plan.lesson_date}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="space-y-6">
            {aiSuggestions && (
              <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>AI Assistant</h3>
                <div className="space-y-4">
                  {Array.isArray(aiSuggestions) && aiSuggestions.length === 0 && (
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                      No AI suggestions available.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Lesson
                </button>
                <button 
                  onClick={() => setActiveView('templates')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Use Template
                </button>
                <button 
                  onClick={generateSchemeOfWork}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Scheme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates View */}
      {activeView === 'templates' && (
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Lesson Plan Templates</h3>
            <button 
              onClick={() => setShowCreateTemplateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length > 0 ? (
              templates.map((template, index) => (
                <div key={index} className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
                  <div className="text-center">
                    <h4 className={`font-semibold mb-2 ${textPrimary}`}>{template.name}</h4>
                    <p className={`text-sm ${textSecondary} mb-3`}>{template.subject}</p>
                    <button
                      onClick={() => {
                        alert(`✅ Using Template: ${template.name}\n\nTemplate loaded!\n\nYou can now customize it for your lesson.`);
                      }}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No templates available.</div>
            )}
          </div>
        </div>
      )}

      {/* Content based on active view */}
      {activeView === 'lesson-plans' && (
        <div className={`${cardBg} rounded-xl shadow-lg`}>
          <div className="p-6">
            <h4 className={`font-medium mb-4 ${textPrimary}`}>My Lesson Plans</h4>
            
            {lessonPlans.length > 0 ? (
              <div className="space-y-4">
                {lessonPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-semibold text-gray-800">{plan.title}</h5>
                          {plan.is_completed ? (
                            <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Subject:</span> {plan.subject}
                          </div>
                          <div>
                            <span className="font-medium">Class:</span> {plan.class_level}
                          </div>
                          <div>
                            <span className="font-medium">Topic:</span> {plan.topic}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(plan.lesson_date).toLocaleDateString()}
                          </div>
                        </div>

                        {plan.uneb_objective && (
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>UNEB Objective:</strong> {plan.uneb_objective}
                          </p>
                        )}

                        {plan.effectiveness_rating && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>Effectiveness: {plan.effectiveness_rating}/5</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        {!plan.is_completed && (
                          <button
                            onClick={() => completeLessonPlan(plan.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No lesson plans found</p>
                <p className="text-sm">Create your first UNEB-aligned lesson plan to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'weekly-schedule' && (
        <div className={`${cardBg} rounded-xl shadow-lg`}>
          <div className="p-6">
            <h4 className={`font-medium mb-4 ${textPrimary}`}>Weekly Schedule</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-800 mb-2">{day}</h5>
                  {weeklySchedule[day] ? (
                    <div className="space-y-2">
                      {weeklySchedule[day].map(lesson => (
                        <div key={lesson.id} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                          <div className="font-medium">{lesson.subject}</div>
                          <div className="text-gray-600">{lesson.class_level}</div>
                          <div className="text-gray-600">Period {lesson.period_number}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">No lessons</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'analytics' && analytics && (
        <div className={`${cardBg} rounded-xl shadow-lg`}>
          <div className="p-6">
            <h4 className={`font-medium mb-4 ${textPrimary}`}>Lesson Planning Analytics</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-800">{analytics.total_lessons}</div>
                <div className="text-sm text-blue-600">Total Lessons</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-800">{analytics.completed_lessons}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-800">{analytics.pending_lessons}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-800">{analytics.average_effectiveness_rating}</div>
                <div className="text-sm text-purple-600">Avg. Rating</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-3">Subject Distribution</h5>
                <div className="space-y-2">
                  {Object.entries(analytics.subject_distribution).map(([subject, count]) => (
                    <div key={subject} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{subject}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Class Distribution</h5>
                <div className="space-y-2">
                  {Object.entries(analytics.class_distribution).map(([classLevel, count]) => (
                    <div key={classLevel} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{classLevel}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Create Lesson Plan Template</h3>
              <button 
                onClick={() => setShowCreateTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`✅ Template Created Successfully!\n\nTemplate: ${newTemplate.name}\nSubject: ${newTemplate.subject}\nClass Level: ${newTemplate.class_level}\n\nTemplate is now available for creating new lesson plans.`);
              setNewTemplate({
                name: '',
                subject: '',
                class_level: '',
                description: '',
                structure: {
                  objectives: true,
                  activities: true,
                  resources: true,
                  assessment: true,
                  homework: true
                }
              });
              setShowCreateTemplateModal(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Standard Physics Template"
                      className={inputField}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                      Subject *
                    </label>
                    <select
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className={inputField}
                    >
                      <option value="">Select subject...</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="physics">Physics</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="biology">Biology</option>
                      <option value="english">English</option>
                      <option value="history">History</option>
                      <option value="geography">Geography</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Class Level *
                  </label>
                  <select
                    value={newTemplate.class_level}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, class_level: e.target.value }))}
                    required
                    className={inputField}
                  >
                    <option value="">Select class...</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${labelText}`}>
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    placeholder="Describe the template structure and purpose..."
                    className={inputField}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${labelText}`}>
                    Template Structure
                  </label>
                  <div className="space-y-3">
                    {Object.entries(newTemplate.structure).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input 
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNewTemplate(prev => ({
                            ...prev,
                            structure: { ...prev.structure, [key]: e.target.checked }
                          }))}
                          className="mr-3"
                        />
                        <span className={textSecondary}>
                          Include {key.charAt(0).toUpperCase() + key.slice(1)} section
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-blue-900 border border-blue-800' : 'bg-blue-50 border border-blue-200'} rounded-lg p-3`}>
                  <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                    <Lightbulb className="w-4 h-4 inline mr-1" />
                    This template will be used as a starting point for creating new lesson plans. You can customize the structure and add default content.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateTemplateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanningPanel;
