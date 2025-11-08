import React, { useState, useEffect } from 'react';
import { Camera, Mic, Monitor, AlertTriangle, MessageSquare, Users, Eye, Flag, CheckCircle, XCircle, Shield, Clock, Bell, Settings, Play, Pause, Square, UserCheck, Lock, Activity, FileText, BarChart3, Zap, AlertCircle, Video, Volume2, Maximize2, Download, Upload, Search, Filter, Plus } from 'lucide-react';

const ProctoringDashboard = ({ user }) => {
  const [examSessions, setExamSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [flags, setFlags] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('idle'); // idle, active, paused, ended
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [supervisionMode, setSupervisionMode] = useState('normal'); // normal, strict, relaxed
  const [identityVerification, setIdentityVerification] = useState(false);
  const [secureBrowserMode, setSecureBrowserMode] = useState(false);
  const [aiMonitoringEnabled, setAiMonitoringEnabled] = useState(true);
  const [liveProctoringEnabled, setLiveProctoringEnabled] = useState(false);
  const [automatedGradingEnabled, setAutomatedGradingEnabled] = useState(false);
  const [examReports, setExamReports] = useState([]);
  const [preExamChecks, setPreExamChecks] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [showGenerateReportForm, setShowGenerateReportForm] = useState(false);
  const [showVerifyStudentsForm, setShowVerifyStudentsForm] = useState(false);
  const [showLockBrowserForm, setShowLockBrowserForm] = useState(false);
  const [showDisableAIForm, setShowDisableAIForm] = useState(false);
  const [showRunChecksForm, setShowRunChecksForm] = useState(false);
  const [showProcessGradingForm, setShowProcessGradingForm] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showCameraControlForm, setShowCameraControlForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    subject_id: '',
    class_level: '',
    start_time: '',
    end_time: '',
    duration_minutes: 120,
    proctoring_enabled: true,
    camera_required: true,
    mic_required: false,
    screen_share_required: false,
    secure_browser_enabled: false,
    ai_monitoring_enabled: true,
    live_proctoring_enabled: false,
    identity_verification_required: true,
    automated_grading_enabled: false
  });

  useEffect(() => {
    loadExamSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  const loadExamSessions = async () => {
    try {
      const params = user.role === 'teacher' ? `?teacher_id=${user.id}` : '';
      const response = await fetch(`http://localhost:5000/api/proctoring/sessions${params}`);
      const data = await response.json();
      if (data.success) {
        setExamSessions(data.data);
      }
    } catch (error) {
      console.error('Error loading exam sessions:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!selectedSession) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/sessions/${selectedSession.id}/dashboard`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
        setFlags(data.recent_flags);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedSession) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/sessions/${selectedSession.id}/messages?user_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createFlag = async (studentSessionId, flagType, severity, description) => {
    try {
      const response = await fetch('http://localhost:5000/api/proctoring/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_exam_session_id: studentSessionId,
          flag_type: flagType,
          severity: severity,
          description: description,
          flagged_by: user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        loadDashboardData();
        alert('Student flagged successfully');
      }
    } catch (error) {
      console.error('Error creating flag:', error);
    }
  };

  const startExamSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ started_by: user.id })
      });
      const data = await response.json();
      if (data.success) {
        setSessionStatus('active');
        loadExamSessions();
        // Notify admin about session start
        notifyAdmin('Exam session started', `Session ${selectedSession?.title} has been started by ${user.name}`);
      }
    } catch (error) {
      console.error('Error starting exam session:', error);
    }
  };

  const pauseExamSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/sessions/${sessionId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused_by: user.id })
      });
      const data = await response.json();
      if (data.success) {
        setSessionStatus('paused');
        loadExamSessions();
        notifyAdmin('Exam session paused', `Session ${selectedSession?.title} has been paused by ${user.name}`);
      }
    } catch (error) {
      console.error('Error pausing exam session:', error);
    }
  };

  const endExamSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ended_by: user.id })
      });
      const data = await response.json();
      if (data.success) {
        setSessionStatus('ended');
        loadExamSessions();
        notifyAdmin('Exam session ended', `Session ${selectedSession?.title} has been ended by ${user.name}`);
      }
    } catch (error) {
      console.error('Error ending exam session:', error);
    }
  };

  const notifyAdmin = async (title, message) => {
    try {
      const response = await fetch('http://localhost:5000/api/proctoring/admin-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          session_id: selectedSession?.id,
          created_by: user.id,
          priority: 'medium'
        })
      });
      const data = await response.json();
      if (data.success) {
        setAdminNotifications(prev => [...prev, { title, message, timestamp: new Date() }]);
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  };

  const loadAdminNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/admin-notifications?session_id=${selectedSession?.id}`);
      const data = await response.json();
      if (data.success) {
        setAdminNotifications(data.data);
      }
    } catch (error) {
      console.error('Error loading admin notifications:', error);
    }
  };

  const sendMessage = async (recipientId = null) => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/proctoring/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_session_id: selectedSession.id,
          sender_id: user.id,
          recipient_id: recipientId,
          message_type: recipientId ? 'chat' : 'alert',
          message: newMessage
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const resolveFlag = async (flagId, notes) => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/flags/${flagId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved_by: user.id,
          resolution_notes: notes
        })
      });
      const data = await response.json();
      if (data.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error resolving flag:', error);
    }
  };

  // Enhanced Proctoring Functions
  const verifyStudentIdentity = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/identity-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          session_id: selectedSession.id,
          verification_type: 'biometric'
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Identity verification completed successfully');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error verifying identity:', error);
    }
  };

  const enableSecureBrowser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/secure-browser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.id,
          enabled: !secureBrowserMode
        })
      });
      const data = await response.json();
      if (data.success) {
        setSecureBrowserMode(!secureBrowserMode);
        alert(`Secure browser ${!secureBrowserMode ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling secure browser:', error);
    }
  };

  const toggleAiMonitoring = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/ai-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.id,
          enabled: !aiMonitoringEnabled
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiMonitoringEnabled(!aiMonitoringEnabled);
        alert(`AI monitoring ${!aiMonitoringEnabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling AI monitoring:', error);
    }
  };

  const toggleLiveProctoring = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/live-proctoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.id,
          enabled: !liveProctoringEnabled
        })
      });
      const data = await response.json();
      if (data.success) {
        setLiveProctoringEnabled(!liveProctoringEnabled);
        alert(`Live proctoring ${!liveProctoringEnabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling live proctoring:', error);
    }
  };

  const generateExamReport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/sessions/${selectedSession.id}/report`, {
        method: 'GET'
      });
      const data = await response.json();
      if (data.success) {
        setExamReports([data.report]);
        alert('Exam report generated successfully');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const runPreExamChecks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/pre-exam-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.id
        })
      });
      const data = await response.json();
      if (data.success) {
        setPreExamChecks(data.checks);
        alert('Pre-exam checks completed');
      }
    } catch (error) {
      console.error('Error running pre-exam checks:', error);
    }
  };

  const loadSuspiciousActivity = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/suspicious-activity?session_id=${selectedSession.id}`);
      const data = await response.json();
      if (data.success) {
        setSuspiciousActivity(data.activities);
      }
    } catch (error) {
      console.error('Error loading suspicious activity:', error);
    }
  };

  const processAutomatedGrading = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/bulk-grading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.id,
          grading_model: 'enhanced_ai'
        })
      });
      const data = await response.json();
      if (data.success) {
        setAutomatedGradingEnabled(true);
        alert(`Automated grading completed for ${data.total_students_processed} students`);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error processing automated grading:', error);
    }
  };

  const getGradingAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/grading-analytics/${selectedSession.id}`);
      const data = await response.json();
      if (data.success) {
        return data.analytics;
      }
    } catch (error) {
      console.error('Error loading grading analytics:', error);
    }
    return null;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-yellow-600 bg-yellow-100',
      medium: 'text-orange-600 bg-orange-100',
      high: 'text-red-600 bg-red-100',
      critical: 'text-red-800 bg-red-200'
    };
    return colors[severity] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      on: 'text-green-600',
      off: 'text-red-600',
      not_available: 'text-gray-400'
    };
    return colors[status] || colors.off;
  };

  // Camera access functions
  const requestCameraAccess = async (studentId) => {
    try {
      // Request camera access from browser
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: false 
      });
      
      const videoElement = document.getElementById(`camera-${studentId}`);
      const placeholderElement = document.getElementById(`placeholder-${studentId}`);
      
      if (videoElement && placeholderElement) {
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        placeholderElement.style.display = 'none';
        
        // Update student camera status
        await updateStudentCameraStatus(studentId, 'on');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  };

  const requestAllCameras = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: false 
      });
      
      // Show camera feed for all students
      if (dashboardData.students) {
        dashboardData.students.forEach(student => {
          const videoElement = document.getElementById(`camera-${student.id}`);
          const placeholderElement = document.getElementById(`placeholder-${student.id}`);
          
          if (videoElement && placeholderElement) {
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            placeholderElement.style.display = 'none';
          }
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  };

  const updateStudentCameraStatus = async (studentId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/proctoring/student-sessions/${studentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_status: status,
          mic_status: 'on',
          screen_share_status: 'off'
        })
      });
      
      if (response.ok) {
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating camera status:', error);
    }
  };

  const createExamSession = async (examData) => {
    // Validate required fields
    if (!examData.title || !examData.start_time || !examData.end_time) {
      alert('Please fill in all required fields (Title, Start Time, End Time)');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/proctoring/sessions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          title: examData.title,
          description: examData.description || '',
          subject_id: examData.subject_id || null,
          class_level: examData.class_level || '',
          teacher_id: user.id,
          start_time: examData.start_time,
          end_time: examData.end_time,
          duration_minutes: examData.duration_minutes || 120,
          proctoring_enabled: examData.proctoring_enabled !== undefined ? examData.proctoring_enabled : true,
          camera_required: examData.camera_required !== undefined ? examData.camera_required : true,
          mic_required: examData.mic_required !== undefined ? examData.mic_required : false,
          screen_share_required: examData.screen_share_required !== undefined ? examData.screen_share_required : false,
          secure_browser_enabled: examData.secure_browser_enabled !== undefined ? examData.secure_browser_enabled : false,
          ai_monitoring_enabled: examData.ai_monitoring_enabled !== undefined ? examData.ai_monitoring_enabled : true,
          live_proctoring_enabled: examData.live_proctoring_enabled !== undefined ? examData.live_proctoring_enabled : false,
          identity_verification_required: examData.identity_verification_required !== undefined ? examData.identity_verification_required : true,
          automated_grading_enabled: examData.automated_grading_enabled !== undefined ? examData.automated_grading_enabled : false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create exam session';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        alert(`❌ Error creating exam session: ${errorMessage}`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        alert('✅ Exam session created successfully!');
        setShowAddExamForm(false);
        setNewExam({
          title: '',
          description: '',
          subject_id: '',
          class_level: '',
          start_time: '',
          end_time: '',
          duration_minutes: 120,
          proctoring_enabled: true,
          camera_required: true,
          mic_required: false,
          screen_share_required: false,
          secure_browser_enabled: false,
          ai_monitoring_enabled: true,
          live_proctoring_enabled: false,
          identity_verification_required: true,
          automated_grading_enabled: false
        });
        loadExamSessions(); // Refresh the sessions list
      } else {
        alert('❌ Error creating exam session: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating exam session:', error);
      alert(`❌ Error creating exam session: ${error.message || 'Please check your connection and try again.'}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Exam Proctoring Dashboard</h2>
          <button
            onClick={() => setShowAddExamForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam</span>
          </button>
        </div>
        
        {/* Session Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam Session</label>
          <select
            value={selectedSession?.id || ''}
            onChange={(e) => {
              const session = examSessions.find(s => s.id === parseInt(e.target.value));
              setSelectedSession(session);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an exam session...</option>
            {examSessions && examSessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.title} - {new Date(session.start_time).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSession && dashboardData && (
        <>
          {/* Session Control Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Session Control</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sessionStatus === 'active' ? 'bg-green-100 text-green-800' :
                  sessionStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  sessionStatus === 'ended' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sessionStatus.charAt(0).toUpperCase() + sessionStatus.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => startExamSession(selectedSession.id)}
                disabled={sessionStatus === 'active'}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                <span>Start Session</span>
              </button>
              
              <button
                onClick={() => pauseExamSession(selectedSession.id)}
                disabled={sessionStatus !== 'active'}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Session</span>
              </button>
              
              <button
                onClick={() => endExamSession(selectedSession.id)}
                disabled={sessionStatus === 'ended'}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Square className="w-4 h-4" />
                <span>End Session</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Supervision Mode:</label>
                <select
                  value={supervisionMode}
                  onChange={(e) => setSupervisionMode(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="normal">Normal</option>
                  <option value="strict">Strict</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Proctoring Features */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enhanced Proctoring Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Identity Verification */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-800">Identity Verification</span>
                  </div>
                  <button
                    onClick={() => setIdentityVerification(!identityVerification)}
                    className={`px-3 py-1 rounded text-sm ${
                      identityVerification ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {identityVerification ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">Biometric authentication and facial recognition</p>
                <button
                  onClick={() => setShowVerifyStudentsForm(true)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Verify All Students
                </button>
              </div>

              {/* Secure Browser */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-800">Secure Browser</span>
                  </div>
                  <button
                    onClick={enableSecureBrowser}
                    className={`px-3 py-1 rounded text-sm ${
                      secureBrowserMode ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {secureBrowserMode ? 'Locked' : 'Unlocked'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">Prevent unauthorized resource access</p>
                <button
                  onClick={() => setShowLockBrowserForm(true)}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  {secureBrowserMode ? 'Unlock Browser' : 'Lock Browser'}
                </button>
              </div>

              {/* AI Monitoring */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-800">AI Monitoring</span>
                  </div>
                  <button
                    onClick={toggleAiMonitoring}
                    className={`px-3 py-1 rounded text-sm ${
                      aiMonitoringEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {aiMonitoringEnabled ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">Screen activity and behavior analysis</p>
                <button
                  onClick={() => setShowDisableAIForm(true)}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  {aiMonitoringEnabled ? 'Disable AI' : 'Enable AI'}
                </button>
              </div>

              {/* Live Proctoring */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-800">Live Proctoring</span>
                  </div>
                  <button
                    onClick={toggleLiveProctoring}
                    className={`px-3 py-1 rounded text-sm ${
                      liveProctoringEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {liveProctoringEnabled ? 'Live' : 'Offline'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">Human proctor real-time monitoring</p>
                <button
                  onClick={toggleLiveProctoring}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  {liveProctoringEnabled ? 'End Live' : 'Start Live'}
                </button>
              </div>

              {/* Pre-Exam Checks */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-800">Pre-Exam Checks</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mb-3">System and environment verification</p>
                <button
                  onClick={() => setShowRunChecksForm(true)}
                  className="w-full px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Run Checks
                </button>
              </div>

              {/* Automated Grading */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-800">Automated Grading</span>
                  </div>
                  <button
                    onClick={() => setAutomatedGradingEnabled(!automatedGradingEnabled)}
                    className={`px-3 py-1 rounded text-sm ${
                      automatedGradingEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {automatedGradingEnabled ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">AI-powered exam response grading</p>
                <button
                  onClick={() => setShowProcessGradingForm(true)}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Process Grading
                </button>
              </div>

              {/* Exam Reports */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-gray-800">Exam Reports</span>
                  </div>
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-sm text-gray-600 mb-3">Comprehensive activity analysis</p>
                <button
                  onClick={() => setShowGenerateReportForm(true)}
                  className="w-full px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Admin Notifications */}
          {user.role === 'admin' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Admin Notifications</h3>
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {adminNotifications.map((notification, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">{notification.title}</span>
                      <span className="text-xs text-blue-600">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{notification.message}</p>
                  </div>
                ))}
                {adminNotifications.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No notifications</p>
                )}
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData.stats.total_students || 0}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Now</p>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.stats.active_students || 0}</p>
                </div>
                <Eye className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cameras On</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.cameras_on || 0}</p>
                </div>
                <Camera className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Flagged Students</p>
                  <p className="text-3xl font-bold text-red-600">{dashboardData.stats.flagged_students || 0}</p>
                </div>
                <Flag className="w-12 h-12 text-red-500" />
              </div>
            </div>
          </div>

          {/* Live Camera Feeds - Only show when live proctoring is enabled */}
          {liveProctoringEnabled && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Live Camera Feeds</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 font-medium">LIVE</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dashboardData.students && dashboardData.students
                  .filter(student => student.camera_status === 'on')
                  .map(student => (
                    <div key={student.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
                        {/* Real Camera Feed */}
                        <video
                          id={`camera-${student.id}`}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          playsInline
                          style={{ display: 'none' }}
                        />
                        
                        {/* Camera Feed Placeholder - shown when no real feed */}
                        <div id={`placeholder-${student.id}`} className="text-white text-center">
                          <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm opacity-75">Camera Feed</p>
                          <p className="text-xs opacity-50">{student.first_name} {student.last_name}</p>
                          <button
                            onClick={() => requestCameraAccess(student.id)}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Request Camera
                          </button>
                        </div>
                        
                        {/* Status Indicators */}
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        
                        {/* Student Info Overlay */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          {student.admission_number}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{student.first_name} {student.last_name}</span>
                          <div className="flex items-center space-x-1">
                            <Camera className="w-3 h-3 text-green-600" />
                            <Mic className="w-3 h-3 text-green-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">Status: {student.status}</span>
                          {student.flag_count > 0 && (
                            <div className="flex items-center space-x-1">
                              <Flag className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-red-600">{student.flag_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {/* No cameras message */}
                {(!dashboardData.students || dashboardData.students.filter(s => s.camera_status === 'on').length === 0) && (
                  <div className="col-span-full text-center py-8">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active camera feeds</p>
                    <p className="text-sm text-gray-400">Students need to enable their cameras to appear here</p>
                    <button
                      onClick={requestAllCameras}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Request All Cameras
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Students List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Students Monitoring</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Students</option>
                    <option value="active">Active</option>
                    <option value="flagged">Flagged</option>
                    <option value="camera_off">Camera Off</option>
                    <option value="mic_off">Mic Off</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.students && dashboardData.students
                  .filter(student => {
                    const matchesSearch = !studentSearch || 
                      `${student.first_name} ${student.last_name}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      student.admission_number?.toLowerCase().includes(studentSearch.toLowerCase());
                    
                    const matchesFilter = activityFilter === 'all' || 
                      (activityFilter === 'active' && student.status === 'in_progress') ||
                      (activityFilter === 'flagged' && student.flag_count > 0) ||
                      (activityFilter === 'camera_off' && student.camera_status === 'off') ||
                      (activityFilter === 'mic_off' && student.mic_status === 'off');
                    
                    return matchesSearch && matchesFilter;
                  })
                  .map(student => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {student.first_name} {student.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{student.admission_number}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Camera className={`w-4 h-4 ${getStatusColor(student.camera_status)}`} />
                        <span className="text-gray-600">Camera</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mic className={`w-4 h-4 ${getStatusColor(student.mic_status)}`} />
                        <span className="text-gray-600">Mic</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Monitor className={`w-4 h-4 ${getStatusColor(student.screen_share_status)}`} />
                        <span className="text-gray-600">Screen</span>
                      </div>
                      {student.flag_count > 0 && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <Flag className="w-4 h-4" />
                          <span>{student.flag_count} flags</span>
                        </div>
                      )}
                    </div>

                    {user.role === 'teacher' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => createFlag(student.id, 'manual', 'medium', 'Manual flag by teacher')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 flex items-center space-x-1"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Flag</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowMessageForm(true);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => verifyStudentIdentity(student.student_id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center space-x-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowCameraControlForm(true);
                          }}
                          className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                            student.camera_status === 'on' 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-gray-500 text-white hover:bg-gray-600'
                          }`}
                        >
                          <Camera className="w-3 h-3" />
                          <span>{student.camera_status === 'on' ? 'Disable' : 'Enable'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flags Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Flags</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {flags && flags.length > 0 ? flags.map(flag => (
                  <div key={flag.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">
                          {flag.first_name} {flag.last_name}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                          {flag.severity} - {flag.flag_type}
                        </span>
                      </div>
                      {!flag.resolved && (
                        <button
                          onClick={() => {
                            const notes = prompt('Resolution notes:');
                            if (notes) resolveFlag(flag.id, notes);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{flag.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(flag.flagged_at).toLocaleString()}
                    </p>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm text-center py-4">No flags yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Messaging Section */}
          {user.role === 'teacher' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Broadcast Message</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message to all students..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={() => sendMessage()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Suspicious Activity Monitoring */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Suspicious Activity Monitoring</h3>
              <button
                onClick={loadSuspiciousActivity}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">High Risk</p>
                    <p className="text-2xl font-bold text-red-800">{suspiciousActivity.filter(a => a.severity === 'high').length}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Medium Risk</p>
                    <p className="text-2xl font-bold text-yellow-800">{suspiciousActivity.filter(a => a.severity === 'medium').length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Screen Changes</p>
                    <p className="text-2xl font-bold text-blue-800">{suspiciousActivity.filter(a => a.activity_type === 'screen_change').length}</p>
                  </div>
                  <Monitor className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Audio Anomalies</p>
                    <p className="text-2xl font-bold text-purple-800">{suspiciousActivity.filter(a => a.activity_type === 'audio_anomaly').length}</p>
                  </div>
                  <Volume2 className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {suspiciousActivity.length > 0 ? suspiciousActivity.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                        activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.severity}
                      </span>
                      <span className="font-medium text-gray-800">{activity.student_name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No suspicious activity detected</p>
                  <p className="text-sm text-gray-400">AI monitoring will detect and display suspicious activities here</p>
                </div>
              )}
            </div>
          </div>

          {/* Exam Reports Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Exam Reports & Analytics</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowGenerateReportForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
                <button 
                  onClick={() => setShowExportForm(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {examReports.length > 0 ? (
              <div className="space-y-4">
                {examReports.map((report, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">Exam Report - {report.session_title}</h4>
                      <span className="text-sm text-gray-500">{report.generated_at}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-800">{report.total_students}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-600">Completed</p>
                        <p className="text-2xl font-bold text-green-800">{report.completed_students}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-sm text-red-600">Flagged Incidents</p>
                        <p className="text-2xl font-bold text-red-800">{report.total_flags}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-800 mb-2">Key Insights:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Average exam completion time: {report.avg_completion_time}</li>
                        <li>• Most common flag type: {report.most_common_flag}</li>
                        <li>• System integrity score: {report.integrity_score}%</li>
                        <li>• Recommended actions: {report.recommendations}</li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No reports generated yet</p>
                <p className="text-sm text-gray-400">Generate a report to view detailed analytics</p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedSession && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select an exam session to start monitoring</p>
        </div>
      )}

      {/* Generate Report Form */}
      {showGenerateReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Generate Exam Report
              </h3>
              <button
                onClick={() => setShowGenerateReportForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="generate-report-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Report Type *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Report Type</option>
                    <option value="comprehensive">Comprehensive Activity Report</option>
                    <option value="flags">Proctoring Flags Summary</option>
                    <option value="behavioral">Behavioral Analysis</option>
                    <option value="technical">Technical Issues Report</option>
                    <option value="summary">Executive Summary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Include Data
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Student activity logs</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Flagged incidents</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">System performance</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Screenshots</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Export Format
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="pdf">PDF Report</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV Data</option>
                    <option value="json">JSON Data</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateReportForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="generate-report-form"
                  className="flex-1 py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Students Form */}
      {showVerifyStudentsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                👥 Verify All Students
              </h3>
              <button
                onClick={() => setShowVerifyStudentsForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="verify-students-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Verification Method *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Method</option>
                    <option value="biometric">Biometric Authentication</option>
                    <option value="facial">Facial Recognition</option>
                    <option value="document">Document Verification</option>
                    <option value="manual">Manual Verification</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Students to Verify
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="all">All Enrolled Students</option>
                    <option value="active">Active Students Only</option>
                    <option value="flagged">Flagged Students Only</option>
                    <option value="custom">Custom Selection</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Verification Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Require photo verification</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Check against student database</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Generate verification report</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyStudentsForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="verify-students-form"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Start Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lock Browser Form */}
      {showLockBrowserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                🔒 Browser Security Control
              </h3>
              <button
                onClick={() => setShowLockBrowserForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="lock-browser-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Security Action *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Action</option>
                    <option value="lock">Lock Browser</option>
                    <option value="unlock">Unlock Browser</option>
                    <option value="restrict">Restrict Access</option>
                    <option value="fullscreen">Enable Fullscreen Mode</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Security Level
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="low">Low - Basic restrictions</option>
                    <option value="medium" selected>Medium - Standard lockdown</option>
                    <option value="high">High - Strict lockdown</option>
                    <option value="maximum">Maximum - Complete isolation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Restrictions to Apply
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Block external websites</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Disable right-click menu</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Block keyboard shortcuts</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Prevent screen capture</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLockBrowserForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="lock-browser-form"
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Apply Security
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable AI Form */}
      {showDisableAIForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                🤖 AI Monitoring Control
              </h3>
              <button
                onClick={() => setShowDisableAIForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="disable-ai-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    AI Action *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Action</option>
                    <option value="disable">Disable AI Monitoring</option>
                    <option value="enable">Enable AI Monitoring</option>
                    <option value="pause">Pause AI Monitoring</option>
                    <option value="configure">Configure AI Settings</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    AI Monitoring Features
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Screen activity tracking</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Audio analysis</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Video analysis</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Behavioral anomaly detection</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Sensitivity Level
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="low">Low - Minimal alerts</option>
                    <option value="medium" selected>Medium - Standard monitoring</option>
                    <option value="high">High - Aggressive monitoring</option>
                    <option value="maximum">Maximum - All activities flagged</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDisableAIForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="disable-ai-form"
                  className="flex-1 py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Update AI Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run Checks Form */}
      {showRunChecksForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                🛡️ Pre-Exam System Checks
              </h3>
              <button
                onClick={() => setShowRunChecksForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="run-checks-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Check Type *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Check Type</option>
                    <option value="full">Full System Check</option>
                    <option value="hardware">Hardware Check</option>
                    <option value="network">Network Check</option>
                    <option value="security">Security Check</option>
                    <option value="performance">Performance Check</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Checks to Run
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Camera access verification</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Microphone access verification</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Network connection test</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Browser security check</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">System resources check</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Check Scope
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="all">All Students</option>
                    <option value="active">Active Students Only</option>
                    <option value="selected">Selected Students</option>
                    <option value="system">System-wide Check</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRunChecksForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="run-checks-form"
                  className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Run Checks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Grading Form */}
      {showProcessGradingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Process Automated Grading
              </h3>
              <button
                onClick={() => setShowProcessGradingForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="process-grading-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Grading Type *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Grading Type</option>
                    <option value="automatic">Automatic AI Grading</option>
                    <option value="semi-automatic">Semi-Automatic Grading</option>
                    <option value="manual">Manual Review Required</option>
                    <option value="comparison">Answer Comparison</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Grading Criteria
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Content accuracy</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Grammar and spelling</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Answer completeness</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Plagiarism detection</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Grading Scale
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="percentage">Percentage (0-100%)</option>
                    <option value="letter">Letter Grades (A-F)</option>
                    <option value="points">Points System</option>
                    <option value="custom">Custom Scale</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProcessGradingForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="process-grading-form"
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Start Grading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Form */}
      {showExportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                📤 Export Exam Data
              </h3>
              <button
                onClick={() => setShowExportForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="export-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Export Type *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Export Type</option>
                    <option value="reports">Exam Reports</option>
                    <option value="logs">Activity Logs</option>
                    <option value="flags">Proctoring Flags</option>
                    <option value="grades">Grading Results</option>
                    <option value="all">All Data</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Export Format *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Format</option>
                    <option value="pdf">PDF Document</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV Data</option>
                    <option value="json">JSON Data</option>
                    <option value="zip">ZIP Archive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Date Range
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="session">Current Session</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Include Data
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Student responses</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Proctoring logs</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">System metrics</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Screenshots</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExportForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="export-form"
                  className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Form */}
      {showMessageForm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                💬 Send Message to Student
              </h3>
              <button
                onClick={() => {
                  setShowMessageForm(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="message-form" className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Student:</p>
                  <p className="font-medium text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                  <p className="text-sm text-gray-500">ID: {selectedStudent.student_id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Message Type *
                  </label>
                  <select className="w-full p-3 rounded-lg border border-gray-300 bg-white" required>
                    <option value="">Select Message Type</option>
                    <option value="warning">Warning</option>
                    <option value="instruction">Instruction</option>
                    <option value="encouragement">Encouragement</option>
                    <option value="reminder">Reminder</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                    placeholder="Brief subject line"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Message *
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Priority Level
                  </label>
                  <select className="w-full p-3 rounded-lg border border-gray-300 bg-white">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="require-response"
                    className="mr-2"
                  />
                  <label htmlFor="require-response" className="text-sm text-gray-700">
                    Require student response
                  </label>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageForm(false);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="message-form"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Control Form */}
      {showCameraControlForm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                📹 Camera Control
              </h3>
              <button
                onClick={() => {
                  setShowCameraControlForm(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="camera-control-form" className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Student:</p>
                  <p className="font-medium text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                  <p className="text-sm text-gray-500">Current Status: <span className={`font-medium ${selectedStudent.camera_status === 'on' ? 'text-green-600' : 'text-red-600'}`}>{selectedStudent.camera_status === 'on' ? 'Enabled' : 'Disabled'}</span></p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Camera Action *
                  </label>
                  <select className="w-full p-3 rounded-lg border border-gray-300 bg-white" required>
                    <option value="">Select Action</option>
                    <option value="enable">Enable Camera</option>
                    <option value="disable">Disable Camera</option>
                    <option value="restart">Restart Camera</option>
                    <option value="check">Check Camera Status</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Reason for Action *
                  </label>
                  <select className="w-full p-3 rounded-lg border border-gray-300 bg-white" required>
                    <option value="">Select Reason</option>
                    <option value="technical">Technical Issue</option>
                    <option value="privacy">Privacy Concern</option>
                    <option value="distraction">Student Distraction</option>
                    <option value="cheating">Suspected Cheating</option>
                    <option value="request">Student Request</option>
                    <option value="maintenance">System Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                    placeholder="Provide additional details about this action..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Duration (if temporary)
                  </label>
                  <select className="w-full p-3 rounded-lg border border-gray-300 bg-white">
                    <option value="permanent">Permanent</option>
                    <option value="5min">5 minutes</option>
                    <option value="15min">15 minutes</option>
                    <option value="30min">30 minutes</option>
                    <option value="1hour">1 hour</option>
                    <option value="session">Until end of session</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notify-student"
                    className="mr-2"
                    defaultChecked
                  />
                  <label htmlFor="notify-student" className="text-sm text-gray-700">
                    Notify student about this action
                  </label>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCameraControlForm(false);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="camera-control-form"
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Apply Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam Form */}
      {showAddExamForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                📝 Create New Exam Session
              </h3>
              <button
                onClick={() => setShowAddExamForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="add-exam-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Exam Title *
                    </label>
                    <input
                      type="text"
                      value={newExam.title}
                      onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                      placeholder="Enter exam title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Year Level *
                    </label>
                    <select
                      value={newExam.class_level}
                      onChange={(e) => setNewExam({...newExam, class_level: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                      required
                    >
                      <option value="">Select Year Level</option>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                    rows="3"
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                    placeholder="Enter exam description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={newExam.start_time}
                      onChange={(e) => setNewExam({...newExam, start_time: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={newExam.end_time}
                      onChange={(e) => setNewExam({...newExam, end_time: e.target.value})}
                      className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newExam.duration_minutes}
                    onChange={(e) => setNewExam({...newExam, duration_minutes: parseInt(e.target.value)})}
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white"
                    min="30"
                    max="480"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Proctoring Settings
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExam.proctoring_enabled}
                        onChange={(e) => setNewExam({...newExam, proctoring_enabled: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable Proctoring</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExam.camera_required}
                        onChange={(e) => setNewExam({...newExam, camera_required: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Camera Required</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExam.mic_required}
                        onChange={(e) => setNewExam({...newExam, mic_required: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Microphone Required</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExam.ai_monitoring_enabled}
                        onChange={(e) => setNewExam({...newExam, ai_monitoring_enabled: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">AI Monitoring</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExam.identity_verification_required}
                        onChange={(e) => setNewExam({...newExam, identity_verification_required: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Identity Verification</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newExam.secure_browser_enabled}
                        onChange={(e) => setNewExam({...newExam, secure_browser_enabled: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Secure Browser</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddExamForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    createExamSession(newExam);
                  }}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create Exam Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringDashboard;
