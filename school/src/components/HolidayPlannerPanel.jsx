import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Edit, Trash2, Save, X, Clock, MapPin, 
  Users, Star, Filter, Search, Download, Upload, Settings,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react';

const HolidayPlannerPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('list'); // list, calendar, grid

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBase = 'w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const inputField = darkMode 
    ? `${inputBase} bg-gray-700 border border-gray-600 text-white placeholder-gray-300`
    : `${inputBase} bg-white border border-gray-300 text-gray-900 placeholder-gray-500`;

  const [newHoliday, setNewHoliday] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'public', // public, school, religious, national
    location: '',
    participants: '',
    budget: '',
    activities: [],
    status: 'planned', // planned, confirmed, completed, cancelled
    priority: 'medium', // low, medium, high
    notes: ''
  });

  useEffect(() => {
    loadHolidays();
  }, []); // Only load once on mount, not when filterYear changes

  const loadHolidays = async () => {
    setLoading(true);
    try {
      // Start with empty array - no demo data
      setHolidays([]);
    } catch (error) {
      console.error('Error loading holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHoliday = async () => {
    // Validate required fields
    if (!newHoliday.name || !newHoliday.name.trim()) {
      alert('Please enter a holiday name');
      return;
    }
    
    if (!newHoliday.startDate) {
      alert('Please select a start date');
      return;
    }
    
    if (!newHoliday.endDate) {
      alert('Please select an end date');
      return;
    }
    
    // Validate date range
    if (new Date(newHoliday.startDate) > new Date(newHoliday.endDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      const holidayData = {
        ...newHoliday,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        // Ensure dates are in proper format
        startDate: newHoliday.startDate,
        endDate: newHoliday.endDate
      };
      
      // Add to holidays list
      setHolidays(prev => [...prev, holidayData]);
      
      // Update filter year to match the new holiday's year if needed
      const holidayYear = new Date(newHoliday.startDate).getFullYear();
      if (holidayYear !== filterYear) {
        setFilterYear(holidayYear);
      }
      
      // Reset form
      setNewHoliday({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'public',
        location: '',
        participants: '',
        budget: '',
        activities: [],
        status: 'planned',
        priority: 'medium',
        notes: ''
      });
      
      setIsCreating(false);
      alert('✅ Holiday added successfully!');
    } catch (error) {
      console.error('Error creating holiday:', error);
      alert('❌ Failed to create holiday. Please try again.');
    }
  };

  const handleUpdateHoliday = async () => {
    try {
      setHolidays(prev => 
        prev.map(holiday => 
          holiday.id === selectedHoliday.id 
            ? { ...holiday, ...selectedHoliday }
            : holiday
        )
      );
      setSelectedHoliday(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating holiday:', error);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        setHolidays(prev => prev.filter(holiday => holiday.id !== holidayId));
      } catch (error) {
        console.error('Error deleting holiday:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = !searchTerm || 
                        holiday.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        holiday.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!holiday.startDate) return false;
    
    try {
      const holidayYear = new Date(holiday.startDate).getFullYear();
      const matchesYear = holidayYear === filterYear;
      return matchesSearch && matchesYear;
    } catch (e) {
      console.error('Error filtering holiday:', e, holiday);
      return matchesSearch;
    }
  });

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary}`}>Holiday Planner</h1>
              <p className={`text-lg ${textSecondary}`}>Plan and manage school holidays and events</p>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === 'admin' && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Holiday</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search holidays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${inputField}`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className={inputField}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 1 + i;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </select>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'calendar' 
                      ? 'bg-blue-600 text-white' 
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Holidays Content */}
        <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-xl font-semibold ${textPrimary}`}>{holiday.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(holiday.status)}`}>
                          {holiday.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(holiday.priority)}`}>
                          {holiday.priority}
                        </span>
                      </div>
                      <p className={`text-sm ${textSecondary} mb-3`}>{holiday.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className={textMuted}>
                            {holiday.startDate ? new Date(holiday.startDate).toLocaleDateString() : 'N/A'} - {holiday.endDate ? new Date(holiday.endDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        {holiday.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className={textMuted}>{holiday.location}</span>
                          </div>
                        )}
                        {holiday.participants && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <span className={textMuted}>{holiday.participants}</span>
                          </div>
                        )}
                      </div>
                      {holiday.activities.length > 0 && (
                        <div className="mt-3">
                          <p className={`text-sm font-medium ${textSecondary} mb-1`}>Activities:</p>
                          <div className="flex flex-wrap gap-2">
                            {holiday.activities.map((activity, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedHoliday(holiday);
                          setIsEditing(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
                  {filteredHolidays.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No holidays found</h3>
                      <p className={textSecondary}>Try adjusting your search criteria or add a new holiday.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Calendar View */}
              {viewMode === 'calendar' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Holiday Calendar View</h3>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {/* Calendar Header */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className={`p-2 text-center text-sm font-medium ${textSecondary}`}>
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date(filterYear, 0, 1);
                        const dayOfWeek = date.getDay();
                        const day = i - dayOfWeek + 1;
                        const currentDate = new Date(filterYear, 0, day);
                        const hasHoliday = filteredHolidays.some(holiday => {
                          const startDate = new Date(holiday.startDate);
                          const endDate = new Date(holiday.endDate);
                          return currentDate >= startDate && currentDate <= endDate;
                        });
                        
                        return (
                          <div
                            key={i}
                            className={`p-2 text-center text-sm border rounded-lg cursor-pointer transition-colors ${
                              hasHoliday 
                                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                : darkMode 
                                  ? 'bg-gray-700 text-gray-300 border-gray-600' 
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {day > 0 && day <= new Date(filterYear, 11, 31).getDate() ? day : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Holiday Legend */}
                  <div className="border-t pt-4">
                    <h4 className={`font-medium ${textPrimary} mb-3`}>Holidays in {filterYear}</h4>
                    <div className="space-y-2">
                      {filteredHolidays.map((holiday) => (
                        <div key={holiday.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">{holiday.name}</p>
                            <p className="text-sm text-blue-700">
                              {holiday.startDate ? new Date(holiday.startDate).toLocaleDateString() : 'N/A'} - {holiday.endDate ? new Date(holiday.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(holiday.status)}`}>
                            {holiday.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Holiday Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Add New Holiday</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Holiday Name</label>
                    <input
                      type="text"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                      className={inputField}
                      placeholder="Enter holiday name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Type</label>
                    <select
                      value={newHoliday.type}
                      onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value})}
                      className={inputField}
                    >
                      <option value="public">Public Holiday</option>
                      <option value="school">School Holiday</option>
                      <option value="religious">Religious Holiday</option>
                      <option value="national">National Holiday</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Description</label>
                  <textarea
                    value={newHoliday.description}
                    onChange={(e) => setNewHoliday({...newHoliday, description: e.target.value})}
                    className={inputField}
                    rows={3}
                    placeholder="Enter holiday description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Start Date</label>
                    <input
                      type="date"
                      value={newHoliday.startDate}
                      onChange={(e) => setNewHoliday({...newHoliday, startDate: e.target.value})}
                      className={inputField}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>End Date</label>
                    <input
                      type="date"
                      value={newHoliday.endDate}
                      onChange={(e) => setNewHoliday({...newHoliday, endDate: e.target.value})}
                      className={inputField}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Location</label>
                    <input
                      type="text"
                      value={newHoliday.location}
                      onChange={(e) => setNewHoliday({...newHoliday, location: e.target.value})}
                      className={inputField}
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Participants</label>
                    <input
                      type="text"
                      value={newHoliday.participants}
                      onChange={(e) => setNewHoliday({...newHoliday, participants: e.target.value})}
                      className={inputField}
                      placeholder="e.g., All Students & Staff"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Budget (UGX)</label>
                    <input
                      type="number"
                      value={newHoliday.budget}
                      onChange={(e) => setNewHoliday({...newHoliday, budget: e.target.value})}
                      className={inputField}
                      placeholder="Enter budget amount"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Priority</label>
                    <select
                      value={newHoliday.priority}
                      onChange={(e) => setNewHoliday({...newHoliday, priority: e.target.value})}
                      className={inputField}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Notes</label>
                  <textarea
                    value={newHoliday.notes}
                    onChange={(e) => setNewHoliday({...newHoliday, notes: e.target.value})}
                    className={inputField}
                    rows={3}
                    placeholder="Additional notes or instructions"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  onClick={() => setIsCreating(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateHoliday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Holiday
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Holiday Modal */}
        {isEditing && selectedHoliday && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Edit Holiday</h2>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedHoliday(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Holiday Name</label>
                    <input
                      type="text"
                      value={selectedHoliday.name}
                      onChange={(e) => setSelectedHoliday({...selectedHoliday, name: e.target.value})}
                      className={inputField}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Type</label>
                    <select
                      value={selectedHoliday.type}
                      onChange={(e) => setSelectedHoliday({...selectedHoliday, type: e.target.value})}
                      className={inputField}
                    >
                      <option value="public">Public Holiday</option>
                      <option value="school">School Holiday</option>
                      <option value="religious">Religious Holiday</option>
                      <option value="national">National Holiday</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Description</label>
                  <textarea
                    value={selectedHoliday.description}
                    onChange={(e) => setSelectedHoliday({...selectedHoliday, description: e.target.value})}
                    className={inputField}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Start Date</label>
                    <input
                      type="date"
                      value={selectedHoliday.startDate}
                      onChange={(e) => setSelectedHoliday({...selectedHoliday, startDate: e.target.value})}
                      className={inputField}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>End Date</label>
                    <input
                      type="date"
                      value={selectedHoliday.endDate}
                      onChange={(e) => setSelectedHoliday({...selectedHoliday, endDate: e.target.value})}
                      className={inputField}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Status</label>
                    <select
                      value={selectedHoliday.status}
                      onChange={(e) => setSelectedHoliday({...selectedHoliday, status: e.target.value})}
                      className={inputField}
                    >
                      <option value="planned">Planned</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Priority</label>
                    <select
                      value={selectedHoliday.priority}
                      onChange={(e) => setSelectedHoliday({...selectedHoliday, priority: e.target.value})}
                      className={inputField}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedHoliday(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateHoliday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Holiday
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayPlannerPanel;
