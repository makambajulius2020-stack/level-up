import React, { useState } from 'react';
import { 
  User, Bell, Shield, Palette, Globe, Smartphone, 
  Mail, Lock, Eye, EyeOff, Save, Download, Upload,
  CheckCircle, AlertCircle, Info, Moon, Sun, Monitor
} from 'lucide-react';

const StudentSettingsPanel = ({ userRole, currentUser, darkMode = false, setDarkMode, fontSize, setFontSize }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      firstName: currentUser?.name?.split(' ')[0] || '',
      lastName: currentUser?.name?.split(' ')[1] || '',
      email: currentUser?.email || '',
      phone: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      assignmentReminders: true,
      examReminders: true,
      gradeNotifications: true,
      attendanceAlerts: true,
      schoolAnnouncements: true,
      teacherMessages: true
    },
    privacy: {
      profileVisibility: 'classmates',
      showGrades: 'private',
      showAttendance: 'private',
      allowMessages: 'classmates-teachers',
      shareProgress: 'instructors-only'
    },
    appearance: {
      theme: darkMode ? 'dark' : 'light',
      language: 'en',
      fontSize: fontSize || 'medium',
      colorScheme: 'default'
    },
    academic: {
      studyReminders: true,
      breakReminders: true,
      goalTracking: true,
      progressSharing: true,
      aiStudySuggestions: true
    }
  });

  // Dark mode utility classes
  const containerBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Handle theme changes
    if (section === 'appearance' && field === 'theme') {
      if (value === 'light') {
        setDarkMode(false);
      } else if (value === 'dark') {
        setDarkMode(true);
      } else if (value === 'auto') {
        // Auto theme - use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
      }
    }
    
    // Handle font size changes
    if (section === 'appearance' && field === 'fontSize') {
      setFontSize(value);
    }
  };

  const handleSaveSettings = () => {
    // Simulate API call
    console.log('Settings saved:', settings);
    // You could replace this with a proper notification system
    // For now, we'll just log to console instead of using alert
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'academic', label: 'Academic', icon: Globe }
  ];

  return (
    <div className={`min-h-screen ${containerBg} p-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary} flex items-center`}>
                <User className="w-8 h-8 mr-3 text-blue-600" />
                Student Settings
              </h1>
              <p className={`${textSecondary} mt-2`}>
                Manage your account preferences and academic settings
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${textMuted}`}>Welcome, {currentUser?.name}</p>
              <p className={`text-xs ${textMuted} capitalize`}>{userRole}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-xl shadow-lg p-4 border sticky top-4`}>
              <h3 className={`font-semibold ${textPrimary} mb-4`}>Settings</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
                        : `${hoverBg} ${textSecondary}`
                    }`}
                  >
                    <tab.icon className="w-4 h-4 inline mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'notifications' && (
              <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${textPrimary} mb-6`}>Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Communication Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className={`font-medium ${textPrimary}`}>Email Notifications</div>
                            <div className={`text-sm ${textSecondary}`}>Receive notifications via email</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <div>
                            <div className={`font-medium ${textPrimary}`}>SMS Notifications</div>
                            <div className={`text-sm ${textSecondary}`}>Receive notifications via SMS</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.smsNotifications}
                            onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Academic Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'assignmentReminders', label: 'Assignment Reminders', desc: 'Get notified about upcoming assignments' },
                        { key: 'examReminders', label: 'Exam Reminders', desc: 'Get notified about upcoming exams' },
                        { key: 'gradeNotifications', label: 'Grade Notifications', desc: 'Get notified when grades are posted' },
                        { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Get notified about attendance issues' },
                        { key: 'schoolAnnouncements', label: 'School Announcements', desc: 'Receive school-wide announcements' },
                        { key: 'teacherMessages', label: 'Teacher Messages', desc: 'Receive messages from teachers' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <div className={`font-medium ${textPrimary}`}>{item.label}</div>
                            <div className={`text-sm ${textSecondary}`}>{item.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[item.key]}
                              onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${textPrimary} mb-6`}>Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun, color: 'text-yellow-500' },
                        { value: 'dark', label: 'Dark', icon: Moon, color: 'text-blue-500' },
                        { value: 'auto', label: 'Auto', icon: Monitor, color: 'text-gray-500' }
                      ].map((theme) => (
                        <label 
                          key={theme.value} 
                          className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            settings.appearance.theme === theme.value
                              ? darkMode 
                                ? 'border-blue-400 bg-blue-900/20' 
                                : 'border-blue-500 bg-blue-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={theme.value}
                            checked={settings.appearance.theme === theme.value}
                            onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                            className="sr-only"
                          />
                          <theme.icon className={`w-6 h-6 mb-2 ${theme.color} ${
                            settings.appearance.theme === theme.value ? 'opacity-100' : 'opacity-60'
                          }`} />
                          <span className={`text-sm font-medium ${
                            settings.appearance.theme === theme.value 
                              ? darkMode ? 'text-blue-300' : 'text-blue-700'
                              : textSecondary
                          }`}>{theme.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Language</h3>
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => handleInputChange('appearance', 'language', e.target.value)}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>Font Size</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'small', label: 'Small', size: 'text-sm', icon: 'A' },
                        { value: 'medium', label: 'Medium', size: 'text-base', icon: 'A' },
                        { value: 'large', label: 'Large', size: 'text-lg', icon: 'A' }
                      ].map((size) => (
                        <label 
                          key={size.value} 
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                            settings.appearance.fontSize === size.value
                              ? darkMode 
                                ? 'border-blue-400 bg-blue-900/20 shadow-lg shadow-blue-500/20' 
                                : 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="fontSize"
                            value={size.value}
                            checked={settings.appearance.fontSize === size.value}
                            onChange={(e) => handleInputChange('appearance', 'fontSize', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`${size.size} font-bold mb-2 ${
                            settings.appearance.fontSize === size.value 
                              ? darkMode ? 'text-blue-300' : 'text-blue-700'
                              : textSecondary
                          }`}>
                            {size.icon}
                          </div>
                          <span className={`text-sm font-medium ${
                            settings.appearance.fontSize === size.value 
                              ? darkMode ? 'text-blue-300' : 'text-blue-700'
                              : textSecondary
                          }`}>
                            {size.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className={`text-sm ${textMuted} mt-2`}>
                      Choose your preferred font size for better readability
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${textPrimary} mb-6`}>Academic Preferences</h2>
                
                <div className="space-y-6">
                  {[
                    { 
                      key: 'studyReminders', 
                      label: 'Study Reminders', 
                      desc: 'Get reminders for scheduled study sessions' 
                    },
                    { 
                      key: 'breakReminders', 
                      label: 'Break Reminders', 
                      desc: 'Get reminders to take breaks during study sessions' 
                    },
                    { 
                      key: 'goalTracking', 
                      label: 'Goal Tracking', 
                      desc: 'Track and monitor your academic goals' 
                    },
                    { 
                      key: 'progressSharing', 
                      label: 'Progress Sharing', 
                      desc: 'Share your progress with instructors and teachers' 
                    },
                    { 
                      key: 'aiStudySuggestions', 
                      label: 'AI Study Suggestions', 
                      desc: 'Receive AI-powered study recommendations' 
                    }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${textPrimary}`}>{item.label}</div>
                        <div className={`text-sm ${textSecondary}`}>{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.academic[item.key]}
                          onChange={(e) => handleInputChange('academic', item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettingsPanel;
