import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, DollarSign, Clock, Users, CheckCircle, XCircle, 
  AlertTriangle, Calendar, Filter, Download, Eye, TrendingUp, 
  BarChart3, RefreshCw, Search, User, Calculator, FileText, Plus,
  Edit, Trash2, Save, X, Shield, CreditCard, Receipt, Settings,
  Building, Phone, Mail, MapPin, CreditCard as IdCard, Briefcase, Award
} from 'lucide-react';

const BiometricPayrollPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('payroll'); // payroll, employees, reports, settings
  const [payrollData, setPayrollData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);
  
  const [stats, setStats] = useState({
    totalStaff: 0,
    processed: 0,
    pending: 0,
    totalAmount: 0,
    averageSalary: 0,
    totalTaxes: 0,
    totalBenefits: 0
  });

  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    department: '',
    hireDate: '',
    basicSalary: 0,
    taxId: '',
    bankAccount: '',
    benefits: {
      healthInsurance: 0,
      retirementPlan: 0,
      lifeInsurance: 0,
      otherBenefits: 0
    },
    deductions: {
      incomeTax: 0,
      socialSecurity: 0,
      otherDeductions: 0
    }
  });

  // Dark mode utility classes
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBase = 'w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const inputField = darkMode 
    ? `${inputBase} bg-gray-700 border border-gray-600 text-white placeholder-gray-300`
    : `${inputBase} bg-white border border-gray-300 text-gray-900 placeholder-gray-500`;

  useEffect(() => {
    if (activeTab === 'payroll') {
      loadPayrollData();
    } else if (activeTab === 'employees') {
      loadEmployees();
    }
  }, [selectedMonth, activeTab]);

  useEffect(() => {
    filterData();
  }, [payrollData, searchTerm, selectedStatus]);

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      // Start with empty data - no demo data
      setPayrollData([]);
      setStats({
        totalStaff: 0,
        processed: 0,
        pending: 0,
        totalAmount: 0,
        averageSalary: 0,
        totalTaxes: 0,
        totalBenefits: 0
      });
    } catch (error) {
      console.error('Error loading payroll data:', error);
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Start with empty data - no demo data
      setEmployees([]);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = payrollData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredData(filtered);
  };

  const handleCreateEmployee = async () => {
    try {
      const employee = {
        id: Date.now(),
        employeeId: newEmployee.employeeId,
        fullName: `${newEmployee.firstName} ${newEmployee.lastName}`,
        ...newEmployee,
        createdAt: new Date().toISOString()
      };

      setEmployees(prev => [...prev, employee]);
      setIsCreatingEmployee(false);
      setNewEmployee({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        position: '',
        department: '',
        hireDate: '',
        basicSalary: 0,
        taxId: '',
        bankAccount: '',
        benefits: {
          healthInsurance: 0,
          retirementPlan: 0,
          lifeInsurance: 0,
          otherBenefits: 0
        },
        deductions: {
          incomeTax: 0,
          socialSecurity: 0,
          otherDeductions: 0
        }
      });
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, ...selectedEmployee }
          : emp
      ));
      setIsEditingEmployee(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const calculateGrossPay = (employee, attendanceHours, expectedHours) => {
    const hourlyRate = employee.basicSalary / (expectedHours || 160);
    const regularHours = Math.min(attendanceHours, expectedHours);
    const overtimeHours = Math.max(0, attendanceHours - expectedHours);
    const overtimeRate = hourlyRate * 1.5;

    return {
      regularPay: regularHours * hourlyRate,
      overtimePay: overtimeHours * overtimeRate,
      totalGrossPay: (regularHours * hourlyRate) + (overtimeHours * overtimeRate)
    };
  };

  const calculateDeductions = (employee, grossPay) => {
    const incomeTax = grossPay * (employee.deductions.incomeTax / 100);
    const socialSecurity = grossPay * (employee.deductions.socialSecurity / 100);
    const otherDeductions = employee.deductions.otherDeductions;

    return {
      incomeTax,
      socialSecurity,
      otherDeductions,
      totalDeductions: incomeTax + socialSecurity + otherDeductions
    };
  };

  const calculateNetPay = (grossPay, deductions) => {
    return grossPay - deductions.totalDeductions;
  };

  const processPayrollForEmployee = async (employee) => {
    try {
      setIsProcessingPayroll(true);
      
      // Simulate biometric attendance data
      const attendanceHours = 160; // Standard monthly hours
      const expectedHours = 160;
      const biometricLogs = [
        { date: '2024-01-01', checkIn: '08:00', checkOut: '17:00', hours: 8 },
        { date: '2024-01-02', checkIn: '08:00', checkOut: '17:00', hours: 8 }
      ];

      const grossPayCalc = calculateGrossPay(employee, attendanceHours, expectedHours);
      const deductionsCalc = calculateDeductions(employee, grossPayCalc.totalGrossPay);
      const netPay = calculateNetPay(grossPayCalc.totalGrossPay, deductionsCalc);

      const payrollEntry = {
        id: Date.now(),
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        position: employee.position,
        department: employee.department,
        month: selectedMonth,
        attendanceHours,
        expectedHours,
        attendanceRate: (attendanceHours / expectedHours) * 100,
        biometricLogs,
        grossPay: grossPayCalc.totalGrossPay,
        deductions: deductionsCalc,
        netPay,
        status: 'processed',
        processedDate: new Date().toISOString().split('T')[0],
        payStubGenerated: true,
        directDeposit: true
      };

      setPayrollData(prev => [...prev, payrollEntry]);
    } catch (error) {
      console.error('Error processing payroll:', error);
    }
  };

  const generatePayStub = (payrollEntry) => {
    // Generate pay stub data
    const payStub = {
      employeeName: payrollEntry.employeeName,
      employeeId: payrollEntry.employeeId,
      payPeriod: payrollEntry.month,
      grossPay: payrollEntry.grossPay,
      deductions: payrollEntry.deductions,
      netPay: payrollEntry.netPay,
      generatedDate: new Date().toISOString().split('T')[0]
    };
    
    // In a real system, this would generate a PDF or send to printer
    console.log('Pay Stub Generated:', payStub);
    alert('Pay stub generated successfully!');
  };

  const generateTaxReport = () => {
    const taxReport = {
      reportPeriod: selectedMonth,
      totalEmployees: payrollData.length,
      totalGrossPay: payrollData.reduce((sum, p) => sum + p.grossPay, 0),
      totalTaxes: payrollData.reduce((sum, p) => sum + p.deductions.incomeTax, 0),
      totalSocialSecurity: payrollData.reduce((sum, p) => sum + p.deductions.socialSecurity, 0),
      generatedDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('Tax Report Generated:', taxReport);
    alert('Tax report generated successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
                Biometric Payroll System
              </h1>
              <p className={`${textSecondary}`}>
                Comprehensive payroll management with biometric attendance integration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => loadPayrollData()}
                className={`${cardBg} p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow`}
              >
                <RefreshCw className={`w-5 h-5 ${textPrimary}`} />
              </button>
              <button
                onClick={generateTaxReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Tax Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`${cardBg} rounded-xl shadow-lg mb-6`}>
          <div className="flex space-x-1 p-1">
            {[
              { id: 'payroll', label: 'Payroll Processing', icon: Calculator },
              { id: 'employees', label: 'Employee Management', icon: Users },
              { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
              { id: 'settings', label: 'System Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : `${textSecondary} hover:${textPrimary}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payroll Processing Tab */}
        {activeTab === 'payroll' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-xs ${textMuted}`}>Total Staff</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>{stats.totalStaff}</p>
                  </div>
                </div>
              </div>
              
              <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-xs ${textMuted}`}>Processed</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>{stats.processed}</p>
                  </div>
                </div>
              </div>
              
              <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-xs ${textMuted}`}>Pending</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>{stats.pending}</p>
                  </div>
                </div>
              </div>
              
              <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-xs ${textMuted}`}>Total Amount</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>
                      {stats.totalAmount.toLocaleString()} UGX
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-xs ${textMuted}`}>Total Taxes</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>
                      {stats.totalTaxes.toLocaleString()} UGX
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-xs ${textMuted}`}>Total Benefits</p>
                    <p className={`text-lg font-bold ${textPrimary}`}>
                      {stats.totalBenefits.toLocaleString()} UGX
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 ${inputField}`}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className={`w-4 h-4 ${textMuted}`} />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={inputField}
                  />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={inputField}
                >
                  <option value="all">All Status</option>
                  <option value="processed">Processed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Payroll Data Table */}
            <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden`}>
              <div className="p-6 border-b border-gray-200">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Payroll Records</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Employee
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Attendance
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Gross Pay
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Deductions
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Net Pay
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={`px-6 py-12 text-center ${textMuted}`}>
                          <div className="flex flex-col items-center">
                            <Calculator className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No payroll data available</p>
                            <p className="text-sm">Add employees and process payroll to see records</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium ${textPrimary}`}>
                                {record.employeeName}
                              </div>
                              <div className={`text-sm ${textMuted}`}>
                                {record.position} • {record.department}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${textPrimary}`}>
                              {record.attendanceHours}h / {record.expectedHours}h
                            </div>
                            <div className={`text-sm ${textMuted}`}>
                              {record.attendanceRate.toFixed(1)}% attendance
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${textPrimary}`}>
                              {record.grossPay.toLocaleString()} UGX
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${textPrimary}`}>
                              {record.deductions.totalDeductions.toLocaleString()} UGX
                            </div>
                            <div className={`text-xs ${textMuted}`}>
                              Tax: {record.deductions.incomeTax.toLocaleString()} UGX
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-bold text-green-600`}>
                              {record.netPay.toLocaleString()} UGX
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => generatePayStub(record)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Generate Pay Stub"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Employee Management Tab */}
        {activeTab === 'employees' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${textPrimary}`}>Employee Management</h3>
              <button
                onClick={() => setIsCreatingEmployee(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

            {/* Employee List */}
            <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Employee
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Position
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Salary
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Hire Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={`px-6 py-12 text-center ${textMuted}`}>
                          <div className="flex flex-col items-center">
                            <Users className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No employees found</p>
                            <p className="text-sm">Add employees to start managing payroll</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium ${textPrimary}`}>
                                {employee.fullName}
                              </div>
                              <div className={`text-sm ${textMuted}`}>
                                {employee.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${textPrimary}`}>
                              {employee.position}
                            </div>
                            <div className={`text-sm ${textMuted}`}>
                              {employee.department}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${textPrimary}`}>
                              {employee.basicSalary.toLocaleString()} UGX
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${textPrimary}`}>
                              {new Date(employee.hireDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsEditingEmployee(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Employee"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => processPayrollForEmployee(employee)}
                                className="text-green-600 hover:text-green-900"
                                title="Process Payroll"
                              >
                                <Calculator className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Reports & Analytics Tab */}
        {activeTab === 'reports' && (
          <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
            <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>Reports & Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className={`text-lg font-medium ${textPrimary} mb-4`}>Payroll Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={textSecondary}>Total Employees:</span>
                    <span className={textPrimary}>{stats.totalStaff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>Total Payroll:</span>
                    <span className={textPrimary}>{stats.totalAmount.toLocaleString()} UGX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>Average Salary:</span>
                    <span className={textPrimary}>{stats.averageSalary.toLocaleString()} UGX</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className={`text-lg font-medium ${textPrimary} mb-4`}>Tax Compliance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={textSecondary}>Total Taxes:</span>
                    <span className={textPrimary}>{stats.totalTaxes.toLocaleString()} UGX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>Total Benefits:</span>
                    <span className={textPrimary}>{stats.totalBenefits.toLocaleString()} UGX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
            <h3 className={`text-xl font-semibold ${textPrimary} mb-6`}>System Settings</h3>
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  className={inputField}
                  placeholder="Enter default tax rate"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Social Security Rate (%)
                </label>
                <input
                  type="number"
                  className={inputField}
                  placeholder="Enter social security rate"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Standard Working Hours per Month
                </label>
                <input
                  type="number"
                  className={inputField}
                  placeholder="Enter standard working hours"
                  defaultValue="160"
                />
              </div>
            </div>
          </div>
        )}

        {/* Create Employee Modal */}
        {isCreatingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${textPrimary}`}>Add New Employee</h3>
                <button
                  onClick={() => setIsCreatingEmployee(false)}
                  className={`${textMuted} hover:${textPrimary}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, employeeId: e.target.value }))}
                    className={inputField}
                    placeholder="EMP001"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                    className={inputField}
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                    className={inputField}
                    placeholder="Doe"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className={inputField}
                    placeholder="john.doe@school.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className={inputField}
                    placeholder="+256 700 000 000"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Position
                  </label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                    className={inputField}
                    placeholder="Teacher"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    className={inputField}
                    placeholder="Mathematics"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, hireDate: e.target.value }))}
                    className={inputField}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Basic Salary (UGX)
                  </label>
                  <input
                    type="number"
                    value={newEmployee.basicSalary}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
                    className={inputField}
                    placeholder="1000000"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Tax ID
                  </label>
                  <input
                    type="text"
                    value={newEmployee.taxId}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, taxId: e.target.value }))}
                    className={inputField}
                    placeholder="TIN123456789"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setIsCreatingEmployee(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEmployee}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {isEditingEmployee && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${cardBg} rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${textPrimary}`}>Edit Employee</h3>
                <button
                  onClick={() => setIsEditingEmployee(false)}
                  className={`${textMuted} hover:${textPrimary}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.employeeId}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, employeeId: e.target.value }))}
                    className={inputField}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.fullName}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, fullName: e.target.value }))}
                    className={inputField}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedEmployee.email}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className={inputField}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Position
                  </label>
                  <input
                    type="text"
                    value={selectedEmployee.position}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, position: e.target.value }))}
                    className={inputField}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Basic Salary (UGX)
                  </label>
                  <input
                    type="number"
                    value={selectedEmployee.basicSalary}
                    onChange={(e) => setSelectedEmployee(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
                    className={inputField}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setIsEditingEmployee(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEmployee}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricPayrollPanel;
