import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Inbox, Users, Search, Plus, Reply, Trash2, Star, Clock, CheckCircle, Phone, Video, Paperclip, Smile, MoreVertical, Circle, AlertCircle, UserPlus, Shield, Eye, Bell, Upload, Share2, Mail, AlertTriangle, Info, Bot, Sparkles } from 'lucide-react';
import apiService from '../services/api';

const MessagingPanel = ({ userRole, currentUser, darkMode = false, notifications: externalNotifications, setNotifications: setExternalNotifications, disableNotifications = false }) => {
  const [activeView, setActiveView] = useState('chat');
  // If notifications are disabled, keep the panel away from any notifications view
  useEffect(() => {
    if (disableNotifications && activeView === 'notifications') {
      setActiveView('chat');
    }
  }, [disableNotifications, activeView]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [composing, setComposing] = useState(false);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    members: [],
    isMonitored: true,
    monitorRole: 'teacher'
  });
  const [availableMembers, setAvailableMembers] = useState([]);
  
  // Call functionality state
  const [callState, setCallState] = useState({
    isInCall: false,
    callType: null, // 'audio' or 'video'
    callParticipants: [],
    callId: null,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false
  });
  const [showCallModal, setShowCallModal] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  
  // Notifications state (optionally disabled)
  const [notifications, setNotifications] = useState(disableNotifications ? [] : (externalNotifications || []));
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    type: 'system',
    recipient: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    if (disableNotifications) {
      setShowSendNotification(false);
      setSendingNotification(false);
    }
  }, [disableNotifications]);
  
  // Share and Upload state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [shareData, setShareData] = useState({
    type: 'message',
    content: '',
    recipients: [],
    isPublic: false
  });
  const [uploadData, setUploadData] = useState({
    file: null,
    description: '',
    recipients: [],
    isPublic: false
  });
  
  // AI Chat Assistant state
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiMessage, setAiMessage] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState([]);
  // UI addons (reserved for future emoji/attachments)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [pendingAttachmentPreview, setPendingAttachmentPreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const aiMessagesEndRef = useRef(null);

  // AI Chat Assistant functions
  const sendAiMessage = async () => {
    if (!aiMessage.trim() || aiLoading) return;

    const baseId = Date.now();
    const nowIso = new Date().toISOString();

    const userMessage = {
      id: baseId,
      content: aiMessage.trim(),
      sender: 'user',
      timestamp: nowIso,
      type: 'text',
      status: 'sent' // sent → delivered → read
    };

    setAiChatMessages(prev => [...prev, userMessage]);
    setAiMessage('');

    // Progress message status like WhatsApp
    setTimeout(() => {
      setAiChatMessages(prev => prev.map(m => m.id === baseId ? { ...m, status: 'delivered' } : m));
    }, 400);
    setTimeout(() => {
      setAiChatMessages(prev => prev.map(m => m.id === baseId ? { ...m, status: 'read' } : m));
    }, 900);

    setAiLoading(true);
    setAiTyping(true);

    try {
      // Simulate AI response with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse = generateAiResponse(userMessage.content, userRole);

      const aiMessageObj = {
        id: baseId + 1,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text',
        status: 'delivered'
      };

      setAiChatMessages(prev => [...prev, aiMessageObj]);

      // Mark AI message as read shortly after
      setTimeout(() => {
        setAiChatMessages(prev => prev.map(m => m.id === baseId + 1 ? { ...m, status: 'read' } : m));
      }, 600);

      // Save to chat history
      setAiChatHistory(prev => [...prev, {
        user: userMessage.content,
        ai: aiResponse,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'error'
      };
      setAiChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
      setAiTyping(false);
    }
  };

  const generateAiResponse = (userMessage, role) => {
    const message = userMessage.toLowerCase();
    
    // Role-specific responses
    if (role === 'admin') {
      if (message.includes('student') || message.includes('enrollment')) {
        return "I can help you with student management! You can view enrollment statistics, manage student records, and track academic performance. Would you like me to show you the enrollment dashboard or help with specific student queries?";
      }
      if (message.includes('teacher') || message.includes('staff')) {
        return "For teacher management, I can assist with staff scheduling, performance reviews, and resource allocation. You can access the staff management panel to view teacher assignments and workload distribution.";
      }
      if (message.includes('attendance') || message.includes('absent')) {
        return "I can help you track attendance patterns and generate reports. The attendance system shows real-time data, identifies trends, and can alert you to concerning patterns. Would you like to see today's attendance summary?";
      }
      if (message.includes('payment') || message.includes('fee')) {
        return "For payment management, I can help you track fee collections, identify outstanding payments, and generate financial reports. The payment dashboard shows collection rates and payment trends.";
      }
      if (message.includes('report') || message.includes('analytics')) {
        return "I can generate comprehensive reports on student performance, attendance, payments, and staff productivity. What specific metrics would you like to analyze?";
      }
    }
    
    if (role === 'teacher') {
      if (message.includes('student') || message.includes('class')) {
        return "I can help you manage your students and classes! I can provide insights on student performance, attendance patterns, and suggest teaching strategies. What specific aspect would you like help with?";
      }
      if (message.includes('assignment') || message.includes('homework')) {
        return "For assignments, I can help you create rubrics, track submission rates, and provide feedback suggestions. I can also help identify students who might need additional support.";
      }
      if (message.includes('grade') || message.includes('assessment')) {
        return "I can assist with grading strategies, analyze assessment results, and help identify learning gaps. Would you like help with creating assessments or analyzing student performance?";
      }
      if (message.includes('communication')) {
        return "I can help you communicate effectively with students and staff. I can draft messages, suggest meeting topics, and help track engagement. What would you like to communicate about?";
      }
      if (message.includes('lesson') || message.includes('curriculum')) {
        return "I can help you plan lessons, suggest teaching resources, and align content with curriculum standards. What subject or topic are you working on?";
      }
    }

    // General responses
    if (message.includes('hello') || message.includes('hi')) {
      return `Hello! I'm your AI assistant. I'm here to help you with school management tasks, student queries, and administrative functions. How can I assist you today?`;
    }
    if (message.includes('help')) {
      return "I can help you with various tasks including student management, attendance tracking, communication, and administrative functions. What specific area would you like assistance with?";
    }
    if (message.includes('thank')) {
      return "You're welcome! I'm here to help make your work easier. Is there anything else I can assist you with?";
    }
    if (message.includes('time') || message.includes('schedule')) {
      return "I can help you with scheduling, time management, and calendar organization. Would you like to check your schedule or create new events?";
    }

    // Default response
    return "I understand you're looking for assistance. I can help with student management, attendance tracking, communication, reports, and various administrative tasks. Could you be more specific about what you need help with?";
  };

  const clearAiChat = () => {
    setAiChatMessages([]);
    setAiChatHistory([]);
  };

  const handleAiKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAiMessage();
    }
  };

  // Dark mode utility classes
  const containerBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  // Debug log to verify user role
  console.log('MessagingPanel - User Role:', userRole, 'Current User:', currentUser);
  console.log('Call feature available for:', userRole === 'teacher' || userRole === 'admin' ? 'YES' : 'NO');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Test Python backend connection
        const healthCheck = await apiService.healthCheck();
        console.log('Python Backend Status:', healthCheck);
        
        // Fetch contacts from backend only (no demo data)
        await fetchContacts();
        setSelectedContact(null);
        
        setChatMessages([]);
        
        // Fetch notifications
        await fetchNotifications();
      } catch (error) {
        console.error('Failed to fetch messaging data:', error);
        // Show empty state - no fake data
        setContacts([]);
        setSelectedContact(null);
        setChatMessages([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      simulateOnlineStatus();
      simulateTypingIndicator();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeView]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Scroll to bottom when new AI messages arrive
  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const simulateOnlineStatus = () => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      contacts.forEach(contact => {
        if (Math.random() > 0.7) {
          if (contact.online) {
            newSet.add(contact.id);
          } else {
            newSet.delete(contact.id);
          }
        }
      });
      return newSet;
    });
  };

  const simulateTypingIndicator = () => {
    if (selectedContact && Math.random() > 0.8) {
      setIsTyping(prev => ({ ...prev, [selectedContact.id]: true }));
      setTimeout(() => {
        setIsTyping(prev => ({ ...prev, [selectedContact.id]: false }));
      }, 2000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) {
      return;
    }

    const messageData = {
      id: Date.now(),
      sender_id: currentUser?.id || 2,
      sender_name: currentUser?.name || "You",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_own: true,
      message_type: "text",
      read_status: "sent"
    };

    // Add message to chat immediately (optimistic update)
    setChatMessages(prev => [...prev, messageData]);
    setNewMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/messaging/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: selectedContact.id,
          content: messageData.content,
          message_type: 'text'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update message status to delivered
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === messageData.id 
              ? { ...msg, read_status: 'delivered', id: result.message_id }
              : msg
          )
        );
      } else {
        // Update message status to failed
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === messageData.id 
              ? { ...msg, read_status: 'failed' }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Update message status to failed
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === messageData.id 
            ? { ...msg, read_status: 'failed' }
            : msg
        )
      );
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing indicator
    setTyping(true);
    
    // Clear typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createGroup = async () => {
    if (!groupData.name.trim() || groupData.members.length === 0) {
      alert('Please provide group name and select at least one member');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/messaging/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: groupData.name,
          description: groupData.description,
          member_ids: groupData.members,
          is_monitored: groupData.isMonitored,
          monitor_role: groupData.monitorRole
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Group created successfully!');
        setShowCreateGroup(false);
        setGroupData({
          name: '',
          description: '',
          members: [],
          isMonitored: true,
          monitorRole: 'teacher'
        });
        // Refresh contacts to include the new group
        fetchContacts();
      } else {
        alert(`❌ Failed to create group: ${result.message}`);
      }
    } catch (error) {
      alert('Error creating group');
      console.error('Create group error:', error);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/messaging/available-members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableMembers(data.members || []);
      } else {
        setAvailableMembers([]);
      }
    } catch (error) {
      console.error('Error fetching available members:', error);
      setAvailableMembers([]);
    }
  };

  const broadcastMessage = async () => {
    const recipientRole = prompt('Send to which group?\nOptions: student, teacher, admin');
    if (!recipientRole) return;

    const subject = prompt('Enter message subject:');
    if (!subject) return;

    const content = prompt('Enter message content:');
    if (!content) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/messaging/broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_role: recipientRole,
          subject: subject,
          content: content
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Message broadcast to ${result.sent_count} recipients`);
      } else {
        alert(`❌ Broadcast failed: ${result.message}`);
      }
    } catch (error) {
      alert('Error broadcasting message');
      console.error('Broadcast error:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/messaging/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          setContacts(data.contacts || []);
        } else {
          setContacts([]);
        }
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    }
  };

  // Notifications functions
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const list = data.notifications || [];
        // Normalize fields for consistent rendering
        const normalized = list.map(n => ({
          id: n.id,
          type: n.type || 'system',
          title: n.title || n.subject || 'Notification',
          message: n.message || n.content || '',
          category: n.category || 'general',
          priority: n.priority || 'medium',
          created_at: n.created_at || n.timestamp,
          read_at: n.read_at || (n.is_read ? new Date().toISOString() : null)
        }));
        setNotifications(normalized);
        setNotificationUnreadCount(normalized.filter(n => !n.read_at).length);
        // Sync with external notifications state
        if (setExternalNotifications) {
          setExternalNotifications(normalized);
        }
      } else {
        setNotifications([]);
        setNotificationUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setNotificationUnreadCount(0);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        );
        setNotifications(updatedNotifications);
        setNotificationUnreadCount(prev => Math.max(0, prev - 1));
        // Sync with external notifications state
        if (setExternalNotifications) {
          setExternalNotifications(updatedNotifications);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const sendNotification = async () => {
    if (!notificationForm.recipient || !notificationForm.message) {
      alert('Please fill in recipient and message fields');
      return;
    }

    setSendingNotification(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const payload = {
        type: notificationForm.type,
        recipient: notificationForm.recipient,
        message: notificationForm.message,
        category: notificationForm.category,
        priority: notificationForm.priority
      };

      if (notificationForm.type === 'email') {
        payload.subject = notificationForm.subject || 'Smart School Notification';
      }

      if (notificationForm.type === 'system') {
        payload.title = notificationForm.subject || 'System Notification';
      }

      const response = await fetch(`${baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Notification sent successfully!');
        setNotificationForm({
          type: 'system',
          recipient: '',
          subject: '',
          message: '',
          category: 'general',
          priority: 'medium'
        });
        setShowSendNotification(false);
        fetchNotifications(); // Refresh notifications
      } else {
        alert(`❌ Failed to send notification: ${result.message}`);
      }
    } catch (error) {
      alert('Error sending notification');
      console.error('Send notification error:', error);
    } finally {
      setSendingNotification(false);
    }
  };

  // Share and Upload functions
  const handleShare = async () => {
    if (!shareData.content.trim()) {
      alert('Please enter content to share');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/messaging/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: shareData.type,
          content: shareData.content,
          recipient_ids: shareData.recipients,
          is_public: shareData.isPublic
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Content shared successfully!');
        setShareData({
          type: 'message',
          content: '',
          recipients: [],
          isPublic: false
        });
        setShowShareModal(false);
      } else {
        alert(`❌ Failed to share content: ${result.message}`);
      }
    } catch (error) {
      alert('Error sharing content');
      console.error('Share error:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      alert('Please select a file to upload');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('description', uploadData.description);
      formData.append('recipient_ids', JSON.stringify(uploadData.recipients));
      formData.append('is_public', uploadData.isPublic);

      const response = await fetch(`${baseUrl}/api/messaging/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ File uploaded and shared successfully!');
        setUploadData({
          file: null,
          description: '',
          recipients: [],
          isPublic: false
        });
        setShowUploadModal(false);
      } else {
        alert(`❌ Failed to upload file: ${result.message}`);
      }
    } catch (error) {
      alert('Error uploading file');
      console.error('Upload error:', error);
    }
  };

  // Call functionality functions
  const initiateCall = async (contactId, callType = 'audio') => {
    if (!selectedContact) {
      alert('Please select a contact to call');
      return;
    }

    try {
      const callId = `call_${Date.now()}`;
      setCallState({
        isInCall: true,
        callType: callType,
        callParticipants: [currentUser.id, contactId],
        callId: callId,
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false
      });
      setShowCallModal(true);

      // Send call invitation
      const callData = {
        callId: callId,
        callerId: currentUser.id,
        callerName: currentUser.name,
        recipientId: contactId,
        callType: callType,
        timestamp: new Date().toISOString()
      };

      // In a real implementation, this would use WebRTC or a service like Agora
      console.log('Initiating call:', callData);
      
      // Simulate call invitation
      setTimeout(() => {
        setIncomingCall({
          callId: callId,
          callerName: currentUser.name,
          callType: callType,
          timestamp: new Date()
        });
      }, 1000);

    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call');
    }
  };

  const answerCall = (callId) => {
    setCallState(prev => ({
      ...prev,
      isInCall: true,
      callId: callId
    }));
    setIncomingCall(null);
    setShowCallModal(true);
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  const endCall = () => {
    setCallState({
      isInCall: false,
      callType: null,
      callParticipants: [],
      callId: null,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false
    });
    setShowCallModal(false);
    setIncomingCall(null);
  };

  const toggleMute = () => {
    setCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };

  const toggleVideo = () => {
    setCallState(prev => ({
      ...prev,
      isVideoOff: !prev.isVideoOff
    }));
  };

  const toggleScreenShare = () => {
    setCallState(prev => ({
      ...prev,
      isScreenSharing: !prev.isScreenSharing
    }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'system':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
        <div className="animate-pulse">
          <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-4`}></div>
          <div className="space-y-3">
            <div className={`h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
            <div className={`h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-5/6`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerBg} p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Modern Chat Layout */}
        <div className={`${cardBg} rounded-2xl shadow-2xl border overflow-hidden`} style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="flex h-full">
            
            {/* Contacts Sidebar */}
            <div className={`w-80 min-w-80 max-w-96 border-r ${borderColor} flex flex-col`}>
              {/* Header */}
              <div className={`p-4 border-b ${borderColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${textPrimary} flex-shrink-0`}>Messages</h2>
                  <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                    {/* Call Feature - Available for teachers and admins */}
                    {(userRole === 'teacher' || userRole === 'admin') && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (contacts.length > 0) {
                              initiateCall(contacts[0].id, 'audio');
                            } else {
                              alert('No contacts available for calling');
                            }
                          }}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          title="Quick Voice Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (contacts.length > 0) {
                              initiateCall(contacts[0].id, 'video');
                            } else {
                              alert('No contacts available for calling');
                            }
                          }}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                          title="Quick Video Call"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => setComposing(true)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        title="New Message"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      
                      {/* Share and Upload buttons - Available for all users */}
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                        title="Share Content"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowUploadModal(true)}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                        title="Upload File"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      
                      {/* Group Creation Button */}
                      <button 
                        onClick={() => setShowCreateGroup(true)}
                        className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                        title="Create Group"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      
                      {userRole === 'student' && (
                        <button
                          onClick={() => {
                            setShowCreateGroup(true);
                            fetchAvailableMembers();
                          }}
                          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                          title="Create Group"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      {(userRole === 'admin' || userRole === 'teacher') && (
                        <button
                          onClick={broadcastMessage}
                          className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                          title="Broadcast Message"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className={`flex border-b ${borderColor} overflow-x-auto scrollbar-hide`}>
                <button
                  onClick={() => setActiveView('chat')}
                  className={`flex-shrink-0 py-4 px-4 text-sm font-medium transition-colors min-w-0 ${
                    activeView === 'chat'
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : `${textSecondary} hover:${textPrimary} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 whitespace-nowrap">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span>Chats</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveView('notifications')}
                  className={`flex-shrink-0 py-4 px-4 text-sm font-medium transition-colors min-w-0 ${
                    activeView === 'notifications'
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : `${textSecondary} hover:${textPrimary} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                
                </button>
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <button
                    onClick={() => setActiveView('ai-assistant')}
                    className={`flex-shrink-0 py-4 px-4 text-sm font-medium transition-colors min-w-0 ${
                      activeView === 'ai-assistant'
                        ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : `${textSecondary} hover:${textPrimary} hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2 whitespace-nowrap">
                      <Bot className="w-4 h-4 flex-shrink-0" />
                      <span>AI Assistant</span>
                      <Sparkles className="w-3 h-3 flex-shrink-0 text-purple-500" />
                    </div>
                  </button>
                )}
                <button
                  onClick={() => setActiveView('inbox')}
                  className={`flex-shrink-0 py-4 px-4 text-sm font-medium transition-colors min-w-0 ${
                    activeView === 'inbox'
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : `${textSecondary} hover:${textPrimary} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                
                </button>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto">
                {activeView === 'chat' ? (
                  <div className="space-y-2 p-3">
                    {contacts
                      .filter(contact => 
                        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contact.role.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          setChatMessages([]);
                        }}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedContact?.id === contact.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm'
                            : `${hoverBg} hover:shadow-sm`
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                            />
                            {contact.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold ${textPrimary} truncate`}>{contact.name}</h4>
                              {contact.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2 font-medium">
                                  {contact.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${textSecondary} capitalize mb-1`}>
                              {contact.role} {contact.subject && `• ${contact.subject}`}
                            </p>
                            <p className={`text-xs ${textMuted}`}>{contact.lastSeen}</p>
                          </div>
                          {/* Quick call buttons for teachers and admins */}
                          {(userRole === 'teacher' || userRole === 'admin') && (
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateCall(contact.id, 'audio');
                                }}
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors shadow-sm"
                                title="Voice Call"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateCall(contact.id, 'video');
                                }}
                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-sm"
                                title="Video Call"
                              >
                                <Video className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeView === 'ai-assistant' ? (
                  <div className="flex flex-col h-full">
                    {/* AI Assistant Header */}
                    <div className={`p-4 border-b ${borderColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full p-2">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${textPrimary}`}>AI Assistant</h3>
                            <p className={`text-sm ${textSecondary}`}>Your intelligent school management helper</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={clearAiChat}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Clear Chat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <Circle className="w-2 h-2 fill-current" />
                            <span>Online</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {aiChatMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                            <Bot className="w-8 h-8 text-purple-600" />
                          </div>
                          <h4 className={`text-lg font-semibold ${textPrimary} mb-2`}>Welcome to AI Assistant!</h4>
                          <p className={`${textSecondary} mb-4`}>
                            I'm here to help you with school management tasks, student queries, and administrative functions.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className={`p-3 rounded-lg ${cardBg} border ${borderColor}`}>
                              <strong className={textPrimary}>For Admins:</strong>
                              <p className={textSecondary}>Student management, attendance tracking, reports, staff management</p>
                            </div>
                            <div className={`p-3 rounded-lg ${cardBg} border ${borderColor}`}>
                              <strong className={textPrimary}>For Teachers:</strong>
                              <p className={textSecondary}>Class management, assignments, grading, student communication</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        aiChatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                message.sender === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : message.type === 'error'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                {message.sender === 'ai' && (
                                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full p-1 flex-shrink-0">
                                    <Bot className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm">{message.content}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {/* AI Typing Indicator */}
                      {aiTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 border border-gray-200 rounded-2xl px-4 py-3 max-w-xs">
                            <div className="flex items-center space-x-2">
                              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full p-1">
                                <Bot className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={aiMessagesEndRef} />
                    </div>

                    {/* AI Chat Input */}
                    <div className={`p-4 border-t ${borderColor}`}>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={aiMessage}
                            onChange={(e) => setAiMessage(e.target.value)}
                            onKeyPress={handleAiKeyPress}
                            placeholder="Ask me anything about school management..."
                            disabled={aiLoading}
                            className={`w-full px-4 py-3 pr-12 rounded-xl border ${borderColor} ${cardBg} ${textPrimary} focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
                          />
                          <button
                            onClick={sendAiMessage}
                            disabled={!aiMessage.trim() || aiLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {aiLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs ${textMuted} mt-2 text-center`}>
                        AI Assistant can help with student management, attendance, reports, and more
                      </p>
                    </div>
                  </div>
                ) : activeView === 'notifications' ? (
                  <div className="space-y-1 p-2">
                    {/* Notification Stats */}
                    <div className={`p-3 rounded-lg ${cardBg} border ${borderColor} mb-3`}>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          <p className={`text-xs ${textSecondary}`}>Total</p>
                          <p className={`text-lg font-bold ${textPrimary}`}>{notifications.length}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          <p className={`text-xs ${textSecondary}`}>Unread</p>
                          <p className={`text-lg font-bold ${textPrimary}`}>{notificationUnreadCount}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          <p className={`text-xs ${textSecondary}`}>Read</p>
                          <p className={`text-lg font-bold ${textPrimary}`}>{notifications.length - notificationUnreadCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-2 space-y-2">
                      {/* Send Notification Button - Hidden for students */}
                      {userRole !== 'student' && (
                        <button
                          onClick={() => setShowSendNotification(true)}
                          className={`w-full p-3 rounded-lg border-2 border-dashed ${borderColor} ${hoverBg} transition-colors`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Bell className="w-4 h-4" />
                            <span className={`text-sm ${textSecondary}`}>Send Notification</span>
                          </div>
                        </button>
                      )}
                      
                      {/* Share and Upload buttons - Available for all users */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowShareModal(true)}
                          className={`p-3 rounded-lg border-2 border-dashed ${borderColor} ${hoverBg} transition-colors`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <Share2 className="w-4 h-4" />
                            <span className={`text-xs ${textSecondary}`}>Share</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className={`p-3 rounded-lg border-2 border-dashed ${borderColor} ${hoverBg} transition-colors`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <Upload className="w-4 h-4" />
                            <span className={`text-xs ${textSecondary}`}>Upload</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-1">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => !notification.read_at && markNotificationAsRead(notification.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            notification.read_at 
                              ? `${cardBg} border ${borderColor}` 
                              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium ${textPrimary} truncate`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                    {notification.priority}
                                  </span>
                                  {notification.read_at ? (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 text-blue-600" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-sm ${textSecondary} mb-1 line-clamp-2`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 space-x-2">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </span>
                                <span className="capitalize">
                                  {notification.type} • {notification.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className={`text-center ${textMuted}`}>Inbox view - Legacy messages</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedContact ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={selectedContact.avatar}
                          alt={selectedContact.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        {selectedContact.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${textPrimary} text-lg`}>{selectedContact.name}</h3>
                        <p className={`text-sm ${textSecondary} flex items-center`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${selectedContact.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {selectedContact.online ? 'Online' : selectedContact.lastSeen}
                          {isTyping[selectedContact.id] && (
                            <span className="text-blue-600 ml-2 font-medium">typing...</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Call buttons - Enhanced for teachers and admins */}
                      {(userRole === 'teacher' || userRole === 'admin') && (
                        <>
                          <button 
                            onClick={() => initiateCall(selectedContact.id, 'audio')}
                            className="p-3 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors shadow-sm"
                            title="Voice Call"
                          >
                            <Phone className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => initiateCall(selectedContact.id, 'video')}
                            className="p-3 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-sm"
                            title="Video Call"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button className={`p-3 rounded-xl ${hoverBg} ${textSecondary} hover:${textPrimary} transition-colors`}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${message.is_own ? 'order-2' : 'order-1'}`}>
                          {!message.is_own && (
                            <div className="flex items-center space-x-2 mb-1">
                              <img
                                src={selectedContact.avatar}
                                alt={selectedContact.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className={`text-xs ${textMuted}`}>{message.sender_name}</span>
                            </div>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg shadow-sm relative ${
                              message.is_own
                                ? 'bg-[#DCF8C6] text-gray-900 rounded-br-sm'
                                : darkMode
                                ? 'bg-[#262D31] text-gray-100 rounded-bl-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                            }`}
                            style={{
                              maxWidth: '75%',
                              wordWrap: 'break-word',
                              position: 'relative'
                            }}
                          >
                            {/* WhatsApp-style tail */}
                            {message.is_own ? (
                              <div className="absolute -right-2 bottom-0 w-0 h-0 border-l-[8px] border-l-[#DCF8C6] border-t-[8px] border-t-transparent"></div>
                            ) : (
                              <div className={`absolute -left-2 bottom-0 w-0 h-0 border-r-[8px] ${darkMode ? 'border-r-[#262D31]' : 'border-r-white'} border-t-[8px] border-t-transparent`}></div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${message.is_own ? 'text-gray-600' : 'text-gray-400'}`}>
                              <span className="text-[11px]">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {message.is_own && (
                                <div className="ml-1 flex items-center">
                                  {message.read_status === 'sent' && (
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 16 15">
                                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.175a.366.366 0 0 0-.063-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.175a.365.365 0 0 0-.063-.512z"/>
                                    </svg>
                                  )}
                                  {message.read_status === 'delivered' && (
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 16 15">
                                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.175a.366.366 0 0 0-.063-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.175a.365.365 0 0 0-.063-.512z"/>
                                    </svg>
                                  )}
                                  {message.read_status === 'read' && (
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 16 15">
                                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.175a.366.366 0 0 0-.063-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.175a.365.365 0 0 0-.063-.512z"/>
                                    </svg>
                                  )}
                                  {message.read_status === 'failed' && (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className={`p-4 border-t ${borderColor}`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button className={`p-2 rounded-lg ${hoverBg} ${textSecondary} hover:${textPrimary} transition-colors`}>
                          <Paperclip className="w-5 h-5" />
                        </button>
                        
                        {/* Share and Upload buttons - Available for all users */}
                        <button 
                          onClick={() => setShowShareModal(true)}
                          className={`p-2 rounded-lg ${hoverBg} ${textSecondary} hover:${textPrimary} transition-colors`}
                          title="Share Content"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className={`p-2 rounded-lg ${hoverBg} ${textSecondary} hover:${textPrimary} transition-colors`}
                          title="Upload File"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1 relative">
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-600 px-3 py-2.5 shadow-sm">
                          <button className={`p-1.5 rounded-full ${hoverBg} ${textSecondary} hover:${textPrimary} transition-colors mr-2`}>
                            <Smile className="w-5 h-5" />
                          </button>
                          <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                          />
                          <button className={`p-1.5 rounded-full ${hoverBg} ${textSecondary} hover:${textPrimary} transition-colors mr-2`}>
                            <Paperclip className="w-5 h-5" />
                          </button>
                          {newMessage.trim() ? (
                            <button
                              onClick={sendMessage}
                              className="p-2 rounded-full bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors shadow-md"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          ) : (
                            <button className={`p-2 rounded-full ${hoverBg} ${textSecondary} hover:${textPrimary} transition-colors`}>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${textMuted}`} />
                    <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>Select a conversation</h3>
                    <p className={`${textSecondary}`}>Choose a contact to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>Create Group Chat</h4>
              <button
                onClick={() => setShowCreateGroup(false)}
                className={`${textMuted} hover:${textPrimary}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={groupData.description}
                  onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter group description (optional)"
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Select Members *
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {availableMembers.map((member) => (
                    <label key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupData.members.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupData(prev => ({ ...prev, members: [...prev.members, member.id] }));
                          } else {
                            setGroupData(prev => ({ ...prev, members: prev.members.filter(id => id !== member.id) }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className={`text-sm ${textPrimary}`}>{member.name}</span>
                      <span className={`text-xs ${textSecondary}`}>({member.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group Monitoring (Confidential) - Hidden for students */}
              {userRole !== 'student' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h5 className={`font-medium text-red-900`}>Group Monitoring (Confidential)</h5>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={groupData.isMonitored}
                        onChange={(e) => setGroupData(prev => ({ ...prev, isMonitored: e.target.checked }))}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className={`text-sm text-red-800`}>Enable confidential group monitoring</span>
                    </label>
                    {groupData.isMonitored && (
                      <div>
                        <label className={`block text-sm font-medium text-red-800 mb-1`}>
                          Monitor Role
                        </label>
                        <select
                          value={groupData.monitorRole}
                          onChange={(e) => setGroupData(prev => ({ ...prev, monitorRole: e.target.value }))}
                          className={`w-full px-3 py-2 border border-red-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                        >
                          <option value="teacher">Teacher</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded p-2 mt-2">
                    <p className={`text-xs text-red-800`}>
                      <Eye className="w-3 h-3 inline mr-1" />
                      <strong>CONFIDENTIAL:</strong> Monitored groups allow designated staff to view messages for safety and educational purposes. All monitoring activities are logged and confidential.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showSendNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>Send Notification</h4>
              <button
                onClick={() => setShowSendNotification(false)}
                className={`${textMuted} hover:${textPrimary}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Notification Type
                  </label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="system">System Notification</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Priority
                  </label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Recipient ({notificationForm.type === 'sms' ? 'Phone Number' : 'Email/User ID'})
                </label>
                <input
                  type="text"
                  value={notificationForm.recipient}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder={
                    notificationForm.type === 'sms' ? '+256700000000' :
                    notificationForm.type === 'email' ? 'user@school.com' :
                    'User ID for system notification'
                  }
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {(notificationForm.type === 'email' || notificationForm.type === 'system') && (
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Subject/Title
                  </label>
                  <input
                    type="text"
                    value={notificationForm.subject}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject or title"
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Message
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your message here..."
                  rows={4}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSendNotification(false)}
                className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                disabled={sendingNotification}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sendingNotification
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sendingNotification ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Content Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>Share Content</h4>
              <button
                onClick={() => setShowShareModal(false)}
                className={`${textMuted} hover:${textPrimary}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Content Type
                </label>
                <select
                  value={shareData.type}
                  onChange={(e) => setShareData(prev => ({ ...prev, type: e.target.value }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="message">Message</option>
                  <option value="announcement">Announcement</option>
                  <option value="resource">Resource</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Content to Share
                </label>
                <textarea
                  value={shareData.content}
                  onChange={(e) => setShareData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter content to share..."
                  rows={4}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Recipients
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {contacts.map((contact) => (
                    <label key={contact.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareData.recipients.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShareData(prev => ({ ...prev, recipients: [...prev.recipients, contact.id] }));
                          } else {
                            setShareData(prev => ({ ...prev, recipients: prev.recipients.filter(id => id !== contact.id) }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <img src={contact.avatar} alt={contact.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className={`text-sm ${textPrimary}`}>{contact.name}</span>
                      <span className={`text-xs ${textSecondary}`}>({contact.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={shareData.isPublic}
                  onChange={(e) => setShareData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="mr-2"
                />
                <label className={`text-sm ${textSecondary}`}>
                  Make this content public (visible to all users)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Share Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>Upload & Share File</h4>
              <button
                onClick={() => setShowUploadModal(false)}
                className={`${textMuted} hover:${textPrimary}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
                />
                <p className={`text-xs ${textMuted} mt-1`}>
                  Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, MP4, MP3
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter file description..."
                  rows={3}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Recipients
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {contacts.map((contact) => (
                    <label key={contact.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadData.recipients.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUploadData(prev => ({ ...prev, recipients: [...prev.recipients, contact.id] }));
                          } else {
                            setUploadData(prev => ({ ...prev, recipients: prev.recipients.filter(id => id !== contact.id) }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <img src={contact.avatar} alt={contact.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className={`text-sm ${textPrimary}`}>{contact.name}</span>
                      <span className={`text-xs ${textSecondary}`}>({contact.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={uploadData.isPublic}
                  onChange={(e) => setUploadData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="mr-2"
                />
                <label className={`text-sm ${textSecondary}`}>
                  Make this file public (visible to all users)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Upload & Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>Create Group</h4>
              <button
                onClick={() => setShowCreateGroup(false)}
                className={`${textMuted} hover:${textPrimary}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name..."
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Description
                </label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter group description..."
                  rows={3}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Add Members
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {availableMembers.map((member) => (
                    <label key={member.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupData.members.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupData(prev => ({ ...prev, members: [...prev.members, member.id] }));
                          } else {
                            setGroupData(prev => ({ ...prev, members: prev.members.filter(id => id !== member.id) }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className={`text-sm ${textPrimary}`}>{member.name} ({member.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              {(userRole === 'teacher' || userRole === 'admin') && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groupData.isMonitored}
                      onChange={(e) => setGroupData(prev => ({ ...prev, isMonitored: e.target.checked }))}
                      className="mr-2"
                    />
                    <label className={`text-sm ${textSecondary}`}>
                      Enable group monitoring
                    </label>
                  </div>
                  
                  {groupData.isMonitored && (
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                        Monitor Role
                      </label>
                      <select
                        value={groupData.monitorRole}
                        onChange={(e) => setGroupData(prev => ({ ...prev, monitorRole: e.target.value }))}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {composing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 border`}>
            <h4 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Compose Message</h4>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Recipient
                </label>
                <select
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select recipient...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Message
                </label>
                <textarea
                  rows={6}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Type your message here..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setComposing(false)}
                className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mb-4">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  callState.callType === 'video' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {callState.callType === 'video' ? (
                    <Video className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Phone className="w-8 h-8 text-green-600" />
                  )}
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {callState.callType === 'video' ? 'Video Call' : 'Voice Call'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Calling {selectedContact?.name || 'Unknown Contact'}
              </p>

              {/* Call Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full ${
                    callState.isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                </button>
                
                {callState.callType === 'video' && (
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full ${
                      callState.isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full ${
                    callState.isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-500 text-white"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-sm w-full rounded-lg shadow-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="mb-4">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  incomingCall.callType === 'video' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {incomingCall.callType === 'video' ? (
                    <Video className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Phone className="w-8 h-8 text-green-600" />
                  )}
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                {incomingCall.callerName} is calling you
              </p>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => answerCall(incomingCall.callId)}
                  className="p-3 rounded-full bg-green-500 text-white"
                >
                  <Phone className="w-5 h-5" />
                </button>
                
                <button
                  onClick={rejectCall}
                  className="p-3 rounded-full bg-red-500 text-white"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPanel;