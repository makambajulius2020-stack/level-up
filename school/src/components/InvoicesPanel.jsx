import React, { useState } from 'react';
import { FileText, Plus, Eye, Download, Send, Search, Filter, Calendar, DollarSign, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const InvoicesPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [invoices, setInvoices] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = totalAmount - totalPaid;

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (invoice) => {
    // Simulate PDF download
    alert(`Downloading invoice ${invoice.id} for ${invoice.studentName}`);
  };

  const handleSendInvoice = (invoice) => {
    // Simulate sending invoice
    alert(`Sending invoice ${invoice.id} to ${invoice.studentName}'s registered email`);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Invoice Management</h1>
                <p className={`${textSecondary} mt-2`}>Create, manage, and track student fee invoices</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Create Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className={`${cardBg} rounded-2xl shadow-xl p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`${textMuted} text-xs lg:text-sm font-medium`}>Total Invoices</p>
                <p className={`${textPrimary} text-xl lg:text-2xl font-bold mt-1 lg:mt-2`}>{totalInvoices}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 lg:p-3 flex-shrink-0 ml-2">
                <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`${textMuted} text-xs lg:text-sm font-medium`}>Total Amount</p>
                <p className={`${textPrimary} text-sm lg:text-lg font-bold mt-1 lg:mt-2 truncate`} title={formatCurrency(totalAmount)}>
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-2 lg:p-3 flex-shrink-0 ml-2">
                <DollarSign className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`${textMuted} text-xs lg:text-sm font-medium`}>Amount Paid</p>
                <p className={`${textPrimary} text-sm lg:text-lg font-bold mt-1 lg:mt-2 text-green-600 truncate`} title={formatCurrency(totalPaid)}>
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-2 lg:p-3 flex-shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl shadow-xl p-4 lg:p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`${textMuted} text-xs lg:text-sm font-medium`}>Outstanding</p>
                <p className={`${textPrimary} text-sm lg:text-lg font-bold mt-1 lg:mt-2 text-red-600 truncate`} title={formatCurrency(totalOutstanding)}>
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-2 lg:p-3 flex-shrink-0 ml-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`${cardBg} rounded-2xl shadow-xl p-6 mb-8`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by student name, invoice ID, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className={`${cardBg} rounded-2xl shadow-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Invoice</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Student</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Class</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Amount</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Due Date</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-6 py-8 text-center ${textSecondary}`}>No invoices</td>
                  </tr>
                ) : filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${textPrimary}`}>{invoice.id}</div>
                        <div className={`text-sm ${textMuted}`}>{invoice.term}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${textPrimary}`}>{invoice.studentName}</div>
                          <div className={`text-sm ${textMuted}`}>{invoice.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${textPrimary}`}>{invoice.class}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${textPrimary}`}>{formatCurrency(invoice.amount)}</div>
                        {invoice.paidAmount > 0 && (
                          <div className="text-sm text-green-600">Paid: {formatCurrency(invoice.paidAmount)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${textSecondary}`}>{invoice.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendInvoice(invoice)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Send Invoice"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Detail Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Invoice Details</h2>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="border-b pb-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Invoice Information</h3>
                      <div className="space-y-2">
                        <p><span className={`${textMuted}`}>Invoice ID:</span> <span className={`${textPrimary} font-medium`}>{selectedInvoice.id}</span></p>
                        <p><span className={`${textMuted}`}>Issue Date:</span> <span className={`${textPrimary}`}>{selectedInvoice.issueDate}</span></p>
                        <p><span className={`${textMuted}`}>Due Date:</span> <span className={`${textPrimary}`}>{selectedInvoice.dueDate}</span></p>
                        <p><span className={`${textMuted}`}>Semester:</span> <span className={`${textPrimary}`}>{selectedInvoice.term}</span></p>
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Student Information</h3>
                      <div className="space-y-2">
                        <p><span className={`${textMuted}`}>Name:</span> <span className={`${textPrimary} font-medium`}>{selectedInvoice.studentName}</span></p>
                        <p><span className={`${textMuted}`}>Student ID:</span> <span className={`${textPrimary}`}>{selectedInvoice.studentId}</span></p>
                        <p><span className={`${textMuted}`}>Class:</span> <span className={`${textPrimary}`}>{selectedInvoice.class}</span></p>
                        <div>
                          <span className={`${textMuted}`}>Status:</span>
                          <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                            {getStatusIcon(selectedInvoice.status)}
                            <span className="ml-1 capitalize">{selectedInvoice.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Fee Breakdown</h3>
                  <div className="space-y-3">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className={`${textSecondary}`}>{item.description}</span>
                        <span className={`${textPrimary} font-medium`}>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 font-bold">
                      <span className={`${textPrimary} text-lg`}>Total Amount</span>
                      <span className={`${textPrimary} text-lg`}>{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {selectedInvoice.paidAmount > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Information</h3>
                    <div className="space-y-1">
                      <p><span className="text-green-600">Amount Paid:</span> <span className="font-medium text-green-800">{formatCurrency(selectedInvoice.paidAmount)}</span></p>
                      {selectedInvoice.paidDate && (
                        <p><span className="text-green-600">Payment Date:</span> <span className="text-green-800">{selectedInvoice.paidDate}</span></p>
                      )}
                      {selectedInvoice.amount > selectedInvoice.paidAmount && (
                        <p><span className="text-red-600">Outstanding:</span> <span className="font-medium text-red-800">{formatCurrency(selectedInvoice.amount - selectedInvoice.paidAmount)}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleSendInvoice(selectedInvoice)}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Invoice Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Create New Invoice</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newInvoice = {
                  id: `INV-${Date.now()}`,
                  studentName: formData.get('studentName'),
                  studentId: formData.get('studentId'),
                  class: formData.get('class'),
                  term: formData.get('term'),
                  amount: parseFloat(formData.get('amount')),
                  paidAmount: 0,
                  dueDate: formData.get('dueDate'),
                  status: 'pending',
                  items: formData.get('items').split(',').map(item => item.trim())
                };
                setInvoices([...invoices, newInvoice]);
                setShowCreateForm(false);
                alert('Invoice created successfully! ✅');
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Student Name *</label>
                    <input
                      name="studentName"
                      required
                      className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Student ID *</label>
                    <input
                      name="studentId"
                      required
                      className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Enter student ID"
                    />
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Class *</label>
                    <select
                      name="class"
                      required
                      className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">Select class</option>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Semester *</label>
                    <select
                      name="term"
                      required
                      className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">Select semester</option>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Amount (UGX) *</label>
                    <input
                      name="amount"
                      type="number"
                      required
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Due Date *</label>
                    <input
                      name="dueDate"
                      type="date"
                      required
                      className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block ${textSecondary} text-sm font-medium mb-2`}>Invoice Items (comma separated) *</label>
                  <textarea
                    name="items"
                    required
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="e.g., Tuition Fee, Library Fee, Sports Fee"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPanel;
