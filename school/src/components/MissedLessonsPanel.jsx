import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, CheckCircle, Clock, AlertCircle, Play, Calendar, TrendingUp } from 'lucide-react';

const MissedLessonsPanel = ({ user }) => {
  const [missedLessons, setMissedLessons] = useState([]);
  const [toReview, setToReview] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('missed'); // missed, to-review, progress

  useEffect(() => {
    if (user.role === 'student') {
      loadMissedLessons();
      loadLessonsToReview();
      loadProgress();
    }
  }, []);

  const loadMissedLessons = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/lessons/student/${user.id}/missed`);
      const data = await response.json();
      if (data.success) {
        setMissedLessons(data.data);
      }
    } catch (error) {
      console.error('Error loading missed lessons:', error);
    }
  };

  const loadLessonsToReview = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/lessons/student/${user.id}/to-review`);
      const data = await response.json();
      if (data.success) {
        setToReview(data.data);
      }
    } catch (error) {
      console.error('Error loading lessons to review:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/lessons/student/${user.id}/progress`);
      const data = await response.json();
      if (data.success) {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const markAsReviewed = async (lessonId, completionPercentage = 100) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/lessons/${lessonId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          completion_percentage: completionPercentage,
          notes: 'Reviewed via online resources'
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Lesson marked as reviewed!');
        loadMissedLessons();
        loadLessonsToReview();
        loadProgress();
        setSelectedLesson(null);
      }
    } catch (error) {
      console.error('Error marking lesson as reviewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewLesson = (lesson) => {
    setSelectedLesson(lesson);
  };

  const renderLessonCard = (lesson, showReviewButton = true) => (
    <div key={lesson.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{lesson.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{lesson.subject_name}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(lesson.lesson_date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          lesson.reviewed 
            ? 'bg-green-100 text-green-800' 
            : lesson.attended 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {lesson.reviewed ? 'Reviewed' : lesson.attended ? 'Attended' : 'Missed'}
        </div>
      </div>

      {lesson.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lesson.description}</p>
      )}

      {lesson.objectives && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-blue-800 mb-1">Learning Objectives:</p>
          <p className="text-sm text-blue-700">{lesson.objectives}</p>
        </div>
      )}

      <div className="flex items-center space-x-2 mb-4">
        {lesson.video_url || lesson.content_url ? (
          <div className="flex items-center space-x-1 text-green-600">
            <Video className="w-4 h-4" />
            <span className="text-sm">Video Available</span>
          </div>
        ) : null}
        {lesson.notes_url && (
          <div className="flex items-center space-x-1 text-blue-600">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Notes Available</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => viewLesson(lesson)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Play className="w-4 h-4" />
          <span>View Lesson</span>
        </button>
        {showReviewButton && !lesson.reviewed && (
          <button
            onClick={() => markAsReviewed(lesson.id)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const renderMissedTab = () => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <p className="font-semibold">You have {missedLessons.length} missed lessons</p>
        </div>
        <p className="text-sm text-red-700 mt-1">
          Review these lessons to catch up with your class
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {missedLessons.map(lesson => renderLessonCard(lesson))}
      </div>

      {missedLessons.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Great! You haven't missed any lessons</p>
        </div>
      )}
    </div>
  );

  const renderToReviewTab = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-blue-800">
          <BookOpen className="w-5 h-5" />
          <p className="font-semibold">{toReview.length} lessons available for review</p>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Review these lessons to reinforce your learning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toReview.map(lesson => renderLessonCard(lesson))}
      </div>

      {toReview.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">All caught up! No lessons to review</p>
        </div>
      )}
    </div>
  );

  const renderProgressTab = () => {
    if (!progress) return null;

    const attendanceRate = progress.overall.total_lessons > 0
      ? (progress.overall.attended_lessons / progress.overall.total_lessons * 100).toFixed(1)
      : 0;
    
    const reviewRate = progress.overall.total_lessons > 0
      ? (progress.overall.reviewed_lessons / progress.overall.total_lessons * 100).toFixed(1)
      : 0;

    return (
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Overall Progress</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
              <p className="text-3xl font-bold text-blue-600">{progress.overall.total_lessons}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Attended</p>
              <p className="text-3xl font-bold text-green-600">{progress.overall.attended_lessons}</p>
              <p className="text-xs text-green-700 mt-1">{attendanceRate}%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Reviewed</p>
              <p className="text-3xl font-bold text-purple-600">{progress.overall.reviewed_lessons}</p>
              <p className="text-xs text-purple-700 mt-1">{reviewRate}%</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Missed</p>
              <p className="text-3xl font-bold text-red-600">{progress.overall.missed_lessons}</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Attendance Rate</span>
                <span>{attendanceRate}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Review Rate</span>
                <span>{reviewRate}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full"
                  style={{ width: `${reviewRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress by Subject */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Progress by Subject</h3>
          <div className="space-y-4">
            {progress.by_subject.map(subject => {
              const subjectAttendance = subject.total_lessons > 0
                ? (subject.attended / subject.total_lessons * 100).toFixed(1)
                : 0;
              const subjectReview = subject.total_lessons > 0
                ? (subject.reviewed / subject.total_lessons * 100).toFixed(1)
                : 0;

              return (
                <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{subject.subject_name}</h4>
                    <span className="text-sm text-gray-600">{subject.total_lessons} lessons</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Attended: {subject.attended}</p>
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${subjectAttendance}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Reviewed: {subject.reviewed}</p>
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full"
                          style={{ width: `${subjectReview}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Missed Lessons & Review</h2>
        <p className="text-gray-600">
          Catch up on missed lessons and review past content to stay on track with your studies
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('missed')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'missed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Missed Lessons ({missedLessons.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('to-review')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'to-review'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>To Review ({toReview.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'progress'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Progress</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'missed' && renderMissedTab()}
          {activeTab === 'to-review' && renderToReviewTab()}
          {activeTab === 'progress' && renderProgressTab()}
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedLesson.title}</h3>
                <p className="text-gray-600">{selectedLesson.subject_name}</p>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            {(selectedLesson.video_url || selectedLesson.content_url) && (
              <div className="mb-6">
                <video controls className="w-full rounded-lg">
                  <source src={selectedLesson.video_url || selectedLesson.content_url} />
                </video>
              </div>
            )}

            {/* Lesson Content */}
            <div className="space-y-4">
              {selectedLesson.description && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedLesson.description}</p>
                </div>
              )}

              {selectedLesson.objectives && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Learning Objectives</h4>
                  <p className="text-gray-600">{selectedLesson.objectives}</p>
                </div>
              )}

              {selectedLesson.homework && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Homework</h4>
                  <p className="text-yellow-700">{selectedLesson.homework}</p>
                </div>
              )}

              {selectedLesson.notes_url && (
                <div>
                  <a
                    href={selectedLesson.notes_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Notes</span>
                  </a>
                </div>
              )}
            </div>

            {!selectedLesson.reviewed && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => markAsReviewed(selectedLesson.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{loading ? 'Marking as reviewed...' : 'Mark as Reviewed'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissedLessonsPanel;
