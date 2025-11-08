import React, { useState } from 'react';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Search, Filter, Reply, Clock, User, CheckCircle, AlertCircle, X, ArrowLeft } from 'lucide-react';
import BackButton from './BackButton';

const TeacherFeedbackPanel = ({ userRole, currentUser, darkMode, setActiveTab: setParentActiveTab }) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Student reviews data - empty array, will be populated from backend
  const [studentReviews] = useState([]);

  // Q&A data - empty array, will be populated from backend
  const [qaItems] = useState([]);

  const filteredReviews = studentReviews.filter(review => {
    const matchesSearch = review.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'replied' && review.replies.length > 0) ||
                         (filterStatus === 'unreplied' && review.replies.length === 0);
    return matchesSearch && matchesStatus;
  });

  const filteredQA = qaItems.filter(qa => {
    const matchesSearch = qa.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         qa.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         qa.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'answered' && qa.status === 'answered') ||
                         (filterStatus === 'pending' && qa.status === 'pending');
    return matchesSearch && matchesStatus;
  });

  const handleReply = (reviewId) => {
    if (!replyText.trim()) return;
    
    // In a real app, this would make an API call
    alert(`Reply sent to student review!`);
    setReplyText('');
    setSelectedReview(null);
  };

  const handleAnswerQuestion = (qaId) => {
    if (!replyText.trim()) return;
    
    // In a real app, this would make an API call
    alert(`Answer posted to question!`);
    setReplyText('');
    setSelectedReview(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {setParentActiveTab && (
        <div className="flex items-center mb-4">
          <BackButton onClick={() => setParentActiveTab('dashboard')} />
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              Feedback & Q&A
            </h3>
            <p className="text-gray-600 mt-1">View student reviews and answer questions</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{studentReviews.length}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{qaItems.filter(q => q.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">Pending Q&A</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'reviews', label: 'Student Reviews', count: studentReviews.length },
              { id: 'qa', label: 'Q&A', count: qaItems.filter(q => q.status === 'pending').length }
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

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews or questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                {activeTab === 'reviews' ? (
                  <>
                    <option value="replied">Replied</option>
                    <option value="unreplied">Unreplied</option>
                  </>
                ) : (
                  <>
                    <option value="answered">Answered</option>
                    <option value="pending">Pending</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews found</p>
                </div>
              ) : (
                filteredReviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{review.studentName}</h4>
                            <span className="text-sm text-gray-500">({review.studentId})</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm font-medium text-gray-700">{review.course}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.review}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{review.helpful}</span>
                        </div>
                      </div>
                    </div>

                    {review.replies.length > 0 && (
                      <div className="ml-16 mb-4">
                        {review.replies.map(reply => (
                          <div key={reply.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-blue-900">{reply.author}</span>
                              <span className="text-sm text-blue-600">{reply.date}</span>
                            </div>
                            <p className="text-blue-800">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="ml-16">
                      {selectedReview === review.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleReply(review.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                              <Reply className="w-4 h-4" />
                              <span>Send Reply</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReview(null);
                                setReplyText('');
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReview(review.id)}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-4">
              {filteredQA.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No questions found</p>
                </div>
              ) : (
                filteredQA.map(qa => (
                  <div key={qa.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{qa.studentName}</h4>
                            <span className="text-sm text-gray-500">({qa.studentId})</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm font-medium text-gray-700">{qa.course}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              qa.status === 'answered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {qa.status === 'answered' ? (
                                <span className="flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Answered
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </span>
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{qa.date}</p>
                          <p className="text-gray-900 font-medium mb-3">{qa.question}</p>
                          {qa.answer && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-green-900">Your Answer</span>
                                <span className="text-sm text-green-600">{qa.answerDate}</span>
                              </div>
                              <p className="text-green-800">{qa.answer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{qa.upvotes}</span>
                        </div>
                      </div>
                    </div>

                    {qa.status === 'pending' && (
                      <div className="ml-16">
                        {selectedReview === qa.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your answer..."
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAnswerQuestion(qa.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Post Answer</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReview(null);
                                  setReplyText('');
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedReview(qa.id)}
                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center space-x-2 transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                            <span>Answer Question</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherFeedbackPanel;

