import React, { useState } from 'react';
import { 
  User, Calendar, Clock, BookOpen, AlertTriangle, CheckCircle, 
  Eye, Download, Bell, MapPin, Users, Star, Target,
  Brain, Zap, TrendingUp, Award, FileText, Phone, Mail,
  Heart, Car, GraduationCap, Trophy, Activity, Clock3,
  TrendingDown, AlertCircle, Shield, Bus, Home
} from 'lucide-react';

const StudentOverviewPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeChild, setActiveChild] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Sample data for children
  const children = [
    {
      id: 1,
      name: 'Emma Johnson',
      grade: 'Grade 10',
      class: '10A',
      age: 15,
      bloodType: 'O+',
      lastActivity: '2 hours ago',
      avatar: '👧',
      attendance: 95,
      averageGrade: 87,
      feeStatus: 'paid',
      subjects: [
        { name: 'Mathematics', grade: 92, teacher: 'Dr. Smith', room: 'Room 201', color: 'green' },
        { name: 'Computer Science', grade: 88, teacher: 'Dr. Brown', room: 'Lab 1', color: 'blue' },
        { name: 'Engineering', grade: 85, teacher: 'Dr. Davis', room: 'Lab 2', color: 'blue' },
        { name: 'Business Administration', grade: 90, teacher: 'Dr. Wilson', room: 'Room 203', color: 'green' },
        { name: 'Economics', grade: 89, teacher: 'Dr. Taylor', room: 'Room 105', color: 'blue' },
        { name: 'Psychology', grade: 82, teacher: 'Dr. Anderson', room: 'Room 108', color: 'yellow' }
      ],
      recentGrades: [
        { subject: 'Mathematics', grade: 95, date: '2024-01-15', type: 'Test', maxScore: 100 },
        { subject: 'Computer Science', grade: 88, date: '2024-01-14', type: 'Assignment', maxScore: 100 },
        { subject: 'Business Administration', grade: 92, date: '2024-01-13', type: 'Quiz', maxScore: 100 },
        { subject: 'Engineering', grade: 85, date: '2024-01-12', type: 'Test', maxScore: 100 }
      ],
      upcomingExams: [
        { subject: 'Mathematics', date: '2024-01-20', time: '09:00', duration: '2 hours', room: 'Room 201', daysRemaining: 5 },
        { subject: 'Computer Science', date: '2024-01-22', time: '10:30', duration: '1.5 hours', room: 'Lab 1', daysRemaining: 7 },
        { subject: 'Business Administration', date: '2024-01-25', time: '14:00', duration: '2 hours', room: 'Room 105', daysRemaining: 10 }
      ],
      extracurricular: [
        { name: 'Football', type: 'Sports', schedule: 'Mon, Wed, Fri 4:00 PM', coach: 'Coach Martinez' },
        { name: 'Debate Club', type: 'Academic', schedule: 'Tue, Thu 3:30 PM', coach: 'Ms. Taylor' },
        { name: 'Music Club', type: 'Creative', schedule: 'Mon, Wed 5:00 PM', coach: 'Mr. Johnson' },
        { name: 'Art Club', type: 'Creative', schedule: 'Fri 4:30 PM', coach: 'Ms. Rodriguez' }
      ],
      achievements: [
        { title: 'Best in Mathematics', type: 'Academic', date: '2024-01-10', category: 'Award' },
        { title: 'Football Team Captain', type: 'Sports', date: '2024-01-05', category: 'Leadership' },
        { title: 'Art Competition Winner', type: 'Creative', date: '2023-12-20', category: 'Competition' },
        { title: 'Top Performer', type: 'Academic', date: '2023-12-15', category: 'Recognition' }
      ],
      attendanceHistory: [
        { date: '2024-01-15', status: 'Present', arrivalTime: '08:15', color: 'green' },
        { date: '2024-01-14', status: 'Late', arrivalTime: '08:45', color: 'yellow' },
        { date: '2024-01-13', status: 'Present', arrivalTime: '08:10', color: 'green' },
        { date: '2024-01-12', status: 'Present', arrivalTime: '08:20', color: 'green' },
        { date: '2024-01-11', status: 'Absent', arrivalTime: 'N/A', color: 'red' }
      ],
      goals: [
        { title: 'Improve Computer Science Grade', current: 88, target: 95, deadline: '2024-02-15', progress: 88 },
        { title: 'Maintain Attendance', current: 95, target: 95, deadline: '2024-06-30', progress: 100 },
        { title: 'Join School Band', current: 0, target: 100, deadline: '2024-03-01', progress: 0 }
      ],
      emergencyContacts: [
        { name: 'Emergency Contact 1', phone: '+1-555-0123', relationship: 'Guardian' },
        { name: 'Emergency Contact 2', phone: '+1-555-0124', relationship: 'Guardian' },
        { name: 'Dr. Smith (Family Doctor)', phone: '+1-555-0125', relationship: 'Doctor' }
      ],
    },
    {
      id: 2,
      name: 'Alex Johnson',
      grade: 'Grade 8',
      class: '8B',
      age: 13,
      bloodType: 'A+',
      lastActivity: '1 hour ago',
      avatar: '👦',
      attendance: 98,
      averageGrade: 91,
      feeStatus: 'paid',
      subjects: [
        { name: 'Mathematics', grade: 95, teacher: 'Dr. Lee', room: 'Room 301', color: 'green' },
        { name: 'Computer Science', grade: 89, teacher: 'Dr. Garcia', room: 'Lab 4', color: 'blue' },
        { name: 'Economics', grade: 93, teacher: 'Dr. White', room: 'Room 205', color: 'green' },
        { name: 'Sociology', grade: 87, teacher: 'Dr. Black', room: 'Room 208', color: 'blue' }
      ],
      recentGrades: [
        { subject: 'Mathematics', grade: 98, date: '2024-01-15', type: 'Test', maxScore: 100 },
        { subject: 'Computer Science', grade: 89, date: '2024-01-14', type: 'Assignment', maxScore: 100 },
        { subject: 'Economics', grade: 94, date: '2024-01-13', type: 'Quiz', maxScore: 100 }
      ],
      upcomingExams: [
        { subject: 'Mathematics', date: '2024-01-21', time: '09:30', duration: '1.5 hours', room: 'Room 301', daysRemaining: 6 },
        { subject: 'Computer Science', date: '2024-01-23', time: '11:00', duration: '1 hour', room: 'Lab 4', daysRemaining: 8 }
      ],
      extracurricular: [
        { name: 'Basketball', type: 'Sports', schedule: 'Tue, Thu 4:30 PM', coach: 'Coach Williams' },
        { name: 'Chess Club', type: 'Academic', schedule: 'Wed 3:45 PM', coach: 'Mr. Black' }
      ],
      achievements: [
        { title: 'Math Olympiad Winner', type: 'Academic', date: '2024-01-08', category: 'Competition' },
        { title: 'Basketball MVP', type: 'Sports', date: '2023-12-18', category: 'Award' }
      ],
      attendanceHistory: [
        { date: '2024-01-15', status: 'Present', arrivalTime: '08:05', color: 'green' },
        { date: '2024-01-14', status: 'Present', arrivalTime: '08:12', color: 'green' },
        { date: '2024-01-13', status: 'Present', arrivalTime: '08:08', color: 'green' },
        { date: '2024-01-12', status: 'Present', arrivalTime: '08:15', color: 'green' },
        { date: '2024-01-11', status: 'Present', arrivalTime: '08:10', color: 'green' }
      ],
      goals: [
        { title: 'Achieve 95% in Computer Science', current: 89, target: 95, deadline: '2024-02-20', progress: 89 },
        { title: 'Join Basketball Team', current: 100, target: 100, deadline: '2024-01-15', progress: 100 }
      ],
      emergencyContacts: [
        { name: 'Emergency Contact 1', phone: '+1-555-0123', relationship: 'Guardian' },
        { name: 'Emergency Contact 2', phone: '+1-555-0124', relationship: 'Guardian' }
      ],
    }
  ];

  const currentChild = children[activeChild];

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600 bg-green-100';
    if (grade >= 80) return 'text-blue-600 bg-blue-100';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFeeStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'Present': return 'text-green-600 bg-green-100';
      case 'Late': return 'text-yellow-600 bg-yellow-100';
      case 'Absent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderChildProfile = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-4xl">{currentChild.avatar}</div>
          <div>
            <h3 className={`text-xl font-semibold ${textPrimary}`}>{currentChild.name}</h3>
            <p className={`text-sm ${textSecondary}`}>{currentChild.grade} • {currentChild.class}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className={`text-sm font-medium ${textPrimary}`}>Age</span>
            </div>
            <p className={`text-lg ${textSecondary}`}>{currentChild.age} years old</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-600" />
              <span className={`text-sm font-medium ${textPrimary}`}>Blood Type</span>
            </div>
            <p className={`text-lg ${textSecondary}`}>{currentChild.bloodType}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock3 className="w-4 h-4 text-green-600" />
              <span className={`text-sm font-medium ${textPrimary}`}>Last Activity</span>
            </div>
            <p className={`text-lg ${textSecondary}`}>{currentChild.lastActivity}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <h4 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{currentChild.attendance}%</div>
            <div className="text-sm text-blue-800">Attendance</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{currentChild.averageGrade}%</div>
            <div className="text-sm text-green-800">Average Grade</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${getFeeStatusColor(currentChild.feeStatus).split(' ')[0]}`}>
              {currentChild.feeStatus.charAt(0).toUpperCase() + currentChild.feeStatus.slice(1)}
            </div>
            <div className="text-sm text-purple-800">Fee Status</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubjectPerformance = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
      <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Subject Performance</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentChild.subjects.map((subject, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="flex items-start justify-between mb-3 min-h-[2.5rem]">
              <h5 className={`font-medium ${textPrimary} truncate flex-1 mr-2`} title={subject.name}>{subject.name}</h5>
              <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${getGradeColor(subject.grade)}`}>
                {subject.grade}%
              </span>
            </div>
            <div className="space-y-2 text-sm flex-1">
              <div className="flex items-center space-x-2 min-h-[1.25rem]">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className={`${textSecondary} truncate`} title={subject.teacher}>{subject.teacher}</span>
              </div>
              <div className="flex items-center space-x-2 min-h-[1.25rem]">
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className={`${textSecondary} truncate`} title={subject.room}>{subject.room}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    subject.color === 'green' ? 'bg-green-500' :
                    subject.color === 'blue' ? 'bg-blue-500' :
                    subject.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${subject.grade}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecentGrades = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
      <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Recent Grades</h4>
      <div className="space-y-3">
        {currentChild.recentGrades.map((grade, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${textPrimary} truncate`} title={grade.subject}>{grade.subject}</div>
                <div className={`text-sm ${textSecondary} truncate`} title={`${grade.type} • ${grade.date}`}>
                  {grade.type} • {grade.date}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className={`text-xl font-bold ${getGradeColor(grade.grade).split(' ')[0]}`}>
                {grade.grade}/{grade.maxScore}
              </div>
              <div className={`text-xs ${textSecondary}`}>Score</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUpcomingExams = () => {
    const calculateDaysRemaining = (examDate) => {
      const today = new Date();
      const exam = new Date(examDate);
      const diffTime = exam - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    };

    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Upcoming Exams</h4>
        <div className="space-y-4">
          {currentChild.upcomingExams.map((exam, index) => {
            const daysRemaining = calculateDaysRemaining(exam.date);
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <h5 className={`font-medium ${textPrimary} truncate flex-1 mr-4`} title={exam.subject}>{exam.subject}</h5>
                  <div className="text-center flex-shrink-0">
                    <div className={`text-xl font-bold ${daysRemaining <= 3 ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-blue-600'}`}>
                      {daysRemaining}
                    </div>
                    <div className={`text-xs ${daysRemaining <= 3 ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-blue-600'}`}>
                      Days
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 min-h-[1.25rem]">
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className={`${textSecondary} truncate`} title={exam.date}>{exam.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 min-h-[1.25rem]">
                    <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className={`${textSecondary} truncate`} title={exam.time}>{exam.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 min-h-[1.25rem]">
                    <Clock3 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className={`${textSecondary} truncate`} title={exam.duration}>{exam.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 min-h-[1.25rem]">
                    <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className={`${textSecondary} truncate`} title={exam.room}>{exam.room}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderExtracurricular = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
      <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Extracurricular Activities</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentChild.extracurricular.map((activity, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 flex flex-col">
            <div className="flex items-start justify-between mb-3 min-h-[2.5rem]">
              <h5 className={`font-medium ${textPrimary} truncate flex-1 mr-2`} title={activity.name}>{activity.name}</h5>
              <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                activity.type === 'Sports' ? 'bg-green-100 text-green-800' :
                activity.type === 'Academic' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {activity.type}
              </span>
            </div>
            <div className="space-y-2 text-sm flex-1">
              <div className="flex items-center space-x-2 min-h-[1.25rem]">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className={`${textSecondary} truncate`} title={activity.schedule}>{activity.schedule}</span>
              </div>
              <div className="flex items-center space-x-2 min-h-[1.25rem]">
                <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className={`${textSecondary} truncate`} title={activity.coach}>{activity.coach}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
      <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Recent Achievements</h4>
      <div className="space-y-3">
        {currentChild.achievements.map((achievement, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${textPrimary} truncate`} title={achievement.title}>{achievement.title}</div>
              <div className={`text-sm ${textSecondary} truncate`} title={`${achievement.type} • ${achievement.date}`}>
                {achievement.type} • {achievement.date}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                achievement.type === 'Academic' ? 'bg-blue-100 text-blue-800' :
                achievement.type === 'Sports' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {achievement.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAttendanceHistory = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
      <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Attendance History (Last 5 Days)</h4>
      <div className="space-y-3">
        {currentChild.attendanceHistory.map((day, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                day.color === 'green' ? 'bg-green-500' :
                day.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${textPrimary} truncate`} title={day.date}>{day.date}</div>
                <div className={`text-sm ${textSecondary} truncate`} title={`Arrival: ${day.arrivalTime}`}>
                  Arrival: {day.arrivalTime}
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ml-2 ${getAttendanceColor(day.status)}`}>
              {day.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoalsTargets = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
      <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Goals & Targets</h4>
      <div className="space-y-4">
        {currentChild.goals.map((goal, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3 min-h-[2.5rem]">
              <h5 className={`font-medium ${textPrimary} truncate flex-1 mr-2`} title={goal.title}>{goal.title}</h5>
              <span className={`text-sm ${textSecondary} flex-shrink-0`} title={`Due: ${goal.deadline}`}>
                Due: {goal.deadline}
              </span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className={textSecondary}>Progress</span>
                <span className={textSecondary}>{goal.current}/{goal.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
            <div className={`text-sm ${goal.progress >= 100 ? 'text-green-600 font-medium' : 'text-gray-600'} truncate`}>
              {goal.progress >= 100 ? '✅ Completed' : `${goal.target - goal.current} remaining`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactEmergency = () => (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <h4 className={`text-lg font-semibold mb-6 ${textPrimary}`}>Emergency Contacts</h4>
        <div className="space-y-3">
          {currentChild.emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${textPrimary} truncate`} title={contact.name}>{contact.name}</div>
                <div className={`text-sm ${textSecondary} truncate`} title={contact.relationship}>{contact.relationship}</div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                <Phone className="w-4 h-4 text-green-600" />
                <span className={`text-sm ${textSecondary} truncate`} title={contact.phone}>{contact.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${textPrimary}`}>Children's Overview</h1>
        <p className={textSecondary}>Comprehensive view of your children's academic and personal information</p>
      </div>

      {/* Child Selector */}
      <div className={`${cardBg} rounded-xl shadow-lg mb-6`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Select Child</h3>
          <div className="flex space-x-4">
            {children.map((child, index) => (
              <button
                key={child.id}
                onClick={() => setActiveChild(index)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-colors ${
                  activeChild === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{child.avatar}</span>
                <div className="text-left">
                  <div className={`font-medium ${textPrimary}`}>{child.name}</div>
                  <div className={`text-sm ${textSecondary}`}>{child.grade}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${cardBg} rounded-xl shadow-lg mb-6`}>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'subjects', label: 'Courses', icon: BookOpen },
              { id: 'grades', label: 'Recent Grades', icon: Award },
              { id: 'exams', label: 'Upcoming Exams', icon: Calendar },
              { id: 'activities', label: 'Activities', icon: Activity },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'attendance', label: 'Attendance', icon: CheckCircle },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'contact', label: 'Contact & Emergency', icon: Phone }
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

      {/* Content */}
      {activeTab === 'profile' && renderChildProfile()}
      {activeTab === 'subjects' && renderSubjectPerformance()}
      {activeTab === 'grades' && renderRecentGrades()}
      {activeTab === 'exams' && renderUpcomingExams()}
      {activeTab === 'activities' && renderExtracurricular()}
      {activeTab === 'achievements' && renderAchievements()}
      {activeTab === 'attendance' && renderAttendanceHistory()}
      {activeTab === 'goals' && renderGoalsTargets()}
      {activeTab === 'contact' && renderContactEmergency()}
    </div>
  );
};

export default StudentOverviewPanel;

