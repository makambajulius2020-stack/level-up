import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Upload, Download, CheckCircle, Clock, AlertTriangle, FileText, Users, BarChart3 } from 'lucide-react';

const AssignmentPanel = ({ userRole, currentUser }) => {
  const [activeView, setActiveView] = useState(userRole === 'teacher' ? 'my-assignments' : 'student-assignments');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    class_level: '',
    due_date: '',
    max_marks: 100,
    submission_format: 'pdf',
    plagiarism_check: true,
    ai_grading: false
  });
  const [submissionData, setSubmissionData] = useState({
    submission_text: '',
    file: null
  });

  // No sample assignments; rely on backend only
  const sampleAssignments = [];

  useEffect(() => {
    fetchAssignments();
  }, [activeView]);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const endpoint = userRole === 'teacher' ? '/api/assignments/teacher' : '/api/assignments/student';
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    if (!newAssignment.title || !newAssignment.subject || !newAssignment.class_level || !newAssignment.due_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/assignments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAssignment)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Assignment created successfully!');
        setNewAssignment({
          title: '',
          description: '',
          subject: '',
          class_level: '',
          due_date: '',
          max_marks: 100,
          submission_format: 'pdf',
          plagiarism_check: true,
          ai_grading: false
        });
        setCreating(false);
        fetchAssignments();
      } else {
        alert(`❌ Failed to create assignment: ${result.message}`);
      }
    } catch (error) {
      alert('Error creating assignment');
      console.error('Create assignment error:', error);
    }
  };

  const publishAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to publish this assignment? Students will be able to see and submit it.')) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Assignment published successfully!');
        fetchAssignments();
      } else {
        alert(`❌ Failed to publish assignment: ${result.message}`);
      }
    } catch (error) {
      alert('Error publishing assignment');
      console.error('Publish assignment error:', error);
    }
  };

  const submitAssignment = async (assignmentId) => {
    if (!submissionData.submission_text && !submissionData.file) {
      alert('Please provide either text submission or upload a file');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const formData = new FormData();
      if (submissionData.submission_text) {
        formData.append('submission_text', submissionData.submission_text);
      }
      if (submissionData.file) {
        formData.append('file', submissionData.file);
      }

      const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Assignment submitted successfully!');
        setSubmissionData({ submission_text: '', file: null });
        setSelectedAssignment(null);
        fetchAssignments();
      } else {
        alert(`❌ Failed to submit assignment: ${result.message}`);
      }
    } catch (error) {
      alert('Error submitting assignment');
      console.error('Submit assignment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    
    if (userRole === 'student') {
      if (assignment.submitted) {
        return { status: 'submitted', color: 'green', icon: CheckCircle };
      } else if (now > dueDate) {
        return { status: 'overdue', color: 'red', icon: AlertTriangle };
      } else {
        return { status: 'pending', color: 'yellow', icon: Clock };
      }
    } else {
      if (!assignment.is_published) {
        return { status: 'draft', color: 'gray', icon: FileText };
      } else {
        return { status: 'published', color: 'blue', icon: Users };
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Assignment Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            {userRole === 'teacher' ? 'Assignment Management' : 'My Assignments'}
          </h3>
          
          {userRole === 'teacher' && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </button>
          )}
        </div>

        {/* Navigation Tabs for Teachers */}
        {userRole === 'teacher' && (
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveView('my-assignments')}
              className={`pb-2 px-1 ${
                activeView === 'my-assignments'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Assignments
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`pb-2 px-1 ${
                activeView === 'analytics'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Analytics
            </button>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Create New Assignment</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Assignment title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subject...</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English Language">English Language</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Level *
                  </label>
                  <select
                    value={newAssignment.class_level}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, class_level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={newAssignment.max_marks}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, max_marks: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submission Format
                  </label>
                  <select
                    value={newAssignment.submission_format}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, submission_format: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="doc">Word Document</option>
                    <option value="txt">Text</option>
                    <option value="any">Any Format</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Assignment instructions and requirements..."
                />
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAssignment.plagiarism_check}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, plagiarism_check: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enable plagiarism detection</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAssignment.ai_grading}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, ai_grading: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enable AI-assisted grading</span>
                </label>
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
                onClick={createAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Submission Modal */}
      {selectedAssignment && userRole === 'student' && !selectedAssignment.submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Submit Assignment: {selectedAssignment.title}</h4>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Subject:</strong> {selectedAssignment.subject}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Due Date:</strong> {formatDate(selectedAssignment.due_date)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Max Marks:</strong> {selectedAssignment.max_marks}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Submission
                </label>
                <textarea
                  value={submissionData.submission_text}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, submission_text: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your submission here..."
                />
              </div>

              <div className="text-center text-gray-500">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Upload ({selectedAssignment.submission_format.toUpperCase()})
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  accept={selectedAssignment.submission_format === 'pdf' ? '.pdf' : 
                          selectedAssignment.submission_format === 'doc' ? '.doc,.docx' :
                          selectedAssignment.submission_format === 'txt' ? '.txt' : '*'}
                />
                {submissionData.file && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {submissionData.file.name}
                  </p>
                )}
              </div>

              {selectedAssignment.plagiarism_check_enabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    This assignment will be checked for plagiarism. Ensure your work is original.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => submitAssignment(selectedAssignment.id)}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6">
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const statusInfo = getAssignmentStatus(assignment);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                          <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Subject:</span> {assignment.subject}
                          </div>
                          <div>
                            <span className="font-medium">Class:</span> {assignment.class_level}
                          </div>
                          <div>
                            <span className="font-medium">Due:</span> {formatDate(assignment.due_date)}
                          </div>
                          <div>
                            <span className="font-medium">Marks:</span> {assignment.max_marks}
                          </div>
                        </div>

                        {assignment.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {assignment.plagiarism_check_enabled && (
                            <span className="flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Plagiarism Check
                            </span>
                          )}
                          {assignment.ai_grading_enabled && (
                            <span className="flex items-center">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              AI Grading
                            </span>
                          )}
                          {userRole === 'teacher' && assignment.submission_count !== undefined && (
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {assignment.submission_count} submissions
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {userRole === 'teacher' && (
                          <>
                            {!assignment.is_published && (
                              <button
                                onClick={() => publishAssignment(assignment.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                              >
                                Publish
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedAssignment(assignment)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </button>
                          </>
                        )}

                        {userRole === 'student' && (
                          <>
                            {assignment.submitted ? (
                              <div className="text-center">
                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                <span className="text-xs text-green-600">Submitted</span>
                                {assignment.submission && assignment.submission.marks_obtained !== null && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Grade: {assignment.submission.grade} ({assignment.submission.marks_obtained}/{assignment.max_marks})
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedAssignment(assignment)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Submit
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No assignments found</p>
              <p className="text-sm">
                {userRole === 'teacher' 
                  ? 'Create your first assignment to get started' 
                  : 'Assignments will appear here when teachers publish them'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* End of panel */}
    </div>
  );
};

export default AssignmentPanel;
