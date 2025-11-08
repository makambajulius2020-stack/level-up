import React, { useState, useEffect } from 'react';
import { FileText, Brain, Clock, Users, Target, CheckCircle, AlertTriangle, Plus, Eye, Download } from 'lucide-react';

const ExamPanel = ({ userRole, currentUser }) => {
  const [activeView, setActiveView] = useState('my-exams');
  const [exams, setExams] = useState([]);
  const [examTemplates, setExamTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    subject: '',
    year_level: '',
    duration: 120,
    total_marks: 100,
    exam_type: 'test',
    difficulty_level: 'medium',
    topics: [],
    question_types: {
      multiple_choice: 10,
      short_answer: 5,
      essay: 2
    },
    ai_generated: true,
    curriculum_aligned: true
  });

  // Removed demo sample data; only real data from backend or empty states

  useEffect(() => {
    fetchExams();
  }, [activeView]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      if (activeView === 'my-exams') {
        const response = await fetch(`${baseUrl}/api/exams/teacher`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setExams(data.exams || []);
        } else {
          setExams([]);
        }
      } else if (activeView === 'templates') {
        const response = await fetch(`${baseUrl}/api/exams/templates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setExamTemplates(data.templates || []);
        } else {
          setExamTemplates([]);
        }
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      if (activeView === 'my-exams') {
        setExams([]);
      } else {
        setExamTemplates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAIExam = async () => {
    if (!newExam.title || !newExam.subject || !newExam.year_level) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/exams/generate-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExam)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ AI-powered exam generated successfully!');
        setNewExam({
          title: '',
          subject: '',
          year_level: '',
          duration: 120,
          total_marks: 100,
          exam_type: 'test',
          difficulty_level: 'medium',
          topics: [],
          question_types: {
            multiple_choice: 10,
            short_answer: 5,
            essay: 2
          },
          ai_generated: true,
          curriculum_aligned: true
        });
        fetchExams();
      } else {
        alert(`❌ Failed to generate exam: ${result.message}`);
      }
    } catch (error) {
      console.error('Generate AI exam error:', error);
      alert('Failed to generate exam. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
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
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI-Powered Exam Management
          </h3>
          <button
            onClick={() => setActiveView('create')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create AI Exam
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveView('my-exams')}
            className={`pb-2 px-1 ${
              activeView === 'my-exams'
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            My Exams
          </button>

          <button
            onClick={() => setActiveView('create')}
            className={`pb-2 px-1 ${
              activeView === 'create'
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-1" />
            AI Generator
          </button>
        </div>
      </div>

      {/* My Exams View */}
      {activeView === 'my-exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{exam.title}</h4>
                  <p className="text-sm text-gray-600">{exam.subject} - {exam.year_level || exam.class_level}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {exam.ai_generated && (
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      AI Generated
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="text-gray-600 ml-1">{exam.duration} min</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Marks:</span>
                  <span className="text-gray-600 ml-1">{exam.total_marks}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Students:</span>
                  <span className="text-gray-600 ml-1">{exam.students_assigned}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submissions:</span>
                  <span className="text-gray-600 ml-1">{exam.submissions}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exam.difficulty_level)}`}>
                  {exam.difficulty_level} difficulty
                </span>
                {exam.curriculum_aligned && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full ml-2">
                    Curriculum Aligned
                  </span>
                )}
              </div>

              {exam.topics && exam.topics.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {exam.topics.map((topic, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {exam.ai_insights && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 mb-2">AI Insights:</p>
                  <div className="text-xs text-purple-700 space-y-1">
                    <p>• {exam.ai_insights.difficulty_distribution}</p>
                    <p>• Est. completion: {exam.ai_insights.estimated_completion_time}</p>
                    <p>• Curriculum coverage: {exam.ai_insights.curriculum_coverage}</p>
                  </div>
                </div>
              )}

              {exam.average_score && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Average Score: {exam.average_score}%
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates View */}
      {activeView === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{template.subject} - {template.year_level || template.class_level}</p>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Question Types:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.question_types.map((type, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Topics:</span>
                    <span className="text-gray-600 ml-1">{template.topics_covered}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="text-gray-600 ml-1">{template.estimated_duration}</span>
                  </div>
                </div>
                
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {template.curriculum_alignment} Curriculum Aligned
                  </p>
                </div>
              </div>
              
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create AI Exam View */}
      {activeView === 'create' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold mb-6 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Generate AI-Powered Exam
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                <input
                  type="text"
                  value={newExam.title}
                  onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Mathematics Mid-term Exam"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={newExam.subject}
                  onChange={(e) => setNewExam({...newExam, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Economics">Economics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Literature">Literature</option>
                  <option value="Sociology">Sociology</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                <select
                  value={newExam.year_level}
                  onChange={(e) => setNewExam({...newExam, year_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({...newExam, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={newExam.total_marks}
                    onChange={(e) => setNewExam({...newExam, total_marks: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                <select
                  value={newExam.exam_type}
                  onChange={(e) => setNewExam({...newExam, exam_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="test">Test</option>
                  <option value="mid-term">Mid-term Exam</option>
                  <option value="final">Final Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={newExam.difficulty_level}
                  onChange={(e) => setNewExam({...newExam, difficulty_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Distribution</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Multiple Choice:</span>
                    <input
                      type="number"
                      value={newExam.question_types.multiple_choice}
                      onChange={(e) => setNewExam({
                        ...newExam,
                        question_types: {
                          ...newExam.question_types,
                          multiple_choice: parseInt(e.target.value)
                        }
                      })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Short Answer:</span>
                    <input
                      type="number"
                      value={newExam.question_types.short_answer}
                      onChange={(e) => setNewExam({
                        ...newExam,
                        question_types: {
                          ...newExam.question_types,
                          short_answer: parseInt(e.target.value)
                        }
                      })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Essay:</span>
                    <input
                      type="number"
                      value={newExam.question_types.essay}
                      onChange={(e) => setNewExam({
                        ...newExam,
                        question_types: {
                          ...newExam.question_types,
                          essay: parseInt(e.target.value)
                        }
                      })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newExam.curriculum_aligned}
                    onChange={(e) => setNewExam({...newExam, curriculum_aligned: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Curriculum Aligned</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newExam.ai_generated}
                    onChange={(e) => setNewExam({...newExam, ai_generated: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">AI-Generated Questions</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setActiveView('my-exams')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={generateAIExam}
              disabled={creating}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Exam
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPanel;
