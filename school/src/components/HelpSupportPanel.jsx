import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, BookOpen, Users, Clock, AlertCircle, CheckCircle, Send, Search, Filter, Star, HelpCircle, FileText, Video, Download } from 'lucide-react';

const HelpSupportPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
    contactMethod: 'email'
  });

  // Dark mode utility classes
  const containerBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const faqData = {
    general: [
      {
        question: "How do I reset my password?",
        answer: "Click on 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your email."
      },
      {
        question: "How do I update my profile information?",
        answer: "Go to 'My Profile' in the main menu, click 'Edit Profile', make your changes, and save."
      },
      {
        question: "How do I change my notification preferences?",
        answer: "Go to Settings > Notifications to customize your notification preferences for emails, SMS, and system notifications."
      }
    ],
    academic: [
      {
        question: "How do I view my assignments?",
        answer: "Go to 'My Assignments' or 'Exam Schedule' to view all your assignments and their due dates."
      },
      {
        question: "How do I submit an assignment?",
        answer: "Click on the assignment, upload your file, add any comments, and click 'Submit Assignment'."
      },
      {
        question: "How do I view my grades?",
        answer: "Go to 'My Performance' or 'Grades & Reports' to view your academic performance and grades."
      }
    ],
    technical: [
      {
        question: "The system is running slowly, what should I do?",
        answer: "Try refreshing your browser, clearing cache, or using a different browser. Contact IT support if the issue persists."
      },
      {
        question: "I can't upload files, what's wrong?",
        answer: "Check your file size (max 10MB), file format (PDF, DOC, DOCX, JPG, PNG), and internet connection."
      },
      {
        question: "How do I access the mobile app?",
        answer: "Download the Smart School app from your app store and log in with your school credentials."
      }
    ]
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call our support team",
      contact: "+256 700 000 000",
      availability: "Mon-Fri: 8AM-5PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email",
      contact: "support@smartschool.edu",
      availability: "24/7 Response"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with support",
      contact: "Available Now",
      availability: "Mon-Fri: 9AM-4PM"
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    alert('✅ Support request submitted successfully! We will get back to you within 24 hours.');
    setShowContactForm(false);
    setContactForm({
      subject: '',
      category: 'general',
      priority: 'medium',
      message: '',
      contactMethod: 'email'
    });
  };

  const filteredFAQs = Object.entries(faqData).reduce((acc, [category, faqs]) => {
    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className={`min-h-screen ${containerBg} p-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary} flex items-center`}>
                <HelpCircle className="w-8 h-8 mr-3 text-blue-600" />
                Help & Support
              </h1>
              <p className={`${textSecondary} mt-2`}>
                Get help with using Smart School platform
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
              <h3 className={`font-semibold ${textPrimary} mb-4`}>Support Options</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === 'faq' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
                      : `${hoverBg} ${textSecondary}`
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  FAQ
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === 'contact' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
                      : `${hoverBg} ${textSecondary}`
                  }`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Us
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === 'resources' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
                      : `${hoverBg} ${textSecondary}`
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Resources
                </button>
                <button
                  onClick={() => setActiveTab('tutorials')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === 'tutorials' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
                      : `${hoverBg} ${textSecondary}`
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Tutorials
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'faq' && (
              <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-semibold ${textPrimary}`}>Frequently Asked Questions</h2>
                  <div className="relative w-64">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(filteredFAQs).map(([category, faqs]) => (
                    <div key={category}>
                      <h3 className={`text-lg font-medium ${textPrimary} mb-4 capitalize`}>
                        {category} Questions
                      </h3>
                      <div className="space-y-3">
                        {faqs.map((faq, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                            <h4 className={`font-medium ${textPrimary} mb-2`}>{faq.question}</h4>
                            <p className={`text-sm ${textSecondary}`}>{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                {/* Contact Methods */}
                <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                  <h2 className={`text-xl font-semibold ${textPrimary} mb-6`}>Contact Methods</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contactMethods.map((method, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${borderColor} ${hoverBg} text-center`}>
                        <method.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                        <h3 className={`font-medium ${textPrimary} mb-2`}>{method.title}</h3>
                        <p className={`text-sm ${textSecondary} mb-2`}>{method.description}</p>
                        <p className={`text-sm font-medium ${textPrimary}`}>{method.contact}</p>
                        <p className={`text-xs ${textMuted}`}>{method.availability}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Form */}
                <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-semibold ${textPrimary}`}>Send Support Request</h2>
                    <button
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {showContactForm ? 'Cancel' : 'New Request'}
                    </button>
                  </div>

                  {showContactForm && (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                            Subject *
                          </label>
                          <input
                            type="text"
                            value={contactForm.subject}
                            onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Brief description of your issue"
                            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                            Category
                          </label>
                          <select
                            value={contactForm.category}
                            onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="general">General</option>
                            <option value="technical">Technical</option>
                            <option value="academic">Academic</option>
                            <option value="account">Account</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                            Priority
                          </label>
                          <select
                            value={contactForm.priority}
                            onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                            Preferred Contact Method
                          </label>
                          <select
                            value={contactForm.contactMethod}
                            onChange={(e) => setContactForm(prev => ({ ...prev, contactMethod: e.target.value }))}
                            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="chat">Live Chat</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                          Message *
                        </label>
                        <textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Please describe your issue in detail..."
                          rows={6}
                          className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          required
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Request
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${textPrimary} mb-6`}>Helpful Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>User Manual</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>Complete guide to using Smart School platform</p>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>Quick Start Guide</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>Get started quickly with essential features</p>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>Video Tutorials</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>Step-by-step video guides</p>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center">
                      <Video className="w-4 h-4 mr-1" />
                      Watch Videos
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>System Requirements</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>Technical specifications and requirements</p>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tutorials' && (
              <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${textPrimary} mb-6`}>Video Tutorials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-3 flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>Getting Started</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>Learn the basics of Smart School platform</p>
                    <button className="text-blue-600 hover:text-blue-800">Watch Now</button>
                  </div>
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-3 flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>Managing Assignments</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>How to view and submit assignments</p>
                    <button className="text-blue-600 hover:text-blue-800">Watch Now</button>
                  </div>
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-3 flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>Using Messages</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>Communication features and notifications</p>
                    <button className="text-blue-600 hover:text-blue-800">Watch Now</button>
                  </div>
                  <div className={`p-4 rounded-lg border ${borderColor} ${hoverBg}`}>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 mb-3 flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className={`font-medium ${textPrimary} mb-2`}>Mobile App</h3>
                    <p className={`text-sm ${textSecondary} mb-3`}>Using Smart School on mobile devices</p>
                    <button className="text-blue-600 hover:text-blue-800">Watch Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPanel;
