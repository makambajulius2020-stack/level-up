import React, { useState, useEffect } from 'react';
import EnhancedPaymentHistoryPanel from './EnhancedPaymentHistoryPanel';
import { 
  CreditCard, DollarSign, Calendar, Clock, CheckCircle, 
  AlertTriangle, Download, Eye, Phone, MessageSquare,
  Receipt, Wallet, TrendingUp, BarChart3, Plus
} from 'lucide-react';

const FeeBalancePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('balance');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentAnalytics, setPaymentAnalytics] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch payment data from backend
  useEffect(() => {
    if (activeTab === 'history') {
      fetchPaymentHistory();
    }
  }, [activeTab, searchTerm, statusFilter, methodFilter, termFilter]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (methodFilter !== 'all') params.append('method', methodFilter);
      if (termFilter !== 'all') params.append('academic_term', termFilter);
      
      // Use enhanced payment API
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/enhanced-payments/student/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setPaymentHistory(data.payments || []);
        setPaymentAnalytics(data.summary || {});
        
        // Also fetch analytics for more detailed insights
        const analyticsResponse = await fetch(`${baseUrl}/api/enhanced-payments/student/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setPaymentAnalytics(prev => ({
            ...prev,
            ...analyticsData.analytics
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPaymentHistory = async () => {
    try {
      // Try to fetch payment data from the backend
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      // First try the enhanced payments endpoint
      let response = await fetch(`${baseUrl}/api/enhanced-payments/student`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      let paymentData = [];
      
      if (response.ok) {
        const data = await response.json();
        paymentData = data.payment_history || [];
      } else {
        // Fallback to regular payments endpoint
        response = await fetch(`${baseUrl}/api/payments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          paymentData = data.data || [];
        }
      }
      
      // If no data from API, bail gracefully with empty CSV
      if (paymentData.length === 0) {
        alert('No payment history found to export.');
        return;
      }
      
      // Create CSV content
      const csvHeaders = ['Date', 'Amount (UGX)', 'Payment Method', 'Status', 'Description', 'Reference'];
      const csvRows = paymentData.map(payment => [
        payment.date || payment.payment_date || new Date().toISOString().split('T')[0],
        payment.amount || 0,
        payment.method || payment.payment_method || 'N/A',
        payment.status || 'Pending',
        payment.description || payment.fee_type || 'Fee Payment',
        payment.reference || payment.transaction_id || 'N/A'
      ]);
      
      // Convert to CSV format
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_history_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('✅ Payment history exported successfully!');
      
    } catch (error) {
      console.error('Error exporting payment history:', error);
      
      // Fallback: Create a basic CSV with available data
      try {
        const csvHeaders = ['Date', 'Amount (UGX)', 'Payment Method', 'Status', 'Description'];
        const csvRows = [
          [new Date().toISOString().split('T')[0], '0', 'N/A', 'No Data', 'No payment history available']
        ];
        
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('✅ CSV file created (no payment data available)');
      } catch (fallbackError) {
        console.error('Fallback export failed:', fallbackError);
        alert('❌ Error exporting payment history. Please try again.');
      }
    }
  };

  // Live fee data
  const [feeData, setFeeData] = useState({
    balance: {
      totalFees: 0,
      paidAmount: 0,
      outstandingBalance: 0,
      nextPaymentDue: '',
      paymentPlan: '',
      currency: 'UGX'
    },
    breakdown: [],
    paymentHistory: [],
    paymentMethods: []
  });

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const studentId = currentUser?.id;
        // Summary (enhanced)
        const summaryRes = await fetch(`${baseUrl}/api/enhanced-payments/student/summary?student_id=${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Outstanding
        const outstandingRes = await fetch(`${baseUrl}/api/enhanced-payments/student/outstanding?student_id=${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Payment methods
        const methodsRes = await fetch(`${baseUrl}/api/enhanced-payments/methods/available`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const summary = summaryRes.ok ? await summaryRes.json() : null;
        const outstanding = outstandingRes.ok ? await outstandingRes.json() : null;
        const methods = methodsRes.ok ? await methodsRes.json() : null;

        setFeeData(prev => ({
          ...prev,
          balance: {
            totalFees: summary?.summary?.total_paid_this_year + (summary?.summary?.outstanding_fees || 0) || 0,
            paidAmount: summary?.summary?.total_paid_this_year || 0,
            outstandingBalance: summary?.summary?.outstanding_fees || outstanding?.outstanding_fees?.total_outstanding || 0,
            nextPaymentDue: summary?.summary?.next_payment_due || '',
            paymentPlan: summary?.summary?.payment_plan || '',
            currency: 'UGX'
          },
          breakdown: Array.isArray(summary?.summary?.fee_breakdown) ? summary.summary.fee_breakdown : [],
          paymentHistory: Array.isArray(summary?.summary?.recent_payments) ? summary.summary.recent_payments : [],
          paymentMethods: Array.isArray(methods?.methods) ? methods.methods : []
        }));
      } catch (e) {
        console.error('Failed to load fee balance', e);
      }
    };
    loadBalance();
  }, [currentUser]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBalance = () => (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{formatCurrency(feeData.balance.totalFees)}</div>
            <div className="text-blue-100">Total Fees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{formatCurrency(feeData.balance.paidAmount)}</div>
            <div className="text-blue-100">Amount Paid</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{formatCurrency(feeData.balance.outstandingBalance)}</div>
            <div className="text-blue-100">Outstanding Balance</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Payment Progress</span>
            <span>{Math.round((feeData.balance.paidAmount / feeData.balance.totalFees) * 100)}%</span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full"
              style={{ width: `${(feeData.balance.paidAmount / feeData.balance.totalFees) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Payment Alert */}
      {feeData.balance.outstandingBalance > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">Payment Reminder</h3>
          </div>
          <p className="text-yellow-800 mb-4">
            You have an outstanding balance of {formatCurrency(feeData.balance.outstandingBalance)}. 
            Next payment is due on {feeData.balance.nextPaymentDue}.
          </p>
          <div className="flex space-x-3">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              Make Payment
            </button>
            <button className="bg-white text-yellow-600 border border-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors">
              Contact Finance Office
            </button>
          </div>
        </div>
      )}

      {/* Fee Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Fee Breakdown</h3>
        <div className="space-y-4">
          {feeData.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{item.item}</div>
                <div className="text-sm text-gray-600">
                  Due: {item.dueDate === 'Paid' ? 'Completed' : item.dueDate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{formatCurrency(item.amount)}</div>
                <div className="text-sm">
                  <span className="text-green-600">Paid: {formatCurrency(item.paid)}</span>
                  {item.outstanding > 0 && (
                    <span className="text-red-600 ml-2">Due: {formatCurrency(item.outstanding)}</span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                {item.outstanding === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Available Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feeData.paymentMethods.map((method, index) => (
            <div 
              key={index}
              className={`p-4 border-2 rounded-lg transition-all ${
                method.available 
                  ? 'border-gray-200 hover:border-blue-300 cursor-pointer' 
                  : 'border-gray-100 bg-gray-50 opacity-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <method.icon className={`w-6 h-6 ${method.available ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-600">
                    Fee: {method.fee} {!method.available && '(Coming Soon)'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Filter payment history based on search and filters
  const filteredPayments = (paymentHistory.length ? paymentHistory : feeData.paymentHistory).filter(payment => {
    const matchesSearch = payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesMethod = methodFilter === 'all' || payment.method.toLowerCase().includes(methodFilter.toLowerCase());
    const matchesTerm = termFilter === 'all' || payment.term === termFilter;
    
    return matchesSearch && matchesStatus && matchesMethod && matchesTerm;
  });

  // Theming helpers for analytics cards
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-600';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';

  const renderHistory = () => (
    <div className="space-y-6">
      <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Enhanced Payment History</h3>
          <button 
            onClick={exportPaymentHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Enhanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Methods</option>
            <option value="mtn">MTN Mobile Money</option>
            <option value="airtel">Airtel Money</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash Payment</option>
          </select>

          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Terms</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>

        {/* Results Summary */}
        <div className={`mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Showing {filteredPayments.length} of {feeData.paymentHistory.length} payments
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Date</th>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Amount</th>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Method</th>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Fee Type</th>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Term</th>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Reference</th>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Status</th>
                <th className={`text-left py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <tr key={payment.id} className={`border-b transition-colors ${
                  darkMode 
                    ? 'border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}>
                  <td className={`py-3 px-4 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {new Date(payment.date).toLocaleDateString('en-UG', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className={`py-3 px-4 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      {payment.method.includes('MTN') ? <Phone className="w-4 h-4 text-yellow-500" /> :
                       payment.method.includes('Airtel') ? <Phone className="w-4 h-4 text-red-500" /> :
                       payment.method.includes('Bank') ? <CreditCard className="w-4 h-4 text-blue-500" /> :
                       <Wallet className="w-4 h-4 text-green-500" />}
                      <span className="text-sm">{payment.method}</span>
                    </div>
                  </td>
                  <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {payment.feeType}
                    </span>
                  </td>
                  <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {payment.term}
                  </td>
                  <td className={`py-3 px-4 font-mono text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {payment.reference}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'Completed' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {payment.status === 'Pending' && <Clock className="w-3 h-3 inline mr-1" />}
                      {payment.status === 'Failed' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.receiptUrl && (
                        <button 
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className={`py-8 px-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center">
                      <Receipt className="w-12 h-12 mb-4 opacity-50" />
                      <p>No payments found matching your filters</p>
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setMethodFilter('all');
                          setTermFilter('all');
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Payment Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center border`}>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {paymentAnalytics.total_transactions || filteredPayments.length}
          </div>
          <div className={`text-sm ${textMuted}`}>Total Payments</div>
          <div className={`text-xs ${textMuted} mt-1`}>
            {paymentAnalytics.successful_transactions || 0} successful
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center border`}>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(paymentAnalytics.total_spent || paymentAnalytics.total_paid)}
          </div>
          <div className={`text-sm ${textMuted}`}>Total Paid</div>
          <div className={`text-xs ${textMuted} mt-1`}>
            {paymentAnalytics.success_rate ? `${paymentAnalytics.success_rate.toFixed(1)}% success rate` : 'This year'}
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center border`}>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatCurrency(paymentAnalytics.average_payment)}
          </div>
          <div className={`text-sm ${textMuted}`}>Average Payment</div>
          <div className={`text-xs ${textMuted} mt-1`}>
            {paymentAnalytics.payment_frequency || 'Per transaction'}
          </div>
        </div>
        
        <div className={`${cardBg} rounded-xl shadow-lg p-6 text-center border`}>
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {paymentAnalytics.preferred_method || 'MTN MoMo'}
          </div>
          <div className={`text-sm ${textMuted}`}>Preferred Method</div>
          <div className={`text-xs ${textMuted} mt-1`}>
            Most used payment
          </div>
        </div>
      </div>

       
      </div>
    
  );

  const renderPaymentPlan = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6">Payment Schedule</h3>
        
        <div className="space-y-4">
          {/* Payment schedule will be loaded from backend */}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Total Annual Fees:</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(0)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
        <div className="space-y-4">
          {/* Payment options will be loaded from backend */}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Fee Balance</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your school fees and payment history</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'balance', label: 'Current Balance', icon: DollarSign },
              { id: 'history', label: 'Payment History', icon: Receipt }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'balance' && renderBalance()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'enhanced-history' && <EnhancedPaymentHistoryPanel darkMode={darkMode} studentId={currentUser?.id} />}
      {activeTab === 'plan' && renderPaymentPlan()}
    </div>
  );
};

export default FeeBalancePanel;
