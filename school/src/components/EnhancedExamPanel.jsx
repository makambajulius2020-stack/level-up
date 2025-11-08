import React, { useState } from 'react';
import { 
  BookOpen, Clock, Users, Award, Brain, Zap, CheckCircle, 
  AlertTriangle, FileText, Calendar, Settings, Eye, Download,
  Upload, Plus, Search, Filter, BarChart3, Target, Star
} from 'lucide-react';

const EnhancedExamPanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [examType, setExamType] = useState('multiple-choice');
  const [aiAssistance, setAiAssistance] = useState(true);

  const examTemplates = [];

  const recentExams = [];

  const renderExamCreation = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Create New Exam</h3>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">AI-Powered</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter exam title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Business Administration</option>
              <option>Accounting</option>
              <option>Computer Science</option>
              <option>Economics</option>
              <option>Marketing</option>
              <option>Finance</option>
              <option>Human Resource Management</option>
              <option>Information Technology</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Year 1</option>
              <option>Year 2</option>
              <option>Year 3</option>
              <option>Year 4</option>
              <option>Graduate</option>
              <option>Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="120"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['multiple-choice', 'essay', 'mixed'].map((type) => (
              <button
                key={type}
                onClick={() => setExamType(type)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  examType === type 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {type === 'multiple-choice' && 'Auto-graded questions'}
                  {type === 'essay' && 'Written responses'}
                  {type === 'mixed' && 'Both types combined'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {aiAssistance && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">AI Question Generation</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Number of Questions</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Difficulty Level</label>
                <select className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Topics</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Algebra, Calculus"
                />
              </div>
            </div>
            <button 
              onClick={() => {
                alert('🤖 AI Question Generation Started!\n\nGenerating questions based on:\n- Subject: ' + (document.querySelector('select')?.value || 'Selected subject') + '\n- Number of questions: 20\n- Difficulty: Mixed\n\nThis will take a few moments...');
              }}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Questions with AI
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button 
            onClick={() => {
              alert('✅ Exam saved as draft!\n\nYou can continue editing later from the Drafts section.');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => {
              const examTitle = document.querySelector('input[placeholder*="exam"]')?.value || 'New Exam';
              alert(`✅ Exam Created Successfully!\n\nExam: ${examTitle}\nStatus: Published\n\nStudents can now access this exam.`);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Exam
          </button>
        </div>
      </div>
    </div>
  );

  const renderExamTemplates = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Exam Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span>{template.questions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{template.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    template.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                    template.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {template.difficulty}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGrading = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Exams</h3>
        <div className="space-y-4">
          {recentExams.map((exam) => (
            <div key={exam.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{exam.title}</h4>
                <p className="text-sm text-gray-600">{exam.class} • {exam.date} • {exam.students} students</p>
              </div>
              <div className="flex items-center space-x-4">
                {exam.average && (
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{exam.average}%</div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                )}
                <span className={`px-3 py-1 text-sm font-medium rounded ${
                  exam.status === 'graded' ? 'bg-green-100 text-green-800' :
                  exam.status === 'grading' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {exam.status}
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Management</h1>
        <p className="text-gray-600">Create, manage, and grade exams with AI assistance</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'create', label: 'Create Exam', icon: Plus },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'grading', label: 'Grading', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'create' && renderExamCreation()}
      {activeTab === 'templates' && renderExamTemplates()}
      {activeTab === 'grading' && renderGrading()}
    </div>
  );
};

export default EnhancedExamPanel;
