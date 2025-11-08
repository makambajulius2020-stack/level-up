import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, GraduationCap, FileText, Monitor, UserCheck, 
  FlaskConical, Heart, Home, Utensils, Shield, Globe, Award, 
  Settings, Eye, Edit, Plus, BarChart3, Activity, AlertTriangle,
  CheckCircle, Clock, TrendingUp, Brain, Zap, Target, Save, X
} from 'lucide-react';

// Import dashboard components
import AdministrationDashboard from './dashboards/AdministrationDashboard';
import FinanceDashboard from './dashboards/FinanceDashboard';
import AcademicDashboard from './dashboards/AcademicDashboard';
import ExaminationsDashboard from './dashboards/ExaminationsDashboard';
import ICTDashboard from './dashboards/ICTDashboard';
import HRDashboard from './dashboards/HRDashboard';
import LaboratoryDashboard from './dashboards/LaboratoryDashboard';
import CounselingDashboard from './dashboards/CounselingDashboard';
import SportsDashboard from './dashboards/SportsDashboard';
import HealthDashboard from './dashboards/HealthDashboard';
import BoardingDashboard from './dashboards/BoardingDashboard';
import CateringDashboard from './dashboards/CateringDashboard';
import SecurityDashboard from './dashboards/SecurityDashboard';
import MediaDashboard from './dashboards/MediaDashboard';
import StudentAffairsDashboard from './dashboards/StudentAffairsDashboard';

