import React, { useState, useEffect } from 'react';
import { 
  Video, Mic, MicOff, VideoOff, Users, MessageSquare, Share, 
  Settings, PhoneOff, Monitor, Hand, FileText, Clock, Plus,
  Calendar, BookOpen, Eye, Download, Upload, Send, Edit3,
  BarChart3, Users2, Presentation, FileImage, Volume2, 
  VolumeX, Camera, CameraOff, Maximize, Minimize, 
  MoreHorizontal, Zap, Target, Layers, PenTool, Tag, Globe,
  Mail, Link, AlertCircle, CheckCircle, X, Info, Bell
} from 'lucide-react';

const OnlineClassPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('schedule');
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inSession, setInSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    subject: '',
    class_level: '',
    scheduled_time: '',
    duration: 60,
    description: '',
    meeting_link: '',
    instructor_name: '',
    instructor_email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: 'bigbluebutton', // bigbluebutton, zoom, google_meet, teams
    recurring: false,
    recurring_pattern: 'weekly', // daily, weekly, monthly
    recurring_end_date: '',
    class_category: '',
    tags: '',
    max_participants: 50,
    meeting_link_platform: '', // For external platforms
    // BigBlueButton specific settings
    enable_whiteboard: true,
    enable_polls: true,
    enable_breakout_rooms: false,
    enable_recording: true,
    enable_screen_sharing: true,
    enable_chat: true,
    enable_hand_raising: true,
    moderator_password: '',
    attendee_password: '',
    // Notifications
    send_reminder: true,
    reminder_time: '15', // minutes before class
    send_to_participants: true,
    // Resources
    resources: [],
    prerequisites: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // BigBlueButton session state
  const [bbbSession, setBbbSession] = useState({
    meetingId: '',
    moderatorPassword: '',
    attendeePassword: '',
    joinUrl: '',
    isRecording: false,
    breakoutRooms: [],
    activePolls: [],
    whiteboardActive: false
  });

  // Dark mode styles
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const inputField = darkMode 
    ? 'w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500'
    : 'w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500';

  useEffect(() => {
    fetchOnlineClasses();
  }, []);

  const fetchOnlineClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const endpoint = userRole === 'teacher' 
        ? `${baseUrl}/api/online-classes/teacher`
        : `${baseUrl}/api/online-classes/student`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOnlineClasses(data.classes || []);
      } else {
        setOnlineClasses([]);
      }
    } catch (error) {
      console.error('Error fetching online classes:', error);
      setOnlineClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newClass.title || newClass.title.trim() === '') {
      newErrors.title = 'Class title is required';
    }
    
    if (!newClass.subject || newClass.subject === '') {
      newErrors.subject = 'Subject is required';
    }
    
    if (!newClass.scheduled_time) {
      newErrors.scheduled_time = 'Scheduled time is required';
    } else {
      const scheduledDate = new Date(newClass.scheduled_time);
      const now = new Date();
      if (scheduledDate < now) {
        newErrors.scheduled_time = 'Scheduled time must be in the future';
      }
    }
    
    if (!newClass.duration || newClass.duration < 15 || newClass.duration > 180) {
      newErrors.duration = 'Duration must be between 15 and 180 minutes';
    }
    
    if (newClass.max_participants && (newClass.max_participants < 1 || newClass.max_participants > 1000)) {
      newErrors.max_participants = 'Max participants must be between 1 and 1000';
    }
    
    if (newClass.platform !== 'bigbluebutton' && !newClass.meeting_link_platform) {
      newErrors.meeting_link_platform = 'Meeting link is required for external platforms';
    }
    
    if (newClass.instructor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClass.instructor_email)) {
      newErrors.instructor_email = 'Invalid email format';
    }
    
    if (newClass.recurring && !newClass.recurring_end_date) {
      newErrors.recurring_end_date = 'End date is required for recurring classes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOnlineClass = async () => {
    if (!validateForm()) {
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Please log in to create an online class');
        setCreating(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Prepare class data with only required fields for backend
      const classData = {
        title: newClass.title,
        subject: newClass.subject,
        class_level: newClass.class_level || '',
        scheduled_time: newClass.scheduled_time,
        duration: newClass.duration || 60,
        description: newClass.description || '',
        meeting_link: newClass.meeting_link_platform || newClass.meeting_link || ''
      };
      
      const response = await fetch(`${baseUrl}/api/online-classes/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create online class';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        alert(`❌ ${errorMessage}`);
        setCreating(false);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Online class scheduled successfully!');
        setNewClass({
          title: '',
          subject: '',
          class_level: '',
          scheduled_time: '',
          duration: 60,
          description: '',
          meeting_link: '',
          instructor_name: '',
          instructor_email: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: 'bigbluebutton',
          recurring: false,
          recurring_pattern: 'weekly',
          recurring_end_date: '',
          class_category: '',
          tags: '',
          max_participants: 50,
          meeting_link_platform: '',
          enable_whiteboard: true,
          enable_polls: true,
          enable_breakout_rooms: false,
          enable_recording: true,
          enable_screen_sharing: true,
          enable_chat: true,
          enable_hand_raising: true,
          moderator_password: '',
          attendee_password: '',
          send_reminder: true,
          reminder_time: '15',
          send_to_participants: true,
          resources: [],
          prerequisites: ''
        });
        setErrors({});
        setShowAdvanced(false);
        setCreating(false);
        fetchOnlineClasses();
      } else {
        alert(`❌ Failed to create class: ${result.message || 'Unknown error'}`);
        setCreating(false);
      }
    } catch (error) {
      console.error('Create online class error:', error);
      alert(`❌ Failed to create online class: ${error.message || 'Please check your connection and try again.'}`);
      setCreating(false);
    }
  };

  const startClass = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/online-classes/${classId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setInSession(true);
        setSessionData(result.session);
        setBbbSession({
          meetingId: result.session.meeting_id,
          moderatorPassword: result.session.moderator_password,
          attendeePassword: result.session.attendee_password,
          joinUrl: result.session.join_url,
          isRecording: false,
          breakoutRooms: [],
          activePolls: [],
          whiteboardActive: false
        });
        setActiveView('live');
      } else {
        alert(`❌ Failed to start class: ${result.message}`);
      }
    } catch (error) {
      console.error('Start class error:', error);
      alert('Failed to start class. Please try again.');
    }
  };

  const joinClass = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/online-classes/${classId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setInSession(true);
        setSessionData(result.session);
        setBbbSession({
          meetingId: result.session.meeting_id,
          moderatorPassword: result.session.moderator_password,
          attendeePassword: result.session.attendee_password,
          joinUrl: result.session.join_url,
          isRecording: false,
          breakoutRooms: [],
          activePolls: [],
          whiteboardActive: false
        });
        setActiveView('live');
      } else {
        alert(`❌ Failed to join class: ${result.message}`);
      }
    } catch (error) {
      console.error('Join class error:', error);
      alert('Failed to join class. Please try again.');
    }
  };

  const endClass = async () => {
    if (!sessionData) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/online-classes/${sessionData.id}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setInSession(false);
        setSessionData(null);
        setBbbSession({
          meetingId: '',
          moderatorPassword: '',
          attendeePassword: '',
          joinUrl: '',
          isRecording: false,
          breakoutRooms: [],
          activePolls: [],
          whiteboardActive: false
        });
        setActiveView('schedule');
        fetchOnlineClasses();
      }
    } catch (error) {
      console.error('End class error:', error);
    }
  };

  // BigBlueButton specific functions
  const startRecording = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/online-classes/${sessionData.id}/recording/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setBbbSession(prev => ({ ...prev, isRecording: true }));
        alert('✅ Recording started');
      } else {
        alert(`❌ Failed to start recording: ${result.message}`);
      }
    } catch (error) {
      console.error('Start recording error:', error);
      alert('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/online-classes/${sessionData.id}/recording/stop`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (result.success) {
        setBbbSession(prev => ({ ...prev, isRecording: false }));
        alert('✅ Recording stopped');
      } else {
        alert(`❌ Failed to stop recording: ${result.message}`);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      alert('Failed to stop recording');
    }
  };

  const createPoll = async () => {
    const question = prompt('Enter poll question:');
    if (!question) return;

    const options = prompt('Enter poll options (separated by commas):');
    if (!options) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/online-classes/${sessionData.id}/polls/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          options: options.split(',').map(opt => opt.trim())
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setBbbSession(prev => ({ 
          ...prev, 
          activePolls: [...prev.activePolls, result.poll] 
        }));
        alert('✅ Poll created successfully');
      } else {
        alert(`❌ Failed to create poll: ${result.message}`);
      }
    } catch (error) {
      console.error('Create poll error:', error);
      alert('Failed to create poll');
    }
  };

  const createBreakoutRooms = async () => {
    const roomCount = prompt('Enter number of breakout rooms:');
    if (!roomCount || isNaN(roomCount)) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/online-classes/${sessionData.id}/breakout-rooms/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomCount: parseInt(roomCount) })
      });

      const result = await response.json();
      
      if (result.success) {
        setBbbSession(prev => ({ 
          ...prev, 
          breakoutRooms: result.rooms 
        }));
        alert('✅ Breakout rooms created successfully');
      } else {
        alert(`❌ Failed to create breakout rooms: ${result.message}`);
      }
    } catch (error) {
      console.error('Create breakout rooms error:', error);
      alert('Failed to create breakout rooms');
    }
  };

  const openWhiteboard = () => {
    setBbbSession(prev => ({ ...prev, whiteboardActive: true }));
    // In a real implementation, this would open the BigBlueButton whiteboard
    alert('Opening BigBlueButton whiteboard...');
  };

  if (loading) {
    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Live Session View
  if (inSession && activeView === 'live') {
    return (
      <div className="space-y-6">
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>
                {sessionData?.title || 'Live Class Session'}
              </h2>
              <p className={`${textSecondary} text-sm`}>
                {sessionData?.subject} • {sessionData?.participants || 0} participants
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Meeting ID: {bbbSession.meetingId}
                </span>
                {bbbSession.isRecording && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-1 animate-pulse"></span>
                    Recording
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                LIVE
              </span>
            </div>
          </div>

          {/* Video Display Area */}
          <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6 relative">
            <div className="text-center text-white">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Video Stream Area</p>
              <p className="text-sm text-gray-400">Connect your camera and microphone</p>
              {bbbSession.whiteboardActive && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  <PenTool className="w-4 h-4 inline mr-1" />
                  Whiteboard Active
                </div>
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-center space-x-2 mb-6 flex-wrap">
            {/* Basic Controls */}
            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors" title="Microphone">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors" title="Camera">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors" title="Screen Share">
              <Monitor className="w-5 h-5" />
            </button>
            
            {/* Advanced Features */}
            {userRole === 'teacher' && (
              <>
                <button 
                  onClick={openWhiteboard}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" 
                  title="Whiteboard"
                >
                  <PenTool className="w-5 h-5" />
                </button>
                <button 
                  onClick={createPoll}
                  className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors" 
                  title="Create Poll"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={createBreakoutRooms}
                  className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors" 
                  title="Breakout Rooms"
                >
                  <Users2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={bbbSession.isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-full transition-colors ${
                    bbbSession.isRecording 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  } text-white`}
                  title={bbbSession.isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {bbbSession.isRecording ? '⏹' : '⏺'}
                  </span>
                </button>
              </>
            )}
            
            {/* Chat and Participants */}
            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors" title="Chat">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors" title="Participants">
              <Users className="w-5 h-5" />
            </button>
            
            {/* End Call */}
            <button 
              onClick={endClass}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              title="End Class"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className={`text-sm font-medium ${textPrimary}`}>Duration</span>
              </div>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {sessionData?.duration || 0} min
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className={`text-sm font-medium ${textPrimary}`}>Participants</span>
              </div>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {sessionData?.participants || 0}
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-yellow-600" />
                <span className={`text-sm font-medium ${textPrimary}`}>Active Polls</span>
              </div>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {bbbSession.activePolls.length}
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <Users2 className="w-4 h-4 text-purple-600" />
                <span className={`text-sm font-medium ${textPrimary}`}>Breakout Rooms</span>
              </div>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {bbbSession.breakoutRooms.length}
              </p>
            </div>
          </div>

          {/* Active Polls Display */}
          {bbbSession.activePolls.length > 0 && (
            <div className="mt-6">
              <h4 className={`text-lg font-semibold mb-3 ${textPrimary}`}>Active Polls</h4>
              <div className="space-y-3">
                {bbbSession.activePolls.map((poll, index) => (
                  <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <p className={`font-medium ${textPrimary} mb-2`}>{poll.question}</p>
                    <div className="space-y-2">
                      {poll.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center justify-between">
                          <span className={textSecondary}>{option}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                            </div>
                            <span className="text-sm text-gray-500">60%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakout Rooms Display */}
          {bbbSession.breakoutRooms.length > 0 && (
            <div className="mt-6">
              <h4 className={`text-lg font-semibold mb-3 ${textPrimary}`}>Breakout Rooms</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bbbSession.breakoutRooms.map((room, index) => (
                  <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${textPrimary}`}>Room {index + 1}</span>
                      <span className="text-sm text-green-600">{room.participants || 0} participants</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Duration: {room.duration || 'Unlimited'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary} flex items-center`}>
              <Video className="w-7 h-7 mr-3 text-blue-600" />
              Online Classes
            </h2>
            <p className={`${textSecondary} mt-1`}>
              {userRole === 'teacher' ? 'Schedule and conduct live classes' : 'Join your scheduled online classes'}
            </p>
          </div>
          
          {userRole === 'teacher' && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Class
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className={`flex space-x-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}>
          <button
            onClick={() => setActiveView('schedule')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'schedule'
                ? `${darkMode ? 'bg-gray-800' : 'bg-white'} text-blue-600 shadow-sm`
                : `${textSecondary} hover:text-blue-600`
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedule
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'history'
                ? `${darkMode ? 'bg-gray-800' : 'bg-white'} text-blue-600 shadow-sm`
                : `${textSecondary} hover:text-blue-600`
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            History
          </button>
        </div>
      </div>

      {/* Create Class Modal */}
      {creating && userRole === 'teacher' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto`}>
            <h4 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Schedule Online Class</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Class Title *
                  </label>
                  <input
                    type="text"
                    value={newClass.title}
                    onChange={(e) => setNewClass(prev => ({ ...prev, title: e.target.value }))}
                    className={inputField}
                    placeholder="e.g., Business Administration 101"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Course *
                  </label>
                  <select
                    value={newClass.subject}
                    onChange={(e) => setNewClass(prev => ({ ...prev, subject: e.target.value }))}
                    className={inputField}
                  >
                    <option value="">Select course...</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Economics">Economics</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resource Management">Human Resource Management</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Year Level
                  </label>
                  <select
                    value={newClass.class_level}
                    onChange={(e) => setNewClass(prev => ({ ...prev, class_level: e.target.value }))}
                    className={inputField}
                  >
                    <option value="">Select year level...</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Scheduled Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newClass.scheduled_time}
                    onChange={(e) => setNewClass(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className={inputField}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newClass.duration}
                    onChange={(e) => setNewClass(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className={inputField}
                    min="15"
                    max="180"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={newClass.max_participants}
                    onChange={(e) => setNewClass(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                    className={inputField}
                    min="1"
                    max="100"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                  Description
                </label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                  className={inputField}
                  rows="3"
                  placeholder="Class description and topics to be covered..."
                ></textarea>
              </div>

              {/* Advanced Feature Settings */}
              <div className="border-t pt-4">
                <h5 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Advanced Features</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newClass.enable_whiteboard}
                        onChange={(e) => setNewClass(prev => ({ ...prev, enable_whiteboard: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm ${textSecondary}`}>
                        <PenTool className="w-4 h-4 inline mr-2" />
                        Enable Whiteboard
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newClass.enable_polls}
                        onChange={(e) => setNewClass(prev => ({ ...prev, enable_polls: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm ${textSecondary}`}>
                        <BarChart3 className="w-4 h-4 inline mr-2" />
                        Enable Polls
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newClass.enable_breakout_rooms}
                        onChange={(e) => setNewClass(prev => ({ ...prev, enable_breakout_rooms: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm ${textSecondary}`}>
                        <Users2 className="w-4 h-4 inline mr-2" />
                        Enable Breakout Rooms
                      </span>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newClass.enable_recording}
                        onChange={(e) => setNewClass(prev => ({ ...prev, enable_recording: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm ${textSecondary}`}>
                        <span className="w-4 h-4 inline mr-2">⏺</span>
                        Enable Recording
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newClass.enable_screen_sharing}
                        onChange={(e) => setNewClass(prev => ({ ...prev, enable_screen_sharing: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm ${textSecondary}`}>
                        <Monitor className="w-4 h-4 inline mr-2" />
                        Enable Screen Sharing
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setCreating(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createOnlineClass}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {onlineClasses.length > 0 ? (
            onlineClasses.map((cls) => (
              <div key={cls.id} className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary}`}>{cls.title}</h4>
                    <p className={`text-sm ${textSecondary}`}>{cls.subject} • {cls.class_level}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    cls.status === 'live' ? 'bg-red-100 text-red-800' :
                    cls.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {cls.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={textSecondary}>
                      {new Date(cls.scheduled_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={textSecondary}>{cls.duration} minutes</span>
                  </div>
                  {cls.participants_count > 0 && (
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className={textSecondary}>{cls.participants_count} participants</span>
                    </div>
                  )}
                </div>

                {cls.description && (
                  <p className={`text-sm ${textSecondary} mb-4`}>{cls.description}</p>
                )}

                <div className="flex space-x-2">
                  {userRole === 'teacher' ? (
                    <button
                      onClick={() => startClass(cls.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start Class
                    </button>
                  ) : (
                    <button
                      onClick={() => joinClass(cls.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      disabled={cls.status !== 'live'}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Class
                    </button>
                  )}
                  {cls.meeting_id && (
                    <div className="flex flex-col space-y-2">
                      <span className="text-xs text-gray-500">Meeting ID: {cls.meeting_id}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(cls.meeting_id)}
                        className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-sm"
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Copy ID
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={`${cardBg} rounded-xl shadow-lg p-6 col-span-2`}>
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className={textSecondary}>No online classes scheduled</p>
                <p className={`text-sm ${textSecondary}`}>
                  {userRole === 'teacher' 
                    ? 'Click "Schedule Class" to create a new online class'
                    : 'Check back later for scheduled classes'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Class History</h3>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={textSecondary}>No class history available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineClassPanel;
