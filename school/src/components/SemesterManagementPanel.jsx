import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, Save, X, BookOpen, Clock, Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const SemesterManagementPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [terms, setTerms] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [newTerm, setNewTerm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    totalStudents: '',
    totalFees: '',
    subjects: [],
    holidays: [],
    examPeriod: ''
  });

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateCollectionRate = (collected, total) => {
    return ((collected / total) * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleAddTerm = () => {
    const term = {
      id: Date.now(),
      ...newTerm,
      status: 'upcoming',
      collectedFees: 0,
      totalStudents: parseInt(newTerm.totalStudents),
      totalFees: parseInt(newTerm.totalFees)
    };
    setTerms([...terms, term]);
    setNewTerm({
      name: '',
      startDate: '',
      endDate: '',
      totalStudents: '',
      totalFees: '',
      subjects: [],
      holidays: [],
      examPeriod: ''
    });
    setShowAddForm(false);
  };

  const handleEditTerm = (term) => {
    setEditingTerm(term.id);
    setNewTerm({
      ...term,
      totalStudents: term.totalStudents.toString(),
      totalFees: term.totalFees.toString()
    });
  };

  const handleUpdateTerm = () => {
    setTerms(terms.map(term => 
      term.id === editingTerm 
        ? {
            ...newTerm,
            id: editingTerm,
            totalStudents: parseInt(newTerm.totalStudents),
            totalFees: parseInt(newTerm.totalFees)
          }
        : term
    ));
    setEditingTerm(null);
    setNewTerm({
      name: '',
      startDate: '',
      endDate: '',
      totalStudents: '',
      totalFees: '',
      subjects: [],
      holidays: [],
      examPeriod: ''
    });
  };

  const handleDeleteTerm = (id) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      setTerms(terms.filter(term => term.id !== id));
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Semester Management</h1>
                <p className={`${textSecondary} mt-2`}>Manage academic semesters, schedules, and financial planning</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Semester</span>
              </button>
            )}
          </div>
        </div>

        {/* Terms Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Total Semesters</p>
                <p className={`${textPrimary} text-3xl font-bold mt-2`}>{terms.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Active Semesters</p>
                <p className={`${textPrimary} text-3xl font-bold mt-2`}>
                  {terms.filter(t => t.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Total Revenue</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2`}>
                  {formatCurrency(terms.reduce((sum, term) => sum + (term.collectedFees || 0), 0))}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Terms List */}
        <div className="space-y-6">
          {terms.length === 0 ? (
            <div className={`${cardBg} rounded-2xl p-8 text-center text-gray-500`}>No semesters defined</div>
          ) : terms.map((term) => (
            <div key={term.id} className={`${cardBg} rounded-2xl shadow-xl p-8`}>
              {editingTerm === term.id ? (
                // Edit Form
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Semester Name</label>
                      <input
                        type="text"
                        value={newTerm.name}
                        onChange={(e) => setNewTerm({...newTerm, name: e.target.value})}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Total Students</label>
                      <input
                        type="number"
                        value={newTerm.totalStudents}
                        onChange={(e) => setNewTerm({...newTerm, totalStudents: e.target.value})}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Start Date</label>
                      <input
                        type="date"
                        value={newTerm.startDate}
                        onChange={(e) => setNewTerm({...newTerm, startDate: e.target.value})}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-sm font-medium mb-2`}>End Date</label>
                      <input
                        type="date"
                        value={newTerm.endDate}
                        onChange={(e) => setNewTerm({...newTerm, endDate: e.target.value})}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setEditingTerm(null)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleUpdateTerm}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <h3 className={`text-2xl font-bold ${textPrimary}`}>{term.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(term.status)}`}>
                        {term.status.charAt(0).toUpperCase() + term.status.slice(1)}
                      </span>
                    </div>
                    {userRole === 'admin' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTerm(term)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTerm(term.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-blue-800 font-medium">Duration</p>
                          <p className="text-blue-600 text-sm">{term.startDate} to {term.endDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-green-800 font-medium">Students</p>
                          <p className="text-green-600 text-sm">{term.totalStudents} enrolled</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-purple-800 font-medium">Fee Collection</p>
                          <p className="text-purple-600 text-sm">{calculateCollectionRate(term.collectedFees, term.totalFees)}% collected</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-orange-800 font-medium">Exam Period</p>
                          <p className="text-orange-600 text-sm">{term.examPeriod}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className={`${textPrimary} font-semibold mb-3`}>Subjects Offered</h4>
                      <div className="flex flex-wrap gap-2">
                        {(term.subjects || []).map((subject, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className={`${textPrimary} font-semibold mb-3`}>Holidays & Breaks</h4>
                      <div className="space-y-2">
                        {(term.holidays || []).map((holiday, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span className={`${textSecondary} text-sm`}>{holiday}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Expected Fees</p>
                        <p className="text-gray-900 font-bold text-lg">{formatCurrency(term.totalFees)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Collected Fees</p>
                        <p className="text-green-600 font-bold text-lg">{formatCurrency(term.collectedFees)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Outstanding</p>
                        <p className="text-red-600 font-bold text-lg">{formatCurrency(term.totalFees - term.collectedFees)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Term Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>Add New Semester</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Semester Name</label>
                    <input
                      type="text"
                      value={newTerm.name}
                      onChange={(e) => setNewTerm({...newTerm, name: e.target.value})}
                      placeholder="e.g., Fall 2025, Spring 2025"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Total Students</label>
                    <input
                      type="number"
                      value={newTerm.totalStudents}
                      onChange={(e) => setNewTerm({...newTerm, totalStudents: e.target.value})}
                      placeholder="Expected enrollment"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Start Date</label>
                    <input
                      type="date"
                      value={newTerm.startDate}
                      onChange={(e) => setNewTerm({...newTerm, startDate: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>End Date</label>
                    <input
                      type="date"
                      value={newTerm.endDate}
                      onChange={(e) => setNewTerm({...newTerm, endDate: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Expected Total Fees (UGX)</label>
                    <input
                      type="number"
                      value={newTerm.totalFees}
                      onChange={(e) => setNewTerm({...newTerm, totalFees: e.target.value})}
                      placeholder="Total expected fee collection"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleAddTerm}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Add Semester</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterManagementPanel;
