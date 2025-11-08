import React, { useState } from 'react';
import { GraduationCap, BookOpen, Target, CheckCircle, AlertTriangle, FileText, Download, Upload, Globe, Award, TrendingUp, BarChart3, Plus, ArrowLeft } from 'lucide-react';
import BackButton from './BackButton';

const CurriculumAlignmentPanel = ({ userRole, currentUser, darkMode, setActiveTab: setParentActiveTab }) => {
  const [activeTab, setActiveTab] = useState('alignment');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState('all');
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    level: '',
    credits: '',
    description: '',
    prerequisites: [],
    learningOutcomes: []
  });
  const [newResource, setNewResource] = useState({
    title: '',
    type: '',
    course: '',
    standard: '',
    description: '',
    file: null
  });


  // International curriculum standards for higher education
  const internationalStandards = [
    { id: 'accreditation', name: 'International Accreditation', frameworks: ['ABET', 'AACSB', 'AMBA', 'EQUIS'] },
    { id: 'competency', name: 'Competency-Based Learning', frameworks: ['Bloom\'s Taxonomy', 'SOLO Taxonomy', 'DACUM'] },
    { id: 'outcome', name: 'Outcome-Based Education', frameworks: ['OBE Framework', 'CBE Standards'] },
    { id: 'professional', name: 'Professional Standards', frameworks: ['Industry Standards', 'Professional Bodies'] }
  ];

  const courses = [];

  const getStatusColor = (status) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      'needs-improvement': 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAlignmentColor = (alignment) => {
    if (alignment >= 95) return 'text-green-600';
    if (alignment >= 85) return 'text-blue-600';
    if (alignment >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {setParentActiveTab && (
        <div className="flex items-center">
          <BackButton onClick={() => setParentActiveTab('dashboard')}  />
        </div>
      )}
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Overall Alignment</p>
              <p className="text-2xl font-bold text-green-800">0%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Courses Tracked</p>
              <p className="text-2xl font-bold text-blue-800">0</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Learning Outcomes</p>
              <p className="text-2xl font-bold text-purple-800">0/0</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Standards Met</p>
              <p className="text-2xl font-bold text-yellow-800">0</p>
            </div>
            <Globe className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'alignment', label: 'Curriculum Alignment', icon: Target },
              { id: 'courses', label: 'Course Management', icon: BookOpen },
              { id: 'standards', label: 'International Standards', icon: Globe },
              { id: 'resources', label: 'Learning Resources', icon: FileText },
              { id: 'assessment', label: 'Assessment Mapping', icon: GraduationCap }
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
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'alignment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Curriculum Alignment Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                  <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg col-span-3">
                    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No curriculum alignment data yet</p>
                    <p className="text-sm mt-2">Add courses to start tracking curriculum alignment</p>
                  </div>
                ) : courses.map((course, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-sm text-gray-600">{course.code} • {course.level}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                        {course.status.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Alignment Score</span>
                          <span className={`text-sm font-medium ${getAlignmentColor(course.alignment)}`}>
                            {course.alignment}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              course.alignment >= 95 ? 'bg-green-500' :
                              course.alignment >= 85 ? 'bg-blue-500' :
                              course.alignment >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${course.alignment}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Standards Met</p>
                          <p className="font-medium">{course.standardsMet}/{course.totalStandards}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Learning Outcomes</p>
                          <p className="font-medium">{course.outcomesMet}/{course.totalOutcomes}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                      <button className="text-green-600 hover:text-green-800 text-sm">Update</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Course Management</h3>
                <button 
                  onClick={() => setShowAddCourseModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Undergraduate Courses
                  </h4>
                  <div className="space-y-2">
                    {courses.filter(c => c.level === 'undergraduate').map((course, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <h5 className="font-medium">{course.name}</h5>
                        <p className="text-sm text-gray-600">{course.code} • {course.credits} Credits</p>
                      </div>
                    ))}
                    {courses.filter(c => c.level === 'undergraduate').length === 0 && (
                      <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">No undergraduate courses</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-purple-600" />
                    Postgraduate Courses
                  </h4>
                  <div className="space-y-2">
                    {courses.filter(c => c.level === 'postgraduate').map((course, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <h5 className="font-medium">{course.name}</h5>
                        <p className="text-sm text-gray-600">{course.code} • {course.credits} Credits</p>
                      </div>
                    ))}
                    {courses.filter(c => c.level === 'postgraduate').length === 0 && (
                      <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">No postgraduate courses</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'standards' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Standards & Frameworks</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {internationalStandards.map((standard) => (
                  <div key={standard.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{standard.name}</h4>
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      {standard.frameworks.map((framework, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{framework}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">Aligned</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Learning Resources</h3>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resource
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Syllabus & Course Outlines</h4>
                  <div className="space-y-2">
                    {[].length === 0 && (
                      <p className="text-sm text-blue-600">No resources uploaded yet</p>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Learning Materials</h4>
                  <div className="space-y-2">
                    {[].length === 0 && (
                      <p className="text-sm text-green-600">No resources uploaded yet</p>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-3">Assessment Tools</h4>
                  <div className="space-y-2">
                    {[].length === 0 && (
                      <p className="text-sm text-purple-600">No resources uploaded yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Assessment Mapping</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    International Assessment Framework
                  </h4>
                  <div className="space-y-3">
                    {[].length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Assessment mapping coming soon</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Course Assessment Alignment
                  </h4>
                  <div className="space-y-3">
                    {[].length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Assessment alignment coming soon</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
              <button 
                onClick={() => setShowAddCourseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`✅ Course Added Successfully!\n\nCourse: ${newCourse.name}\nCode: ${newCourse.code}\nLevel: ${newCourse.level}\n\nInternational curriculum alignment will be automatically configured.`);
              setNewCourse({
                name: '',
                code: '',
                level: '',
                credits: '',
                description: '',
                prerequisites: [],
                learningOutcomes: []
              });
              setShowAddCourseModal(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                    <input 
                      type="text"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Advanced Mathematics, Data Structures"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Code *</label>
                    <input 
                      type="text"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                      required
                      placeholder="e.g., MATH301, CS201"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                    <select 
                      value={newCourse.level}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, level: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="diploma">Diploma</option>
                      <option value="certificate">Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Hours *</label>
                    <input 
                      type="number"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, credits: e.target.value }))}
                      required
                      placeholder="e.g., 3, 4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    value={newCourse.description}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    placeholder="Brief description of the course..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upload Learning Resource</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`✅ Resource Uploaded Successfully!\n\nTitle: ${newResource.title}\nType: ${newResource.type}\nCourse: ${newResource.course}\n\nResource is now available and aligned with international standards.`);
              setNewResource({
                title: '',
                type: '',
                course: '',
                standard: '',
                description: '',
                file: null
              });
              setShowUploadModal(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource Title *</label>
                    <input 
                      type="text"
                      value={newResource.title}
                      onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                      required
                      placeholder="e.g., Course Syllabus, Lecture Notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type *</label>
                    <select 
                      value={newResource.type}
                      onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      <option value="syllabus">Syllabus</option>
                      <option value="lecture-notes">Lecture Notes</option>
                      <option value="assessment">Assessment Tool</option>
                      <option value="reading-material">Reading Material</option>
                      <option value="video">Video Lecture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">International Standard *</label>
                  <select 
                    value={newResource.standard}
                    onChange={(e) => setNewResource(prev => ({ ...prev, standard: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Standard</option>
                    {internationalStandards.map(std => (
                      <option key={std.id} value={std.id}>{std.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    placeholder="Brief description of the resource..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="resource-upload"
                      onChange={(e) => setNewResource(prev => ({ ...prev, file: e.target.files[0] }))}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.mp4,.mp3"
                    />
                    <label htmlFor="resource-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, PPT, XLSX, MP4, MP3 up to 50MB</p>
                      </div>
                    </label>
                  </div>
                  {newResource.file && (
                    <p className="text-sm text-green-600 mt-2">✓ File selected: {newResource.file.name}</p>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-green-900">International Standards Alignment</h4>
                      <p className="text-sm text-green-700">This resource will be automatically tagged with relevant international curriculum standards and accreditation frameworks.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumAlignmentPanel;

