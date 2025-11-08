import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, CheckCircle, AlertTriangle, Download, Eye, Smartphone, Building, Calendar, Plus, TrendingUp, X } from 'lucide-react';
import apiService from '../services/api';
import FeePaymentPlanPanel from './FeePaymentPlanPanel';

const PaymentPanel = ({ userRole, currentUser, darkMode = false, setActiveTab: parentSetActiveTab, appActiveTab }) => {
  const user = currentUser;
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [studentNumber, setStudentNumber] = useState('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  useEffect(() => {
    // If parent provides appActiveTab (app-level navigation), map it to local panel tabs
    if (appActiveTab) {
      // Map app-level tab names to PaymentPanel local tab ids
      if (appActiveTab === 'payment-history') setActiveTab('history');
      else if (appActiveTab === 'payments') setActiveTab('methods');
      // otherwise leave as-is
    }

    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        
        // Test Python backend connection
        const healthCheck = await apiService.healthCheck();
        console.log('Python Backend Status:', healthCheck);
        
        // Get payment history from real backend
        const paymentData = await apiService.getPayments();
        console.log('Payment Data:', paymentData);
        
        if (paymentData.success) {
          setPaymentHistory(paymentData.payments);
          setPaymentSummary(paymentData.summary);
        }

        // Fetch bank accounts
        const bankResponse = await fetch('http://localhost:5000/api/bank-accounts');
        const bankData = await bankResponse.json();
        if (bankData.success) {
          setBankAccounts(bankData.data || []);
        }

        // Fetch student number
        if (currentUser?.id) {
          const studentResponse = await fetch(`http://localhost:5000/api/students/${currentUser.id}`);
          const studentData = await studentResponse.json();
          if (studentData.success && studentData.student) {
            setStudentNumber(studentData.student.admission_number || studentData.student.student_id || '');
          }
        }
        
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
        // Show empty state - no fake data
        setPaymentHistory([]);
        setPaymentSummary({
          total_payments: 0,
          total_paid: 0,
          total_pending: 0,
          payment_success_rate: 0
        });
        setBankAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [currentUser, appActiveTab]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Dark mode utility classes
  const containerBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'refunds':
        return (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-4`}>Refunds Management</h2>
              <p className={`${textSecondary} mb-6`}>Process and manage refund requests</p>
              
              {/* Refund Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Pending Refunds</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Processing</p>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Completed</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Total Refunded</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(0)}</p>
                </div>
              </div>

              {/* Refund Requests Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Student</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Course</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Amount</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Reason</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Status</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" className={`text-center py-8 ${textSecondary}`}>
                        No refund requests at this time
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'payouts':
        return (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-4`}>Payouts Management</h2>
              <p className={`${textSecondary} mb-6`}>Manage instructor and affiliate payouts</p>
              
              {/* Payout Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Pending Payouts</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Completed</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Total Paid</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(0)}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>This Month</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(0)}</p>
                </div>
              </div>

              {/* Payouts Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Instructor</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Course</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Amount</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Date</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Status</th>
                      <th className={`text-left py-3 px-4 ${textPrimary} font-semibold`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" className={`text-center py-8 ${textSecondary}`}>
                        No payouts at this time
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'methods':
        return (
          <div className="space-y-6">
            {/* Payment Methods Tab Content */}
            <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Payment Methods</h2>
                <p className={`${textSecondary}`}>Make a secure payment using your credit or debit card</p>
              </div>

              {/* Payment Button */}
              <div className="flex justify-center items-center py-12">
                <button 
                  onClick={() => {
                    setSelectedPaymentMethod('card');
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold text-lg shadow-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            {/* Payment History Tab Content */}
            <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Payment History</h2>
                <button 
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + "Date,Description,Amount,Status\n"
                      + paymentHistory.map(p => `${p.date},${p.description},${p.amount},${p.status}`).join("\n");
                    const link = document.createElement("a");
                    link.setAttribute("href", encodeURI(csvContent));
                    link.setAttribute("download", `payment_history_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>

              <div className="space-y-4">
                {paymentHistory.length > 0 ? (
                  paymentHistory.map((payment) => (
                    <div key={payment.id} className={`flex items-center justify-between p-4 rounded-lg border ${borderColor} ${cardBg}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          payment.status === 'completed' ? 'bg-green-500' : 
                          payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{formatCurrency(payment.amount)}</p>
                          <p className={`text-sm ${textSecondary}`}>{payment.method} • {payment.fee_type}</p>
                          <p className={`text-xs ${textMuted}`}>
                            {new Date(payment.initiated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                        <button className={`p-2 ${textMuted} hover:${textPrimary}`}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
                    <p className={`${textSecondary} text-lg font-medium`}>No payment history yet</p>
                    <p className={`${textMuted} text-sm mt-2`}>Your payment transactions will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default: // overview
        return (
          <div className="space-y-6">
            {/* Fee Balance Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Fee Balance Overview</h2>
                  <p className="text-blue-100">Current outstanding fees and payment status</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Current Balance</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(paymentSummary?.total_pending || 0)}
                      </p>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-yellow-300" />
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Overdue Amount</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency((paymentSummary?.total_overdue ?? paymentSummary?.total_pending) || 0)}
                      </p>
                    </div>
                    <Clock className="w-6 h-6 text-red-300" />
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Next Due Date</p>
                      <p className="text-lg font-semibold">
                        {paymentSummary?.next_due_date 
                          ? new Date(paymentSummary.next_due_date).toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-300" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
                <p className="text-sm text-blue-100">
                  <strong>Payment Status:</strong> You have outstanding fees for Term 3. Please make payment to avoid late fees.
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            {paymentSummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Payments</p>
                      <p className="text-2xl font-bold text-blue-600">{paymentSummary.total_payments}</p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Paid</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(paymentSummary.total_paid)}</p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(paymentSummary.total_pending)}</p>
                    </div>
                    <div className="bg-yellow-100 rounded-full p-3">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-600">{paymentSummary.payment_success_rate}%</p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Payment */}
            <div className={`mt-8 ${cardBg} rounded-xl shadow-lg p-6 border`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Make a Payment</h3>
              <p className={`${textSecondary} mb-6`}>Pay your outstanding fees securely using your credit or debit card</p>
              <div className="flex justify-center">
                <button 
                  onClick={() => {
                    setSelectedPaymentMethod('card');
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold text-lg shadow-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`${containerBg} min-h-screen p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Payment Management</h1>
          <p className={`${textSecondary}`}>Manage your school fee payments and view transaction history</p>
        </div>

        {/* Navigation Tabs */}
        <div className={`${cardBg} rounded-xl shadow-lg mb-6 border`}>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'history', label: 'Payment History', icon: Clock },
                { id: 'methods', label: 'Payment Methods', icon: CreditCard },
                { id: 'refunds', label: 'Refunds', icon: AlertTriangle },
                { id: 'payouts', label: 'Payouts', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    // Only use parent navigation for specific tabs that have app-level equivalents
                    if (userRole === 'admin' && typeof parentSetActiveTab === 'function') {
                      if (tab.id === 'history') {
                        parentSetActiveTab('payment-history');
                      } else {
                        // For overview and methods, stay within PaymentPanel
                        setActiveTab(tab.id);
                      }
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
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

        {/* Tab Content */}
        {renderTabContent()}

        {/* Payment Modal - Same as Enroll Now */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
            <div className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden transition-colors ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Payment Checkout
                </div>
                <button 
                  aria-label="Close" 
                  onClick={() => setShowPaymentModal(false)} 
                  className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const formData = new FormData(e.target);
                    const cardholderName = formData.get('cardholderName') || e.target.querySelector('input[placeholder="Jane Doe"]')?.value || '';
                    const cardNumber = formData.get('cardNumber') || e.target.querySelector('input[placeholder*="4242"]')?.value || '';
                    const expiry = formData.get('expiry') || e.target.querySelector('input[placeholder="MM/YY"]')?.value || '';
                    const cvc = formData.get('cvc') || e.target.querySelector('input[placeholder="123"]')?.value || '';
                    
                    // Extract amount from payment summary
                    const amountStr = paymentSummary?.outstanding_balance || '0';
                    const amount = parseFloat(amountStr.replace(/[^\d.]/g, '')) || 0;
                    
                    if (amount <= 0) {
                      alert('No outstanding balance to pay');
                      return;
                    }
                    
                    // Get token for authentication
                    const token = localStorage.getItem('token');
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    
                    // Process payment through API
                    const response = await fetch(`${baseUrl}/api/payments/initiate`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        amount: amount,
                        method: 'stripe', // Credit card payment
                        fee_type: 'tuition',
                        description: 'School Fee Payment',
                        cardholder_name: cardholderName,
                        card_number: cardNumber.replace(/\s/g, ''),
                        expiry: expiry,
                        cvc: cvc
                      })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      alert('✅ Payment processed successfully!');
                      setShowPaymentModal(false);
                      setSelectedPaymentMethod(null);
                      // Reload payment data
                      window.location.reload();
                    } else {
                      alert(`❌ Payment failed: ${result.message || 'Please try again'}`);
                    }
                  } catch (error) {
                    console.error('Payment error:', error);
                    alert('❌ Payment processing error. Please try again.');
                  }
                }} 
                className="p-5 space-y-4"
              >
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {paymentSummary?.outstanding_balance || 'UGX 0'}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Outstanding Fee Balance
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <label className="text-sm">
                    <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cardholder Name</span>
                    <input 
                      required 
                      name="cardholderName"
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                      placeholder="Jane Doe" 
                    />
                  </label>
                  <label className="text-sm">
                    <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Card Number</span>
                    <input 
                      required 
                      name="cardNumber"
                      inputMode="numeric" 
                      pattern="[0-9 ]{12,23}" 
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                      placeholder="4242 4242 4242 4242" 
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expiry</span>
                      <input 
                        required 
                        name="expiry"
                        className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                        placeholder="MM/YY" 
                      />
                    </label>
                    <label className="text-sm">
                      <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>CVC</span>
                      <input 
                        required 
                        name="cvc"
                        inputMode="numeric" 
                        pattern="[0-9]{3,4}" 
                        className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                        placeholder="123" 
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowPaymentModal(false)} 
                    className={`px-4 py-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-70 hover:opacity-90"
                  >
                    Pay Now
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Copy Notification */}
        {showCopyNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Student Number copied to clipboard!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPanel;