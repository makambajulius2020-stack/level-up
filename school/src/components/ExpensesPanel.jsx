import React, { useState } from 'react';
import { Receipt, Plus, Edit, Trash2, Save, X, DollarSign, Calendar, Tag, User, TrendingUp, TrendingDown, Filter, Search } from 'lucide-react';

const ExpensesPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [expenses, setExpenses] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: '',
    amount: '',
    date: '',
    paymentMethod: '',
    vendor: '',
    department: '',
    receiptNumber: ''
  });

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const categories = ['Salaries', 'Equipment', 'Utilities', 'Maintenance', 'Educational Materials', 'Transport', 'Administration', 'Other'];
  const paymentMethods = ['Bank Transfer', 'Cheque', 'Cash', 'Mobile Money', 'Credit Card'];
  const departments = ['Administration', 'Academic Affairs', 'Human Resources', 'Science Department', 'ICT Department', 'Transport', 'Maintenance', 'Finance'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Salaries': 'bg-purple-100 text-purple-800',
      'Equipment': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-orange-100 text-orange-800',
      'Maintenance': 'bg-red-100 text-red-800',
      'Educational Materials': 'bg-green-100 text-green-800',
      'Transport': 'bg-indigo-100 text-indigo-800',
      'Administration': 'bg-gray-100 text-gray-800',
      'Other': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidExpenses = expenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending' || exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);

  const handleAddExpense = () => {
    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      status: 'pending',
      approvedBy: currentUser.name || 'System'
    };
    setExpenses([...expenses, expense]);
    setNewExpense({
      description: '',
      category: '',
      amount: '',
      date: '',
      paymentMethod: '',
      vendor: '',
      department: '',
      receiptNumber: ''
    });
    setShowAddForm(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense.id);
    setNewExpense({
      ...expense,
      amount: expense.amount.toString()
    });
  };

  const handleUpdateExpense = () => {
    setExpenses(expenses.map(expense => 
      expense.id === editingExpense 
        ? { ...newExpense, id: editingExpense, amount: parseFloat(newExpense.amount) }
        : expense
    ));
    setEditingExpense(null);
    setNewExpense({
      description: '',
      category: '',
      amount: '',
      date: '',
      paymentMethod: '',
      vendor: '',
      department: '',
      receiptNumber: ''
    });
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, status: newStatus } : expense
    ));
  };

  // Calculate monthly trends
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  }).reduce((sum, exp) => sum + exp.amount, 0);

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear;
  }).reduce((sum, exp) => sum + exp.amount, 0);

  const monthlyChange = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-4">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Expense Management</h1>
                <p className={`${textSecondary} mt-2`}>Track and manage school expenses and payments</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Expense</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Total Expenses</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2`}>{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Paid Expenses</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2 text-green-600`}>{formatCurrency(paidExpenses)}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Pending Payments</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2 text-yellow-600`}>{formatCurrency(pendingExpenses)}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Monthly Change</p>
                <p className={`${textPrimary} text-2xl font-bold mt-2 ${monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
                </p>
              </div>
              <div className={`${monthlyChange >= 0 ? 'bg-red-100' : 'bg-green-100'} rounded-full p-3`}>
                {monthlyChange >= 0 ? 
                  <TrendingUp className={`w-6 h-6 ${monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'}`} /> :
                  <TrendingDown className={`w-6 h-6 ${monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'}`} />
                }
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${cardBg} rounded-2xl shadow-xl p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                />
              </div>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className={`${cardBg} rounded-2xl shadow-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Description</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Category</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Amount</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Date</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-medium ${textPrimary}`}>{expense.description}</div>
                        <div className={`text-sm ${textMuted}`}>
                          {expense.vendor} • {expense.receiptNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${textPrimary}`}>{formatCurrency(expense.amount)}</div>
                      <div className={`text-sm ${textMuted}`}>{expense.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${textSecondary}`}>{expense.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userRole === 'admin' ? (
                        <select
                          value={expense.status}
                          onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getStatusColor(expense.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="paid">Paid</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {userRole === 'admin' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Expense Modal */}
        {(showAddForm || editingExpense) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Description</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="Expense description"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Amount (UGX)</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="0"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Date</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Payment Method</label>
                    <select
                      value={newExpense.paymentMethod}
                      onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="">Select Payment Method</option>
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Vendor</label>
                    <input
                      type="text"
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                      placeholder="Vendor name"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Department</label>
                    <select
                      value={newExpense.department}
                      onChange={(e) => setNewExpense({...newExpense, department: e.target.value})}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Receipt Number</label>
                    <input
                      type="text"
                      value={newExpense.receiptNumber}
                      onChange={(e) => setNewExpense({...newExpense, receiptNumber: e.target.value})}
                      placeholder="RCP-2024-XXX"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingExpense(null);
                      setNewExpense({
                        description: '',
                        category: '',
                        amount: '',
                        date: '',
                        paymentMethod: '',
                        vendor: '',
                        department: '',
                        receiptNumber: ''
                      });
                    }}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingExpense ? 'Update' : 'Add'} Expense</span>
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

export default ExpensesPanel;
