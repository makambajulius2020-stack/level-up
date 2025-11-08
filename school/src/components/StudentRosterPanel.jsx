import React, { useState } from 'react';
import { 
  Users, Search, Filter, Download, Upload, Eye, MessageSquare, 
  Phone, Mail, Calendar, Award, TrendingUp, Clock, AlertTriangle,
  CheckCircle, FileText, BarChart3, User, Edit, Plus, Star
} from 'lucide-react';

const StudentRosterPanel = ({ userRole, currentUser }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const classes = [];

  const students = [];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'high-performers' && student.performance.currentGrade >= 85) ||
                         (filterBy === 'needs-attention' && student.performance.currentGrade < 75) ||
                         (filterBy === 'attendance-issues' && student.performance.attendance < 90);
    
    return matchesSearch && matchesFilter;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'grade':
        return b.performance.currentGrade - a.performance.currentGrade;
      case 'attendance':
        return b.performance.attendance - a.performance.attendance;
      case 'rank':
        return a.performance.rank - b.performance.rank;
      default:
        return 0;
    }
  });

  const getPerformanceColor = (grade) => {
    if (grade >= 85) return 'text-green-600 bg-green-100';
    if (grade >= 75) return 'text-blue-600 bg-blue-100';
    if (grade >= 65) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-blue-600 transform rotate-90" />;
    }
  };

  const renderStudentList = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Students</option>
            <option value="high-performers">High Performers</option>
            <option value="needs-attention">Needs Attention</option>
            <option value="attendance-issues">Attendance Issues</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="grade">Sort by Grade</option>
            <option value="attendance">Sort by Attendance</option>
            <option value="rank">Sort by Rank</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {sortedStudents.length} of {students.length} students
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.studentId}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getPerformanceColor(student.performance.currentGrade)}`}>
                      {student.performance.currentGrade}%
                    </span>
                    <span className="text-xs text-gray-500">Rank #{student.performance.rank}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{student.performance.attendance}%</div>
                  <div className="text-xs text-gray-600">Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {student.performance.assignments.completed}/{student.performance.assignments.total}
                  </div>
                  <div className="text-xs text-gray-600">Assignments</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {student.subjects.slice(0, 2).map((subject, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{subject.name}</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{subject.grade}%</span>
                      {getTrendIcon(subject.trend)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedStudent(student)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </button>
                <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudentProfile = () => {
    if (!selectedStudent) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={selectedStudent.photo}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                <p className="text-gray-600">{selectedStudent.studentId} • {selectedStudent.class}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 text-sm font-bold rounded ${getPerformanceColor(selectedStudent.performance.currentGrade)}`}>
                    Grade: {selectedStudent.performance.currentGrade}%
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded">
                    Rank #{selectedStudent.performance.rank}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedStudent(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{selectedStudent.performance.currentGrade}%</div>
              <div className="text-sm text-blue-700">Overall Grade</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{selectedStudent.performance.attendance}%</div>
              <div className="text-sm text-green-700">Attendance</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {selectedStudent.performance.assignments.completed}/{selectedStudent.performance.assignments.total}
              </div>
              <div className="text-sm text-purple-700">Assignments</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{selectedStudent.performance.lastTest}%</div>
              <div className="text-sm text-orange-700">Last Test</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Student Email</label>
                <p className="text-gray-900">{selectedStudent.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Student Phone</label>
                <p className="text-gray-900">{selectedStudent.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Emergency Contact Email</label>
                <p className="text-gray-900">{selectedStudent.emergencyContactEmail || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                <p className="text-gray-900">{selectedStudent.emergencyContactPhone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Address</label>
                <p className="text-gray-900">{selectedStudent.address}</p>
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Subject Performance
            </h3>
            <div className="space-y-4">
              {selectedStudent.subjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{subject.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-sm font-bold rounded ${getPerformanceColor(subject.grade)}`}>
                      {subject.grade}%
                    </span>
                    {getTrendIcon(subject.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {selectedStudent.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-600">{activity.date}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      activity.status === 'submitted' ? 'bg-green-100 text-green-800' :
                      activity.status === 'graded' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'present' ? 'bg-green-100 text-green-800' :
                      activity.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                    {activity.grade && (
                      <div className="text-sm font-medium text-gray-900 mt-1">{activity.grade}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Behavior Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
              Behavior Notes
            </h3>
            <div className="space-y-3">
              {selectedStudent.behaviorNotes.map((note, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{note.date}</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      note.type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {note.type}
                    </span>
                  </div>
                  <p className="text-gray-900">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-800">Message Student</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-800">Contact Emergency</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-purple-800">Schedule Meeting</span>
            </button>
            <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center">
              <FileText className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-orange-800">Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Roster</h1>
        <p className="text-gray-600">Manage your students, track their progress, and maintain communication</p>
      </div>

      {selectedStudent ? renderStudentProfile() : renderStudentList()}
    </div>
  );
};

export default StudentRosterPanel;
