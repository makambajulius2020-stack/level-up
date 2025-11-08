import React, { useState, useEffect } from 'react';
import {
  User, Calendar, BookOpen, Users, BarChart3, Settings, Bell, CreditCard, MessageSquare, Clock, Award, Shield,
  Home, UserPlus, FileText, Phone, Mail, Eye, EyeOff, LogOut, CheckCircle, AlertTriangle, TrendingUp, GraduationCap, DollarSign, Smartphone,
  ChevronLeft, ChevronRight, MapPin, Moon, Sun, Target, Star, Receipt, Bot, Brain, Video, Fingerprint, Bus, Stethoscope, Building2, Trophy, Play
} from 'lucide-react';
import LoginForm from './LoginForm';
import DashboardCard from './DashboardCard';
import AIInsightsPanel from './AIInsightsPanel';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
// Enhanced Components - ALL your actual work restored
import AttendancePanel from './components/AttendancePanel';
import PaymentPanel from './components/PaymentPanel';
import AIAnalyticsPanel from './components/AIAnalyticsPanel';
import NotificationPanel from './components/NotificationPanel';
import ProfilePanel from './components/ProfilePanel';
import MessagingPanel from './components/MessagingPanel';
import AssignmentPanel from './components/AssignmentPanel';
import LessonPlanningPanel from './components/LessonPlanningPanel';
import SystemSettingsPanel from './components/SystemSettingsPanel';
import EnhancedAttendancePanel from './components/EnhancedAttendancePanel';
import EnhancedExamPanel from './components/EnhancedExamPanel';
import EnhancedStudentProgressPanel from './components/EnhancedStudentProgressPanel';
import EnhancedSubmitAssignmentPanel from './components/EnhancedSubmitAssignmentPanel';
import MyCoursesPanel from './components/MyCoursesPanel';
import MyPerformancePanel from './components/MyPerformancePanel';
import FeeBalancePanel from './components/FeeBalancePanel';
import TeacherRatingsPanel from './components/TeacherRatingsPanel';
import StudyMaterialsPanel from './components/StudyMaterialsPanel';
import PastPapersPanel from './components/PastPapersPanel';
import AIRecommendationsPanel from './components/AIRecommendationsPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import TeachingResourcesPanel from './components/TeachingResourcesPanel';
import StudentRosterPanel from './components/StudentRosterPanel';
import PlagiarismDetectionPanel from './components/PlagiarismDetectionPanel';
import UserManagementPanel from './components/UserManagementPanel';
import LibraryPanel from './components/LibraryPanel';
import ActivitiesPanel from './components/ActivitiesPanel';
import GradesPanel from './components/GradesPanel';
import ExamPanel from './components/ExamPanel';
import FeeStatementsPanel from './components/FeeStatementsPanel';
// Missing component imports referenced later
import ClassManagementPanel from './components/ClassManagementPanel';
import ClassSchedulePanel from './components/ClassSchedulePanel';
import AIReadingTimetablePanel from './components/AIReadingTimetablePanel';
import ClassTimetablePanel from './components/ClassTimetablePanel';
import ExamSchedulePanel from './components/ExamSchedulePanel';
import FeeStructurePanel from './components/FeeStructurePanel';
import ReportsPanel from './components/ReportsPanel';
import FeedbackPanel from './components/FeedbackPanel';
import CurriculumAlignmentPanel from './components/CurriculumAlignmentPanel';
import ComplaintsPanel from './components/ComplaintsPanel';
import AwardsPanel from './components/AwardsPanel';
import BiometricSetupPanel from './components/BiometricSetupPanel';
import SemesterManagementPanel from './components/SemesterManagementPanel';
import InvoicesPanel from './components/InvoicesPanel';
import ExpensesPanel from './components/ExpensesPanel';
import AIAutomationPanel from './components/AIAutomationPanel';
import UnitPlanGeneratorPanel from './components/UnitPlanGeneratorPanel';
import ClassAnnouncementPanel from './components/ClassAnnouncementPanel';
import AITeachingToolsPanel from './components/AITeachingToolsPanel';
import StudentAIToolsPanel from './components/StudentAIToolsPanel';
import ErrorBoundary from './components/ErrorBoundary';
import OnlineClassPanel from './components/OnlineClassPanel';
import FeeRestrictionGuard from './components/FeeRestrictionGuard';
// NEW ENHANCED FEATURES
import ProctoringDashboard from './components/ProctoringDashboard';
import HolidayTestsPanel from './components/HolidayTestsPanel';
import RevenueDashboard from './components/RevenueDashboard';
import TeacherBiometricAttendancePanel from './components/TeacherBiometricAttendancePanel';
import HolidayPlannerPanel from './components/HolidayPlannerPanel';
import BiometricPayrollPanel from './components/BiometricPayrollPanel';
import StudentBiometricPanel from './components/StudentBiometricPanel';
import HelpSupportPanel from './components/HelpSupportPanel';
import StudentSettingsPanel from './components/StudentSettingsPanel';
import TeacherSettingsPanel from './components/TeacherSettingsPanel';
import Department from './components/Department';
import AdminTeacherRatingsPanel from './components/AdminTeacherRatingsPanel';
import TeacherFeedbackPanel from './components/TeacherFeedbackPanel';
import CertificatePanel from './components/CertificatePanel';
import BackButton from './components/BackButton';
import CoursesManagementPanel from './components/CoursesManagementPanel';
import ScholarshipPricingPanel from './components/ScholarshipPricingPanel';


