import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, CreditCard, Clock, CheckCircle, AlertTriangle, Plus, Edit, Trash2, Calculator, TrendingUp, FileText, Download, X } from 'lucide-react';
import apiService from '../services/api';

const FeePaymentPlanPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeStructure, setFeeStructure] = useState(null);
  
  // Fee Calculator state
  const [calculatorForm, setCalculatorForm] = useState({
    studentClass: '',
    term: '1',
    boarding: false,
    meals: true,
    books: true,
    activities: true,
    transport: false,
    uniform: false,
    customFees: []
  });
  
  // Payment Statements state
  const [statements, setStatements] = useState([]);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [statementFilter, setStatementFilter] = useState({
    year: new Date().getFullYear(),
    term: 'all',
    status: 'all'
  });
  
  // Form state for creating/editing plans
  const [planForm, setPlanForm] = useState({
    name: '',
    totalAmount: '',
    installmentCount: 3,
    startDate: '',
    frequency: 'monthly', // monthly, quarterly, termly
    description: '',
    isActive: true
  });

  // Dark mode utility classes
  const containerBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  useEffect(() => {
    fetchPaymentPlans();
    fetchFeeStructure();
    fetchPaymentStatements();
  }, []);

  const fetchPaymentPlans = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPaymentPlans(currentUser?.id);
      if (response.success) {
        setPaymentPlans(response.plans || []);
      } else {
        // Mock data for demonstration
        setPaymentPlans([
          {
            id: 1,
            name: 'Term 1 Payment Plan',
            totalAmount: 450000,
            paidAmount: 150000,
            remainingAmount: 300000,
            installmentCount: 3,
            completedInstallments: 1,
            startDate: '2024-01-15',
            frequency: 'monthly',
            status: 'active',
            installments: [
              { id: 1, amount: 150000, dueDate: '2024-01-15', status: 'paid', paidDate: '2024-01-14' },
              { id: 2, amount: 150000, dueDate: '2024-02-15', status: 'pending', paidDate: null },
              { id: 3, amount: 150000, dueDate: '2024-03-15', status: 'pending', paidDate: null }
            ]
          },
          {
            id: 2,
            name: 'Annual Fee Plan',
            totalAmount: 1200000,
            paidAmount: 300000,
            remainingAmount: 900000,
            installmentCount: 4,
            completedInstallments: 1,
            startDate: '2024-01-01',
            frequency: 'quarterly',
            status: 'active',
            installments: [
              { id: 1, amount: 300000, dueDate: '2024-01-01', status: 'paid', paidDate: '2023-12-28' },
              { id: 2, amount: 300000, dueDate: '2024-04-01', status: 'pending', paidDate: null },
              { id: 3, amount: 300000, dueDate: '2024-07-01', status: 'pending', paidDate: null },
              { id: 4, amount: 300000, dueDate: '2024-10-01', status: 'pending', paidDate: null }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      setPaymentPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStructure = async () => {
    try {
      const response = await apiService.getFeeStructure();
      if (response.success) {
        setFeeStructure(response.feeStructure);
      } else {
        // Mock fee structure
        setFeeStructure({
          tuition: 300000,
          boarding: 200000,
          meals: 100000,
          books: 50000,
          activities: 30000,
          total: 680000
        });
      }
    } catch (error) {
      console.error('Error fetching fee structure:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateInstallmentAmount = (totalAmount, installmentCount) => {
    return Math.ceil(totalAmount / installmentCount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'active':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleCreatePlan = async () => {
    if (!planForm.name || !planForm.totalAmount || !planForm.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const installmentAmount = calculateInstallmentAmount(planForm.totalAmount, planForm.installmentCount);
      const installments = [];
      
      for (let i = 0; i < planForm.installmentCount; i++) {
        const dueDate = new Date(planForm.startDate);
        if (planForm.frequency === 'monthly') {
          dueDate.setMonth(dueDate.getMonth() + i);
        } else if (planForm.frequency === 'quarterly') {
          dueDate.setMonth(dueDate.getMonth() + (i * 3));
        } else if (planForm.frequency === 'termly') {
          dueDate.setMonth(dueDate.getMonth() + (i * 4));
        }

        installments.push({
          id: i + 1,
          amount: installmentAmount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'pending',
          paidDate: null
        });
      }

      const newPlan = {
        ...planForm,
        totalAmount: parseFloat(planForm.totalAmount),
        paidAmount: 0,
        remainingAmount: parseFloat(planForm.totalAmount),
        completedInstallments: 0,
        status: 'active',
        installments
      };

      const response = await apiService.createPaymentPlan(newPlan);
      if (response.success) {
        setPaymentPlans(prev => [...prev, { ...newPlan, id: response.planId }]);
        setActiveTab('overview');
        resetForm();
        alert('Payment plan created successfully!');
      } else {
        alert('Failed to create payment plan');
      }
    } catch (error) {
      console.error('Error creating payment plan:', error);
      alert('Error creating payment plan');
    }
  };

  const resetForm = () => {
    setPlanForm({
      name: '',
      totalAmount: '',
      installmentCount: 3,
      startDate: '',
      frequency: 'monthly',
      description: '',
      isActive: true
    });
  };

  const fetchPaymentStatements = async () => {
    try {
      // Mock payment statements data
      const mockStatements = [
        {
          id: 1,
          studentName: 'John Doe',
          studentId: 'STU001',
          term: 'Term 1',
          year: 2024,
          totalAmount: 680000,
          paidAmount: 450000,
          balance: 230000,
          status: 'partial',
          dueDate: '2024-03-15',
          generatedDate: '2024-01-15',
          payments: [
            { date: '2024-01-15', amount: 200000, method: 'Bank Transfer', reference: 'TXN001' },
            { date: '2024-02-15', amount: 250000, method: 'Mobile Money', reference: 'TXN002' }
          ]
        },
        {
          id: 2,
          studentName: 'John Doe',
          studentId: 'STU001',
          term: 'Term 2',
          year: 2024,
          totalAmount: 680000,
          paidAmount: 680000,
          balance: 0,
          status: 'paid',
          dueDate: '2024-06-15',
          generatedDate: '2024-04-15',
          payments: [
            { date: '2024-04-15', amount: 340000, method: 'Bank Transfer', reference: 'TXN003' },
            { date: '2024-05-15', amount: 340000, method: 'Mobile Money', reference: 'TXN004' }
          ]
        }
      ];
      setStatements(mockStatements);
    } catch (error) {
      console.error('Error fetching payment statements:', error);
      setStatements([]);
    }
  };

  const calculateTotalFees = () => {
    if (!feeStructure) return 0;
    
    let total = 0;
    
    // Base tuition fee based on class
    const classFees = {
      'P1': 250000,
      'P2': 260000,
      'P3': 270000,
      'P4': 280000,
      'P5': 290000,
      'P6': 300000,
      'S1': 320000,
      'S2': 330000,
      'S3': 340000,
      'S4': 350000,
      'S5': 360000,
      'S6': 380000
    };
    
    total += classFees[calculatorForm.studentClass] || 300000;
    
    // Add optional fees
    if (calculatorForm.boarding) total += 200000;
    if (calculatorForm.meals) total += 100000;
    if (calculatorForm.books) total += 50000;
    if (calculatorForm.activities) total += 30000;
    if (calculatorForm.transport) total += 80000;
    if (calculatorForm.uniform) total += 120000;
    
    // Add custom fees
    calculatorForm.customFees.forEach(fee => {
      total += fee.amount || 0;
    });
    
    return total;
  };

  const downloadStatement = (statement) => {
    // Create a simple text-based statement
    const statementText = `
PAYMENT STATEMENT
=================

Student: ${statement.studentName}
Student ID: ${statement.studentId}
Term: ${statement.term} ${statement.year}
Generated: ${statement.generatedDate}
Due Date: ${statement.dueDate}

FEE BREAKDOWN:
Total Amount: ${formatCurrency(statement.totalAmount)}
Paid Amount: ${formatCurrency(statement.paidAmount)}
Balance: ${formatCurrency(statement.balance)}
Status: ${statement.status.toUpperCase()}

PAYMENT HISTORY:
${statement.payments.map(payment => 
  `${payment.date} - ${formatCurrency(payment.amount)} (${payment.method}) - Ref: ${payment.reference}`
).join('\n')}

Generated by Smart School Management System
    `.trim();
    
    const blob = new Blob([statementText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement_${statement.studentId}_${statement.term}_${statement.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Active Plans</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>
            {paymentPlans.filter(plan => plan.status === 'active').length}
          </p>
          <p className={`text-sm ${textMuted}`}>Payment plans in progress</p>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Total Outstanding</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>
            {formatCurrency(paymentPlans.reduce((sum, plan) => sum + plan.remainingAmount, 0))}
          </p>
          <p className={`text-sm ${textMuted}`}>Remaining to be paid</p>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Next Payment</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${textPrimary}`}>
            {(() => {
              const nextInstallment = paymentPlans
                .flatMap(plan => plan.installments)
                .filter(inst => inst.status === 'pending')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
              return nextInstallment ? formatCurrency(nextInstallment.amount) : 'N/A';
            })()}
          </p>
          <p className={`text-sm ${textMuted}`}>Due next</p>
        </div>
      </div>

      {/* Payment Plans List */}
      <div className={`${cardBg} rounded-xl shadow-lg border`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${textPrimary}`}>Your Payment Plans</h3>
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {paymentPlans.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className={`w-16 h-16 mx-auto mb-4 ${textMuted}`} />
              <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No Payment Plans</h3>
              <p className={`${textSecondary} mb-4`}>Create a payment plan to manage your school fees in installments</p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentPlans.map((plan) => (
                <div key={plan.id} className={`p-4 rounded-lg border ${borderColor} ${hoverBg} transition-colors`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${textPrimary}`}>{plan.name}</h4>
                      <p className={`text-sm ${textSecondary}`}>
                        {plan.completedInstallments}/{plan.installmentCount} installments completed
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowEditPlan(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className={`text-sm ${textMuted}`}>Total Amount</p>
                      <p className={`font-semibold ${textPrimary}`}>{formatCurrency(plan.totalAmount)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${textMuted}`}>Paid Amount</p>
                      <p className={`font-semibold text-green-600`}>{formatCurrency(plan.paidAmount)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${textMuted}`}>Remaining</p>
                      <p className={`font-semibold text-red-600`}>{formatCurrency(plan.remainingAmount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(plan.paidAmount / plan.totalAmount) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${textMuted}`}>
                      {plan.frequency} installments • Started {new Date(plan.startDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => setActiveTab('details')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreatePlan = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
      <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Create Payment Plan</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Plan Name *
            </label>
            <input
              type="text"
              value={planForm.name}
              onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Term 1 Payment Plan"
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Total Amount (UGX) *
            </label>
            <input
              type="number"
              value={planForm.totalAmount}
              onChange={(e) => setPlanForm(prev => ({ ...prev, totalAmount: e.target.value }))}
              placeholder="450000"
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Number of Installments
            </label>
            <select
              value={planForm.installmentCount}
              onChange={(e) => setPlanForm(prev => ({ ...prev, installmentCount: parseInt(e.target.value) }))}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value={2}>2 installments</option>
              <option value={3}>3 installments</option>
              <option value={4}>4 installments</option>
              <option value={6}>6 installments</option>
              <option value={12}>12 installments</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Payment Frequency
            </label>
            <select
              value={planForm.frequency}
              onChange={(e) => setPlanForm(prev => ({ ...prev, frequency: e.target.value }))}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="termly">Termly</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Start Date *
            </label>
            <input
              type="date"
              value={planForm.startDate}
              onChange={(e) => setPlanForm(prev => ({ ...prev, startDate: e.target.value }))}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Description (Optional)
          </label>
          <textarea
            value={planForm.description}
            onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Additional notes about this payment plan..."
            rows={3}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        {/* Payment Preview */}
        {planForm.totalAmount && planForm.installmentCount && (
          <div className={`p-4 rounded-lg border ${borderColor} bg-blue-50 dark:bg-blue-900/20`}>
            <h4 className={`font-semibold ${textPrimary} mb-2`}>Payment Preview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${textMuted}`}>Total Amount</p>
                <p className={`font-semibold ${textPrimary}`}>{formatCurrency(planForm.totalAmount)}</p>
              </div>
              <div>
                <p className={`text-sm ${textMuted}`}>Installment Amount</p>
                <p className={`font-semibold ${textPrimary}`}>
                  {formatCurrency(calculateInstallmentAmount(planForm.totalAmount, planForm.installmentCount))}
                </p>
              </div>
              <div>
                <p className={`text-sm ${textMuted}`}>Frequency</p>
                <p className={`font-semibold ${textPrimary}`}>{planForm.frequency}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border ${borderColor} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePlan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Plan
          </button>
        </div>
      </div>
    </div>
  );

  const renderFeeCalculator = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${textPrimary}`}>Fee Calculator</h3>
        <Calculator className="w-6 h-6 text-blue-600" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Student Class
            </label>
            <select
              value={calculatorForm.studentClass}
              onChange={(e) => setCalculatorForm(prev => ({ ...prev, studentClass: e.target.value }))}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">Select Class</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
              <option value="Graduate">Graduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Semester
            </label>
            <select
              value={calculatorForm.term}
              onChange={(e) => setCalculatorForm(prev => ({ ...prev, term: e.target.value }))}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>

          <div>
            <h4 className={`text-lg font-medium ${textPrimary} mb-4`}>Optional Fees</h4>
            <div className="space-y-3">
              {[
                { key: 'boarding', label: 'Boarding', amount: 200000 },
                { key: 'meals', label: 'Meals', amount: 100000 },
                { key: 'books', label: 'Books & Supplies', amount: 50000 },
                { key: 'activities', label: 'Extra Activities', amount: 30000 },
                { key: 'transport', label: 'Transport', amount: 80000 },
                { key: 'uniform', label: 'Uniform', amount: 120000 }
              ].map((fee) => (
                <label key={fee.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={calculatorForm[fee.key]}
                      onChange={(e) => setCalculatorForm(prev => ({ ...prev, [fee.key]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`${textPrimary}`}>{fee.label}</span>
                  </div>
                  <span className={`${textSecondary}`}>{formatCurrency(fee.amount)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Results */}
        <div className="space-y-6">
          <div className={`${cardBg} rounded-xl border p-6`}>
            <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Fee Breakdown</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`${textSecondary}`}>Base Tuition</span>
                <span className={`${textPrimary} font-medium`}>
                  {formatCurrency(calculatorForm.studentClass ? 
                    (calculatorForm.studentClass.startsWith('P') ? 
                      (250000 + (parseInt(calculatorForm.studentClass.slice(1)) - 1) * 10000) :
                      (320000 + (parseInt(calculatorForm.studentClass.slice(1)) - 1) * 10000)
                    ) : 300000
                  )}
                </span>
              </div>
              
              {calculatorForm.boarding && (
                <div className="flex justify-between items-center">
                  <span className={`${textSecondary}`}>Boarding</span>
                  <span className={`${textPrimary} font-medium`}>{formatCurrency(200000)}</span>
                </div>
              )}
              
              {calculatorForm.meals && (
                <div className="flex justify-between items-center">
                  <span className={`${textSecondary}`}>Meals</span>
                  <span className={`${textPrimary} font-medium`}>{formatCurrency(100000)}</span>
                </div>
              )}
              
              {calculatorForm.books && (
                <div className="flex justify-between items-center">
                  <span className={`${textSecondary}`}>Books & Supplies</span>
                  <span className={`${textPrimary} font-medium`}>{formatCurrency(50000)}</span>
                </div>
              )}
              
              {calculatorForm.activities && (
                <div className="flex justify-between items-center">
                  <span className={`${textSecondary}`}>Extra Activities</span>
                  <span className={`${textPrimary} font-medium`}>{formatCurrency(30000)}</span>
                </div>
              )}
              
              {calculatorForm.transport && (
                <div className="flex justify-between items-center">
                  <span className={`${textSecondary}`}>Transport</span>
                  <span className={`${textPrimary} font-medium`}>{formatCurrency(80000)}</span>
                </div>
              )}
              
              {calculatorForm.uniform && (
                <div className="flex justify-between items-center">
                  <span className={`${textSecondary}`}>Uniform</span>
                  <span className={`${textPrimary} font-medium`}>{formatCurrency(120000)}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-semibold ${textPrimary}`}>Total Fees</span>
                  <span className={`text-xl font-bold text-blue-600`}>{formatCurrency(calculateTotalFees())}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-xl border p-6`}>
            <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Payment Options</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className={`${textPrimary}`}>Full Payment</span>
                <span className={`font-semibold ${textPrimary}`}>{formatCurrency(calculateTotalFees())}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className={`${textPrimary}`}>2 Installments</span>
                <span className={`font-semibold ${textPrimary}`}>{formatCurrency(Math.ceil(calculateTotalFees() / 2))}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className={`${textPrimary}`}>3 Installments</span>
                <span className={`font-semibold ${textPrimary}`}>{formatCurrency(Math.ceil(calculateTotalFees() / 3))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentStatements = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${textPrimary}`}>Payment Statements</h3>
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Year</label>
          <select
            value={statementFilter.year}
            onChange={(e) => setStatementFilter(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Term</label>
          <select
            value={statementFilter.term}
            onChange={(e) => setStatementFilter(prev => ({ ...prev, term: e.target.value }))}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Terms</option>
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Status</label>
          <select
            value={statementFilter.status}
            onChange={(e) => setStatementFilter(prev => ({ ...prev, status: e.target.value }))}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Statements List */}
      <div className="space-y-4">
        {statements
          .filter(statement => {
            if (statementFilter.year !== statement.year) return false;
            if (statementFilter.term !== 'all' && !statement.term.includes(statementFilter.term)) return false;
            if (statementFilter.status !== 'all' && statement.status !== statementFilter.status) return false;
            return true;
          })
          .map((statement) => (
          <div key={statement.id} className={`${cardBg} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h4 className={`text-lg font-semibold ${textPrimary}`}>
                    {statement.term} {statement.year}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statement.status === 'paid' ? 'bg-green-100 text-green-800' :
                    statement.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {statement.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className={`${textSecondary}`}>Total:</span>
                    <span className={`${textPrimary} font-medium ml-1`}>{formatCurrency(statement.totalAmount)}</span>
                  </div>
                  <div>
                    <span className={`${textSecondary}`}>Paid:</span>
                    <span className={`${textPrimary} font-medium ml-1`}>{formatCurrency(statement.paidAmount)}</span>
                  </div>
                  <div>
                    <span className={`${textSecondary}`}>Balance:</span>
                    <span className={`${textPrimary} font-medium ml-1`}>{formatCurrency(statement.balance)}</span>
                  </div>
                  <div>
                    <span className={`${textSecondary}`}>Due:</span>
                    <span className={`${textPrimary} font-medium ml-1`}>{statement.dueDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedStatement(statement)}
                  className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => downloadStatement(statement)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {statements.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className={`${textSecondary}`}>No payment statements found</p>
          </div>
        )}
      </div>

      {/* Statement Details Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>Statement Details</h3>
              <button
                onClick={() => setSelectedStatement(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`${textSecondary}`}>Student:</span>
                  <span className={`${textPrimary} font-medium ml-1`}>{selectedStatement.studentName}</span>
                </div>
                <div>
                  <span className={`${textSecondary}`}>Student ID:</span>
                  <span className={`${textPrimary} font-medium ml-1`}>{selectedStatement.studentId}</span>
                </div>
                <div>
                  <span className={`${textSecondary}`}>Term:</span>
                  <span className={`${textPrimary} font-medium ml-1`}>{selectedStatement.term} {selectedStatement.year}</span>
                </div>
                <div>
                  <span className={`${textSecondary}`}>Due Date:</span>
                  <span className={`${textPrimary} font-medium ml-1`}>{selectedStatement.dueDate}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className={`font-semibold ${textPrimary} mb-2`}>Payment History</h4>
                <div className="space-y-2">
                  {selectedStatement.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <span className={`${textPrimary}`}>{payment.date}</span>
                        <span className={`${textSecondary} ml-2`}>({payment.method})</span>
                      </div>
                      <div className="text-right">
                        <span className={`${textPrimary} font-medium`}>{formatCurrency(payment.amount)}</span>
                        <div className={`text-xs ${textMuted}`}>Ref: {payment.reference}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={`${containerBg} min-h-screen p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerBg} min-h-screen p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Fee Payment Plans</h1>
          <p className={`${textSecondary}`}>Create and manage installment payment plans for school fees</p>
        </div>

        {/* Navigation Tabs */}
        <div className={`${cardBg} rounded-xl shadow-lg mb-6 border`}>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'create', label: 'Create Plan', icon: Plus },
                { id: 'calculator', label: 'Fee Calculator', icon: Calculator },
                { id: 'statements', label: 'Statements', icon: FileText }
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

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'create' && renderCreatePlan()}
        {activeTab === 'calculator' && renderFeeCalculator()}
        {activeTab === 'statements' && renderPaymentStatements()}
      </div>
    </div>
  );
};

export default FeePaymentPlanPanel;

