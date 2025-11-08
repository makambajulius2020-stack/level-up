import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, Award, Users, MapPin, 
  CheckCircle, Calendar, Eye, MessageSquare, Brain, AlertTriangle
} from 'lucide-react';

const MyCoursesPanel = ({ userRole, currentUser, darkMode = false, setActiveTab }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [browseMode, setBrowseMode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [courseToEnroll, setCourseToEnroll] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Dynamic courses data - will be fetched from API or localStorage
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available courses for browsing
  const availableCourses = [
    {
      id: 'avail-1',
      name: 'Introduction to Computer Science',
      code: 'CS101',
      instructor: 'Dr. Sarah Johnson',
      description: 'Learn the fundamentals of computer science including programming basics, algorithms, and data structures.',
      duration: '12 weeks',
      price: '$299',
      level: 'Beginner',
      color: 'blue'
    },
    {
      id: 'avail-2',
      name: 'Web Development Fundamentals',
      code: 'WEB201',
      instructor: 'Prof. Michael Chen',
      description: 'Master HTML, CSS, JavaScript and modern web development frameworks.',
      duration: '10 weeks',
      price: '$349',
      level: 'Intermediate',
      color: 'purple'
    },
    {
      id: 'avail-3',
      name: 'Data Science and Analytics',
      code: 'DS301',
      instructor: 'Dr. Emily Rodriguez',
      description: 'Explore data analysis, machine learning, and statistical modeling techniques.',
      duration: '14 weeks',
      price: '$399',
      level: 'Advanced',
      color: 'green'
    },
    {
      id: 'avail-4',
      name: 'Digital Marketing Essentials',
      code: 'MKT201',
      instructor: 'Prof. James Wilson',
      description: 'Learn SEO, social media marketing, content strategy, and analytics.',
      duration: '8 weeks',
      price: '$249',
      level: 'Beginner',
      color: 'orange'
    },
    {
      id: 'avail-5',
      name: 'Mobile App Development',
      code: 'MOB301',
      instructor: 'Dr. Lisa Anderson',
      description: 'Build native and cross-platform mobile applications using modern tools.',
      duration: '12 weeks',
      price: '$379',
      level: 'Intermediate',
      color: 'indigo'
    },
    {
      id: 'avail-6',
      name: 'Business Analytics',
      code: 'BA201',
      instructor: 'Prof. Robert Taylor',
      description: 'Learn to analyze business data and make data-driven decisions.',
      duration: '10 weeks',
      price: '$329',
      level: 'Intermediate',
      color: 'blue'
    }
  ];

  // Fetch courses data on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${baseUrl}/api/students/${currentUser?.id}/courses`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.courses) {
                setCourses(data.courses);
                setLoading(false);
                return;
              }
            }
          } catch (apiError) {
            console.log('API fetch failed, trying localStorage:', apiError);
          }
        }
        
        // Fallback to localStorage
        const savedCourses = localStorage.getItem(`courses_${currentUser?.id}`);
        if (savedCourses) {
          try {
            const parsedCourses = JSON.parse(savedCourses);
            setCourses(parsedCourses);
          } catch (parseError) {
            console.error('Error parsing saved courses:', parseError);
            setCourses([]);
          }
        } else {
          setCourses([]);
        }
        
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const getGradeColor = (grade) => {
    if (grade >= 85) return 'text-green-600';
    if (grade >= 75) return 'text-blue-600';
    if (grade >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-l-blue-500 bg-blue-50',
      purple: 'border-l-purple-500 bg-purple-50',
      green: 'border-l-green-500 bg-green-50',
      orange: 'border-l-orange-500 bg-orange-50',
      indigo: 'border-l-indigo-500 bg-indigo-50'
    };
    return darkMode ? 'border-l-gray-500 bg-gray-700' : colors[color] || colors.blue;
  };

  const handleEnrollClick = (course) => {
    // Check if course has a price
    const priceStr = course.price || '$0';
    const price = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
    
    if (price > 0) {
      // Show payment modal for paid courses
      setCourseToEnroll(course);
      setShowPaymentModal(true);
    } else {
      // Free enrollment
      enrollInCourse(course, 0, null);
    }
  };

  const enrollInCourse = async (course, amount = 0, paymentMethod = null) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Extract course ID (use id or code as fallback)
      const courseId = course.id || course.code || course.courseId;
      
      if (!courseId) {
        alert('Error: Course ID not found');
        return;
      }

      // Extract numeric amount
      let numericAmount = amount;
      if (typeof course.price === 'string') {
        numericAmount = parseFloat(course.price.replace(/[^\d.]/g, '')) || 0;
      }

      const response = await fetch(`${baseUrl}/api/courses/enroll-with-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_id: courseId,
          course_name: course.name,
          amount: numericAmount,
          payment_method: paymentMethod || 'stripe'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local courses list
        const newCourse = {
          ...course,
          status: 'enrolled',
          completionPercentage: 0,
          enrolledDate: new Date().toISOString(),
          purchased: numericAmount > 0
        };
        const updatedCourses = [...courses, newCourse];
        setCourses(updatedCourses);
        localStorage.setItem(`courses_${currentUser?.id}`, JSON.stringify(updatedCourses));
        
        setShowPaymentModal(false);
        setCourseToEnroll(null);
        setSelectedCourse(null);
        setBrowseMode(false);
        
        alert(`✅ Successfully enrolled in ${course.name}!${numericAmount > 0 ? ' Payment processed.' : ''}`);
        
        // Refresh courses from API
        if (currentUser?.id) {
          window.location.reload();
        }
      } else {
        alert(`❌ Enrollment failed: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      alert(`❌ Enrollment failed: ${err.message}`);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (processingPayment || !courseToEnroll) return;
    
    setProcessingPayment(true);
    
    try {
      const formData = new FormData(e.target);
      const cardholderName = formData.get('cardholderName') || '';
      const cardNumber = formData.get('cardNumber') || '';
      const expiry = formData.get('expiry') || '';
      const cvc = formData.get('cvc') || '';
      
      if (!cardholderName || !cardNumber || !expiry || !cvc) {
        alert('Please fill in all payment fields');
        setProcessingPayment(false);
        return;
      }

      // Extract amount from course price
      const priceStr = courseToEnroll.price || '$0';
      const amount = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
      
      // Process enrollment with payment
      await enrollInCourse(courseToEnroll, amount, paymentMethod);
      
    } catch (err) {
      console.error('Payment error:', err);
      alert(`❌ Payment processing error: ${err.message}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}> My Courses</h1>
          <p className={textSecondary}>Loading your courses...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}> My Courses</h1>
          <p className={textSecondary}>Error loading courses</p>
        </div>
        <div className={`${cardBg} rounded-xl shadow-lg p-8 text-center`}>
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>Unable to Load Courses</h3>
          <p className={`${textSecondary} mb-4`}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>My Courses</h1>
        <p className={textSecondary}>
          Purchased & enrolled courses, % complete
        </p>
      </div>

      {/* Summary Stats - Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className={`text-2xl font-bold ${textPrimary}`}>{courses.length}</p>
              <p className={`text-sm ${textMuted}`}>Total Courses</p>
            </div>
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {courses.length ? Math.round(courses.reduce((acc, c) => acc + (c.completionPercentage || 0), 0) / courses.length) : 0}%
              </p>
              <p className={`text-sm ${textMuted}`}>Avg Completion</p>
            </div>
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {courses.filter(c => c.status === 'enrolled').length}
              </p>
              <p className={`text-sm ${textMuted}`}>Enrolled</p>
            </div>
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {courses.filter(c => c.purchased).length}
              </p>
              <p className={`text-sm ${textMuted}`}>Purchased</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Only show when courses exist */}
      {courses.length > 0 && (
        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-8`}>
        <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('assignments')}
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-blue-900">View Assignments</p>
              <p className="text-sm text-blue-700">Check your pending tasks</p>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Award className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-green-900">View Grades</p>
              <p className="text-sm text-green-700">Check your performance</p>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('timetable')}
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Calendar className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Class Timetable</p>
              <p className="text-sm text-purple-700">View your schedule</p>
            </div>
          </button>
        </div>
        </div>
      )}

      {/* Browse Mode - Available Courses */}
      {browseMode && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Available Courses</h2>
              <p className={textSecondary}>Browse and enroll in courses to start learning</p>
            </div>
            <button
              onClick={() => setBrowseMode(false)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Back to My Courses
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableCourses.map((course) => (
              <div 
                key={course.id}
                className={`${cardBg} rounded-xl shadow-lg border-l-4 ${getColorClasses(course.color || 'blue')} p-6 hover:shadow-xl transition-shadow cursor-pointer`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`text-xl font-semibold ${textPrimary}`}>{course.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                        course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                    <p className={`text-sm ${textMuted} mb-2`}>{course.code}</p>
                    {course.instructor && (
                      <p className={`text-sm ${textSecondary} flex items-center`}>
                        <Users className="w-4 h-4 mr-1" />
                        {course.instructor}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${textPrimary}`}>
                      {course.price}
                    </div>
                    <p className={`text-xs ${textMuted}`}>Price</p>
                  </div>
                </div>

                <p className={`text-sm ${textSecondary} mb-4`}>{course.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {course.duration && (
                      <div className="text-center">
                        <Clock className={`w-4 h-4 mx-auto ${textSecondary} mb-1`} />
                        <p className={`text-xs ${textMuted}`}>{course.duration}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(course);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnrollClick(course);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!browseMode && courses.length === 0 && (
        <div className={`${cardBg} rounded-xl shadow-lg p-12 text-center`}>
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>No Courses Found</h3>
          <p className={`${textSecondary} mb-6`}>
            You haven't purchased or enrolled in any courses yet. Browse available courses to get started.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => setBrowseMode(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Browse Courses</span>
            </button>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {!browseMode && courses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>My Courses</h2>
              <p className={textSecondary}>Your enrolled and purchased courses</p>
            </div>
            <button
              onClick={() => setBrowseMode(true)}
              className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center space-x-2`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse More Courses</span>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
          <div 
            key={course.id}
            className={`${cardBg} rounded-xl shadow-lg border-l-4 ${getColorClasses(course.color || 'blue')} p-6 hover:shadow-xl transition-shadow cursor-pointer`}
            onClick={() => setSelectedCourse(course)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`text-xl font-semibold ${textPrimary}`}>{course.name}</h3>
                  {course.purchased && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Purchased</span>
                  )}
                  {course.status === 'enrolled' && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">Enrolled</span>
                  )}
                </div>
                <p className={`text-sm ${textMuted} mb-2`}>{course.code || course.courseCode}</p>
                {course.instructor && (
                  <p className={`text-sm ${textSecondary} flex items-center`}>
                    <Users className="w-4 h-4 mr-1" />
                    {course.instructor}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getGradeColor(course.completionPercentage || 0)}`}>
                  {course.completionPercentage || 0}%
                </div>
                <p className={`text-xs ${textMuted}`}>Complete</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${
                    (course.completionPercentage || 0) >= 75 ? 'bg-green-500' :
                    (course.completionPercentage || 0) >= 50 ? 'bg-blue-500' :
                    (course.completionPercentage || 0) >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${course.completionPercentage || 0}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{course.completionPercentage || 0}% complete</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {course.purchased && (
                  <div className="text-center">
                    <CheckCircle className={`w-4 h-4 mx-auto ${textSecondary} mb-1`} />
                    <p className={`text-xs ${textMuted}`}>Purchased</p>
                  </div>
                )}
                {course.status === 'enrolled' && (
                  <div className="text-center">
                    <Award className={`w-4 h-4 mx-auto ${textSecondary} mb-1`} />
                    <p className={`text-xs ${textMuted}`}>Enrolled</p>
                  </div>
                )}
                {course.duration && (
                  <div className="text-center">
                    <Clock className={`w-4 h-4 mx-auto ${textSecondary} mb-1`} />
                    <p className={`text-xs ${textMuted}`}>{course.duration}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCourse(course);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                {course.status === 'enrolled' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setActiveTab) {
                        setActiveTab('ai-tutor');
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Continue Learning"
                  >
                    <BookOpen className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>{selectedCourse.name}</h3>
              <button 
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {selectedCourse.purchased && (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Purchased</span>
                )}
                {selectedCourse.status === 'enrolled' && (
                  <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">Enrolled</span>
                )}
                {selectedCourse.level && !selectedCourse.status && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCourse.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                    selectedCourse.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedCourse.level}
                  </span>
                )}
              </div>
              
              <div>
                <p className={`text-sm ${textMuted}`}>Course Code</p>
                <p className={`font-medium ${textPrimary}`}>{selectedCourse.code || selectedCourse.courseCode}</p>
              </div>
              
              {selectedCourse.instructor && (
                <div>
                  <p className={`text-sm ${textMuted}`}>Instructor</p>
                  <p className={`font-medium ${textPrimary}`}>{selectedCourse.instructor}</p>
                </div>
              )}
              
              {selectedCourse.status === 'enrolled' && (
                <div>
                  <p className={`text-sm ${textMuted} mb-2`}>Completion Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        (selectedCourse.completionPercentage || 0) >= 75 ? 'bg-green-500' :
                        (selectedCourse.completionPercentage || 0) >= 50 ? 'bg-blue-500' :
                        (selectedCourse.completionPercentage || 0) >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedCourse.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm font-medium ${textPrimary} mt-1`}>{selectedCourse.completionPercentage || 0}% complete</p>
                </div>
              )}
              
              {selectedCourse.description && (
                <div>
                  <p className={`text-sm ${textMuted}`}>Description</p>
                  <p className={`font-medium ${textPrimary}`}>{selectedCourse.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {selectedCourse.duration && (
                  <div>
                    <p className={`text-sm ${textMuted}`}>Duration</p>
                    <p className={`font-medium ${textPrimary}`}>{selectedCourse.duration}</p>
                  </div>
                )}
                {selectedCourse.price && !selectedCourse.status && (
                  <div>
                    <p className={`text-sm ${textMuted}`}>Price</p>
                    <p className={`font-medium ${textPrimary}`}>{selectedCourse.price}</p>
                  </div>
                )}
                {selectedCourse.purchasedDate && (
                  <div>
                    <p className={`text-sm ${textMuted}`}>Purchased</p>
                    <p className={`font-medium ${textPrimary}`}>{new Date(selectedCourse.purchasedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4 mt-4 border-t border-gray-200">
              {selectedCourse.status === 'enrolled' && (
                <button 
                  onClick={() => {
                    if (setActiveTab) {
                      setActiveTab('ai-tutor');
                    }
                    setSelectedCourse(null);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Learning
                </button>
              )}
              {!selectedCourse.status && !selectedCourse.purchased && (
                <button 
                  onClick={() => {
                    handleEnrollClick(selectedCourse);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enroll Now
                </button>
              )}
              {!selectedCourse.status && selectedCourse.purchased && (
                <button 
                  onClick={() => {
                    alert('Purchase course functionality coming soon');
                    setSelectedCourse(null);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Purchase Course
                </button>
              )}
              <button 
                onClick={() => setSelectedCourse(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && courseToEnroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>Enroll in Course</h3>
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setCourseToEnroll(null);
                }}
                className={`text-2xl ${textMuted} hover:${textPrimary}`}
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className={`${textSecondary} mb-2`}>Course: <span className="font-semibold">{courseToEnroll.name}</span></p>
              <p className={`${textPrimary} text-2xl font-bold`}>{courseToEnroll.price || '$0'}</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="stripe">Credit/Debit Card</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {paymentMethod === 'stripe' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardholderName"
                      placeholder="Jane Doe"
                      required
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength="19"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Expiry</label>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        required
                        maxLength="5"
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>CVC</label>
                      <input
                        type="text"
                        name="cvc"
                        placeholder="123"
                        required
                        maxLength="4"
                        className={`w-full px-3 py-2 border rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod !== 'stripe' && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${textSecondary}`}>
                    {paymentMethod === 'mtn_momo' && 'You will receive payment instructions via MTN Mobile Money.'}
                    {paymentMethod === 'airtel_money' && 'You will receive payment instructions via Airtel Money.'}
                    {paymentMethod === 'bank' && 'You will receive bank transfer details after submitting.'}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {processingPayment ? 'Processing...' : `Pay and Enroll`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setCourseToEnroll(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
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

export default MyCoursesPanel;

