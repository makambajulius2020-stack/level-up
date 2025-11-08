import React, { useState, useRef } from 'react';
import { Brain, Send, X, BookOpen, Calculator, Microscope, Globe, History, Palette, Music, MessageSquare, User, Clock, Star, Video, Mic, Volume2, Play, Pause, StopCircle, Upload } from 'lucide-react';
import apiService from '../services/api';

const AITutorForm = ({ userRole, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  
  // Audio and Video features
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const subjects = [
    { id: 'math', name: 'Mathematics', icon: Calculator, color: 'blue' },
    { id: 'cs', name: 'Computer Science', icon: Brain, color: 'green' },
    { id: 'engineering', name: 'Engineering', icon: Microscope, color: 'purple' },
    { id: 'business', name: 'Business Administration', icon: BookOpen, color: 'orange' },
    { id: 'economics', name: 'Economics', icon: Globe, color: 'teal' },
    { id: 'psychology', name: 'Psychology', icon: Brain, color: 'pink' },
    { id: 'literature', name: 'Literature', icon: BookOpen, color: 'indigo' }
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some knowledge' },
    { value: 'advanced', label: 'Advanced', description: 'Strong foundation' }
  ];

  const studyGoals = [
    { value: 'assignment', label: 'Assignment Help', description: 'Get help with coursework and assignments' },
    { value: 'exam-prep', label: 'Exam Preparation', description: 'Prepare for upcoming tests and exams' },
    { value: 'concept-explanation', label: 'Concept Explanation', description: 'Understand difficult topics and theories' },
    { value: 'practice-problems', label: 'Practice Problems', description: 'Work through exercises' },
    { value: 'study-strategy', label: 'Study Strategy', description: 'Improve study methods' },
    { value: 'video-lesson', label: 'Video Lesson', description: 'Watch interactive video explanations' },
    { value: 'audio-explanation', label: 'Audio Explanation', description: 'Listen to detailed audio guides' }
  ];

  // Video lessons will be loaded from API
  const videoLessons = [];

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageText = currentMessage;
    setCurrentMessage('');

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true
    };
    setChatMessages(prev => [...prev, loadingMessage]);

    try {
      // Check if it's a conversational message first
      const lowerMessage = messageText.toLowerCase();
      const isConversational = lowerMessage.includes('hello') || 
                              lowerMessage.includes('hi') || 
                              lowerMessage.includes('how are you') || 
                              lowerMessage.includes('thank') ||
                              lowerMessage.includes('bye') ||
                              lowerMessage.includes('goodbye');

      if (isConversational) {
        // Handle conversational messages
        const conversationalResponse = getConversationalResponse(messageText, userRole);
        setChatMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isLoading);
          const aiMessage = {
            id: Date.now() + 2,
            type: 'ai',
            content: conversationalResponse,
            timestamp: new Date(),
            isLoading: false
          };
          return [...withoutLoading, aiMessage];
        });
        return;
      }

      // Determine the appropriate API call based on user role and message content
      let apiResponse;
      
      if (userRole === 'student') {
        // For students, generate a language lesson based on their question
        const lessonData = {
          language: 'English',
          level: 'intermediate',
          topic: extractTopicFromMessage(messageText),
          lessonType: 'general',
          studentId: 1
        };
        apiResponse = await apiService.generateLanguageLesson(lessonData);
      } else if (userRole === 'teacher') {
        // For teachers, generate assignment scaffold
        const scaffoldData = {
          assignment: messageText,
          yearLevel: 'Year 1',
          subject: extractSubjectFromMessage(messageText)
        };
        apiResponse = await apiService.generateAssignmentScaffold(scaffoldData);
      } else {
        // Generate career assessment
        const careerData = {
          interests: [extractTopicFromMessage(messageText)],
          subjects: ['Mathematics', 'English'],
          skills: ['Problem solving', 'Communication'],
          yearLevel: 'Year 1',
          studentId: 1
        };
        apiResponse = await apiService.generateCareerAssessment(careerData);
      }

      // Remove loading message and add real response
      setChatMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const aiMessage = {
          id: Date.now() + 2,
          type: 'ai',
          content: formatAIResponse(apiResponse, userRole),
          timestamp: new Date(),
          isLoading: false
        };
        return [...withoutLoading, aiMessage];
      });

    } catch (error) {
      console.error('AI API Error:', error);
      
      // Remove loading message and add error response
      setChatMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const errorMessage = {
          id: Date.now() + 2,
          type: 'ai',
          content: 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again later.',
          timestamp: new Date(),
          isLoading: false
        };
        return [...withoutLoading, errorMessage];
      });
    }
  };

  // Helper function for conversational responses
  const getConversationalResponse = (message, role) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      const greetings = {
        student: "Hello! 👋 I'm your AI tutor. I'm here to help you learn and understand new concepts. What subject would you like to explore today?",
        teacher: "Hello! 👋 I'm your AI teaching assistant. I can help you create lesson plans, assignments, and teaching materials. What would you like to work on?"
      };
      return greetings[role] || greetings.student;
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing great! 😊 I'm excited to help you with your studies. I have access to lots of educational content and can create personalized lessons, assignments, and assessments. What would you like to learn about?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're very welcome! 😊 I'm happy to help. Feel free to ask me anything else about your studies or if you need help with any subject.";
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! 👋 It was great helping you today. Come back anytime you need assistance with your studies. Have a wonderful day!";
    }
    
    // Default conversational response
    return "I'm here to help you learn! 😊 You can ask me about any subject, request lesson plans, or get help with assignments. What would you like to explore?";
  };

  // Helper functions
  const extractTopicFromMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('math') || lowerMessage.includes('algebra') || lowerMessage.includes('calculus')) return 'mathematics';
    if (lowerMessage.includes('science') || lowerMessage.includes('biology') || lowerMessage.includes('chemistry')) return 'science';
    if (lowerMessage.includes('english') || lowerMessage.includes('literature') || lowerMessage.includes('writing')) return 'english';
    if (lowerMessage.includes('history') || lowerMessage.includes('social studies')) return 'history';
    if (lowerMessage.includes('art') || lowerMessage.includes('drawing') || lowerMessage.includes('painting')) return 'art';
    if (lowerMessage.includes('music') || lowerMessage.includes('singing') || lowerMessage.includes('instrument')) return 'music';
    return 'general studies';
  };


  const formatAIResponse = (apiResponse, userRole) => {
    if (!apiResponse || !apiResponse.data) {
      return 'I apologize, but I couldn\'t generate a proper response. Please try again.';
    }

    const data = apiResponse.data;
    
    if (userRole === 'student' && data.title) {
      return `📚 ${data.title}\n\n🎯 Learning Objectives:\n${data.objectives?.map(obj => `• ${obj}`).join('\n') || '• Understanding key concepts'}\n\n⏰ Duration: ${data.duration}\n\n🎯 Activities:\n${data.activities?.map(activity => `• ${activity.title} (${activity.duration})`).join('\n') || '• Interactive learning activities'}`;
    }
    
    if (userRole === 'teacher' && data.steps) {
      return `📝 Assignment Scaffold: ${data.assignment}\n\n📋 Steps:\n${data.steps.map(step => `${step.step}. ${step.title} - ${step.description} (${step.timeEstimate})`).join('\n')}\n\n⏰ Total Time: ${data.totalTime}`;
    }
    
    
    return 'I\'ve generated some helpful content for you. Please check the details above.';
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // In a real app, upload this to a server for transcription
        alert('Audio recorded! Processing...');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playAudio = (url) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const playVideo = (url) => {
    setVideoUrl(url);
    setIsPlayingVideo(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlayingVideo(false);
    setVideoUrl(null);
  };

  const handleQuickStart = async (subject, difficulty, goal) => {
    setSelectedSubject(subject);
    setDifficultyLevel(difficulty);
    setStudyGoal(goal);
    setActiveTab('chat');
    
    // Add loading message
    const loadingMessage = {
      id: Date.now(),
      type: 'ai',
      content: 'Generating personalized content for you...',
      timestamp: new Date(),
      isLoading: true
    };
    setChatMessages([loadingMessage]);

    try {
      let apiResponse;
      
      if (userRole === 'student') {
        const lessonData = {
          language: 'English',
          level: difficulty.toLowerCase(),
          topic: subject.toLowerCase(),
          lessonType: goal.toLowerCase().replace(' ', '_'),
          studentId: 1
        };
        apiResponse = await apiService.generateLanguageLesson(lessonData);
      } else if (userRole === 'teacher') {
        const scaffoldData = {
          assignment: `${subject} - ${goal}`,
          yearLevel: 'Year 1',
          subject: subject
        };
        apiResponse = await apiService.generateAssignmentScaffold(scaffoldData);
      } else {
        const careerData = {
          interests: [subject.toLowerCase()],
          subjects: [subject],
          skills: ['Problem solving', 'Communication'],
          yearLevel: 'Year 1',
          studentId: 1
        };
        apiResponse = await apiService.generateCareerAssessment(careerData);
      }

      // Replace loading message with real response
      const welcomeMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: formatAIResponse(apiResponse, userRole),
        timestamp: new Date(),
        isLoading: false
      };
      setChatMessages([welcomeMessage]);

    } catch (error) {
      console.error('Quick Start API Error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Welcome! I'm your AI tutor. I see you want help with ${subject} at ${difficulty} level for ${goal}. However, I'm having trouble connecting to the AI service right now. Please try asking me a specific question.`,
        timestamp: new Date(),
        isLoading: false
      };
      setChatMessages([errorMessage]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-purple-600" />
              AI Tutor Assistant
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {userRole === 'student' && 'Get personalized help with video and audio features'}
            {userRole === 'teacher' && 'Enhance your teaching with AI assistance'}
          </p>
          
          {/* Interaction Mode Tabs */}
          <div className="flex space-x-2 mt-4 border-b border-gray-200">
            {[
              { id: 'chat', label: 'Text Chat', icon: MessageSquare },
              { id: 'audio', label: 'Audio', icon: Mic },
              { id: 'video', label: 'Video Lessons', icon: Video }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface - Full Width */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Content based on active tab */}
            {activeTab === 'chat' && (
              <>
                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 chat-scroll">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Start a conversation with your AI tutor</p>
                      <p className="text-sm text-gray-400">Type your question below or use the tabs above to switch between text, audio, and video modes</p>
                    </div>
                  ) : (
                    chatMessages.map(message => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {message.type === 'ai' && <Brain className="w-4 h-4 mt-0.5 text-purple-600" />}
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-line">{message.content}</p>
                              {message.audioUrl && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <button
                                    onClick={() => playAudio(message.audioUrl)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                    <span className="text-xs">Play Audio</span>
                                  </button>
                                </div>
                              )}
                              {message.videoUrl && (
                                <div className="mt-2">
                                  <video
                                    src={message.videoUrl}
                                    controls
                                    className="w-full rounded-lg max-w-md"
                                  />
                                </div>
                              )}
                              {message.isLoading && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                              )}
                              <p className={`text-xs mt-1 ${
                                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your studies..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'audio' && (
              <div className="flex-1 flex flex-col overflow-hidden h-full">
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center">
                      <Mic className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Audio Learning</h3>
                      <p className="text-gray-600">Record your question or request an audio explanation</p>
                    </div>

                    {/* Recording Controls */}
                    <div className="flex flex-col items-center space-y-4">
                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center space-x-3 shadow-lg transition-all"
                        >
                          <Mic className="w-6 h-6" />
                          <span className="font-semibold">Start Recording</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-red-600 font-semibold">Recording...</span>
                          </div>
                          <button
                            onClick={stopRecording}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-all"
                          >
                            <StopCircle className="w-5 h-5" />
                            <span>Stop</span>
                          </button>
                        </div>
                      )}

                      {audioUrl && (
                        <div className="w-full mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-3">Your Recording:</p>
                          <audio ref={audioRef} src={audioUrl} controls className="w-full mb-3" />
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => playAudio(audioUrl)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-all"
                            >
                              <Play className="w-4 h-4" />
                              <span>Play</span>
                            </button>
                            <button
                              onClick={stopAudio}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-all"
                            >
                              <Pause className="w-4 h-4" />
                              <span>Stop</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Request Audio Explanation */}
                      <div className="w-full mt-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Request Audio Explanation</h4>
                        <input
                          type="text"
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          placeholder="What topic would you like explained?"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => {
                            // In a real app, this would generate audio explanation
                            alert('Requesting audio explanation... This feature will generate an AI voice response.');
                          }}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2 transition-all"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Get Audio Explanation</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="flex-1 p-6 overflow-y-auto min-h-0 h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Lessons</h3>
                  <p className="text-gray-600">Interactive video explanations for your courses</p>
                </div>

                {/* Video Player */}
                {isPlayingVideo && videoUrl && (
                  <div className="mb-6 bg-black rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">Now Playing</h4>
                      <button
                        onClick={stopVideo}
                        className="text-white hover:text-gray-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Video Lessons List */}
                {videoLessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No video lessons available yet. Request a custom video lesson below.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoLessons.map(lesson => (
                      <div key={lesson.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={lesson.thumbnail}
                            alt={lesson.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            {lesson.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                              {lesson.subject}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{lesson.title}</h4>
                          <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>
                          <button
                            onClick={() => {
                              // In a real app, this would load the video
                              setVideoUrl(`https://example.com/videos/${lesson.id}`);
                              setIsPlayingVideo(true);
                            }}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Watch Lesson</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Request Video Lesson */}
                <div className="mt-6 p-6 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Request Custom Video Lesson</h4>
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="What topic would you like a video lesson about?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => {
                      alert('Requesting custom video lesson... This feature will generate an AI video explanation.');
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Generate Video Lesson</span>
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AITutorForm;
