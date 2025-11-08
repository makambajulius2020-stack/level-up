import React, { useState } from 'react';
import { 
  DollarSign, Plus, Edit3, Trash2, Search, Filter, Save, 
  Calculator, FileText, Users, Calendar, Settings, Eye,
  TrendingUp, BarChart3, AlertCircle, CheckCircle, Copy
} from 'lucide-react';

const FeeStructurePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('structure');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Fee structure data (start empty; populate from backend when available)
  const feeStructure = [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  const formatCurrencyFull = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderFeeStructureCard = (structure) => (
    <div key={structure.id} className={`${cardBg} rounded-xl shadow-lg overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${textPrimary}`}>{structure.course || structure.level}</h3>
              <p className={`${textSecondary}`}>
                Course: {structure.course || structure.level} • {structure.studentsEnrolled || 0} enrolled
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setEditingFee(structure)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg min-w-0">
            <p className={`text-sm ${textSecondary} mb-2`}>Mandatory Fees</p>
            <p className="text-lg sm:text-xl font-bold text-green-600 break-words" title={formatCurrencyFull(structure.totalMandatory)}>
              {formatCurrency(structure.totalMandatory)}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-0">
            <p className={`text-sm ${textSecondary} mb-2`}>Optional Fees</p>
            <p className="text-lg sm:text-xl font-bold text-blue-600 break-words" title={formatCurrencyFull(structure.totalOptional)}>
              {formatCurrency(structure.totalOptional)}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-w-0">
            <p className={`text-sm ${textSecondary} mb-2`}>Total Fees</p>
            <p className="text-lg sm:text-xl font-bold text-purple-600 break-words" title={formatCurrencyFull(structure.totalFees)}>
              {formatCurrency(structure.totalFees)}
            </p>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="space-y-3">
          <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Fee Breakdown</h4>
          {structure.fees.map((fee, index) => (
            <div key={index} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg gap-3 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full w-fit ${
                    fee.mandatory 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {fee.mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                  <h5 className={`font-medium ${textPrimary} truncate`}>{fee.category}</h5>
                </div>
                <p className={`text-sm ${textMuted} mt-1`}>{fee.description}</p>
              </div>
              <div className="text-right sm:text-right flex-shrink-0">
                <p className={`text-base sm:text-lg font-bold ${textPrimary} break-words`} title={formatCurrencyFull(fee.amount)}>
                  {formatCurrency(fee.amount)}
                </p>
                <button className="text-blue-600 hover:text-blue-800 text-sm mt-1">Edit</button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Category
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSummaryCards = () => {
    const totalStudents = feeStructure.reduce((sum, level) => sum + (level.studentsEnrolled || 0), 0);
    const totalRevenue = feeStructure.reduce((sum, level) => sum + ((level.totalFees || 0) * (level.studentsEnrolled || 0)), 0);
    const avgFeePerStudent = totalStudents ? totalRevenue / totalStudents : 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className={`${cardBg} rounded-xl shadow-lg p-4 lg:p-6`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${textSecondary} mb-1`}>Total Students</p>
              <p className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>{totalStudents}</p>
              <p className="text-blue-600 text-sm">Enrolled students</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2 lg:p-3 flex-shrink-0">
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-4 lg:p-6`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${textSecondary} mb-1`}>Expected Revenue</p>
              <p className={`text-lg lg:text-2xl font-bold ${textPrimary} break-words`} title={formatCurrencyFull(totalRevenue)}>
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-green-600 text-sm">This semester</p>
            </div>
            <div className="bg-green-100 rounded-full p-2 lg:p-3 flex-shrink-0">
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-4 lg:p-6`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${textSecondary} mb-1`}>Avg Fee/Student</p>
              <p className={`text-lg lg:text-2xl font-bold ${textPrimary} break-words`} title={formatCurrencyFull(avgFeePerStudent)}>
                {formatCurrency(avgFeePerStudent)}
              </p>
              <p className="text-purple-600 text-sm">Per semester</p>
            </div>
            <div className="bg-purple-100 rounded-full p-2 lg:p-3 flex-shrink-0">
              <Calculator className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-4 lg:p-6`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${textSecondary} mb-1`}>Fee Categories</p>
              <p className={`text-2xl lg:text-3xl font-bold ${textPrimary}`}>
                {feeStructure[0]?.fees?.length || 0}
              </p>
              <p className="text-orange-600 text-sm">Active categories</p>
            </div>
            <div className="bg-orange-100 rounded-full p-2 lg:p-3 flex-shrink-0">
              <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Course Fee Structure</h1>
        <p className={textSecondary}>Configure and manage fee structures for courses</p>
      </div>

      {/* Header Controls */}
      <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Courses</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Economics">Economics</option>
              <option value="Psychology">Psychology</option>
              <option value="Literature">Literature</option>
              <option value="Sociology">Sociology</option>
            </select>

            <select 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="current">Current Semester</option>
              <option value="Fall 2024">Fall 2024</option>
              <option value="Spring 2025">Spring 2025</option>
              <option value="Summer 2025">Summer 2025</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv,.xlsx,.xls';
                input.onchange = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    alert(`Importing fee structure from: ${file.name}\n\nThis will upload and process the file.`);
                  }
                };
                input.click();
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Import Structure
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Structure
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className={`flex space-x-1 rounded-lg p-1 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
          {[
            { id: 'structure', label: 'Fee Structure', icon: DollarSign },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'comparison', label: 'Comparison', icon: TrendingUp }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === view.id
                  ? `${darkMode ? 'bg-gray-800' : 'bg-white'} text-blue-600 shadow-sm`
                  : `${textSecondary} hover:text-blue-600 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-white/50'}`
              }`}
            >
              <view.icon className="w-4 h-4 mr-2" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Content Views */}
      {activeView === 'structure' && (
        <div className="space-y-6">
          {feeStructure.map(structure => (
            <div key={structure.id || structure.course || structure.level} className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-4 border-b border-gray-200 dark:border-gray-600`}>
              {renderFeeStructureCard(structure)}
            </div>
          ))}
        </div>
      )}

      {activeView === 'analytics' && (
        <div className={`${cardBg} rounded-xl shadow-lg p-8 text-center`}>
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>Fee Analytics</h3>
          <p className={textSecondary}>Detailed fee analytics and revenue projections coming soon.</p>
        </div>
      )}

      {activeView === 'comparison' && (
        <div className={`${cardBg} rounded-xl shadow-lg p-8 text-center`}>
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>Fee Comparison</h3>
          <p className={textSecondary}>Compare fee structures across different semesters and courses.</p>
        </div>
      )}

      {/* Create Fee Structure Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Create New Fee Structure</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              alert(`Fee Structure Created! ✅\n\nCourse: ${formData.get('course')}\nSemester: ${formData.get('semester')}\nTuition: UGX ${formData.get('tuition')}\nTotal: UGX ${parseInt(formData.get('tuition') || 0) + parseInt(formData.get('materials') || 0) + parseInt(formData.get('certification') || 0)}`);
              setShowCreateModal(false);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Course *</label>
                  <select
                    name="course"
                    required
                    className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Select course</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Economics">Economics</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Literature">Literature</option>
                    <option value="Sociology">Sociology</option>
                  </select>
                </div>
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Semester *</label>
                  <select
                    name="semester"
                    required
                    className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Select semester</option>
                    <option value="Fall 2024">Fall 2024</option>
                    <option value="Spring 2025">Spring 2025</option>
                    <option value="Summer 2025">Summer 2025</option>
                  </select>
                </div>
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Tuition Fee (UGX) *</label>
                  <input
                    name="tuition"
                    type="number"
                    required
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="e.g., 500000"
                  />
                </div>
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Course Materials Fee (UGX)</label>
                  <input
                    name="materials"
                    type="number"
                    defaultValue="0"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="e.g., 100000"
                  />
                </div>
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Certification Fee (UGX)</label>
                  <input
                    name="certification"
                    type="number"
                    defaultValue="0"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="e.g., 50000"
                  />
                </div>
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Other Fees (UGX)</label>
                  <input
                    name="other"
                    type="number"
                    defaultValue="0"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Additional notes about this fee structure..."
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructurePanel;