const SmartSchoolApp = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loginForm, setLoginForm] = React.useState({ email: '', password: '', showPassword: false });
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [notifications, setNotifications] = React.useState([]);
  const [aiInsights, setAiInsights] = React.useState([]);
  const [calendarDate, setCalendarDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [darkMode, setDarkMode] = React.useState(false);
  const [fontSize, setFontSize] = React.useState('medium');
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  // In-app floating chatbot state
  const [inAppChatOpen, setInAppChatOpen] = React.useState(false);
  const [inAppChatMessages, setInAppChatMessages] = React.useState([
    { id: 1, role: 'ai', text: 'Hi! I am your SmartSchool assistant. How can I help?' }
  ]);
  const [inAppChatInput, setInAppChatInput] = React.useState('');
  // Profile dropdown state
  const [showEventForm, setShowEventForm] = React.useState(false);
  const [showReminderForm, setShowReminderForm] = React.useState(false);
  const [showRSVPForm, setShowRSVPForm] = React.useState(false);
  const [showContactForm, setShowContactForm] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  // Enhanced fetch utility with retry and fallback
  const enhancedFetch = async (url, options = {}, retries = 3) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('NETWORK_ERROR');
        } else if (response.status >= 500) {
          throw new Error('SERVER_ERROR');
        } else if (response.status === 404) {
          throw new Error('NOT_FOUND');
        } else {
          throw new Error(`HTTP_${response.status}`);
        }
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retries > 0 && (error.name === 'AbortError' || error.message === 'NETWORK_ERROR')) {
        console.log(`Retrying request (${4 - retries}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
        return enhancedFetch(url, options, retries - 1);
      }
      
      throw error;
    }
  };

  // Check server connectivity
  const checkServerHealth = async () => {
    try {
      const explicit = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
      const apiBase = explicit ? `${explicit}/api` : '/api';
      const response = await enhancedFetch(`${apiBase}/health`, { method: 'GET' });
      return response.ok;
    } catch (error) {
      console.warn('Server health check failed:', error);
      return false;
    }
  };

  // School events data
  const schoolEvents = {
    '2024-09-25': [
    ],
    '2024-09-26': [
      { title: 'Science Fair Preparation', time: '9:00 AM', type: 'academic', color: 'blue' }
    ],
    '2024-09-27': [
      { title: 'Sports Practice', time: '4:00 PM', type: 'sports', color: 'orange' }
    ],
    '2024-09-28': [
      { title: 'Drama Club Rehearsal', time: '3:00 PM', type: 'cultural', color: 'purple' }
    ],
    '2024-09-30': [
      { title: 'Monthly Assembly', time: '8:30 AM', type: 'event', color: 'indigo' }
    ],
    '2024-10-01': [
      { title: 'Term 3 Opening Assembly', time: '8:30 AM', type: 'event', color: 'indigo' }
    ],
    '2024-10-03': [
      { title: 'Computer Lab Training', time: '11:00 AM', type: 'academic', color: 'blue' }
    ],
    '2024-10-05': [
      { title: 'School Open Day', time: '10:00 AM', type: 'event', color: 'indigo' }
    ],
    '2024-10-08': [
      { title: 'Cultural Day Rehearsal', time: '10:00 AM', type: 'cultural', color: 'purple' }
    ],
    '2024-10-10': [
      { title: 'Mid-term Exams Start', time: '8:00 AM', type: 'exam', color: 'red' }
    ],
    '2024-10-15': [
      { title: 'Fee Payment Deadline', time: 'All Day', type: 'financial', color: 'yellow' }
    ],
    '2024-10-20': [
      { title: 'Inter-house Sports', time: '8:00 AM', type: 'sports', color: 'orange' }
    ]
  };

  // Check for existing session on app load - Database only
  React.useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        // Only restore users with valid database tokens (not localStorage tokens)
        if (userData.role && !token.startsWith('local_')) {
          setCurrentUser(userData);
        } else {
          // Clear any localStorage-based user data
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      setAiInsights([]);
      setNotifications([]);
    }
  }, [currentUser]);

  // Apply font size globally
  React.useEffect(() => {
    const root = document.documentElement;
    switch (fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  }, [fontSize]);

  // Close notification dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotificationDropdown && !event.target.closest('.notification-dropdown')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationDropdown]);

  // Close profile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginForm;

    try {
      const explicit = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
      const apiBase = explicit ? `${explicit}/api` : '/api';

      const response = await enhancedFetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!data?.access_token || !data?.user?.role) {
        throw new Error(data?.msg || 'Invalid email or password');
      }

      const currentUserData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      };

      setCurrentUser(currentUserData);
      setLoginForm({ email: '', password: '', showPassword: false });
      setActiveTab('dashboard');

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('currentUser', JSON.stringify(currentUserData));
    } catch (error) {
      console.error('Login error:', error);
      alert(error?.message || 'Login failed. Please try again.');
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setNotifications([]);
    setAiInsights([]);
    setShowNotificationDropdown(false);
    
    // Clear ALL localStorage data related to authentication
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('registeredUsers');
    
    // Clear any other cached authentication data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('user') || key.includes('auth') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction) => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const days = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
      const dateKey = formatDateKey(date);
      const hasEvents = schoolEvents[dateKey];
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg relative transition-colors ${
            isToday ? 'bg-blue-100 text-blue-800 font-semibold' :
            isSelected ? 'bg-blue-500 text-white' :
            hasEvents ? 'bg-green-50 text-green-800 hover:bg-green-100' :
            'hover:bg-gray-100'
          }`}
        >
          {day}
          {hasEvents && (
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              <span>Events</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">
              {selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Upcoming Events'}
            </h4>
            <button 
              onClick={() => setActiveTab('events')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(() => {
              if (selectedDate && schoolEvents[formatDateKey(selectedDate)]) {
                // Show events for selected date
                return schoolEvents[formatDateKey(selectedDate)].map((event, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setActiveTab('events')}
                  >
                    <div className={`w-3 h-3 rounded-full mr-3 bg-${event.color}-500`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-gray-600">{event.time}</p>
                    </div>
                  </div>
                ));
              } else {
                // Show all upcoming events
                const today = new Date();
                const upcomingEvents = [];
                Object.entries(schoolEvents).forEach(([dateKey, events]) => {
                  const eventDate = new Date(dateKey);
                  if (eventDate >= today) {
                    events.forEach(event => {
                      upcomingEvents.push({
                        ...event,
                        date: eventDate,
                        dateKey
                      });
                    });
                  }
                });
                
                // Sort by date
                upcomingEvents.sort((a, b) => a.date - b.date);
                
                return upcomingEvents.slice(0, 8).map((event, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setActiveTab('events')}
                  >
                    <div className={`w-3 h-3 rounded-full mr-3 bg-${event.color}-500`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-gray-600">
                        {event.date.toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                  </div>
                ));
              }
            })()}
          </div>
        </div>
      </div>
    );
  };

  const getNavigationItems = (role) => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, section: 'main' },
      { id: 'messaging', label: 'Messages', icon: MessageSquare, section: 'communication' },
      { id: 'settings', label: 'Settings', icon: Settings, section: 'system' },
      { id: 'help-support', label: 'Help & Support', icon: Phone, section: 'system' },
    ];
    
    const roleSpecific = {
      admin: [
        // User Management Section
        { id: 'users', label: 'User Management', icon: Users, section: 'management' },
        { id: 'departments', label: 'Department Management', icon: Building2, section: 'management' },
        
        // Academic Management
        { id: 'classes', label: 'Online Class Management', icon: BookOpen, section: 'academic' },
        { id: 'courses-management', label: 'Courses', icon: BookOpen, section: 'academic' },
        { id: 'subjects', label: 'Digital Library', icon: FileText, section: 'academic' },
        { id: 'curriculum', label: 'Curriculum Setup', icon: GraduationCap, section: 'academic' },
        { id: 'assignments', label: 'Assignment Overview', icon: FileText, section: 'academic' },
        
        // Attendance & Tracking
        { id: 'attendance', label: 'Attendance System', icon: Clock, section: 'tracking' },
        { id: 'biometric-setup', label: 'Biometric Setup', icon: Eye, section: 'tracking' },
        { id: 'student-biometric', label: 'Student Biometric', icon: Fingerprint, section: 'tracking' },
        { id: 'holiday-planner', label: 'Holiday Planner', icon: Calendar, section: 'management' },
        { id: 'biometric-payroll', label: 'Biometric Payroll', icon: DollarSign, section: 'financial' },
        
        // Financial Management
        { id: 'payments', label: 'Payment Management', icon: CreditCard, section: 'financial' },
        { id: 'fee-structure', label: 'Course Fee Structure', icon: DollarSign, section: 'financial' },
        { id: 'scholarship-pricing', label: 'Scholarship & Pricing', icon: DollarSign, section: 'financial' },
        { id: 'term-management', label: 'Semester Management', icon: Calendar, section: 'financial' },
        { id: 'invoices', label: 'Invoices', icon: FileText, section: 'financial' },
        { id: 'expenses', label: 'Expenses', icon: Receipt, section: 'financial' },
        
        // Analytics & Reports
        { id: 'ai-analytics', label: 'AI Analytics', icon: BarChart3, section: 'analytics' },
        { id: 'reports', label: 'Reports', icon: FileText, section: 'analytics' },
        
        // System Management
        { id: 'complaints', label: 'Complaints Management', icon: MessageSquare, section: 'system' },

        // Enhanced Admin Features
        { id: 'admin-teacher-ratings', label: 'Teacher Ratings', icon: Star, section: 'management' },
        { id: 'awards', label: 'Awards & Recognition', icon: Award, section: 'academic' },
        { id: 'ai-automation', label: 'AI Automation Hub', icon: Bot, section: 'system' },
        
        // NEW ENHANCED FEATURES
        { id: 'proctoring', label: 'Exam Proctoring', icon: Video, section: 'academic' },
        { id: 'revenue-dashboard', label: 'Revenue Dashboard', icon: DollarSign, section: 'financial' },
      ],
      
      teacher: [
        // Teaching & Planning
        { id: 'online-class', label: 'Online Classes', icon: Video, section: 'teaching' },
        { id: 'lesson-planning', label: 'Lesson Planning', icon: BookOpen, section: 'teaching' },
        { id: 'unit-plan-generator', label: 'AI Powered Unit Plan Generator', icon: Brain, section: 'teaching' },
        { id: 'ai-teaching-tools', label: 'AI Powered Teaching Tools', icon: Target, section: 'teaching' },
        { id: 'teaching-resources', label: 'Teaching Resources', icon: Brain, section: 'teaching' },
        { id: 'curriculum-alignment', label: 'Curriculum Alignment', icon: GraduationCap, section: 'teaching' },
        
        // Class Management
        { id: 'student-roster', label: 'My Students', icon: Users, section: 'classes' },
        
        // Assignments & Assessment
        { id: 'assignments', label: 'Assignment Management', icon: Brain, section: 'assessment' },
        { id: 'grading', label: 'Grading & Marking', icon: Award, section: 'assessment' },
        { id: 'exam-setting', label: 'Exam Setting', icon: BookOpen, section: 'assessment' },
        { id: 'plagiarism-check', label: ' Plagiarism Detection', icon: Brain, section: 'assessment' },
        { id: 'proctoring', label: 'Exam Proctoring', icon: Brain, section: 'assessment' },
        
        // Student Tracking
        { id: 'attendance', label: 'Attendance Tracking', icon: Clock, section: 'tracking' },
        { id: 'student-progress', label: 'Student Progress', icon: TrendingUp, section: 'tracking' },
        { id: 'ai-analytics', label: 'Student Analytics', icon: BarChart3, section: 'tracking' },

        // Administrative
        { id: 'reports', label: ' Generate Reports', icon: Brain, section: 'admin' },
        { id: 'teacher-feedback', label: 'Feedback', icon: MessageSquare, section: 'admin' },
        
        // Resources
        { id: 'library', label: 'Digital Library', icon: BookOpen, section: 'resources' },
        
        // Holiday Management
        { id: 'holiday-planner', label: ' Holiday Planner', icon: Brain, section: 'holiday' }
      ],
      
      student: [
        // Academic Work
        { id: 'online-class', label: 'Online Classes', icon: Video, section: 'academic' },
        { id: 'subjects', label: ' My Courses', icon: BookOpen, section: 'academic', description: 'Purchased & enrolled courses, % complete' },
        { id: 'exam-schedule', label: 'Exam Schedule & Assignments', icon: Calendar, section: 'academic' },
        
        // Performance & Progress
        { id: 'ai-analytics', label: 'My Performance', icon: TrendingUp, section: 'progress' },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, section: 'progress' },
        { id: 'progress-reports', label: 'Progress Reports', icon: BarChart3, section: 'progress' },
        
        // Attendance & Schedule
        { id: 'attendance', label: 'My Attendance', icon: Clock, section: 'schedule' },
        { id: 'study-timetable', label: 'AI Powered Study Timetable', icon: BookOpen, section: 'schedule' },
        { id: 'activities', label: 'Co-curricular Activities', icon: Calendar, section: 'schedule' },
        
        // Resources
        { id: 'library', label: 'Digital Library', icon: BookOpen, section: 'resources' },
        
        // NEW ENHANCED FEATURES
        { id: 'holiday-tests', label: 'Holiday schedules', icon: FileText, section: 'academic' }
      ],
      
    };
    
    return [...common, ...roleSpecific[role]];
  };

  if (false) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Simple Top Nav */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Modern School</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a>
              <a href="#stories" className="text-gray-600 hover:text-blue-600">Stories</a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {}}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowLanding(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm mb-6">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-gray-700">AI-Powered Personalization</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
              Learn Anything, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Anywhere, Anytime</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
              Explore courses and programs tailored to your goals. AI helps you track progress, get reminders, and stay on the perfect learning path.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowLanding(false)}
                className="px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
              >
                Start Learning Now
              </button>
              <a href="#features" className="px-6 py-3 rounded-lg font-semibold border border-gray-300 bg-white hover:bg-gray-50">
                Browse Features
              </a>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">modern Goals</div>
                  <div className="text-xs text-gray-600">AI learning paths</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Reminders</div>
                  <div className="text-xs text-gray-600">Never miss a lesson</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Progress Tracking</div>
                  <div className="text-xs text-gray-600">Real-time analytics</div>
                </div>
              </div>

              {/* Profile Avatar */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(v => !v)}
                  className={`w-9 h-9 rounded-full overflow-hidden border flex items-center justify-center ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  title="Profile"
                >
                  <span className={`w-full h-full grid place-items-center text-sm font-semibold ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-44 rounded-lg shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <button onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}>Profile</button>
                    <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}>Settings</button>
                    <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-red-300' : 'hover:bg-gray-100 text-red-600'}`}>Logout</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(v => !v)}
                  className={`w-9 h-9 rounded-full overflow-hidden border flex items-center justify-center ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  title="Profile"
                >
                  <span className={`w-full h-full grid place-items-center text-sm font-semibold ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-44 rounded-lg shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <button onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}>Profile</button>
                    <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`}>Settings</button>
                    <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-red-300' : 'hover:bg-gray-100 text-red-600'}`}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">Why Choose <span className="text-blue-600">Our Platform</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Brain, title: 'AI-Personalized Study Plans', desc: 'Smart recommendations for your style and goals' },
                { icon: Award, title: 'Accredited Courses', desc: 'Earn recognized certificates from institutions' },
                { icon: Smartphone, title: 'Mobile Ready', desc: 'Learn from anywhere on any device' },
                { icon: MessageSquare, title: 'AI tutor', desc: 'Instant help and tutoring 24/7' },
                { icon: Users, title: 'Community', desc: 'Learn with others and stay motivated' },
                { icon: Shield, title: 'Secure', desc: 'Your data protected end-to-end' },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    <f.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Courses</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start learning with our most popular courses, taught by industry experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 1,
                  title: "AI & Machine Learning Masterclass",
                  instructor: "Dr. Sarah Johnson",
                  rating: 4.9,
                  students: 12500,
                  duration: "40 hours",
                  price: "$99",
                  level: "Intermediate",
                  category: "Technology & AI",
                  image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
                },
                {
                  id: 2,
                  title: "Professional Pastry & Baking",
                  instructor: "Chef Michael Chen",
                  rating: 4.8,
                  students: 8900,
                  duration: "25 hours",
                  price: "$79",
                  level: "Beginner",
                  category: "Catering",
                  image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop",
                },
                {
                  id: 3,
                  title: "Full Stack Web Development",
                  instructor: "Alex Rodriguez",
                  rating: 4.9,
                  students: 15200,
                  duration: "60 hours",
                  price: "$129",
                  level: "All Levels",
                  category: "Technology",
                  image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
                },
                {
                  id: 4,
                  title: "Digital Marketing & SEO Strategy",
                  instructor: "Emma Williams",
                  rating: 4.7,
                  students: 9800,
                  duration: "30 hours",
                  price: "$89",
                  level: "Intermediate",
                  category: "Marketing",
                  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
                },
                {
                  id: 5,
                  title: "UI/UX Design Fundamentals",
                  instructor: "David Park",
                  rating: 4.8,
                  students: 11300,
                  duration: "35 hours",
                  price: "$94",
                  level: "Beginner",
                  category: "Design",
                  image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
                },
                {
                  id: 6,
                  title: "Business Leadership & Management",
                  instructor: "Dr. Lisa Anderson",
                  rating: 4.9,
                  students: 13700,
                  duration: "45 hours",
                  price: "$109",
                  level: "Advanced",
                  category: "Business",
                  image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop",
                },
              ].map((course, index) => (
                <div
                  key={course.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-blue-500/50 bg-white rounded-2xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Course Image */}
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="px-4 py-2 rounded-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Preview
                      </button>
                    </div>
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white text-blue-600 text-xs font-semibold">
                      {course.level}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="text-xs text-blue-600 font-medium mb-2">{course.category}</div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{course.instructor}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                      <button 
                        onClick={() => setShowLanding(false)}
                        className="px-4 py-2 rounded-lg font-semibold border-2 border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => setShowLanding(false)}
                className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50"
              >
                Browse All Courses
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Modern School. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-gray-600 hover:text-blue-600">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Terms</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginForm 
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
      />
    );
  }

  const navigationItems = getNavigationItems(currentUser.role);

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar - Updated for mobile */}
      <div className={`
  ${isMobileMenuOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:flex'}
  w-64 lg:w-64 h-screen overflow-y-scroll shadow-lg flex flex-col transition-colors duration-300 sidebar-scroll 
  ${darkMode ? 'bg-gray-800' : 'bg-white'}
`}>
  {/* Close button for mobile */}
  {isMobileMenuOpen && (
    <div className="lg:hidden p-4 border-b flex justify-between items-center">
      <h2 className="font-bold text-lg text-white">Menu</h2>
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  )}
      <div className={`w-64 shadow-lg flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Modern School</h2>
              <p className="text-sm text-gray-600 capitalize">{currentUser.role} Panel</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 pr-3">
          <nav className="mt-6 pb-6">
          {(() => {
            // Group navigation items by section
            const sections = {};
            navigationItems.forEach(item => {
              if (!sections[item.section]) {
                sections[item.section] = [];
              }
              sections[item.section].push(item);
            });

            // Define section order and labels
            const sectionOrder = {
              'main': 'Main',
              'management': 'Management',
              'academic': 'Academic',
              'teaching': 'Teaching & Planning',
              'classes': 'Class Management',
              'assessment': 'Assessment',
              'tracking': 'Tracking & Monitoring',
              'progress': 'Performance & Progress',
              'schedule': 'Schedule & Activities',
              'financial': 'Financial Management',
              'resources': 'Resources',
              'communication': 'Communication',
              'analytics': 'Analytics & Reports',
              'involvement': 'School Involvement',
              'admin': 'Administrative',
              'holiday': 'Holiday Management',
              'system': 'System Management'
            };

            return Object.entries(sectionOrder).map(([sectionKey, sectionLabel]) => {
              const sectionItems = sections[sectionKey];
              if (!sectionItems || sectionItems.length === 0) return null;

              return (
                <div key={sectionKey} className="mb-6">
                  {sectionKey !== 'main' && (
                    <div className="px-6 mb-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {sectionLabel}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-1">
                    {sectionItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}}
                        className={`w-full flex items-center px-6 py-2.5 text-left transition-colors text-sm ${
                          activeTab === item.id 
                            ? (darkMode 
                                ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300 font-medium' 
                                : 'bg-blue-50 border-r-2 border-blue-500 text-blue-600 font-medium')
                            : (darkMode 
                                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-blue-50')
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
          </nav>
        </div>
        <div className="flex-shrink-0 p-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      </div>
      {isMobileMenuOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    onClick={() => setIsMobileMenuOpen(false)}
  ></div>
)}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
                 <div className="flex items-center justify-between mb-6">
          {/* Hide header for certain pages that have their own titles */}
          {!['rfid-management', 'profile', 'dashboard'].includes(activeTab) && (
            <div className="flex items-center space-x-4">
              <BackButton 
                onClick={() => setActiveTab('dashboard')} 
                
                className={darkMode ? 'text-gray-300 hover:text-white' : ''}
              />
            </div>
          )}
          {!['rfid-management', 'profile', 'dashboard'].includes(activeTab) && (
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {activeTab === 'ai-analytics' && currentUser.role === 'student' 
                  ? 'My Performance' 
                  : activeTab === 'teacher-feedback' 
                  ? 'Student Feedback & Q&A'
                  : activeTab === 'reports'
                  ? 'Generate Reports'
                  : activeTab === 'subjects' && currentUser.role === 'student'
                  ? 'My Courses'
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/-/g, ' ')}
              </h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {activeTab === 'subjects' && currentUser.role === 'student' 
                  ? 'View and manage your enrolled courses' 
                  : `Welcome back, ${currentUser.name}`}
              </p>
            </div>
          )}
          {['dashboard'].includes(activeTab) && (
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Dashboard
              </h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Welcome back, {currentUser.name}</p>
            </div>
          )}
          {/* Dark Mode Toggle and Notifications */}
          <div className={`flex items-center space-x-4 ${['rfid-management', 'profile'].includes(activeTab) ? 'ml-auto' : ''}`}>
                    {/* Mobile Menu Button  */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`lg:hidden p-2 mr-3 rounded-lg ${
          darkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {/* Hamburger icon */}
        <div className="w-6 h-6 flex flex-col justify-between">
          <div className={`w-full h-0.5 ${darkMode ? 'bg-gray-300' : 'bg-gray-600'} rounded`}></div>
          <div className={`w-full h-0.5 ${darkMode ? 'bg-gray-300' : 'bg-gray-600'} rounded`}></div>
          <div className={`w-full h-0.5 ${darkMode ? 'bg-gray-300' : 'bg-gray-600'} rounded`}></div>
        </div>
      </button>
      
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  } ${showNotificationDropdown ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                  title="View Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className={`absolute right-0 top-12 w-80 rounded-lg shadow-xl border z-50 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Notifications
                        </h3>
                        <button
                          onClick={() => {
                            setActiveTab('notifications');
                            setShowNotificationDropdown(false);
                          }}
                          className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                            darkMode 
                              ? 'text-blue-400 hover:bg-gray-700' 
                              : 'text-blue-600 hover:bg-gray-100'
                          }`}
                        >
                          View All
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              setShowNotificationDropdown(false);
                            }}
                            className={`p-4 border-b last:border-b-0 hover:bg-opacity-50 transition-colors cursor-pointer ${
                              darkMode 
                                ? 'border-gray-700 hover:bg-gray-700' 
                                : 'border-gray-100 hover:bg-gray-50'
                            } ${notification.read ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.priority === 'high' ? 'bg-red-500' :
                                notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Just now
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No new notifications
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative profile-menu">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  } ${showProfileMenu ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                  title="View Profile"
                >
                  <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                    {(currentUser?.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className={`absolute right-0 top-12 w-48 rounded-lg shadow-xl border z-50 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Profile
                        </h3>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileMenu(false);
                        }}
                        className={`w-full p-3 text-left transition-colors ${
                          darkMode 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className={`w-full p-3 text-left transition-colors ${
                          darkMode 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Dashboard Content */}
          <ErrorBoundary 
            darkMode={darkMode} 
            onRetry={() => window.location.reload()} 
            onGoHome={() => setActiveTab('dashboard')}
          >
          {activeTab === 'dashboard' && (
            <>
              {/* Dashboard - Grid Layout with Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {currentUser.role === 'admin' && <AdminDashboard aiInsights={aiInsights} setActiveTab={setActiveTab} darkMode={darkMode} />}
                    {currentUser.role === 'teacher' && <TeacherDashboard aiInsights={aiInsights} setActiveTab={setActiveTab} darkMode={darkMode} />}
                    {currentUser.role === 'student' && <StudentDashboard aiInsights={aiInsights} setActiveTab={setActiveTab} darkMode={darkMode} currentUser={currentUser} />}
                  </div>
                  <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 self-start">
                    {renderCalendar()}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">School Events</h3>
                        <button 
                          onClick={() => setActiveTab('events')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {(() => {
                          const today = new Date();
                          const upcomingEvents = [];
                          Object.entries(schoolEvents).forEach(([dateKey, events]) => {
                            const eventDate = new Date(dateKey);
                            if (eventDate >= today) {
                              events.forEach(event => {
                                upcomingEvents.push({
                                  ...event,
                                  date: eventDate,
                                  dateKey
                                });
                              });
                            }
                          });
                          upcomingEvents.sort((a, b) => a.date - b.date);
                          return upcomingEvents.slice(0, 8).map((event, index) => {
                            const typeStyles = {
                              academic: 'bg-blue-100 text-blue-800',
                              meeting: 'bg-green-100 text-green-800',
                              sports: 'bg-orange-100 text-orange-800',
                              cultural: 'bg-purple-100 text-purple-800',
                              exam: 'bg-red-100 text-red-800',
                              event: 'bg-indigo-100 text-indigo-800'
                            };
                            return (
                              <div 
                                key={index} 
                                className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setActiveTab('events')}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{event.title}</p>
                                    <p className="text-sm text-gray-600">{event.date.toLocaleDateString()} • {event.time}</p>
                                  </div>
                                  <span className={`ml-3 px-2 py-1 text-xs rounded whitespace-nowrap ${typeStyles[event.type] || 'bg-gray-100 text-gray-800'}`}>
                                    {event.type}
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
            </>
          )}
          {/* ALL Enhanced Feature Panels - Your Complete Work */}
          {activeTab === 'profile' && (
            <ProfilePanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          {activeTab === 'messaging' && (
            <MessagingPanel 
              userRole={currentUser.role} 
              currentUser={currentUser} 
              darkMode={darkMode}
              disableNotifications={true}
            />
          )}
          {activeTab === 'assignments' && (
            <AssignmentPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          {activeTab === 'online-class' && (
            <OnlineClassPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'lesson-planning' && (
            <LessonPlanningPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'attendance' && currentUser.role === 'teacher' && (
            <TeacherBiometricAttendancePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'attendance' && currentUser.role !== 'teacher' && (
            <AttendancePanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          {activeTab === 'payments' && (
            <PaymentPanel userRole={currentUser.role} currentUser={currentUser} setActiveTab={setActiveTab} appActiveTab={activeTab} />
          )}
          {activeTab === 'ai-analytics' && currentUser.role === 'student' && (
            <MyPerformancePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'ai-analytics' && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
            <AIAnalyticsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'settings' && currentUser.role === 'student' && (
            <StudentSettingsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} />
          )}


          {activeTab === 'settings' && currentUser.role === 'teacher' && (
            <TeacherSettingsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} />
          )}
          {activeTab === 'settings' && currentUser.role === 'admin' && (
            <SystemSettingsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'help-support' && (
            <HelpSupportPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {/* Enhanced Student Panels */}
          {activeTab === 'submit-assignment' && currentUser.role === 'student' && (
            <EnhancedSubmitAssignmentPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'subjects' && currentUser.role === 'student' && (
            <MyCoursesPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'recommendations' && (
            <AIRecommendationsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'study-materials' && (
            <StudyMaterialsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'past-papers' && (
            <PastPapersPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'fee-balance' && (
            <FeeBalancePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {/* Enhanced Teacher Panels */}
          {activeTab === 'teaching-resources' && (
            <TeachingResourcesPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Duplicate panel definitions removed - already handled above */}
          {activeTab === 'library' && (
            <LibraryPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'activities' && (
            <ActivitiesPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          {(activeTab === 'grades' || activeTab === 'progress-reports') && (
            <FeeRestrictionGuard 
              userRole={currentUser.role} 
              currentUser={currentUser} 
              darkMode={darkMode}
              restrictionType="grades"
            >
              <GradesPanel userRole={currentUser.role} currentUser={currentUser} />
            </FeeRestrictionGuard>
          )}
          {/* Default Exam Panel for grading (non-enhanced) */}
          {(activeTab === 'grading') && (
            <ExamPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          
          {/* Fee Statements Panel */}
          {activeTab === 'fee-statements' && (
            <FeeStatementsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}

          {/* Fee-related tabs using PaymentPanel */}
          {activeTab === 'payment-history' && (
            <PaymentPanel userRole={currentUser.role} currentUser={currentUser} setActiveTab={setActiveTab} appActiveTab={activeTab} />
          )}
          
          {/* Communication tabs using MessagingPanel - now includes announcements */}
          {(activeTab === 'teacher-communication' || activeTab === 'announcements') && (
            <MessagingPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          {/* Default assignment panel for non-students */}
          {(activeTab === 'submit-assignment') && currentUser.role !== 'student' && (
            <AssignmentPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          
          {/* Default subjects panel for non-students */}
          {(activeTab === 'subjects') && currentUser.role !== 'student' && (
            <LibraryPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          
          


          {/* Admin Teacher Ratings Management */}
          {activeTab === 'admin-teacher-ratings' && currentUser.role === 'admin' && (
            <AdminTeacherRatingsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Teacher Feedback Panel - Student Reviews and Q&A */}
          {activeTab === 'teacher-feedback' && currentUser.role === 'teacher' && (
            <TeacherFeedbackPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} setActiveTab={setActiveTab} />
          )}
          
          {/* Student Biometric Management - Admin Access */}
          {activeTab === 'student-biometric' && currentUser.role === 'admin' && (
            <StudentBiometricPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          {/* Biometric Setup (separate panel) */}
          {activeTab === 'biometric-setup' && (
            <BiometricSetupPanel userRole={currentUser.role} />
          )}
          
          {/* User management */}
          {activeTab === 'users' && (
            <UserManagementPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          
          
          
          
          {/* Enhanced Class Management Panel */}
          {activeTab === 'classes' && currentUser.role === 'admin' && (
            <ClassManagementPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          {/* Student Roster - Teacher specific */}
          {(activeTab === 'student-roster') && currentUser.role === 'teacher' && (
            <StudentRosterPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Admin Student Roster */}
          {(activeTab === 'student-roster') && currentUser.role === 'admin' && (
            <UserManagementPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Enhanced Exam Setting */}
          {(activeTab === 'exam-setting') && (
            <EnhancedExamPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Plagiarism Detection */}
          {(activeTab === 'plagiarism-check') && (
            <PlagiarismDetectionPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          
          {/* Enhanced Student Progress - Teacher specific */}
          {(activeTab === 'student-progress') && currentUser.role === 'teacher' && (
            <EnhancedStudentProgressPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Default Student Progress for other roles */}
          {(activeTab === 'student-progress') && currentUser.role !== 'teacher' && (
            <AIAnalyticsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Teaching and curriculum tabs */}
          {(activeTab === 'curriculum' || activeTab === 'curriculum-alignment') && (
            <CurriculumAlignmentPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} setActiveTab={setActiveTab} />
          )}
          
          {/* Enhanced Fee Structure Panel */}
          {activeTab === 'fee-structure' && (
            <FeeStructurePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Courses Management */}
          {activeTab === 'courses-management' && (
            <CoursesManagementPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Scholarship & Pricing */}
          {activeTab === 'scholarship-pricing' && (
            <ScholarshipPricingPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Reports tabs */}
          {activeTab === 'reports' && (
            <ReportsPanel userRole={currentUser.role} currentUser={currentUser} setActiveTab={setActiveTab} />
          )}
          
          {/* New Financial Management Panels */}
          {activeTab === 'term-management' && (
            <SemesterManagementPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'invoices' && (
            <InvoicesPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'expenses' && (
            <ExpensesPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Enhanced Feature Panels */}
          {activeTab === 'complaints' && (
            <ComplaintsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          {activeTab === 'awards' && (
            <AwardsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* AI Automation Hub */}
          {activeTab === 'ai-automation' && (
            <AIAutomationPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* NEW ENHANCED FEATURES */}
          {activeTab === 'proctoring' && (
            <ErrorBoundary>
              <ProctoringDashboard user={currentUser} />
            </ErrorBoundary>
          )}
          {activeTab === 'revenue-dashboard' && currentUser.role === 'admin' && (
            <RevenueDashboard user={currentUser} />
          )}
          {activeTab === 'biometric-attendance' && currentUser.role === 'admin' && (
            <TeacherBiometricAttendancePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Holiday Planner - now includes holiday tests */}
          {(activeTab === 'holiday-planner' || activeTab === 'holiday-tests') && (
            <HolidayPlannerPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Biometric Payroll */}
          {activeTab === 'biometric-payroll' && (
            <BiometricPayrollPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          {/* Department Management */}
          {activeTab === 'departments' && (
            <Department userRole={currentUser.role} currentUser={currentUser} />
          )}
          
          {/* Unit Plan Generator */}
          {activeTab === 'unit-plan-generator' && (
            <UnitPlanGeneratorPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* AI Teaching Tools */}
          {activeTab === 'ai-teaching-tools' && (
            <AITeachingToolsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Student AI Learning Tools */}
          {activeTab === 'ai-learning-tools' && (
            <StudentAIToolsPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          
          {/* School Feedback */}
          {(activeTab === 'feedback') && (
            <FeedbackPanel userRole={currentUser.role} currentUser={currentUser} />
          )}
          
          
          {/* Enhanced Student Panels (definitions consolidated above; duplicates removed) */}
          
          {/* Class Schedules Panel */}
          {activeTab === 'class-schedules' && (
            <ClassSchedulePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Class Timetable for students on timetable tab */}
          {activeTab === 'timetable' && currentUser.role === 'student' && (
            <ClassTimetablePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} setActiveTab={setActiveTab} />
          )}
          
          {/* AI Study Timetable for students */}
          {activeTab === 'study-timetable' && currentUser.role === 'student' && (
            <AIReadingTimetablePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Default timetable for non-students */}
          {activeTab === 'timetable' && currentUser.role !== 'student' && (
            <LibraryPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          
          {/* Default study materials for non-students */}
          {(activeTab === 'study-materials') && currentUser.role !== 'student' && (
            <LibraryPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          
          {/* Default past papers for non-students */}
          {(activeTab === 'past-papers') && currentUser.role !== 'student' && (
            <LibraryPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          
          {(activeTab === 'exam-schedule') && currentUser.role === 'student' && (
            <ExamSchedulePanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          {/* Default exam schedule for non-students */}
          {(activeTab === 'exam-schedule') && currentUser.role !== 'student' && (
            <ExamPanel userRole={currentUser.role} currentUser={currentUser} darkMode={darkMode} />
          )}
          
          
          {/* General Events */}
          {(activeTab === 'events') && (
            <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
              <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-3 space-y-3">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-sm p-2 sm:p-3 text-white">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white" />
                    <div className="flex-1">
                      <h1 className="text-base sm:text-lg font-bold">School Events Calendar</h1>
                      <p className="text-indigo-100 text-xs">Stay updated with school activities</p>
                    </div>
                  </div>
                </div>

                {/* Calendar and Events */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <div className="lg:col-span-3">
                    <div className={`rounded-lg shadow-sm border p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      {renderCalendar()}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className={`rounded-lg shadow-sm border p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center mb-3">
                        <Target className="w-4 h-4 text-blue-600 mr-2" />
                        <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h3>
                      </div>
                      <div className="space-y-2">
                        <button 
                          onClick={() => setShowEventForm(true)}
                          className="w-full bg-blue-500 text-white p-2 rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Add to Calendar
                        </button>
                        <button 
                          onClick={() => setShowReminderForm(true)}
                          className="w-full bg-green-500 text-white p-2 rounded text-xs hover:bg-green-600 transition-colors"
                        >
                          Set Reminders
                        </button>
                        <button 
                          onClick={() => setShowRSVPForm(true)}
                          className="w-full bg-purple-500 text-white p-2 rounded text-xs hover:bg-purple-600 transition-colors"
                        >
                          RSVP Events
                        </button>
                        <button 
                          onClick={() => setShowContactForm(true)}
                          className="w-full bg-orange-500 text-white p-2 rounded text-xs hover:bg-orange-600 transition-colors"
                        >
                          Contact Organizer
                        </button>
                      </div>
                    </div>

                    {/* Event Categories */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 text-yellow-600 mr-2" />
                        <h3 className="text-sm font-bold text-gray-800">Categories</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center p-2 bg-red-50 rounded border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <div>
                            <p className="font-medium text-red-800 text-xs">Exams</p>
                          </div>
                        </div>
                        <div className="flex items-center p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <div>
                            <p className="font-medium text-blue-800 text-xs">Academic</p>
                          </div>
                        </div>
                        <div className="flex items-center p-2 bg-green-50 rounded border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <div>
                            <p className="font-medium text-green-800 text-xs">Meetings</p>
                          </div>
                        </div>
                        <div className="flex items-center p-2 bg-orange-50 rounded border border-orange-200">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          <div>
                            <p className="font-medium text-orange-800 text-xs">Sports</p>
                          </div>
                        </div>
                        <div className="flex items-center p-2 bg-purple-50 rounded border border-purple-200">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          <div>
                            <p className="font-medium text-purple-800 text-xs">Cultural</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Previous Events Section - keeping for reference */}
          {false && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">School Events & Communication</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Upcoming Events</h4>
                  <div className="space-y-3">
                    {[
                      { title: 'Science Fair', date: '2024-10-20', time: '9:00 AM', type: 'academic' },
                      { title: 'Sports Day', date: '2024-10-25', time: '8:00 AM', type: 'sports' }
                    ].map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{event.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          
          </ErrorBoundary>
        </div>
      </div>

      {/* Calendar Integration Form */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📅 Add to Calendar
              </h3>
              <button
                onClick={() => setShowEventForm(false)}
                className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'hover:text-gray-300' : ''}`}
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Calendar Type
                </label>
                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>Google Calendar</option>
                  <option>Outlook Calendar</option>
                  <option>Apple Calendar</option>
                  <option>Export as iCal</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Events to Add
                </label>
                <div className="space-y-2">
                  {Object.entries(schoolEvents).slice(0, 5).map(([date, events]) => 
                    events.map((event, index) => (
                      <label key={`${date}-${index}`} className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {event.title} - {date}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notification Settings
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email reminders</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>SMS notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Push notifications</span>
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Reminder Form */}
      {showReminderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🔔 Set Reminders
              </h3>
              <button
                onClick={() => setShowReminderForm(false)}
                className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'hover:text-gray-300' : ''}`}
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Event Type
                </label>
                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>All Events</option>
                  <option>Exams Only</option>
                  <option>Meetings Only</option>
                  <option>Sports Events</option>
                  <option>Academic Events</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reminder Time
                </label>
                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>15 minutes before</option>
                  <option>30 minutes before</option>
                  <option>1 hour before</option>
                  <option>1 day before</option>
                  <option>1 week before</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notification Methods
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Push Notification</span>
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReminderForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Set Reminders
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RSVP Form */}
      {showRSVPForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ✅ RSVP Events
              </h3>
              <button
                onClick={() => setShowRSVPForm(false)}
                className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'hover:text-gray-300' : ''}`}
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Event
                </label>
                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>Science Fair - Oct 20</option>
                  <option>Sports Day - Oct 25</option>
                  <option>Cultural Day - Nov 1</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Response
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="rsvp" value="attending" className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>✅ Attending</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="rsvp" value="not_attending" className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>❌ Not Attending</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="rsvp" value="maybe" className="mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🤔 Maybe</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Number of Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Special Requirements
                </label>
                <textarea
                  rows="3"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Any special dietary requirements, accessibility needs, etc."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRSVPForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Submit RSVP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Organizer Form */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full max-h-[90vh] rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col`}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📧 Contact Event Organizer
              </h3>
              <button
                onClick={() => setShowContactForm(false)}
                className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'hover:text-gray-300' : ''}`}
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="contact-form" className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Event
                </label>
                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>Science Fair - Oct 20</option>
                  <option>Sports Day - Oct 25</option>
                  <option>Cultural Day - Nov 1</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Name *
                </label>
                <input
                  type="text"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="+256 700 000 000"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                  <option value="">Select Subject</option>
                  <option value="question">General Question</option>
                  <option value="information">Request Information</option>
                  <option value="issue">Report Issue</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message *
                </label>
                <textarea
                  rows="4"
                  className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Please provide details about your inquiry, question, or concern..."
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority Level
                </label>
                <select className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option value="low">Low - General inquiry</option>
                  <option value="medium" selected>Medium - Standard request</option>
                  <option value="high">High - Urgent matter</option>
                  <option value="urgent">Urgent - Immediate attention needed</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="follow-up"
                  className="mr-2"
                />
                <label htmlFor="follow-up" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  I would like to receive a follow-up response
                </label>
              </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="contact-form"
                  className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* In-App Floating Chatbot */}
      <div className="fixed bottom-5 right-5 z-40">
        {inAppChatOpen && (
          <div className={`mb-3 w-80 max-w-[90vw] rounded-2xl shadow-2xl border-2 ${darkMode ? 'bg-gray-800 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white ${darkMode ? 'border-blue-600' : 'border-blue-300'}`}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white text-xs font-bold">AI</span>
                <p className="text-sm font-medium">Assistant</p>
              </div>
              <button onClick={() => setInAppChatOpen(false)} className="p-1 rounded hover:bg-white/20 transition-colors text-white">✕</button>
            </div>
            <div className={`h-64 overflow-y-auto px-4 py-3 space-y-2 bg-gradient-to-b ${darkMode ? 'from-gray-800 to-gray-900 text-gray-200' : 'from-blue-50 to-white text-gray-700'}`}>
              {inAppChatMessages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-600 text-white shadow-md' : (darkMode ? 'bg-blue-900/50 text-blue-100 border border-blue-700' : 'bg-blue-100 text-blue-900 border border-blue-200')}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const text = inAppChatInput.trim();
              if (!text) return;
              const id = Date.now();
              setInAppChatMessages(prev => [...prev, { id, role: 'user', text }]);
              setInAppChatInput('');
              setTimeout(() => {
                setInAppChatMessages(prev => [...prev, { id: id + 1, role: 'ai', text: 'Thanks! I will look into: ' + text }]);
              }, 600);
            }} className={`p-3 border-t ${darkMode ? 'border-blue-700 bg-gray-800' : 'border-blue-200 bg-blue-50'}`}>
              <div className="flex items-center gap-2">
                <input value={inAppChatInput} onChange={e => setInAppChatInput(e.target.value)} placeholder="Ask the assistant..." className={`flex-1 px-3 py-2 rounded-lg outline-none border ${darkMode ? 'bg-gray-700 border-blue-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50' : 'bg-white border-blue-300 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} />
                <button type="submit" className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">Send</button>
              </div>
            </form>
          </div>
        )}
        <button onClick={() => setInAppChatOpen(v => !v)} className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-700 shadow-lg hover:shadow-xl hover:scale-110 transition-all grid place-items-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default SmartSchoolApp;
