import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import AIInsightsPanel from './AIInsightsPanel';
import RequiredActions from './components/RequiredActions';
import TopPerformingStudents from './components/TopPerformingStudents';
import TopMostActiveStudents from './components/TopMostActiveStudents';
import AITutorForm from './components/AITutorForm';
import { Award, Clock, FileText, Video, DollarSign, AlertTriangle, TrendingUp, Target, Calendar, BookOpen, Users, MapPin, Bell, Upload, Star, Send, ThumbsUp, MessageSquare, Heart, Brain } from 'lucide-react';

const StudentDashboard = ({ aiInsights, setActiveTab, darkMode = false, currentUser }) => {
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showAITutorForm, setShowAITutorForm] = useState(false);
  const [teacherRatings, setTeacherRatings] = useState({
    clarity: 0,
    organization: 0,
    participation: 0,
    fairness: 0,
    support: 0
  });
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    // No demo schedule; wait for backend data
    setTodaysSchedule([]);

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentPeriod = () => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);
    
    for (let i = 0; i < todaysSchedule.length; i++) {
      const period = todaysSchedule[i];
      const startTime = period.time;
      const endTime = addMinutes(startTime, period.duration);
      
      if (currentTimeStr >= startTime && currentTimeStr <= endTime) {
        return { ...period, index: i };
      }
    }
    return null;
  };

  const addMinutes = (timeStr, minutes) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const getNextPeriod = () => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);
    
    for (let i = 0; i < todaysSchedule.length; i++) {
      const period = todaysSchedule[i];
      if (period.time > currentTimeStr) {
        return { ...period, index: i };
      }
    }
    return null;
  };

  const currentPeriod = getCurrentPeriod();
  const nextPeriod = getNextPeriod();

  // Teachers list starts empty; populate from backend
  const teachers = [];

  const ratingCriteria = [
    { key: 'clarity', label: 'Clarity and Explanation', description: 'How clearly does the teacher explain concepts?' },
    { key: 'organization', label: 'Organization and Preparation', description: 'How well-prepared and organized are the lessons?' },
    { key: 'participation', label: 'Participation and Engagement', description: 'How well does the teacher encourage student participation?' },
    { key: 'fairness', label: 'Fairness and Respect', description: 'How fair and respectful is the teacher?' },
    { key: 'support', label: 'Support and Availability', description: 'How supportive and available is the teacher for help?' }
  ];

  const handleRateTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowRatingModal(true);
    setTeacherRatings({
      clarity: 0,
      organization: 0,
      participation: 0,
      fairness: 0,
      support: 0
    });
    setRatingComment('');
  };

  const handleSubmitRating = () => {
    // Simulate API call to submit rating
    alert(`✅ Rating submitted for ${selectedTeacher.name}! Thank you for your feedback.`);
    setShowRatingModal(false);
    setSelectedTeacher(null);
  };

  const StarRating = ({ rating, onRatingChange, disabled = false }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={`w-6 h-6 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${disabled ? 'cursor-default' : 'cursor-pointer hover:text-yellow-300'}`}
        >
          <Star className="w-full h-full fill-current" />
        </button>
      ))}
    </div>
  );

  return (
  <div className="space-y-6">
    <RequiredActions userRole="student" setActiveTab={setActiveTab} darkMode={darkMode} />
      
      {/* Today's Schedule */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Today's Schedule</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-700">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-lg font-bold text-blue-600">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>

        {/* Current Period */}
        {currentPeriod && (
          <div className="bg-blue-600 text-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">Currently: {currentPeriod.subject}</h4>
                <p className="text-blue-100">
                  {currentPeriod.type === 'class' ? `With ${currentPeriod.teacher}` : 
                   currentPeriod.type === 'study' ? 'AI Study Session' : 
                   'Break Time'}
                </p>
                {currentPeriod.room && (
                  <p className="text-blue-100 text-sm">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {currentPeriod.room}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Until</div>
                <div className="text-lg font-bold">
                  {addMinutes(currentPeriod.time, currentPeriod.duration)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Period */}
        {nextPeriod && !currentPeriod && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Next: {nextPeriod.subject}</h4>
                <p className="text-green-700">
                  {nextPeriod.type === 'class' ? `With ${nextPeriod.teacher}` : 
                   nextPeriod.type === 'study' ? 'AI Study Session' : 
                   'Break Time'}
                </p>
                {nextPeriod.room && (
                  <p className="text-green-700 text-sm">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {nextPeriod.room}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-green-700">Starts at</div>
                <div className="text-lg font-bold text-green-800">{nextPeriod.time}</div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {todaysSchedule.length === 0 && (
            <div className="text-center text-gray-500 py-6">No schedule for today.</div>
          )}
          {todaysSchedule.map((period, index) => {
            const isCurrent = currentPeriod && currentPeriod.index === index;
            const isPast = new Date().toTimeString().slice(0, 5) > addMinutes(period.time, period.duration);
            
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  isCurrent 
                    ? 'bg-blue-100 border-blue-300' 
                    : isPast 
                    ? 'bg-gray-100 border-gray-200 opacity-60' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      period.type === 'class' ? 'bg-blue-500' :
                      period.type === 'study' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <h5 className={`font-medium ${
                        isCurrent ? 'text-blue-800' : 
                        isPast ? 'text-gray-500' : 
                        'text-gray-800'
                      }`}>
                        {period.subject}
                      </h5>
                      <p className={`text-sm ${
                        isCurrent ? 'text-blue-600' : 
                        isPast ? 'text-gray-400' : 
                        'text-gray-600'
                      }`}>
                        {period.type === 'class' ? period.teacher :
                         period.type === 'study' ? 'AI Study Session' :
                         'Break'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-800' : 
                      isPast ? 'text-gray-500' : 
                      'text-gray-700'
                    }`}>
                      {period.time}
                    </div>
                    <div className={`text-xs ${
                      isCurrent ? 'text-blue-600' : 
                      isPast ? 'text-gray-400' : 
                      'text-gray-500'
                    }`}>
                      {period.duration} min
                    </div>
                  </div>
                </div>
                {period.room && period.type !== 'break' && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {period.room}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex space-x-3">
          <button 
            onClick={() => setActiveTab && setActiveTab('timetable')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>View Full Timetable</span>
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('study-timetable')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>AI Study Schedule</span>
          </button>
        </div>
      </div>
    
    {/* Join Online Class Button */}
    <div className="flex justify-center">
      <button 
        onClick={() => setActiveTab && setActiveTab('online-class')}
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
      >
        <Video className="w-5 h-5" />
        <span>Join Online Class</span>
      </button>
    </div>
    
    {/* Fee Balance Alert */}
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-900">Fee Balance Reminder</h3>
      </div>
      <p className="text-yellow-800 mb-4">
        You have an outstanding balance of UGX 0. Next payment is due on [Due Date].
      </p>
      <div className="flex space-x-3">
        <button 
          onClick={() => setActiveTab && setActiveTab('fee-balance')}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
        >
          <DollarSign className="w-4 h-4" />
          <span>View Fee Balance</span>
        </button>
      </div>
    </div>
    
    {/* Attendance Encouragement Bar */}
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Attendance Progress</h3>
            <p className="text-green-700 text-sm">Keep up the great attendance! You're on track for excellent performance.</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">0%</div>
          <div className="text-sm text-green-700">This Month</div>
          <div className="w-32 bg-green-200 rounded-full h-2 mt-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Present Days</span>
          </div>
          <div className="text-lg font-bold text-green-600 mt-1">0/0</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Target</span>
          </div>
          <div className="text-lg font-bold text-purple-600 mt-1">0%</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Streak</span>
          </div>
          <div className="text-lg font-bold text-orange-600 mt-1">0 days</div>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-3">
        <button 
          onClick={() => setActiveTab && setActiveTab('attendance')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Clock className="w-4 h-4" />
          <span>View Attendance</span>
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <DashboardCard title="GPA" value="0.0" icon={Award} color="blue" />
      <DashboardCard title="Attendance" value="0%" icon={Clock} trend="0%" color="green" />
      <DashboardCard title="Fee Balance" value="UGX 0" icon={DollarSign} color="purple" />
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab && setActiveTab('messaging')}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl">💬</div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">Community</div>
        <div className="text-sm text-gray-600">Peer discussions, Q&A</div>
      </div>
    </div>
    {/* AI Insights Row */}
    <div className="w-full">
      <AIInsightsPanel aiInsights={aiInsights} />
    </div>

    {/* AI Tutor Button */}
    <div className="w-full">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Tutor Assistant</h3>
              <p className="text-purple-100">Get personalized help with your studies</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAITutorForm(true)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
          >
            <Brain className="w-5 h-5" />
            <span>Try AI Tutor</span>
          </button>
        </div>
      </div>
    </div>

    {/* Top 5 Most Active Students Row */}
    <div className="w-full">
      <TopMostActiveStudents userRole="student" currentUser={currentUser} darkMode={darkMode} setActiveTab={setActiveTab} />
    </div>

    {/* Assignment Quick Actions */}
    <div className="w-full">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Assignment Quick Actions</h3>
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('exam-schedule')}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {['Pending','Overdue','Submitted','Graded'].map((label, idx) => (
            <div key={label} className="bg-white rounded-lg p-4 text-center border border-purple-100">
              <div className="text-2xl font-bold text-gray-500 mb-1">0</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab && setActiveTab('exam-schedule')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-3"
          >
            <FileText className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">View Assignments</div>
              <div className="text-sm text-blue-100">See all your assignments</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('submit-assignment')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-3"
          >
            <Upload className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Submit Assignment</div>
              <div className="text-sm text-green-100">Upload your work</div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('exam-schedule')}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-3"
          >
            <Calendar className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Due Dates</div>
              <div className="text-sm text-purple-100">Check deadlines</div>
            </div>
          </button>
        </div>

        {/* Recent Assignments Preview */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-purple-900 mb-3">Recent Assignments</h4>
          <div className="text-center text-gray-500 py-4">No recent assignments.</div>
        </div>
      </div>
    </div>

    {/* Teacher Rating System */}
    <div className="w-full">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
        <div className="text-center text-orange-700">Teacher ratings are not available yet.</div>
      </div>
    </div>

    {/* Rating Modal */}
    {showRatingModal && selectedTeacher && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Rate {selectedTeacher.name}</h3>
            <button
              onClick={() => setShowRatingModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {ratingCriteria.map((criterion) => (
              <div key={criterion.key} className="border-b border-gray-200 pb-4">
                <div className="mb-2">
                  <h4 className="font-medium text-gray-800">{criterion.label}</h4>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                <StarRating
                  rating={teacherRatings[criterion.key]}
                  onRatingChange={(rating) => setTeacherRatings(prev => ({
                    ...prev,
                    [criterion.key]: rating
                  }))}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share any additional feedback about this teacher..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Rating</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
      {/* AI Tutor Form */}
      <AITutorForm 
        userRole="student" 
        isOpen={showAITutorForm} 
        onClose={() => setShowAITutorForm(false)} 
      />
    </div>
  );
};

export default StudentDashboard;
