import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Search, Filter, Edit, Trash2, Eye, Mail, Phone, MapPin, Save, X, Settings, Check, Plus, Minus } from 'lucide-react';

const UserManagementPanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [roleCounts, setRoleCounts] = useState({});
  const [adminStats, setAdminStats] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState([
    'View Grades', 'Submit Assignments', 'Access Library', 'Manage Classes', 
    'Grade Assignments', 'Create Lessons', 'Pay Fees', 
    'Message Teachers', 'Full Access', 'User Management', 'System Settings',
    'Manage Students', 'Manage Teachers', 'View Reports',
    'Manage Finances', 'Manage Attendance', 'Manage Timetable', 'Manage Exams'
  ]);

  useEffect(() => {
    loadUsers();
    initializeRolePermissions();
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setAdminStats(data.data);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const initializeRolePermissions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/roles');
      const data = await response.json();
      if (data.success) {
        const permissionsMap = {};
        const countsMap = {};
        data.data.forEach(roleData => {
          permissionsMap[roleData.role] = roleData.permissions;
          countsMap[roleData.role] = roleData.count;
        });
        setRolePermissions(permissionsMap);
        setRoleCounts(countsMap);
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      // Fallback to default permissions
      const defaultPermissions = {
        student: ['View Grades', 'Submit Assignments', 'Access Library'],
        teacher: ['Manage Classes', 'Grade Assignments', 'Create Lessons', 'View Reports'],
        admin: ['Full Access', 'User Management', 'System Settings', 'Manage Students', 'Manage Teachers', 'View Reports', 'Manage Finances', 'Manage Attendance', 'Manage Timetable', 'Manage Exams']
      };
      const defaultCounts = {
        student: 0,
        teacher: 0,
        admin: 0
      };
      setRolePermissions(defaultPermissions);
      setRoleCounts(defaultCounts);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || ''
    });
  };

  const handleSaveUser = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: currentUser.id,
          ...editForm
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
        setEditingUser(null);
        loadUsers();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!confirm('Are you sure you want to change this user\'s status?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: currentUser.id,
          is_active: !currentStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('User status updated!');
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEditRolePermissions = (role) => {
    setEditingRole(role);
  };

  const handleSaveRolePermissions = async (role) => {
    setLoading(true);
    try {
      // Here you would typically make an API call to save the permissions
      // For now, we'll just update the local state
      const response = await fetch(`http://localhost:5000/api/admin/roles/${role}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: currentUser.id,
          permissions: rolePermissions[role]
        })
      });
      
      if (response.ok) {
        alert('Role permissions updated successfully!');
        setEditingRole(null);
      } else {
        alert('Failed to update role permissions');
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
      alert('Error updating role permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (role, permission) => {
    const currentPermissions = rolePermissions[role] || [];
    const updatedPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    setRolePermissions(prev => ({
      ...prev,
      [role]: updatedPermissions
    }));
  };

  const handleAddCustomPermission = (role, newPermission) => {
    if (newPermission.trim() && !rolePermissions[role].includes(newPermission.trim())) {
      setRolePermissions(prev => ({
        ...prev,
        [role]: [...(prev[role] || []), newPermission.trim()]
      }));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-blue-800">{adminStats.role_counts?.student || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Teachers</p>
              <p className="text-2xl font-bold text-green-800">{adminStats.role_counts?.teacher || 0}</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Admins</p>
              <p className="text-2xl font-bold text-red-800">{adminStats.role_counts?.admin || 0}</p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', label: 'All Users', icon: Users },
              { id: 'register', label: 'Register User', icon: UserPlus },
              { id: 'roles', label: 'Role Management', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser === user.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editForm.first_name}
                                  onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="First Name"
                                />
                                <input
                                  type="text"
                                  value={editForm.last_name}
                                  onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="Last Name"
                                />
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="Email"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {((user.first_name || '') + ' ' + (user.last_name || '')).trim().split(' ').map(n => n[0]).join('') || 'U'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingUser === user.id ? (
                              <input
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="Phone"
                              />
                            ) : (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {user.phone || 'N/A'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingUser === user.id ? (
                              <input
                                type="date"
                                value={editForm.date_of_birth}
                                onChange={(e) => setEditForm({...editForm, date_of_birth: e.target.value})}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            ) : (
                              user.date_of_birth || 'N/A'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingUser === user.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveUser(user.id)}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Edit Profile"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-6">Register New User</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+256 7XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Role</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter address"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Register User
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Role Management</h3>
                {editingRole && (
                  <button
                    onClick={() => setEditingRole(null)}
                    className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
              
              {!editingRole ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { role: 'student' },
                    { role: 'teacher' },
                    { role: 'admin' }
                  ].map((roleData) => (
                    <div key={roleData.role} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium capitalize">{roleData.role}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(roleData.role)}`}>
                          {roleCounts[roleData.role] || 0}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Permissions:</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {(rolePermissions[roleData.role] || []).slice(0, 3).map((permission, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                              {permission}
                            </li>
                          ))}
                          {(rolePermissions[roleData.role] || []).length > 3 && (
                            <li className="text-gray-400">
                              +{(rolePermissions[roleData.role] || []).length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                      <button 
                        onClick={() => handleEditRolePermissions(roleData.role)}
                        className="mt-3 w-full flex items-center justify-center space-x-2 text-blue-600 text-sm hover:text-blue-800 hover:bg-blue-50 py-2 px-3 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Edit Permissions</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold capitalize">Edit {editingRole} Permissions</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveRolePermissions(editingRole)}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Permissions */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Current Permissions</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(rolePermissions[editingRole] || []).map((permission, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-700">{permission}</span>
                            <button
                              onClick={() => handleTogglePermission(editingRole, permission)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!rolePermissions[editingRole] || rolePermissions[editingRole].length === 0) && (
                          <p className="text-gray-500 text-sm">No permissions assigned</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Available Permissions */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Available Permissions</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availablePermissions
                          .filter(permission => !(rolePermissions[editingRole] || []).includes(permission))
                          .map((permission, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm text-gray-700">{permission}</span>
                              <button
                                onClick={() => handleTogglePermission(editingRole, permission)}
                                className="text-green-600 hover:text-green-800 p-1"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>
                      
                      {/* Add Custom Permission */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h6 className="font-medium text-gray-900 mb-2">Add Custom Permission</h6>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter custom permission"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCustomPermission(editingRole, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousElementSibling;
                              handleAddCustomPermission(editingRole, input.value);
                              input.value = '';
                            }}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPanel;
