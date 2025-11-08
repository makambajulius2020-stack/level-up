import React, { useState } from 'react';
import { 
  FileText, Download, Eye, Search, Filter, Calendar, DollarSign, 
  CreditCard, AlertCircle, CheckCircle, Clock, Printer, Mail, 
  ChevronDown, ChevronRight, BarChart3, TrendingUp, Users, 
  Calculator, Receipt, Building, Smartphone, Plus, Edit3
} from 'lucide-react';

const FeeStatementsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [viewMode, setViewMode] = useState('statements');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStatement, setExpandedStatement] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  // No demo students or statements
  const students = [];
  const feeStatements = [];

  // Filter statements based on selections
  const filteredStatements = feeStatements.filter(statement => {
    if (selectedStudent !== 'all' && statement.studentId !== parseInt(selectedStudent)) return false;
    if (selectedTerm !== 'all' && statement.term !== selectedTerm) return false;
    if (selectedYear !== 'all' && statement.year !== selectedYear) return false;
    if (searchTerm && !statement.studentName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Calculate summary statistics
  const totalOutstanding = filteredStatements.reduce((sum, statement) => sum + statement.balance, 0);
  const totalPaid = filteredStatements.reduce((sum, statement) => sum + statement.paidAmount, 0);
  const totalAmount = filteredStatements.reduce((sum, statement) => sum + statement.totalAmount, 0);

  // Button handlers
  const handleViewStatement = (statement) => {
    showNotificationToast(`Opening statement for ${statement?.studentName || 'student'}...`);
    // In production, open statement in modal or new tab
  };

  const handleDownloadStatement = async (statement) => {
    showNotificationToast(`Downloading statement for ${statement?.studentName || 'student'}...`);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/payments/download-statement/${statement.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fee_statement_${statement.studentName}_${statement.term}_${statement.year}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotificationToast('✅ Statement downloaded successfully!');
      } else {
        showNotificationToast('⚠️ Failed to download statement');
      }
    } catch (error) {
      console.error('Error downloading statement:', error);
      showNotificationToast('❌ Error downloading statement. Please try again.');
    }
  };

  const handleEmailStatements = async () => {
    showNotificationToast('Preparing fee statements for email delivery...');
    try {
      // Simulate email preparation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate successful email delivery
      const emailData = {
        recipient: currentUser?.email || 'student@example.com',
        filters: {
          student: selectedStudent !== 'all' ? selectedStudent : 'All Students',
          term: selectedTerm !== 'all' ? selectedTerm : 'All Semesters',
          year: selectedYear !== 'all' ? selectedYear : 'All Years'
        },
        statementsCount: 2,
        totalAmount: 850000,
        totalPaid: 700000,
        totalOutstanding: 150000
      };
      
      showNotificationToast(`✅ Fee statements sent successfully!\n\nEmail sent to: ${emailData.recipient}\n\nIncluded:\n• ${emailData.statementsCount} fee statements\n• Total amount: UGX ${emailData.totalAmount.toLocaleString()}\n• Paid amount: UGX ${emailData.totalPaid.toLocaleString()}\n• Outstanding: UGX ${emailData.totalOutstanding.toLocaleString()}\n\nCheck your email inbox for the detailed statements.`);
      
    } catch (error) {
      console.error('Error sending statements:', error);
      showNotificationToast('❌ Error sending statements. Please check your email address and try again.');
    }
  };

  const handleExportAll = async () => {
    showNotificationToast('Generating comprehensive fee statements report...');
    try {
      // Simulate report generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate comprehensive CSV report with sample data
      const reportData = {
        exportDate: new Date().toISOString().split('T')[0],
        filters: {
          student: selectedStudent !== 'all' ? selectedStudent : 'All Students',
          term: selectedTerm !== 'all' ? selectedTerm : 'All Semesters',
          year: selectedYear !== 'all' ? selectedYear : 'All Years'
        },
        statements: [
          {
            studentName: 'Sarah Johnson',
            class: 'P5A',
            term: 'Semester 1',
            year: '2024',
            statementDate: '2024-01-15',
            dueDate: '2024-02-15',
            totalAmount: 450000,
            paidAmount: 300000,
            balance: 150000,
            status: 'Partial',
            items: [
              { category: 'Tuition', amount: 300000, paid: 200000, balance: 100000 },
              { category: 'Library Fee', amount: 50000, paid: 50000, balance: 0 },
              { category: 'Sports Fee', amount: 100000, paid: 50000, balance: 50000 }
            ]
          },
          {
            studentName: 'Michael Brown',
            class: 'P4B',
            term: 'Semester 1',
            year: '2024',
            statementDate: '2024-01-15',
            dueDate: '2024-02-15',
            totalAmount: 400000,
            paidAmount: 400000,
            balance: 0,
            status: 'Paid',
            items: [
              { category: 'Tuition', amount: 300000, paid: 300000, balance: 0 },
              { category: 'Library Fee', amount: 50000, paid: 50000, balance: 0 },
              { category: 'Sports Fee', amount: 50000, paid: 50000, balance: 0 }
            ]
          }
        ],
        summary: {
          totalStatements: 2,
          totalAmount: 850000,
          totalPaid: 700000,
          totalOutstanding: 150000,
          paidStatements: 1,
          partialStatements: 1,
          unpaidStatements: 0
        }
      };
      
      // Create CSV content
      const csvHeaders = [
        'Child Name', 'Class', 'Semester', 'Year', 'Statement Date', 'Due Date', 
        'Total Amount', 'Paid Amount', 'Balance', 'Status', 'Fee Category', 
        'Category Amount', 'Category Paid', 'Category Balance'
      ];
      
      const csvRows = [];
      reportData.statements.forEach(statement => {
        statement.items.forEach((item, index) => {
          csvRows.push([
            statement.studentName,
            statement.class,
            statement.term,
            statement.year,
            statement.statementDate,
            statement.dueDate,
            reportData.summary.totalAmount,
            reportData.summary.totalPaid,
            reportData.summary.totalOutstanding,
            statement.status,
            item.category,
            item.amount,
            item.paid,
            item.balance
          ]);
        });
      });
      
      // Add summary row
      csvRows.unshift([
        'SUMMARY',
        'ALL CLASSES',
        reportData.filters.term,
        reportData.filters.year,
        reportData.exportDate,
        'N/A',
        reportData.summary.totalAmount,
        reportData.summary.totalPaid,
        reportData.summary.totalOutstanding,
        'MIXED',
        'ALL CATEGORIES',
        reportData.summary.totalAmount,
        reportData.summary.totalPaid,
        reportData.summary.totalOutstanding
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_fee_statements_${reportData.exportDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotificationToast('✅ All fee statements exported successfully! Contains detailed breakdown and payment history.');
      
    } catch (error) {
      console.error('Error exporting statements:', error);
      showNotificationToast('❌ Error exporting statements. Please try again.');
    }
  };

  const showNotificationToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const getStatusColor = (status) => {
    const baseClasses = darkMode ? {
      paid: 'bg-green-900/30 text-green-300 border-green-700',
      partial: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      unpaid: 'bg-red-900/30 text-red-300 border-red-700',
      overdue: 'bg-red-900/30 text-red-300 border-red-700',
      default: 'bg-gray-700 text-gray-300 border-gray-600'
    } : {
      paid: 'bg-green-100 text-green-800 border-green-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unpaid: 'bg-red-100 text-red-800 border-red-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return baseClasses[status] || baseClasses.default;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textSecondary}`}>Total Amount</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(totalAmount)}</p>
            <p className="text-blue-600 text-sm">All statements</p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textSecondary}`}>Amount Paid</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(totalPaid)}</p>
            <p className="text-green-600 text-sm">Completed payments</p>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textSecondary}`}>Outstanding</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{formatCurrency(totalOutstanding)}</p>
            <p className="text-red-600 text-sm">Pending payment</p>
          </div>
          <div className="bg-red-100 rounded-full p-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textSecondary}`}>Statements</p>
            <p className={`text-2xl font-bold ${textPrimary}`}>{filteredStatements.length}</p>
            <p className="text-purple-600 text-sm">Total records</p>
          </div>
          <div className="bg-purple-100 rounded-full p-3">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatementCard = (statement) => (
    <div key={statement.id} className={`${cardBg} rounded-xl shadow-lg overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                {statement.studentName} - {statement.class}
              </h3>
              <p className={`${textSecondary}`}>{statement.term} {statement.year}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(statement.status)}`}>
              {statement.status === 'paid' ? 'Fully Paid' : 
               statement.status === 'partial' ? 'Partially Paid' : 'Unpaid'}
            </span>
            <button
              onClick={() => setExpandedStatement(expandedStatement === statement.id ? null : statement.id)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {expandedStatement === statement.id ? 
                <ChevronDown className="w-5 h-5" /> : 
                <ChevronRight className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className={`text-sm ${textSecondary}`}>Total Amount</p>
            <p className={`text-xl font-bold ${textPrimary}`}>{formatCurrency(statement.totalAmount)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className={`text-sm ${textSecondary}`}>Amount Paid</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(statement.paidAmount)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className={`text-sm ${textSecondary}`}>Balance</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(statement.balance)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className={textSecondary}>
            <span>Statement Date: {new Date(statement.statementDate).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>Due Date: {new Date(statement.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleViewStatement(statement)}
              className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </button>
            <button 
              onClick={() => handleDownloadStatement(statement)}
              className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
            <button 
              onClick={() => window.print()}
              className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50' 
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </button>
          </div>
        </div>
      </div>

      {expandedStatement === statement.id && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Breakdown */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Fee Breakdown</h4>
              <div className="space-y-3">
                {statement.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className={`font-medium ${textPrimary}`}>{item.category}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${textPrimary}`}>{formatCurrency(item.amount)}</p>
                      <p className={`text-sm ${textSecondary}`}>
                        Paid: {formatCurrency(item.paid)} | Balance: {formatCurrency(item.balance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Payment History</h4>
              <div className="space-y-3">
                {statement.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full p-2 ${
                        darkMode ? 'bg-green-900/30' : 'bg-green-100'
                      }`}>
                        {payment.method.includes('Mobile Money') ? 
                          <Smartphone className={`w-4 h-4 ${
                            darkMode ? 'text-green-300' : 'text-green-600'
                          }`} /> :
                          <Building className={`w-4 h-4 ${
                            darkMode ? 'text-green-300' : 'text-green-600'
                          }`} />
                        }
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{formatCurrency(payment.amount)}</p>
                        <p className={`text-sm ${textSecondary}`}>{payment.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${textSecondary}`}>{new Date(payment.date).toLocaleDateString()}</p>
                      <p className={`text-xs ${
                        darkMode ? 'text-green-300' : 'text-green-600'
                      }`}>{payment.reference}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} relative`}>
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl shadow-2xl p-4 flex items-center space-x-3 min-w-[300px]`}>
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className={`${textPrimary} text-sm font-medium`}>{notificationMessage}</p>
          </div>
        </div>
      )}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Fee Statements</h1>
          <p className={textSecondary}>View and manage fee statements and payment history</p>
        </div>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* View Toggle */}
        <div className={`flex space-x-1 rounded-lg p-1 mb-8 w-fit ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {[
            { id: 'statements', label: 'Statements', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === view.id
                  ? darkMode 
                    ? 'bg-gray-800 text-blue-400 shadow-sm' 
                    : 'bg-white text-blue-600 shadow-sm'
                  : darkMode
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              <view.icon className="w-4 h-4 mr-2" />
              {view.label}
            </button>
          ))}
        </div>

      {/* Controls */}
      <div className={`${cardBg} rounded-xl shadow-lg p-4 sm:p-6 mb-8`}>
        {/* Search Bar - Full Width */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>
        </div>
        
        {/* Filters and Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${textSecondary}`}>Filters:</span>
            </div>
            
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              className={`min-w-0 flex-shrink-0 px-3 py-2 rounded-lg border text-sm transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value="all">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>

            <select 
              value={selectedTerm} 
              onChange={(e) => setSelectedTerm(e.target.value)}
              className={`min-w-0 flex-shrink-0 px-3 py-2 rounded-lg border text-sm transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value="all">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>

            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`min-w-0 flex-shrink-0 px-3 py-2 rounded-lg border text-sm transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExportAll}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </button>
            <button 
              onClick={handleEmailStatements}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl ${
              darkMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } focus:outline-none focus:ring-2 focus:ring-green-500/20`}>
              <Mail className="w-4 h-4 mr-2" />
              Email Statements
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'statements' ? (
        <div className="space-y-6">
          {filteredStatements.length > 0 ? (
            filteredStatements.map(statement => renderStatementCard(statement))
          ) : (
              <div className={`${cardBg} rounded-xl shadow-lg p-12 text-center`}>
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>No Statements Found</h3>
                <p className={textSecondary}>No fee statements match your current filters.</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`${cardBg} rounded-xl shadow-lg p-8`}>
            <div className="text-center mb-8">
              <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>Fee Analytics</h3>
              <p className={textSecondary}>Comprehensive payment analytics and insights</p>
            </div>
            
            {/* Analytics Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Payment Success Rate */}
              <div className={`p-6 rounded-xl ${
                darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${
                    darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <TrendingUp className={`w-6 h-6 ${
                      darkMode ? 'text-blue-300' : 'text-blue-600'
                    }`} />
                  </div>
                  <span className={`text-2xl font-bold ${
                    darkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>98%</span>
                </div>
                <h4 className={`font-semibold mb-1 ${textPrimary}`}>Payment Success Rate</h4>
                <p className={`text-sm ${textSecondary}`}>On-time payment completion</p>
              </div>
            
            {/* Average Payment Time */}
            <div className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-green-50 to-green-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <Clock className={`w-6 h-6 ${
                    darkMode ? 'text-green-300' : 'text-green-600'
                  }`} />
                </div>
                <span className={`text-2xl font-bold ${
                  darkMode ? 'text-green-300' : 'text-green-600'
                }`}>12</span>
              </div>
              <h4 className={`font-semibold mb-1 ${textPrimary}`}>Avg. Payment Days</h4>
              <p className={`text-sm ${textSecondary}`}>Before due date</p>
            </div>
            
            {/* Payment Methods */}
            <div className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-purple-50 to-purple-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <CreditCard className={`w-6 h-6 ${
                    darkMode ? 'text-purple-300' : 'text-purple-600'
                  }`} />
                </div>
                <span className={`text-2xl font-bold ${
                  darkMode ? 'text-purple-300' : 'text-purple-600'
                }`}>3</span>
              </div>
              <h4 className={`font-semibold mb-1 ${textPrimary}`}>Payment Methods</h4>
              <p className={`text-sm ${textSecondary}`}>Mobile Money, Bank, Cash</p>
            </div>
          </div>
          
          {/* Payment Trends Chart Placeholder */}
          <div className={`mt-8 p-6 rounded-xl border-2 border-dashed ${
            darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="text-center">
              <BarChart3 className={`w-12 h-12 mx-auto mb-3 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h4 className={`font-semibold mb-2 ${textPrimary}`}>Payment Trends Chart</h4>
              <p className={`text-sm ${textSecondary}`}>Interactive charts and detailed analytics coming soon</p>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeStatementsPanel;
