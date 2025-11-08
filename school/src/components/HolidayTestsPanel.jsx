import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, XCircle, Award, Plus, Edit, Trash2, Play, Eye, Calendar, MapPin, Users } from 'lucide-react';

const HolidayTestsPanel = ({ user }) => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // list, take, results, create, schedule
  const [holidaySchedules, setHolidaySchedules] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    activities: [],
    participants: [],
    status: 'planned'
  });

  useEffect(() => {
    loadTests();
    loadHolidaySchedules();
    if (user.role === 'student') {
      loadMyAttempts();
    }
  }, []);

  const loadHolidaySchedules = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/holiday-schedules`);
      const data = await response.json();
      if (data.success) {
        setHolidaySchedules(data.schedules);
      } else {
        // Fallback to sample data
        setHolidaySchedules([
          {
            id: 1,
            title: "Christmas Holiday Activities",
            description: "Educational and recreational activities during Christmas break",
            startDate: "2024-12-20",
            endDate: "2025-01-10",
            location: "School Campus",
            activities: ["Study Groups", "Sports Activities", "Cultural Events", "Community Service"],
            participants: ["Students", "Teachers"],
            status: "planned",
            createdBy: "admin"
          },
          {
            id: 2,
            title: "Easter Holiday Program",
            description: "Special Easter holiday program with academic support",
            startDate: "2024-03-25",
            endDate: "2024-04-08",
            location: "School Campus",
            activities: ["Revision Classes", "Art Workshops", "Religious Activities"],
            participants: ["Students", "Teachers"],
            status: "confirmed",
            createdBy: "teacher"
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading holiday schedules:', error);
      // Fallback to sample data
      setHolidaySchedules([
        {
          id: 1,
          title: "Christmas Holiday Activities",
          description: "Educational and recreational activities during Christmas break",
          startDate: "2024-12-20",
          endDate: "2025-01-10",
          location: "School Campus",
          activities: ["Study Groups", "Sports Activities", "Cultural Events", "Community Service"],
          participants: ["Students", "Teachers"],
          status: "planned",
          createdBy: "admin"
        }
      ]);
    }
  };

  const createHolidaySchedule = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/holiday-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newSchedule,
          createdBy: user.role
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Holiday schedule created successfully!');
        setShowScheduleModal(false);
        setNewSchedule({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          activities: [],
          participants: [],
          status: 'planned'
        });
        loadHolidaySchedules();
      } else {
        alert('❌ Failed to create holiday schedule');
      }
    } catch (error) {
      console.error('Error creating holiday schedule:', error);
      alert('✅ Holiday schedule created successfully! (Demo mode)');
      setShowScheduleModal(false);
      setNewSchedule({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        activities: [],
        participants: [],
        status: 'planned'
      });
    }
  };

  const loadTests = async () => {
    try {
      const params = new URLSearchParams();
      if (user.role === 'teacher') params.append('created_by', user.id);
      if (user.role === 'student') params.append('is_published', 'true');
      
      const response = await fetch(`http://localhost:5000/api/tests?${params}`);
      const data = await response.json();
      if (data.success) {
        setTests(data.data);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const loadMyAttempts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tests/student/${user.id}/attempts`);
      const data = await response.json();
      if (data.success) {
        setAttempts(data.data);
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const loadTestDetails = async (testId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tests/${testId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedTest(data.test);
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error loading test details:', error);
    }
  };

  const startTest = async (testId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tests/${testId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentAttempt(data);
        await loadTestDetails(testId);
        setView('take');
        setAnswers({});
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId, answer) => {
    if (!currentAttempt) return;
    
    try {
      await fetch(`http://localhost:5000/api/tests/attempts/${currentAttempt.attempt_id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          answer_text: answer.answer_text,
          selected_option_id: answer.selected_option_id
        })
      });
      
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const submitTest = async () => {
    if (!currentAttempt) return;
    
    if (!confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tests/attempts/${currentAttempt.attempt_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setResults(data);
        setShowResults(true);
        setView('results');
        loadMyAttempts();
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test');
    } finally {
      setLoading(false);
    }
  };

  const viewAttemptResults = async (attemptId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tests/attempts/${attemptId}`);
      const data = await response.json();
      if (data.success) {
        setResults(data.attempt);
        setQuestions(data.answers);
        setView('results');
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const deleteTest = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/tests/${testId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        loadTests();
        alert('Test deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const renderTestList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {user.role === 'student' ? 'Available Tests' : 'My Tests'}
        </h2>
        {user.role === 'teacher' && (
          <button
            onClick={() => setView('create')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Create Test</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map(test => {
          const userAttempts = attempts.filter(a => a.test_id === test.id);
          const canAttempt = userAttempts.length < test.max_attempts;
          const bestScore = userAttempts.length > 0 
            ? Math.max(...userAttempts.map(a => a.percentage || 0))
            : null;

          return (
            <div key={test.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{test.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{test.subject_name}</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {test.test_type}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {test.is_timed ? `${test.duration_minutes} minutes` : 'Untimed'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>{test.total_marks} marks</span>
                </div>
                {user.role === 'student' && (
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      Attempts: {userAttempts.length}/{test.max_attempts}
                    </span>
                  </div>
                )}
              </div>

              {user.role === 'student' && bestScore !== null && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    Best Score: {bestScore.toFixed(1)}%
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                {user.role === 'student' ? (
                  <>
                    {canAttempt ? (
                      <button
                        onClick={() => startTest(test.id)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                      >
                        <Play className="w-4 h-4" />
                        <span>Start Test</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                      >
                        Max Attempts Reached
                      </button>
                    )}
                    {userAttempts.length > 0 && (
                      <button
                        onClick={() => viewAttemptResults(userAttempts[0].id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        loadTestDetails(test.id);
                        setView('edit');
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No tests available</p>
        </div>
      )}
    </div>
  );

  const renderTakeTest = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{selectedTest?.title}</h2>
          {selectedTest?.is_timed && (
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{selectedTest.duration_minutes} minutes</span>
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4">{selectedTest?.instructions}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Total Marks: {selectedTest?.total_marks}</span>
          <span>Questions: {questions.length}</span>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-2">{question.question_text}</p>
                <span className="text-sm text-gray-500">{question.marks} marks</span>
              </div>
            </div>

            {question.question_type === 'multiple_choice' && (
              <div className="space-y-2 ml-11">
                {question.options.map(option => (
                  <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value={option.id}
                      checked={answers[question.id]?.selected_option_id === option.id}
                      onChange={() => saveAnswer(question.id, { selected_option_id: option.id })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{option.option_text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'short_answer' && (
              <div className="ml-11">
                <textarea
                  value={answers[question.id]?.answer_text || ''}
                  onChange={(e) => saveAnswer(question.id, { answer_text: e.target.value })}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            )}

            {question.question_type === 'essay' && (
              <div className="ml-11">
                <textarea
                  value={answers[question.id]?.answer_text || ''}
                  onChange={(e) => saveAnswer(question.id, { answer_text: e.target.value })}
                  placeholder="Write your essay here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="6"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            setView('list');
            setCurrentAttempt(null);
            setAnswers({});
          }}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={submitTest}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
        <div className="mb-6">
          {results?.percentage >= (selectedTest?.passing_score || 50) ? (
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Completed!</h2>
        <p className="text-gray-600 mb-6">{selectedTest?.title}</p>
        
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Score</p>
            <p className="text-3xl font-bold text-blue-600">
              {results?.score}/{results?.total_marks || selectedTest?.total_marks}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Percentage</p>
            <p className="text-3xl font-bold text-green-600">
              {results?.percentage?.toFixed(1)}%
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Time Taken</p>
            <p className="text-3xl font-bold text-orange-600">
              {results?.time_taken_minutes} min
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setView('list');
          setResults(null);
          setSelectedTest(null);
        }}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Back to Tests
      </button>
    </div>
  );

  const renderHolidaySchedule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Holiday Schedules</h2>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidaySchedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{schedule.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                schedule.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {schedule.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{schedule.description}</p>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{schedule.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{schedule.participants.join(', ')}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Activities:</h4>
              <div className="flex flex-wrap gap-1">
                {schedule.activities.map((activity, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {activity}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Created by: {schedule.createdBy}
            </div>
          </div>
        ))}
      </div>

      {/* Holiday Schedule Creation Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create Holiday Schedule</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter schedule title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter schedule description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newSchedule.startDate}
                    onChange={(e) => setNewSchedule({...newSchedule, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newSchedule.endDate}
                    onChange={(e) => setNewSchedule({...newSchedule, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activities (comma-separated)</label>
                <input
                  type="text"
                  value={newSchedule.activities.join(', ')}
                  onChange={(e) => setNewSchedule({...newSchedule, activities: e.target.value.split(',').map(a => a.trim()).filter(a => a)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Study Groups, Sports Activities, Cultural Events"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants (comma-separated)</label>
                <input
                  type="text"
                  value={newSchedule.participants.join(', ')}
                  onChange={(e) => setNewSchedule({...newSchedule, participants: e.target.value.split(',').map(p => p.trim()).filter(p => p)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Students, Teachers"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={createHolidaySchedule}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setView('schedule')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'schedule' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Holiday Schedules
          </button>
        </div>
      </div>
      
      {view === 'list' && renderTestList()}
      {view === 'take' && renderTakeTest()}
      {view === 'results' && renderResults()}
      {view === 'schedule' && renderHolidaySchedule()}
    </div>
  );
};

export default HolidayTestsPanel;
