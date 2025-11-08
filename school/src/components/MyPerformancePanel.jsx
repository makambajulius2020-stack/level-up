import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BarChart3, Award, Target, Star, 
  Calendar, Clock, Eye, Download, AlertTriangle,
  CheckCircle, Brain, Zap, Users, BookOpen, FileText,
  GraduationCap, X, Search, Filter
} from 'lucide-react';

const MyPerformancePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('term');
  const [grades, setGrades] = useState([]);
  const [gradesSummary, setGradesSummary] = useState(null);
  const [gradesLoading, setGradesLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const performanceData = {
    overview: { currentGPA: 0, classRank: 0, totalStudents: 0, improvement: 0, attendanceRate: 0 },
    subjects: [],
    assessments: [],
    goals: []
  };

  useEffect(() => {
    if (activeTab === 'grades') {
      fetchGrades();
    } else if (activeTab === 'certificates') {
      fetchCertificates();
    }
  }, [activeTab]);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/grades/?semester=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades || []);
        setGradesSummary(data.summary || null);
      } else {
        setGrades([]);
        setGradesSummary(null);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]);
      setGradesSummary(null);
    } finally {
      setGradesLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      setCertificatesLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Try to fetch from API first
      if (token && currentUser?.id) {
        try {
          // Try achievements endpoint which includes certificates
          const response = await fetch(`${baseUrl}/api/student-achievements/student/${currentUser.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.achievements) {
              // Filter for certificates only
              const certs = data.achievements.filter(a => a.certificate_issued);
              setCertificates(certs);
              setCertificatesLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.log('API fetch failed, trying localStorage:', apiError);
        }
      }
      
      // Fallback to localStorage
      const savedCertificates = localStorage.getItem(`certificates_${currentUser?.id}`);
      if (savedCertificates) {
        try {
          const parsedCertificates = JSON.parse(savedCertificates);
          setCertificates(parsedCertificates);
        } catch (parseError) {
          console.error('Error parsing saved certificates:', parseError);
          setCertificates([]);
        }
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setCertificatesLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
    return <TrendingUp className="w-4 h-4 text-blue-600 transform rotate-90" />;
  };

  const getGradeColorClass = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'A-': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-blue-600 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'B-': return 'text-yellow-600 bg-yellow-100';
      case 'C+': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const renderGrades = () => (
    <div className="space-y-6">
      {/* Term Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Grade History</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">Current Semester</option>
            <option value="previous">Previous Semester</option>
            <option value="year">Academic Year</option>
          </select>
        </div>

        {/* Grades Summary */}
        {gradesSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{gradesSummary.averageGrade || 'N/A'}</div>
              <div className="text-sm text-gray-600">Average Grade</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{gradesSummary.highestGrade || 'N/A'}</div>
              <div className="text-sm text-gray-600">Highest Grade</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{gradesSummary.totalSubjects || 0}</div>
              <div className="text-sm text-gray-600">Subjects</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{gradesSummary.improvement || '0'}%</div>
              <div className="text-sm text-gray-600">Improvement</div>
            </div>
          </div>
        )}

        {/* Grades List */}
        {gradesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading grades...</p>
          </div>
        ) : grades.length > 0 ? (
          <div className="space-y-3">
            {grades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{grade.course}</div>
                    <div className="text-sm text-gray-600">{grade.assessment} • {grade.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold px-3 py-1 rounded-full ${getGradeColorClass(grade.grade)}`}>
                      {grade.grade}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Score: {grade.score}%
                    </div>
                  </div>
                  {grade.trend && (
                    <div className="flex items-center">
                      {grade.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : grade.trend === 'down' ? (
                        <TrendingUp className="w-5 h-5 text-red-600 transform rotate-180" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-blue-600 transform rotate-90" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No grades available</p>
            <p className="text-sm text-gray-400">Your grades will appear here once they are recorded</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{performanceData.overview.currentGPA}</div>
          <div className="text-sm text-gray-600">Current GPA</div>
          <div className="text-xs text-green-600 mt-1">+{performanceData.overview.improvement}% this semester</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{performanceData.overview.classRank}</div>
          <div className="text-sm text-gray-600">Class Rank</div>
          <div className="text-xs text-gray-500 mt-1">of {performanceData.overview.totalStudents} students</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{performanceData.overview.attendanceRate}%</div>
          <div className="text-sm text-gray-600">Attendance</div>
          <div className="text-xs text-purple-600 mt-1">Excellent</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {performanceData.overview.currentGPA > 0 ? `${(performanceData.overview.currentGPA * 1.1).toFixed(1)}` : '--'}
          </div>
          <div className="text-sm text-gray-600">Expected GPA</div>
          <div className="text-xs text-orange-600 mt-1">Based on current trend</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {performanceData.overview.attendanceRate >= 80 ? 'On Track' : 'At Risk'}
          </div>
          <div className="text-sm text-gray-600">Graduation Readiness</div>
          <div className="text-xs text-red-600 mt-1">Academic standing</div>
        </div>
        <div 
          className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition-shadow" 
          onClick={() => setActiveTab('certificates')}
        >
          <div className="text-3xl mb-2">🏅</div>
          <div className="text-sm font-semibold text-gray-700">Certificates</div>
          <div className="text-xs text-gray-500 mt-1">Download or share completion badges</div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Subject Performance</h3>
        <div className="space-y-4">
          {performanceData.subjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{subject.name}</div>
                  <div className="text-sm text-gray-600">Rank #{subject.rank} • Class Avg: {subject.classAverage}%</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getGradeColor(subject.currentGrade)}`}>
                    {subject.currentGrade}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Previous: {subject.previousGrade}%
                  </div>
                </div>
                {getTrendIcon(subject.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Recent Assessments</h3>
        <div className="space-y-3">
          {performanceData.assessments.map((assessment, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{assessment.name}</div>
                <div className="text-sm text-gray-600">{assessment.date}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getGradeColor((assessment.score / assessment.maxScore) * 100)}`}>
                    {assessment.score}/{assessment.maxScore}
                  </div>
                  <div className="text-xs text-gray-500">Rank #{assessment.rank}</div>
                </div>
                <div className="text-sm text-gray-600">
                  Avg: {assessment.average}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleDownloadCertificate = (certificate) => {
    if (certificate.certificate_url) {
      window.open(certificate.certificate_url, '_blank');
    } else {
      alert('Certificate download link not available. Please contact your administrator.');
    }
  };

  const handlePreviewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.certificate_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || cert.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCertificates = () => {
    const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
    const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
    const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center`}>
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${textPrimary} mb-1`}>{certificates.length}</div>
            <div className={`text-sm ${textMuted}`}>Total Certificates</div>
          </div>
          <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center`}>
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${textPrimary} mb-1`}>
              {certificates.filter(c => c.verified).length}
            </div>
            <div className={`text-sm ${textMuted}`}>Verified</div>
          </div>
          <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center`}>
            <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${textPrimary} mb-1`}>
              {certificates.filter(c => c.award_level === 'school').length}
            </div>
            <div className={`text-sm ${textMuted}`}>School Level</div>
          </div>
          <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center`}>
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${textPrimary} mb-1`}>
              {certificates.filter(c => c.award_level === 'national').length}
            </div>
            <div className={`text-sm ${textMuted}`}>National Level</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted} w-5 h-5`} />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${darkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'text-white placeholder-gray-400' : ''}`}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className={`${textMuted} w-5 h-5`} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-4 py-2 border ${darkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="arts">Arts</option>
                <option value="leadership">Leadership</option>
                <option value="community">Community Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates List */}
        {certificatesLoading ? (
          <div className={`${cardBg} rounded-xl shadow-lg p-12 text-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={textSecondary}>Loading certificates...</p>
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className={`${cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 ${
                  certificate.award_level === 'national' ? 'border-purple-500' :
                  certificate.award_level === 'regional' ? 'border-blue-500' :
                  'border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${
                      certificate.award_level === 'national' ? 'bg-purple-100' :
                      certificate.award_level === 'regional' ? 'bg-blue-100' :
                      'bg-yellow-100'
                    }`}>
                      <Award className={`w-6 h-6 ${
                        certificate.award_level === 'national' ? 'text-purple-600' :
                        certificate.award_level === 'regional' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>{certificate.title}</h3>
                      {certificate.category && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {certificate.category}
                        </span>
                      )}
                    </div>
                  </div>
                  {certificate.verified && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>

                {certificate.description && (
                  <p className={`text-sm ${textSecondary} mb-4 line-clamp-2`}>
                    {certificate.description}
                  </p>
                )}

                <div className={`space-y-2 mb-4 ${textMuted} text-sm`}>
                  {certificate.achievement_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(certificate.achievement_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {certificate.certificate_number && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-mono text-xs">ID: {certificate.certificate_number}</span>
                    </div>
                  )}
                  {certificate.awarded_by && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Awarded by: {certificate.awarded_by}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handlePreviewCertificate(certificate)}
                    className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                      darkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    } transition-colors`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  {certificate.certificate_url && (
                    <button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                        darkMode
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      } transition-colors`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${cardBg} rounded-xl shadow-lg p-12 text-center`}>
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>No Certificates Found</h3>
            <p className={textSecondary}>
              {searchQuery || filterCategory !== 'all'
                ? 'No certificates match your search criteria.'
                : "You haven't earned any certificates yet. Keep working hard!"}
            </p>
          </div>
        )}

        {/* Certificate Preview Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto`}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-semibold ${textPrimary} flex items-center`}>
                    <Award className="w-5 h-5 mr-2 text-yellow-600" />
                    Certificate Preview
                  </h3>
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className={`${textMuted} hover:${textPrimary}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-8">
                {/* Certificate Template */}
                <div className="border-4 border-yellow-600 rounded-lg p-12 bg-gradient-to-br from-yellow-50 to-white text-center">
                  <div className="mb-8">
                    <GraduationCap className="w-20 h-20 text-yellow-600 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">CERTIFICATE OF ACHIEVEMENT</h1>
                    <div className="w-32 h-1 bg-yellow-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">This is to certify that</p>
                  </div>
                  <div className="my-8">
                    <h2 className="text-3xl font-bold text-blue-900 mb-2">
                      {currentUser?.name || currentUser?.username || 'Student'}
                    </h2>
                    {currentUser?.id && (
                      <p className="text-gray-600">Student ID: {currentUser.id}</p>
                    )}
                  </div>
                  <div className="mb-8">
                    <p className="text-lg text-gray-700 mb-4">
                      has successfully achieved
                    </p>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedCertificate.title}</h3>
                    {selectedCertificate.description && (
                      <p className="text-gray-600 mb-2">{selectedCertificate.description}</p>
                    )}
                    {selectedCertificate.category && (
                      <p className="text-sm text-gray-500">Category: {selectedCertificate.category}</p>
                    )}
                  </div>
                  <div className="mt-12 flex justify-between items-end">
                    <div className="text-center">
                      {selectedCertificate.awarded_by && (
                        <div className="border-t-2 border-gray-900 w-48 pt-2">
                          <p className="font-semibold">{selectedCertificate.awarded_by}</p>
                          <p className="text-sm">Awarded By</p>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-2">
                        {selectedCertificate.achievement_date
                          ? new Date(selectedCertificate.achievement_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : new Date().toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                      </p>
                      <div className="border-t-2 border-gray-900 w-48 pt-2">
                        <p className="font-semibold">Date</p>
                      </div>
                    </div>
                  </div>
                  {selectedCertificate.certificate_number && (
                    <p className="mt-4 text-xs text-gray-500">
                      Certificate ID: {selectedCertificate.certificate_number}
                    </p>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  {selectedCertificate.certificate_url && (
                    <button
                      onClick={() => handleDownloadCertificate(selectedCertificate)}
                      className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
                        darkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition-colors`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className={`px-6 py-2 border ${
                      darkMode
                        ? 'border-gray-600 text-white hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } rounded-lg transition-colors`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Academic Goals Progress</h3>
        <div className="space-y-6">
          {performanceData.goals.map((goal, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{goal.subject}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Current: {goal.current}%</span>
                  <span className="text-sm text-blue-600">Target: {goal.target}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full relative"
                  style={{ width: `${goal.progress}%` }}
                >
                  <div className="absolute right-0 top-0 h-3 w-1 bg-green-600 rounded-r-full"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{goal.progress}% to goal</span>
                <span>{goal.target - goal.current} points needed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Focus Area</span>
            </div>
            <p className="text-sm text-blue-800">Increase Computer Science study time by 30% to reach your target of 85%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Strength</span>
            </div>
            <p className="text-sm text-green-800">Maintain excellent Mathematics performance - you're on track for 95%</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Performance</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track your academic progress and achievements</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'grades', label: 'My Grades', icon: Award },
              { id: 'certificates', label: 'Certificates', icon: GraduationCap },
              { id: 'goals', label: 'Goals & Progress', icon: Target },
              { id: 'analytics', label: 'Detailed Analytics', icon: TrendingUp }
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
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'grades' && renderGrades()}
      {activeTab === 'certificates' && renderCertificates()}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics</h3>
          <p className="text-gray-600">Advanced performance analytics coming soon</p>
        </div>
      )}
    </div>
  );
};

export default MyPerformancePanel;
