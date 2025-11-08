import React, { useState } from 'react';
import { BookOpen, Brain, Download, Save, RefreshCw, Target, Clock, Users, CheckCircle, FileText, Lightbulb, Calendar } from 'lucide-react';

const UnitPlanGeneratorPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    yearLevel: '',
    duration: '',
    learningObjectives: '',
    standards: '',
    prerequisites: ''
  });
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPlans, setSavedPlans] = useState([
    {
      id: 1,
      title: 'Financial Accounting Principles',
      subject: 'Accounting',
      grade: 'Year 2',
      duration: '2 weeks',
      createdAt: '2024-09-28',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Database Management Systems',
      subject: 'Computer Science',
      grade: 'Year 3',
      duration: '3 weeks',
      createdAt: '2024-09-25',
      status: 'in_progress'
    }
  ]);

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const mockPlan = {
        title: formData.topic,
        subject: formData.subject,
        yearLevel: formData.yearLevel,
        duration: formData.duration,
        overview: `This unit plan covers ${formData.topic} for ${formData.yearLevel} students over ${formData.duration}. Students will explore key concepts through interactive activities and assessments.`,
        objectives: [
          `Understand the fundamental concepts of ${formData.topic}`,
          `Apply knowledge through practical exercises`,
          `Analyze real-world applications`,
          `Evaluate different perspectives and approaches`
        ],
        lessons: [
          {
            day: 1,
            title: `Introduction to ${formData.topic}`,
            duration: '40 minutes',
            activities: ['Opening discussion', 'Concept introduction', 'Initial assessment'],
            materials: ['Textbook', 'Whiteboard', 'Handouts'],
            assessment: 'Formative - Class participation'
          },
          {
            day: 2,
            title: `Core Concepts`,
            duration: '40 minutes',
            activities: ['Lecture', 'Group work', 'Practice exercises'],
            materials: ['Slides', 'Worksheets', 'Calculator'],
            assessment: 'Formative - Worksheet completion'
          },
          {
            day: 3,
            title: `Practical Application`,
            duration: '40 minutes',
            activities: ['Lab work', 'Experiments', 'Data collection'],
            materials: ['Lab equipment', 'Safety gear', 'Recording sheets'],
            assessment: 'Summative - Lab report'
          }
        ],
        assessments: [
          { type: 'Formative', description: 'Daily exit tickets', weight: '20%' },
          { type: 'Summative', description: 'Unit test', weight: '50%' },
          { type: 'Project', description: 'Research presentation', weight: '30%' }
        ],
        resources: [
          'UNEB Curriculum Guidelines',
          'Recommended textbooks',
          'Online resources and videos',
          'Supplementary materials'
        ]
      };
      
      setGeneratedPlan(mockPlan);
      setIsGenerating(false);
    }, 3000);
  };

  const handleSave = () => {
    if (generatedPlan) {
      const newPlan = {
        id: Date.now(),
        title: generatedPlan.title,
        subject: generatedPlan.subject,
        grade: generatedPlan.grade,
        duration: generatedPlan.duration,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'draft'
      };
      setSavedPlans([newPlan, ...savedPlans]);
      alert('Unit plan saved successfully!');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary}`}>AI Unit Plan Generator</h1>
              <p className={`${textSecondary} mt-2`}>Generate comprehensive unit plans aligned with UNEB standards</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Unit Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Course</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  >
                    <option value="">Select Course</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Economics">Economics</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resource Management">Human Resource Management</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Topic/Unit Title</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder="e.g., Financial Accounting, Database Management"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  />
                </div>

                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Year Level</label>
                  <select
                    value={formData.yearLevel}
                    onChange={(e) => setFormData({...formData, yearLevel: e.target.value})}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  >
                    <option value="">Select Year Level</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  >
                    <option value="">Select Duration</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3 weeks">3 weeks</option>
                    <option value="4 weeks">4 weeks</option>
                    <option value="1 month">1 month</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Learning Objectives</label>
                  <textarea
                    value={formData.learningObjectives}
                    onChange={(e) => setFormData({...formData, learningObjectives: e.target.value})}
                    placeholder="What should students learn?"
                    rows={3}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!formData.subject || !formData.topic || !formData.yearLevel || isGenerating}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Generate Unit Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Saved Plans */}
            <div className={`${cardBg} rounded-2xl shadow-xl p-6 mt-6`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-4`}>Saved Plans</h3>
              <div className="space-y-3">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className={`border rounded-lg p-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h4 className={`font-medium ${textPrimary}`}>{plan.title}</h4>
                    <p className={`text-sm ${textMuted}`}>{plan.subject} • {plan.grade} • {plan.duration}</p>
                    <p className={`text-xs ${textMuted}`}>Created: {plan.createdAt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Plan */}
          <div className="lg:col-span-2">
            {generatedPlan ? (
              <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${textPrimary}`}>{generatedPlan.title}</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSave}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className={`font-semibold ${textPrimary}`}>{generatedPlan.subject}</p>
                    <p className={`text-sm ${textMuted}`}>Course</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className={`font-semibold ${textPrimary}`}>{generatedPlan.yearLevel}</p>
                    <p className={`text-sm ${textMuted}`}>Year Level</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className={`font-semibold ${textPrimary}`}>{generatedPlan.duration}</p>
                    <p className={`text-sm ${textMuted}`}>Duration</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Overview */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Unit Overview</h4>
                    <p className={`${textSecondary}`}>{generatedPlan.overview}</p>
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Learning Objectives</h4>
                    <ul className="space-y-2">
                      {generatedPlan.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className={`${textSecondary}`}>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Lesson Plans */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Daily Lesson Plans</h4>
                    <div className="space-y-4">
                      {generatedPlan.lessons.map((lesson, index) => (
                        <div key={index} className={`border rounded-lg p-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`font-semibold ${textPrimary}`}>Day {lesson.day}: {lesson.title}</h5>
                            <span className={`text-sm ${textMuted}`}>{lesson.duration}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className={`font-medium ${textSecondary} mb-1`}>Activities:</p>
                              <ul className={`${textMuted} space-y-1`}>
                                {lesson.activities.map((activity, i) => (
                                  <li key={i}>• {activity}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className={`font-medium ${textSecondary} mb-1`}>Materials:</p>
                              <ul className={`${textMuted} space-y-1`}>
                                {lesson.materials.map((material, i) => (
                                  <li key={i}>• {material}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className={`font-medium ${textSecondary} mb-1`}>Assessment:</p>
                              <p className={`${textMuted}`}>{lesson.assessment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assessments */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Assessment Strategy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {generatedPlan.assessments.map((assessment, index) => (
                        <div key={index} className={`border rounded-lg p-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <h5 className={`font-semibold ${textPrimary} mb-2`}>{assessment.type}</h5>
                          <p className={`text-sm ${textSecondary} mb-2`}>{assessment.description}</p>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {assessment.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Resources & Materials</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {generatedPlan.resources.map((resource, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className={`${textSecondary}`}>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${cardBg} rounded-2xl shadow-xl p-8 text-center`}>
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>AI Unit Plan Generator</h3>
                <p className={`${textSecondary} mb-6`}>Fill in the details on the left and click "Generate Unit Plan" to create a comprehensive, UNEB-aligned unit plan.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className={`${textSecondary}`}>UNEB Standards Aligned</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className={`${textSecondary}`}>Detailed Lesson Plans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className={`${textSecondary}`}>Assessment Strategies</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitPlanGeneratorPanel;
