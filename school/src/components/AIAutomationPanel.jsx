import React, { useState } from 'react';
import { Mail, MessageSquare, Bot, Send, Users, Calendar, TrendingUp, Settings, Play, Pause, Edit, Trash2, Plus, BarChart3, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const AIAutomationPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('email');
  const [automations, setAutomations] = useState([]);

  const [templates, setTemplates] = useState([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    type: 'email',
    trigger: 'weekly',
    recipients: 'students',
    template: '',
    subject: '',
    content: ''
  });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    variables: [],
    description: '',
    category: 'general'
  });

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
  };

  const handleToggleStatus = (id) => {
    setAutomations(automations.map(auto => 
      auto.id === id 
        ? { ...auto, status: auto.status === 'active' ? 'paused' : 'active' }
        : auto
    ));
  };

  const handleDeleteAutomation = (id) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      setAutomations(automations.filter(auto => auto.id !== id));
    }
  };

  const handleCreateAutomation = () => {
    const automation = {
      id: Date.now(),
      ...newAutomation,
      status: 'draft',
      lastRun: null,
      nextRun: null,
      sent: 0,
      opened: 0,
      clicked: 0
    };
    setAutomations([...automations, automation]);
    setNewAutomation({
      name: '',
      type: 'email',
      trigger: 'weekly',
      recipients: 'students',
      template: '',
      subject: '',
      content: ''
    });
    setShowCreateForm(false);
  };

  const handleCreateTemplate = () => {
    const template = {
      id: Date.now(),
      ...newTemplate,
      created_at: new Date().toISOString(),
      usage_count: 0
    };
    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
      description: '',
      category: 'general'
    });
    setShowNewTemplateModal(false);
    alert('✅ Template created successfully!');
  };

  const addVariable = (variable) => {
    if (!newTemplate.variables.includes(variable)) {
      setNewTemplate({
        ...newTemplate,
        variables: [...newTemplate.variables, variable]
      });
    }
  };

  const removeVariable = (variable) => {
    setNewTemplate({
      ...newTemplate,
      variables: newTemplate.variables.filter(v => v !== variable)
    });
  };

  const totalSent = automations.reduce((sum, auto) => sum + auto.sent, 0);
  const totalOpened = automations.reduce((sum, auto) => sum + auto.opened, 0);
  const totalClicked = automations.reduce((sum, auto) => sum + auto.clicked, 0);
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
  const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>AI Automation Hub</h1>
                <p className={`${textSecondary} mt-2`}>Automate emails, messages, and communications with AI</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Create Automation</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Active Automations</p>
                <p className={`${textPrimary} text-3xl font-bold mt-2`}>{automations.filter(a => a.status === 'active').length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Messages Sent</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2`}>{totalSent.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Open Rate</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2 text-green-600`}>{openRate}%</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Click Rate</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2 text-purple-600`}>{clickRate}%</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Templates</p>
                <p className={`${textPrimary} text-3xl font-bold mt-2`}>{templates.length}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Edit className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`${cardBg} rounded-2xl shadow-xl mb-8`}>
          <div className="flex border-b border-gray-200">
            {[
              { id: 'email', label: 'Email Automations', icon: Mail },
              { id: 'messages', label: 'Message Automations', icon: MessageSquare },
              { id: 'templates', label: 'Templates', icon: Edit },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : `${textSecondary} hover:${darkMode ? 'text-white' : 'text-gray-900'}`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {(activeTab === 'email' || activeTab === 'messages') && (
          <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>
                {activeTab === 'email' ? 'Email' : 'Message'} Automations
              </h3>
              <span className={`${textMuted} text-sm`}>
                {automations.filter(a => a.type === activeTab).length} automations
              </span>
            </div>
            
            <div className="space-y-4">
              {automations.filter(automation => automation.type === activeTab).map((automation) => (
                <div key={automation.id} className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-full p-2">
                        {getTypeIcon(automation.type)}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${textPrimary}`}>{automation.name}</h4>
                        <p className={`text-sm ${textMuted}`}>
                          Trigger: {automation.trigger} • Recipients: {automation.recipients}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                        {automation.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                      </span>
                      {userRole === 'admin' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(automation.id)}
                            className={`p-2 rounded-lg ${automation.status === 'active' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                          >
                            {automation.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAutomation(automation.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${textPrimary}`}>{automation.sent}</p>
                      <p className={`text-xs ${textMuted}`}>Sent</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-green-600`}>{automation.opened}</p>
                      <p className={`text-xs ${textMuted}`}>Opened</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-purple-600`}>{automation.clicked}</p>
                      <p className={`text-xs ${textMuted}`}>Clicked</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold text-blue-600`}>
                        {automation.sent > 0 ? ((automation.opened / automation.sent) * 100).toFixed(1) : 0}%
                      </p>
                      <p className={`text-xs ${textMuted}`}>Open Rate</p>
                    </div>
                  </div>
                  
                  {automation.nextRun && (
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Next run: {automation.nextRun}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>Message Templates</h3>
              <button 
                onClick={() => setShowNewTemplateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Template</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div key={template.id} className={`border rounded-xl p-6 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        {getTypeIcon(template.type)}
                      </div>
                      <h4 className={`font-semibold ${textPrimary}`}>{template.name}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className={`text-sm font-medium ${textSecondary}`}>Subject:</p>
                      <p className={`text-sm ${textMuted}`}>{template.subject}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${textSecondary}`}>Content Preview:</p>
                      <p className={`text-sm ${textMuted} line-clamp-3`}>{template.content}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${textSecondary}`}>Variables:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {template.variables.map((variable, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Performance Overview */}
            <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">{openRate}%</span>
                  </div>
                  <h4 className={`font-semibold ${textPrimary}`}>Average Open Rate</h4>
                  <p className={`text-sm ${textMuted}`}>Industry average: 21.3%</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">{clickRate}%</span>
                  </div>
                  <h4 className={`font-semibold ${textPrimary}`}>Average Click Rate</h4>
                  <p className={`text-sm ${textMuted}`}>Industry average: 2.6%</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">{automations.filter(a => a.status === 'active').length}</span>
                  </div>
                  <h4 className={`font-semibold ${textPrimary}`}>Active Campaigns</h4>
                  <p className={`text-sm ${textMuted}`}>Running automations</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${cardBg} rounded-2xl shadow-xl p-8`}>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Recent Activity</h3>
              <div className="space-y-4">
                {automations.slice(0, 5).map((automation) => (
                  <div key={automation.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        {getTypeIcon(automation.type)}
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{automation.name}</p>
                        <p className={`text-sm ${textMuted}`}>Last run: {automation.lastRun || 'Never'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${textPrimary}`}>{automation.sent} sent</p>
                      <p className={`text-sm ${textMuted}`}>{automation.opened} opened</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Automation Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>Create New Automation</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Automation Name</label>
                    <input
                      type="text"
                      value={newAutomation.name}
                      onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                      placeholder="Enter automation name"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Type</label>
                    <select
                      value={newAutomation.type}
                      onChange={(e) => setNewAutomation({...newAutomation, type: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="email">Email</option>
                      <option value="message">Message</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Trigger</label>
                    <select
                      value={newAutomation.trigger}
                      onChange={(e) => setNewAutomation({...newAutomation, trigger: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="due_date">Due Date</option>
                      <option value="overdue">Overdue</option>
                      <option value="event">Event Based</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Recipients</label>
                    <select
                      value={newAutomation.recipients}
                      onChange={(e) => setNewAutomation({...newAutomation, recipients: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="students">Students</option>
                      <option value="teachers">Teachers</option>
                      <option value="all">All Users</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Subject</label>
                  <input
                    type="text"
                    value={newAutomation.subject}
                    onChange={(e) => setNewAutomation({...newAutomation, subject: e.target.value})}
                    placeholder="Enter email subject or message title"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  />
                </div>

                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Content</label>
                  <textarea
                    value={newAutomation.content}
                    onChange={(e) => setNewAutomation({...newAutomation, content: e.target.value})}
                    placeholder="Enter message content. Use {{variable_name}} for dynamic content."
                    rows={6}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAutomation}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Create Automation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Template Modal */}
        {showNewTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Create New Template</h2>
                <button
                  onClick={() => setShowNewTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleCreateTemplate(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Template Name *</label>
                    <input
                      type="text"
                      required
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                      placeholder="Enter template name"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Template Type *</label>
                    <select
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="email">Email Template</option>
                      <option value="sms">SMS Template</option>
                      <option value="push">Push Notification</option>
                      <option value="in-app">In-App Message</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Category</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="attendance">Attendance</option>
                      <option value="financial">Financial</option>
                      <option value="events">Events</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Subject/Title *</label>
                    <input
                      type="text"
                      required
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                      placeholder="Enter subject or title"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Description</label>
                  <textarea
                    rows="2"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Enter template description (optional)"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  />
                </div>
                
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Message Content *</label>
                  <textarea
                    rows="6"
                    required
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    placeholder="Enter message content. Use {{variable_name}} for dynamic content."
                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                  />
                </div>
                
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Available Variables</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {[
                      'student_name', 'teacher_name', 'class_name', 
                      'subject_name', 'grade', 'attendance_rate', 'fee_amount',
                      'due_date', 'school_name', 'current_date', 'term_name'
                    ].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => addVariable(variable)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          newTemplate.variables.includes(variable)
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {`{{${variable}}}`}
                      </button>
                    ))}
                  </div>
                  
                  {newTemplate.variables.length > 0 && (
                    <div>
                      <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Selected Variables</label>
                      <div className="flex flex-wrap gap-2">
                        {newTemplate.variables.map((variable) => (
                          <span
                            key={variable}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {`{{${variable}}}`}
                            <button
                              type="button"
                              onClick={() => removeVariable(variable)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowNewTemplateModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Create Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAutomationPanel;
