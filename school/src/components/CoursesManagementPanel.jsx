import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle, XCircle, Eye, Search, Filter, 
  Clock, Star, Users, TrendingUp, AlertCircle, FileText,
  Edit, Download, Upload, Calendar, Award, Plus, X
} from 'lucide-react';

const CoursesManagementPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    price: '',
    duration: '',
    level: 'beginner',
    status: 'approved'
  });

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveCourse = (courseId) => {
    // Approve course logic
    alert('Course approved successfully!');
  };

  const handleRejectCourse = (courseId) => {
    // Reject course logic
    alert('Course rejected.');
  };

  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.description || !newCourse.instructor || !newCourse.category || !newCourse.price) {
      alert('Please fill in all required fields');
      return;
    }

    const course = {
      id: Date.now(),
      ...newCourse,
      price: parseFloat(newCourse.price) || 0,
      duration: newCourse.duration || 'N/A',
      createdAt: new Date().toISOString()
    };

    setCourses([...courses, course]);
    setNewCourse({
      title: '',
      description: '',
      instructor: '',
      category: '',
      price: '',
      duration: '',
      level: 'beginner',
      status: 'approved'
    });
    setShowAddCourseModal(false);
    alert('Course added successfully!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter courses based on active tab and search term
  const filteredCourses = courses.filter(course => {
    // Filter by status
    if (activeTab === 'pending' && course.status !== 'pending') return false;
    if (activeTab === 'approved' && course.status !== 'approved') return false;
    if (activeTab === 'rejected' && course.status !== 'rejected') return false;
    // 'all' tab shows all courses
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        course.title?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.instructor?.toLowerCase().includes(searchLower) ||
        course.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Update tab counts
  const tabCounts = {
    pending: courses.filter(c => c.status === 'pending').length,
    approved: courses.filter(c => c.status === 'approved').length,
    rejected: courses.filter(c => c.status === 'rejected').length,
    all: courses.length
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Courses Management</h1>
                <p className={`${textSecondary} mt-2`}>Approve and review submitted courses</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Course</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={`${cardBg} rounded-xl shadow-lg mb-6`}>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pending', label: 'Pending Review', icon: Clock, count: tabCounts.pending },
                { id: 'approved', label: 'Approved', icon: CheckCircle, count: tabCounts.approved },
                { id: 'rejected', label: 'Rejected', icon: XCircle, count: tabCounts.rejected },
                { id: 'all', label: 'All Courses', icon: BookOpen, count: tabCounts.all }
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
                  {tab.count > 0 && (
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className={`${cardBg} rounded-xl shadow-lg p-12 text-center`}>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Courses Found</h3>
              <p className={textSecondary}>
                {activeTab === 'pending' 
                  ? 'No courses pending review at this time'
                  : activeTab === 'approved'
                  ? 'No approved courses yet'
                  : activeTab === 'rejected'
                  ? 'No rejected courses'
                  : 'No courses available'}
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-xl font-semibold ${textPrimary}`}>{course.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                    <p className={`${textSecondary} mb-2`}>{course.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={textMuted}>Instructor: {course.instructor}</span>
                      <span className={textMuted}>•</span>
                      <span className={textMuted}>Category: {course.category}</span>
                      <span className={textMuted}>•</span>
                      <span className={textMuted}>Price: {typeof course.price === 'number' ? `$${course.price.toFixed(2)}` : course.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {activeTab === 'pending' && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApproveCourse(course.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectCourse(course.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Edit className="w-4 h-4" />
                      <span>Request Changes</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New Course Modal */}
      {showAddCourseModal && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Add New Course</h2>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 ${textSecondary}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newCourse.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                  placeholder="Enter course description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Instructor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={newCourse.instructor}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                    placeholder="Enter instructor name"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={newCourse.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                    placeholder="e.g., Mathematics, Science"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={newCourse.price}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={newCourse.duration}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                    placeholder="e.g., 8 weeks, 40 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Level
                  </label>
                  <select
                    name="level"
                    value={newCourse.level}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={newCourse.status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${inputBg}`}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className={`px-6 py-2 border rounded-lg hover:bg-gray-50 ${textSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagementPanel;

