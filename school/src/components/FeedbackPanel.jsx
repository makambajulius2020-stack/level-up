import React, { useState } from 'react';
import { MessageSquare, Send, Star, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, Clock, User, Filter } from 'lucide-react';

const FeedbackPanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('submit');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    category: '',
    subject: '',
    message: '',
    priority: 'normal',
    anonymous: false,
    rating: 0
  });

  // Sample feedback categories
  const categories = [
    { id: 'academic', label: 'Academic Programs', icon: '📚' },
    { id: 'facilities', label: 'School Facilities', icon: '🏫' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'events', label: 'School Events', icon: '🎉' },
    { id: 'transport', label: 'Transportation', icon: '🚌' },
    { id: 'meals', label: 'School Meals', icon: '🍽️' },
    { id: 'safety', label: 'Safety & Security', icon: '🛡️' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'extracurricular', label: 'Extracurricular Activities', icon: '⚽' },
    { id: 'other', label: 'Other', icon: '📝' }
  ];

  // Submitted feedback (start empty)
  const [submittedFeedback, setSubmittedFeedback] = useState([]);

  // School surveys (start empty)
  const [surveys, setSurveys] = useState([]);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    const newFeedback = {
      id: submittedFeedback.length + 1,
      ...feedbackForm,
      status: 'pending',
      response: null,
      submittedDate: new Date().toISOString().split('T')[0],
      responseDate: null
    };
    setSubmittedFeedback([newFeedback, ...submittedFeedback]);
    setFeedbackForm({
      category: '',
      subject: '',
      message: '',
      priority: 'normal',
      anonymous: false,
      rating: 0
    });
    setShowFeedbackForm(false);
    alert('Feedback submitted successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            disabled={!interactive}
          >
            <Star className="w-5 h-5" fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  const renderSubmitFeedback = () => (
    <div className="space-y-6">
      {/* Quick Feedback Categories */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Quick Feedback</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setFeedbackForm({ ...feedbackForm, category: category.id });
                setShowFeedbackForm(true);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium text-gray-900">{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Feedback Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Submit Detailed Feedback</h4>
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Write Feedback
          </button>
        </div>
        <p className="text-gray-600">
          Your feedback helps us improve our school community. Share your thoughts, suggestions, or concerns.
        </p>
      </div>

      {/* Recent School Updates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Recent Improvements Based on Your Feedback</h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-green-800">Extended Library Hours</h5>
              <p className="text-green-700 text-sm">Based on student and staff feedback, library hours have been extended until 6 PM on weekdays.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800">Improved School Meals</h5>
              <p className="text-blue-700 text-sm">New healthy meal options added to the cafeteria menu following nutrition feedback.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-purple-800">Enhanced Communication</h5>
              <p className="text-purple-700 text-sm">New communication portal features implemented for better student-instructor communication.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyFeedback = () => (
    <div className="space-y-4">
      {submittedFeedback.map((feedback) => (
        <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{feedback.subject}</h4>
              <p className="text-gray-600 text-sm">
                Category: {categories.find(c => c.id === feedback.category)?.label}
              </p>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                {feedback.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feedback.priority)}`}>
                {feedback.priority}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700">{feedback.message}</p>
          </div>

          {feedback.rating > 0 && (
            <div className="mb-4">
              <span className="text-sm text-gray-600 mr-2">Rating:</span>
              {renderStars(feedback.rating)}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Submitted:</span> {new Date(feedback.submittedDate).toLocaleDateString()}
            </div>
            {feedback.responseDate && (
              <div>
                <span className="font-medium">Responded:</span> {new Date(feedback.responseDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {feedback.response && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">School Response:</h5>
              <p className="text-blue-700 text-sm">{feedback.response}</p>
            </div>
          )}

          {feedback.status === 'pending' && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">Your feedback is being reviewed. We'll respond within 3-5 business days.</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSurveys = () => (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <div key={survey.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{survey.title}</h4>
              <p className="text-gray-600 mt-1">{survey.description}</p>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                survey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {survey.status}
              </span>
              {survey.completed && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  completed
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Questions:</span> {survey.questions}
            </div>
            <div>
              <span className="font-medium">Deadline:</span> {new Date(survey.deadline).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Category:</span> {survey.category}
            </div>
          </div>

          <div className="flex space-x-3">
            {survey.status === 'active' && !survey.completed && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Take Survey
              </button>
            )}
            {survey.completed && (
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                View Results
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              School Feedback & Suggestions
            </h3>
            <p className="text-gray-600 mt-1">Help us improve by sharing your thoughts and experiences</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{submittedFeedback.length}</div>
            <div className="text-sm text-gray-600">Feedback Submitted</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'submit', label: 'Submit Feedback', count: categories.length },
              { id: 'my-feedback', label: 'My Feedback', count: submittedFeedback.length },
              { id: 'surveys', label: 'Surveys', count: surveys.filter(s => s.status === 'active').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'submit' && renderSubmitFeedback()}
          {activeTab === 'my-feedback' && renderMyFeedback()}
          {activeTab === 'surveys' && renderSurveys()}
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Submit Feedback</h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={feedbackForm.category}
                  onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief summary of your feedback"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Please provide detailed feedback..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={feedbackForm.priority}
                  onChange={(e) => setFeedbackForm({...feedbackForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (Optional)</label>
                {renderStars(feedbackForm.rating, true, (rating) => setFeedbackForm({...feedbackForm, rating}))}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={feedbackForm.anonymous}
                  onChange={(e) => setFeedbackForm({...feedbackForm, anonymous: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Submit anonymously
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