const Department = ({ userRole, currentUser }) => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [userPermissions, setUserPermissions] = useState({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    icon: 'Building2',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    systemAccess: '',
    status: 'active',
    staffCount: 0
  });

  // Icon mapping for dynamic rendering
  const iconMap = {
    Building2,
    BarChart3,
    GraduationCap,
    FileText,
    Monitor,
    UserCheck,
    FlaskConical,
    Heart,
    Activity,
    Home,
    Utensils,
    Shield,
    Globe,
    Award
  };

  useEffect(() => {
    loadDepartments();
    loadDepartmentStats();
    loadUserPermissions();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Loading departments with token:', token ? 'Present' : 'Missing');
      
      // Check if using localStorage fallback (token starts with 'local_')
      if (token && token.startsWith('local_')) {
        // For localStorage fallback, use empty data
        const mockDepartments = [];
        
        setDepartments(mockDepartments);
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/departments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Departments data:', data);
      
      if (data.success) {
        setDepartments(data.data);
      } else {
        console.error('API returned error:', data.message);
        // Use the actual departments you specified
        setDepartments(getActualDepartments());
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      // Use the actual departments you specified
      setDepartments(getActualDepartments());
    } finally {
      setLoading(false);
    }
  };

  const getActualDepartments = () => {
    return [];
  };

  const loadDepartmentStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading department stats:', error);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departments/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserPermissions(data.data);
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const handleViewDashboard = (department) => {
    setShowDashboard(true);
    setSelectedDepartment(department);
  };

  const handleViewAnalytics = (department) => {
    setShowAnalytics(true);
    setSelectedDepartment(department);
  };

  const handleBackToList = () => {
    setSelectedDepartment(null);
    setShowDashboard(false);
    setShowAnalytics(false);
    setEditingDepartment(null);
    setShowAddDepartment(false);
  };

  const handleAddDepartment = () => {
    setShowAddDepartment(true);
  };

  const handleSaveNewDepartment = async () => {
    console.log('=== DEPARTMENT CREATION DEBUG ===');
    console.log('handleSaveNewDepartment called');
    console.log('newDepartment:', newDepartment);
    console.log('token:', localStorage.getItem('token'));
    console.log('departments length:', departments.length);
    
    // Validate required fields
    if (!newDepartment.name.trim()) {
      alert('Department name is required');
      return;
    }
    if (!newDepartment.description.trim()) {
      alert('Department description is required');
      return;
    }
    if (!newDepartment.systemAccess.trim()) {
      alert('System access description is required');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token check:', token ? 'Present' : 'Missing');
      
      // Check if using localStorage fallback (token starts with 'local_')
      if (token && token.startsWith('local_')) {
        console.log('Using localStorage fallback mode');
        // For localStorage fallback, add to local state instead of API call
        const newId = Math.max(...departments.map(d => d.id), 0) + 1;
        const newDept = {
          id: newId,
          ...newDepartment,
          lastActivity: 'Just now',
          coreFunctions: [],
          aiFeatures: [],
          allowedRoles: ['admin'],
          editPermissions: ['admin']
        };
        
        console.log('Adding new department locally:', newDept);
        setDepartments(prev => [...prev, newDept]);
        
        alert('Department added successfully!');
        setShowAddDepartment(false);
        setNewDepartment({
          name: '',
          description: '',
          icon: 'Building2',
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-600',
          systemAccess: '',
          status: 'active',
          staffCount: 0
        });
        return;
      }

      console.log('Making API call to backend');
      // For proper JWT authentication, make API call
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('API URL:', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/departments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDepartment)
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        alert('Server returned invalid response. Please try again.');
        return;
      }
      
      if (data.success) {
        console.log('Department created successfully');
        alert('Department added successfully!');
        setShowAddDepartment(false);
        setNewDepartment({
          name: '',
          description: '',
          icon: 'Building2',
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-600',
          systemAccess: '',
          status: 'active',
          staffCount: 0
        });
        loadDepartments();
      } else {
        console.error('API Error:', data);
        console.error('Response status:', response.status);
        
        // Provide more specific error messages
        let errorMessage = 'Unknown error';
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.msg) {
          errorMessage = data.msg;
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 422) {
          errorMessage = 'Invalid token format. Please log in again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found.';
        }
        
        console.error('Final error message:', errorMessage);
        alert(`Failed to add department: ${errorMessage}`);
      }
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Error adding department:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = error.message || 'Unknown error occurred';
      
      if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection.';
      } else if (error.message && error.message.includes('Not enough segments')) {
        errorMessage = 'Authentication error: Invalid token. Please log out and log in again.';
      } else if (error.message && error.message.includes('SyntaxError')) {
        errorMessage = 'Server returned invalid response. Please try again.';
      } else if (error.message && error.message.includes('TypeError')) {
        errorMessage = 'Request failed. Please check your connection.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server.';
      }
      
      console.error('Final catch error message:', errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleCancelAddDepartment = () => {
    setShowAddDepartment(false);
    setNewDepartment({
      name: '',
      description: '',
      icon: 'Building2',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      systemAccess: '',
      status: 'active',
      staffCount: 0
    });
  };

  const getDashboardComponent = (departmentName) => {
    const dashboardMap = {
      'Administration Department': AdministrationDashboard,
      'Finance & Accounts Department': FinanceDashboard,
      'Academic Departments': AcademicDashboard,
      'Examinations & Assessment Department': ExaminationsDashboard,
      'ICT & Data Management Department': ICTDashboard,
      'Human Resource Department': HRDashboard,
      'Laboratory & Science Resource Department': LaboratoryDashboard,
      'Guidance & Counseling Department': CounselingDashboard,
      'Games & Sports Department': SportsDashboard,
      'Health / Sick Bay Department': HealthDashboard,
      'Boarding & Dormitory Department': BoardingDashboard,
      'Catering & Nutrition Department': CateringDashboard,
      'Security Department': SecurityDashboard,
      'Public Relations & Media Department': MediaDashboard,
      'Student Affairs & Clubs Department': StudentAffairsDashboard
    };

    const DashboardComponent = dashboardMap[departmentName];
    return DashboardComponent ? <DashboardComponent userRole={userRole} currentUser={currentUser} /> : null;
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department.id);
    setEditForm({
      name: department.name,
      description: department.description,
      status: department.status,
      staffCount: department.staffCount
    });
  };

  const handleSaveDepartment = async (departmentId) => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (data.success) {
        alert('Department updated successfully!');
        setEditingDepartment(null);
        loadDepartments();
      } else {
        alert(data.message || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Error updating department');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setEditForm({});
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Show Dashboard View
  if (showDashboard && selectedDepartment) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${selectedDepartment.bgColor} ${selectedDepartment.borderColor} border`}>
                {iconMap[selectedDepartment.icon] && React.createElement(iconMap[selectedDepartment.icon], { 
                  className: `w-8 h-8 ${selectedDepartment.textColor}` 
                })}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedDepartment.name} Dashboard</h1>
                <p className="text-gray-600">Real-time monitoring and management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {getDashboardComponent(selectedDepartment.name)}
      </div>
    );
  }

  // Show Analytics View
  if (showAnalytics && selectedDepartment) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${selectedDepartment.bgColor} ${selectedDepartment.borderColor} border`}>
                {iconMap[selectedDepartment.icon] && React.createElement(iconMap[selectedDepartment.icon], { 
                  className: `w-8 h-8 ${selectedDepartment.textColor}` 
                })}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedDepartment.name} Analytics</h1>
                <p className="text-gray-600">Performance insights and data analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">Analytics data will be loaded from the API</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDepartment) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${selectedDepartment.bgColor} ${selectedDepartment.borderColor} border`}>
                {iconMap[selectedDepartment.icon] && React.createElement(iconMap[selectedDepartment.icon], { 
                  className: `w-8 h-8 ${selectedDepartment.textColor}` 
                })}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedDepartment.name}</h1>
                <p className="text-gray-600">{selectedDepartment.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(selectedDepartment.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDepartment.status)}`}>
              {selectedDepartment.status.charAt(0).toUpperCase() + selectedDepartment.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Department Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Access */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-blue-600" />
                System Access
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">{selectedDepartment.systemAccess}</p>
              </div>
            </div>

            {/* Core Functions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Core Functions
              </h3>
              <div className="space-y-3">
                {selectedDepartment.coreFunctions.map((function_, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{function_}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Features
              </h3>
              <div className="space-y-3">
                {selectedDepartment.aiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Zap className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Staff Count</span>
                  <span className="font-semibold text-gray-900">{selectedDepartment.staffCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Activity</span>
                  <span className="font-semibold text-gray-900">{selectedDepartment.lastActivity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Features</span>
                  <span className="font-semibold text-green-600">{selectedDepartment.aiFeatures.length} Active</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleViewDashboard(selectedDepartment)}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Dashboard</span>
                </button>
                {selectedDepartment.canEdit && (
                  <button 
                    onClick={() => handleEditDepartment(selectedDepartment)}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Department</span>
                  </button>
                )}
                <button 
                  onClick={() => handleViewAnalytics(selectedDepartment)}
                  className="w-full flex items-center justify-center space-x-2 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Departments</p>
              <p className="text-2xl font-bold text-blue-800">{stats.totalDepartments || 0}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Departments</p>
              <p className="text-2xl font-bold text-green-800">{stats.activeDepartments || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Staff</p>
              <p className="text-2xl font-bold text-purple-800">{stats.totalStaff || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">AI Enabled</p>
              <p className="text-2xl font-bold text-orange-800">{stats.aiEnabledDepartments || 0}</p>
            </div>
            <Brain className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">System Health</p>
              <p className="text-2xl font-bold text-indigo-800">{stats.systemHealth || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Department Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">School Departments</h2>
            <div className="flex items-center space-x-2">
              {userRole === 'admin' && (
                <button 
                  onClick={handleAddDepartment}
                  className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Department</span>
                </button>
              )}
            </div>
          </div>
          {/* Show notice if using localStorage fallback */}
          {localStorage.getItem('token') && localStorage.getItem('token').startsWith('local_') && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <div className="text-sm text-red-800">
                  <strong>Database Connection Issue:</strong> Unable to connect to the backend server. 
                  Please ensure your backend server is running on http://localhost:5000 and your database is properly configured.
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading departments...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Departments Found</h3>
                <p className="text-gray-500">Check your connection or contact administrator</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
              <div
                key={department.id}
                onClick={() => handleDepartmentClick(department)}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${department.bgColor} ${department.borderColor} border group-hover:scale-110 transition-transform`}>
                    {iconMap[department.icon] && React.createElement(iconMap[department.icon], { 
                      className: `w-6 h-6 ${department.textColor}` 
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(department.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(department.status)}`}>
                      {department.status}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {department.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {department.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{department.staffCount} staff</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>{department.aiFeatures.length} AI features</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Last activity: {department.lastActivity}</span>
                    <div className="flex items-center space-x-2">
                      {department.canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDepartment(department);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Department"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium">View Details</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDashboard(department);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 py-1.5 px-2 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                      title="View Dashboard"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAnalytics(department);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 bg-green-50 text-green-600 py-1.5 px-2 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                      title="View Analytics"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Department Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Department</h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status || 'active'}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Count</label>
                <input
                  type="number"
                  value={editForm.staffCount || 0}
                  onChange={(e) => setEditForm({...editForm, staffCount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveDepartment(editingDepartment)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Department</h3>
              <button
                onClick={handleCancelAddDepartment}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter department name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter department description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Access</label>
                <input
                  type="text"
                  value={newDepartment.systemAccess}
                  onChange={(e) => setNewDepartment({...newDepartment, systemAccess: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter system access description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newDepartment.status}
                  onChange={(e) => setNewDepartment({...newDepartment, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Count</label>
                <input
                  type="number"
                  value={newDepartment.staffCount}
                  onChange={(e) => setNewDepartment({...newDepartment, staffCount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter staff count"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelAddDepartment}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewDepartment}
                disabled={loading || !newDepartment.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Adding...' : 'Add Department'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;
