import React, { useState, useEffect } from 'react';
import { 
  Bell, Clock, Calendar, BookOpen, Users, AlertTriangle, 
  CheckCircle, Mail, Smartphone, Settings, Eye, EyeOff,
  Video, MessageSquare, FileText, Award, GraduationCap
} from 'lucide-react';

const NotificationService = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    email: true,
    sms: true,
    push: true,
    onlineLessons: {
      beforeStart: 10, // minutes
      afterStart: 5,   // minutes
    },
    assignments: {
      dueSoon: 24,     // hours
      overdue: true,
    },
    events: {
      upcoming: 24,    // hours
      reminders: true,
    },
    tasks: {
      dueSoon: 12,     // hours
      overdue: true,
    }
  });

  // Notification types
  const notificationTypes = {
    ONLINE_LESSON: 'online_lesson',
    ASSIGNMENT: 'assignment',
    EVENT: 'event',
    TASK: 'task',
    SCHEDULE: 'schedule',
    FEE_REMINDER: 'fee_reminder',
    EXAM: 'exam',
    MEETING: 'meeting'
  };

  // Notification channels
  const channels = {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    SYSTEM: 'system'
  };

  // Mock notification data
  const mockNotifications = [
    {
      id: 1,
      type: notificationTypes.ONLINE_LESSON,
      title: 'Mathematics Class Starting Soon',
      message: 'Your online Mathematics class starts in 10 minutes. Join now!',
      timestamp: new Date(),
      channel: channels.PUSH,
      priority: 'high',
      userId: 1,
      userRole: 'student',
      relatedId: 'lesson_123',
      actionUrl: '/online-class',
      read: false
    },
    {
      id: 2,
      type: notificationTypes.ASSIGNMENT,
      title: 'Assignment Due Tomorrow',
      message: 'English Essay assignment is due tomorrow at 11:59 PM',
      timestamp: new Date(Date.now() - 3600000),
      channel: channels.EMAIL,
      priority: 'medium',
      userId: 1,
      userRole: 'student',
      relatedId: 'assignment_456',
      actionUrl: '/assignments',
      read: false
    },
    {
      id: 3,
      type: notificationTypes.EVENT,
      title: 'Parent-Teacher Meeting',
      message: 'Parent-Teacher meeting scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 7200000),
      channel: channels.SMS,
      priority: 'high',
      userId: 2,
      userRole: 'parent',
      relatedId: 'meeting_789',
      actionUrl: '/parent-meetings',
      read: true
    },
    {
      id: 4,
      type: notificationTypes.FEE_REMINDER,
      title: 'Fee Payment Reminder',
      message: 'School fees payment is due in 3 days. Amount: UGX 500,000',
      timestamp: new Date(Date.now() - 10800000),
      channel: channels.EMAIL,
      priority: 'medium',
      userId: 2,
      userRole: 'parent',
      relatedId: 'fee_101',
      actionUrl: '/fee-balance',
      read: false
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  // Schedule notification for online lessons
  const scheduleOnlineLessonNotification = (lessonData) => {
    const { startTime, duration, subject, teacher, studentId, parentId } = lessonData;
    const startDate = new Date(startTime);
    
    // 10 minutes before start
    const beforeStartTime = new Date(startDate.getTime() - (settings.onlineLessons.beforeStart * 60 * 1000));
    
    // 5 minutes after start
    const afterStartTime = new Date(startDate.getTime() + (settings.onlineLessons.afterStart * 60 * 1000));

    // Schedule notifications
    scheduleNotification({
      type: notificationTypes.ONLINE_LESSON,
      title: `${subject} Class Starting Soon`,
      message: `Your online ${subject} class with ${teacher} starts in ${settings.onlineLessons.beforeStart} minutes. Join now!`,
      scheduledTime: beforeStartTime,
      userId: studentId,
      userRole: 'student',
      channels: [channels.PUSH, channels.EMAIL],
      priority: 'high',
      relatedId: lessonData.id,
      actionUrl: '/online-class'
    });

    // Also notify parent
    scheduleNotification({
      type: notificationTypes.ONLINE_LESSON,
      title: `${subject} Class Started`,
      message: `Your child's ${subject} class with ${teacher} has started ${settings.onlineLessons.afterStart} minutes ago.`,
      scheduledTime: afterStartTime,
      userId: parentId,
      userRole: 'parent',
      channels: [channels.EMAIL, channels.SMS],
      priority: 'medium',
      relatedId: lessonData.id,
      actionUrl: '/online-class'
    });
  };

  // Schedule notification for assignments
  const scheduleAssignmentNotification = (assignmentData) => {
    const { dueDate, title, subject, studentId, parentId } = assignmentData;
    const dueDateTime = new Date(dueDate);
    
    // Due soon notification
    const dueSoonTime = new Date(dueDateTime.getTime() - (settings.assignments.dueSoon * 60 * 60 * 1000));

    scheduleNotification({
      type: notificationTypes.ASSIGNMENT,
      title: 'Assignment Due Soon',
      message: `${title} for ${subject} is due in ${settings.assignments.dueSoon} hours.`,
      scheduledTime: dueSoonTime,
      userId: studentId,
      userRole: 'student',
      channels: [channels.PUSH, channels.EMAIL],
      priority: 'medium',
      relatedId: assignmentData.id,
      actionUrl: '/assignments'
    });

    // Notify parent
    scheduleNotification({
      type: notificationTypes.ASSIGNMENT,
      title: 'Child Assignment Due Soon',
      message: `Your child has an assignment "${title}" for ${subject} due soon.`,
      scheduledTime: dueSoonTime,
      userId: parentId,
      userRole: 'parent',
      channels: [channels.EMAIL],
      priority: 'low',
      relatedId: assignmentData.id,
      actionUrl: '/assignments'
    });
  };

  // Schedule notification for events
  const scheduleEventNotification = (eventData) => {
    const { startTime, title, description, userIds, userRoles } = eventData;
    const eventStartTime = new Date(startTime);
    
    // Upcoming event notification
    const upcomingTime = new Date(eventStartTime.getTime() - (settings.events.upcoming * 60 * 60 * 1000));

    userIds.forEach((userId, index) => {
      scheduleNotification({
        type: notificationTypes.EVENT,
        title: 'Upcoming Event',
        message: `${title} is starting in ${settings.events.upcoming} hours.`,
        scheduledTime: upcomingTime,
        userId: userId,
        userRole: userRoles[index],
        channels: [channels.PUSH, channels.EMAIL, channels.SMS],
        priority: 'medium',
        relatedId: eventData.id,
        actionUrl: '/events'
      });
    });
  };

  // Schedule notification for tasks
  const scheduleTaskNotification = (taskData) => {
    const { dueDate, title, assignedTo, assignedRole } = taskData;
    const dueDateTime = new Date(dueDate);
    
    // Due soon notification
    const dueSoonTime = new Date(dueDateTime.getTime() - (settings.tasks.dueSoon * 60 * 60 * 1000));

    scheduleNotification({
      type: notificationTypes.TASK,
      title: 'Task Due Soon',
      message: `Task "${title}" is due in ${settings.tasks.dueSoon} hours.`,
      scheduledTime: dueSoonTime,
      userId: assignedTo,
      userRole: assignedRole,
      channels: [channels.PUSH, channels.EMAIL],
      priority: 'medium',
      relatedId: taskData.id,
      actionUrl: '/tasks'
    });
  };

  // Generic notification scheduler
  const scheduleNotification = (notificationData) => {
    const { scheduledTime, channels, ...notification } = notificationData;
    
    // In a real implementation, this would use a job scheduler like Bull or Agenda
    // For now, we'll simulate with setTimeout
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        channels.forEach(channel => {
          sendNotification({ ...notification, channel });
        });
      }, delay);
    }
  };

  // Send notification through specified channel
  const sendNotification = async (notification) => {
    try {
      switch (notification.channel) {
        case channels.EMAIL:
          await sendEmailNotification(notification);
          break;
        case channels.SMS:
          await sendSMSNotification(notification);
          break;
        case channels.PUSH:
          await sendPushNotification(notification);
          break;
        case channels.SYSTEM:
          await sendSystemNotification(notification);
          break;
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  // Email notification
  const sendEmailNotification = async (notification) => {
    // Mock email sending
    console.log('Sending email notification:', notification);
    // In real implementation, integrate with email service like SendGrid, AWS SES, etc.
  };

  // SMS notification
  const sendSMSNotification = async (notification) => {
    // Mock SMS sending
    console.log('Sending SMS notification:', notification);
    // In real implementation, integrate with SMS service like Twilio, AWS SNS, etc.
  };

  // Push notification
  const sendPushNotification = async (notification) => {
    // Mock push notification
    console.log('Sending push notification:', notification);
    // In real implementation, integrate with push service like Firebase Cloud Messaging
  };

  // System notification
  const sendSystemNotification = async (notification) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  // Update notification settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    notifications,
    settings,
    scheduleOnlineLessonNotification,
    scheduleAssignmentNotification,
    scheduleEventNotification,
    scheduleTaskNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    notificationTypes,
    channels
  };
};

export default NotificationService;
