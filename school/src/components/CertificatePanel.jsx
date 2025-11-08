import React, { useState } from 'react';
import { Award, Download, Eye, Search, Filter, CheckCircle, Clock, User, GraduationCap, Calendar, FileText, Settings, X, ArrowLeft, Sparkles, Star, Trophy } from 'lucide-react';
import BackButton from './BackButton';

const CertificatePanel = ({ userRole, currentUser, darkMode, setActiveTab: setParentActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateSettings, setCertificateSettings] = useState({
    template: 'modern',
    includeQRCode: true,
    includeSignature: true,
    includeSeal: true
  });

  // Courses data - empty array, will be populated from backend
  const [courses] = useState([]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'completed' && course.status === 'completed') ||
                         (filterStatus === 'in-progress' && course.status === 'in-progress') ||
                         (filterStatus === 'generated' && course.certificateGenerated) ||
                         (filterStatus === 'pending' && course.status === 'completed' && !course.certificateGenerated);
    return matchesSearch && matchesStatus;
  });

  const handleGenerateCertificate = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || course.status !== 'completed') {
      alert('Certificate can only be generated for completed courses.');
      return;
    }
    
    // In a real app, this would make an API call to generate the certificate
    alert(`Certificate generated for ${course.studentName} - ${course.courseName}`);
    setSelectedCertificate(course);
  };

  const handleBatchGenerate = () => {
    const completedCourses = courses.filter(c => c.status === 'completed' && !c.certificateGenerated);
    if (completedCourses.length === 0) {
      alert('No pending certificates to generate.');
      return;
    }
    
    // In a real app, this would make an API call
    alert(`Generating ${completedCourses.length} certificates...`);
  };

  const handleDownloadCertificate = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.certificateGenerated) {
      alert('Certificate not yet generated.');
      return;
    }
    
    // In a real app, this would download the certificate file
    alert(`Downloading certificate for ${course.studentName} - ${course.courseName}`);
  };

  const handlePreviewCertificate = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCertificate(course);
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
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Award className="w-10 h-10 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-3xl font-bold flex items-center mb-2">
                <Sparkles className="w-6 h-6 mr-2 text-yellow-300" />
                Course Completion Certificates
              </h3>
              <p className="text-blue-100 text-lg">Auto-generate and manage professional certificates</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="text-3xl font-bold text-yellow-300">
                {courses.filter(c => c.status === 'completed' && !c.certificateGenerated).length}
              </div>
              <div className="text-sm text-blue-100 mt-1">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-300">
                {courses.filter(c => c.certificateGenerated).length}
              </div>
              <div className="text-sm text-blue-100 mt-1">Generated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1 text-lg">Batch Operations</h4>
              <p className="text-sm text-gray-600">Generate certificates for all completed courses at once</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBatchGenerate}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 font-semibold transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate All Pending</span>
            </button>
            <button
              onClick={() => setCertificateSettings({ ...certificateSettings, template: certificateSettings.template === 'modern' ? 'classic' : 'modern' })}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-blue-500 transition-all flex items-center space-x-2 font-medium"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name, course, or ID..."
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
              <option value="all">All Courses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending Generation</option>
              <option value="generated">Generated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Certificates List - Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Found</h3>
              <p className="text-gray-500">No courses match your search criteria</p>
            </div>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden group"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${
                course.certificateGenerated 
                  ? 'from-green-500 to-emerald-600' 
                  : course.status === 'completed'
                  ? 'from-blue-500 to-indigo-600'
                  : 'from-gray-400 to-gray-500'
              } p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    {course.certificateGenerated && (
                      <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Issued</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-bold mb-1 line-clamp-1">{course.courseName}</h4>
                  <p className="text-white/80 text-sm">{course.courseCode}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Student Info */}
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{course.studentName}</p>
                      <p className="text-xs text-gray-500">{course.studentId}</p>
                    </div>
                  </div>

                  {/* Grade */}
                  {course.grade && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Grade:</span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        course.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                        course.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                        course.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.grade}
                      </span>
                    </div>
                  )}

                  {/* Completion Date */}
                  {course.completionDate ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(course.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>In Progress ({course.progress}%)</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="pt-2 border-t border-gray-200">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      course.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          In Progress
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6">
                {course.status === 'completed' && !course.certificateGenerated ? (
                  <button
                    onClick={() => handleGenerateCertificate(course.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Certificate</span>
                  </button>
                ) : course.certificateGenerated ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePreviewCertificate(course.id)}
                      className="bg-purple-50 text-purple-600 py-3 rounded-xl hover:bg-purple-100 transition-all font-semibold flex items-center justify-center space-x-2 border-2 border-purple-200"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(course.id)}
                      className="bg-green-50 text-green-600 py-3 rounded-xl hover:bg-green-100 transition-all font-semibold flex items-center justify-center space-x-2 border-2 border-green-200"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-auto animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                      Certificate Preview
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">View and download your certificate</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Certificate Template */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-400 relative">
                {/* Decorative Border Pattern */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-blue-600 opacity-20"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-purple-600 opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-indigo-600 opacity-20"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-pink-600 opacity-20"></div>
                </div>

                {/* Certificate Content */}
                <div className="relative p-12 md:p-16 text-center">
                  {/* Header Decoration */}
                  <div className="mb-8">
                    <div className="flex justify-center items-center mb-6">
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full shadow-lg">
                        <GraduationCap className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-yellow-500 mx-2" />
                      <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent tracking-wide">
                        CERTIFICATE
                      </h1>
                      <Star className="w-6 h-6 text-yellow-500 mx-2" />
                    </div>
                    <div className="w-40 h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 mx-auto mb-4 rounded-full"></div>
                    <p className="text-2xl text-gray-700 font-medium">OF COMPLETION</p>
                  </div>

                  {/* Certification Text */}
                  <div className="my-10">
                    <p className="text-xl text-gray-600 mb-6">This is to certify that</p>
                    <div className="my-8">
                      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        {selectedCertificate.studentName}
                      </h2>
                      <div className="flex items-center justify-center space-x-4 text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span className="text-sm">ID: {selectedCertificate.studentId}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xl text-gray-700 mb-6">
                      has successfully completed the course
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 my-6">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedCertificate.courseName}</h3>
                      <p className="text-gray-600 text-lg">Course Code: {selectedCertificate.courseCode}</p>
                      {selectedCertificate.grade && (
                        <div className="mt-4 inline-block">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-xl font-bold shadow-lg">
                            Grade: {selectedCertificate.grade}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="mt-16 grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="border-t-2 border-gray-900 w-48 mx-auto pt-3">
                        <p className="font-bold text-lg text-gray-900">Instructor Signature</p>
                      </div>
                    </div>
                    <div className="text-center">
                      {selectedCertificate.completionDate && (
                        <>
                          <p className="font-semibold text-lg text-gray-900 mb-3">
                            {new Date(selectedCertificate.completionDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <div className="border-t-2 border-gray-900 w-48 mx-auto pt-3">
                            <p className="font-bold text-lg text-gray-900">Date</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* QR Code and Certificate ID */}
                  <div className="mt-12 flex flex-col items-center space-y-4">
                    {certificateSettings.includeQRCode && (
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-xl border-2 border-gray-300">
                        <div className="w-32 h-32 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <span className="text-xs text-gray-500">QR Code</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedCertificate.certificateId && (
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <p className="text-sm font-mono text-gray-600">
                          Certificate ID: <span className="font-bold">{selectedCertificate.certificateId}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Close
                </button>
                {selectedCertificate.certificateGenerated && (
                  <button
                    onClick={() => handleDownloadCertificate(selectedCertificate.id)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatePanel;

