import React, { useState } from 'react';
import { 
  Upload, FileText, Calendar, Clock, CheckCircle, AlertTriangle, 
  Eye, Download, Send, X, Plus, Search, Filter, Star, Award,
  Brain, Zap, Target, BookOpen, Users, MessageSquare
} from 'lucide-react';

const EnhancedSubmitAssignmentPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const assignments = [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderSubmitAssignment = () => (
    <div className="space-y-6">
      {/* Assignment Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Select Assignment to Submit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.filter(a => a.status === 'pending' || a.status === 'draft').map((assignment) => (
            <div 
              key={assignment.id}
              onClick={() => setSelectedAssignment(assignment)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedAssignment?.id === assignment.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                <Star className={`w-4 h-4 ${getPriorityColor(assignment.priority)}`} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{assignment.subject} • {assignment.teacher}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Due: {assignment.dueDate}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(assignment.status)}`}>
                  {assignment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      {selectedAssignment && (
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Submit: {selectedAssignment.title}</h3>
            <button 
              onClick={() => setSelectedAssignment(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Assignment Details</h4>
            <p className="text-sm text-blue-800 mb-2">{selectedAssignment.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Due Date:</span> {selectedAssignment.dueDate} at {selectedAssignment.dueTime}
              </div>
              <div>
                <span className="font-medium">Max Marks:</span> {selectedAssignment.maxMarks}
              </div>
              {selectedAssignment.allowedFormats && (
                <div>
                  <span className="font-medium">Allowed Formats:</span> {selectedAssignment.allowedFormats.join(', ')}
                </div>
              )}
              {selectedAssignment.wordLimit && (
                <div>
                  <span className="font-medium">Word Limit:</span> {selectedAssignment.wordLimit} words
                </div>
              )}
            </div>
            {selectedAssignment.instructions && (
              <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                <span className="font-medium text-blue-900">Instructions:</span>
                <p className="text-sm text-blue-800 mt-1">{selectedAssignment.instructions}</p>
              </div>
            )}
          </div>

          {/* Submission Interface */}
          {selectedAssignment.submissionType === 'file' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Your Assignment</h4>
                <p className="text-gray-600 mb-4">Drag and drop files or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: {selectedAssignment.allowedFormats?.join(', ')} (Max 10MB)
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept={selectedAssignment.allowedFormats?.map(f => `.${f.toLowerCase()}`).join(',')}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                >
                  Choose File
                </label>
              </div>

              {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{selectedFile.name}</p>
                        <p className="text-sm text-green-700">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Your Response</label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your assignment response here..."
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Words: {submissionText.split(' ').filter(word => word.length > 0).length}</span>
                {selectedAssignment.wordLimit && (
                  <span>Limit: {selectedAssignment.wordLimit} words</span>
                )}
              </div>
            </div>
          )}

          {/* AI Writing Assistant */}
          <div className="bg-purple-50 rounded-lg p-4 mt-6">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">AI Writing Assistant</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className="bg-white border border-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors">
                Grammar Check
              </button>
              <button className="bg-white border border-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors">
                Improve Writing
              </button>
              <button className="bg-white border border-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors">
                Citation Help
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Save as Draft
              </button>
              <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                Preview
              </button>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Submit Assignment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMySubmissions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">My Submissions</h3>
          <div className="flex space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Courses</option>
              <option>Business Administration</option>
              <option>Accounting</option>
              <option>Computer Science</option>
              <option>Economics</option>
              <option>Marketing</option>
              <option>Finance</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Status</option>
              <option>Submitted</option>
              <option>Graded</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">{assignment.subject} • {assignment.teacher}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {assignment.grade && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{assignment.grade}/{assignment.maxMarks}</div>
                      <div className="text-xs text-gray-500">Grade</div>
                    </div>
                  )}
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                <div>Due: {assignment.dueDate}</div>
                {assignment.submittedDate && <div>Submitted: {assignment.submittedDate}</div>}
                <div>Max Marks: {assignment.maxMarks}</div>
                <div className={`font-medium ${getPriorityColor(assignment.priority)}`}>
                  Priority: {assignment.priority}
                </div>
              </div>

              {assignment.feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Teacher Feedback</span>
                  </div>
                  <p className="text-sm text-blue-800">{assignment.feedback}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    <Eye className="w-4 h-4 inline mr-1" />
                    View Details
                  </button>
                  {assignment.status === 'submitted' && (
                    <button className="text-green-600 hover:text-green-800 text-sm">
                      <Download className="w-4 h-4 inline mr-1" />
                      Download
                    </button>
                  )}
                </div>
                {assignment.status === 'pending' && (
                  <button 
                    onClick={() => setSelectedAssignment(assignment)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Submit Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${textPrimary}`}>Assignment Submission</h1>
        <p className={textSecondary}>Submit assignments and track your academic progress</p>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg mb-6`}>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'submit', label: 'Submit Assignment', icon: Upload },
              { id: 'submissions', label: 'My Submissions', icon: FileText }
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

      {activeTab === 'submit' && renderSubmitAssignment()}
      {activeTab === 'submissions' && renderMySubmissions()}
    </div>
  );
};

export default EnhancedSubmitAssignmentPanel;
