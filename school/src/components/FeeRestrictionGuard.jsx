import React, { useState, useEffect } from 'react';
import { Lock, DollarSign, AlertTriangle, CreditCard, Eye, EyeOff, CheckCircle, XCircle, FileText, Smartphone, Building } from 'lucide-react';
import apiService from '../services/api';

const FeeRestrictionGuard = ({ 
  children, 
  userRole, 
  currentUser, 
  darkMode = false, 
  restrictionType = 'performance', // 'performance', 'grades', 'reports'
  onRestrictionBypass = null 
}) => {
  const [feeBalance, setFeeBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Dark mode utility classes
  const containerBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    checkFeeBalance();
  }, [currentUser]);

  const checkFeeBalance = async () => {
    try {
      setLoading(true);
      
      // Get fee balance for the user
      const response = await apiService.getFeeBalance(currentUser?.id);
      
      if (response.success) {
        const balance = response.balance || 0;
        setFeeBalance(balance);
        
        // Check if user has access based on fee balance
        // Access is granted if balance is 0 or if user is admin
        const hasZeroBalance = balance <= 0;
        const isAdmin = userRole === 'admin';
        
        setHasAccess(hasZeroBalance || isAdmin);
      } else {
        // No mock fallback; treat as zero data from backend
        setFeeBalance(0);
        setHasAccess(userRole === 'admin');
      }
    } catch (error) {
      console.error('Error checking fee balance:', error);
      // Default to safe state without injecting demo data
      setFeeBalance(0);
      setHasAccess(userRole === 'admin');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRestrictionMessage = () => {
    switch (restrictionType) {
      case 'performance':
        return {
          title: 'Performance Reports Restricted',
          message: 'You cannot view detailed performance reports until all outstanding fees are cleared.',
          icon: EyeOff
        };
      case 'grades':
        return {
          title: 'Grade Reports Restricted',
          message: 'You cannot view grade reports until all outstanding fees are cleared.',
          icon: Lock
        };
      case 'reports':
        return {
          title: 'Academic Reports Restricted',
          message: 'You cannot view academic reports until all outstanding fees are cleared.',
          icon: FileText
        };
      default:
        return {
          title: 'Access Restricted',
          message: 'You cannot view this content until all outstanding fees are cleared.',
          icon: Lock
        };
    }
  };

  const handleMakePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    // Refresh fee balance
    checkFeeBalance();
  };

  if (loading) {
    return (
      <div className={`${containerBg} min-h-screen p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // If user has access, render the children
  if (hasAccess) {
    return children;
  }

  // If user doesn't have access, show restriction message
  const restriction = getRestrictionMessage();
  const RestrictionIcon = restriction.icon;

  return (
    <div className={`${containerBg} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${cardBg} rounded-xl shadow-lg border p-8 text-center`}>
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <RestrictionIcon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
              {restriction.title}
            </h2>
            <p className={`${textSecondary} mb-6`}>
              {restriction.message}
            </p>
          </div>

          {/* Fee Balance Display */}
          <div className={`${cardBg} rounded-lg border p-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Outstanding Fee Balance</h3>
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold text-red-600 mb-2`}>
                {formatCurrency(feeBalance)}
              </p>
              <p className={`text-sm ${textMuted}`}>
                This amount must be paid in full to access academic reports
              </p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleMakePayment}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <span>Make Payment</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/payments'}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                <span>View Payment Plans</span>
              </button>
            </div>

            <div className="text-center">
              <p className={`text-sm ${textMuted}`}>
                Need help? Contact the finance office at finance@school.edu or call +256 700 000 000
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className={`mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-left">
                <h4 className={`font-semibold text-yellow-800 mb-1`}>Important Notice</h4>
                <p className={`text-sm text-yellow-700`}>
                  According to school policy, students and teachers cannot access detailed academic reports 
                  (including end-of-term results, performance analytics, and grade reports) until all 
                  outstanding fees are cleared. This policy ensures fair access to academic information 
                  for all stakeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Make Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`${textMuted} hover:${textPrimary}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 bg-blue-50 rounded-lg`}>
                <h4 className={`font-semibold ${textPrimary} mb-2`}>Payment Amount</h4>
                <p className={`text-2xl font-bold text-blue-600`}>
                  {formatCurrency(feeBalance)}
                </p>
                <p className={`text-sm ${textMuted}`}>
                  Pay this amount to regain access to academic reports
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    alert('Mobile Money payment integration would be implemented here');
                    handlePaymentComplete();
                  }}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Mobile Money</span>
                </button>
                
                <button
                  onClick={() => {
                    alert('Bank transfer integration would be implemented here');
                    handlePaymentComplete();
                  }}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Building className="w-5 h-5" />
                  <span>Bank Transfer</span>
                </button>
              </div>

              <div className="text-center">
                <p className={`text-sm ${textMuted}`}>
                  Payment will be processed immediately and access will be restored
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeRestrictionGuard;
