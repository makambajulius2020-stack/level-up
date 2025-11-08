import React, { useState } from 'react';
import { 
  DollarSign, Percent, Tag, Mail, TrendingUp, Brain, 
  Plus, Edit, Trash2, Search, Filter, Calendar, 
  Users, Award, FileText, Send, Eye, Download
} from 'lucide-react';

const ScholarshipPricingPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('scholarships');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [aiPricingEnabled, setAiPricingEnabled] = useState(false);
  const [pricingRules, setPricingRules] = useState({
    demandBased: false,
    enrollmentBased: false,
    marketTrend: false
  });

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  const [scholarships, setScholarships] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [newsletters, setNewsletters] = useState([]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleSave = () => {
    alert(`${modalType} created successfully!`);
    handleCloseModal();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Scholarship & Pricing</h1>
                <p className={`${textSecondary} mt-2`}>Manage discounts, AI dynamic pricing, marketing promotions, and newsletters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${cardBg} rounded-xl shadow-lg mb-6`}>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'scholarships', label: 'Scholarships', icon: Award },
                { id: 'discounts', label: 'Discounts', icon: Percent },
                { id: 'pricing', label: 'AI Dynamic Pricing', icon: Brain },
                { id: 'promotions', label: 'Marketing Promotions', icon: Tag },
                { id: 'newsletters', label: 'Newsletters', icon: Mail }
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

        {/* Scholarships Tab */}
        {activeTab === 'scholarships' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Scholarship Management</h2>
                <button 
                  onClick={() => handleOpenModal('scholarship')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Scholarship</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Active Scholarships</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Total Awarded</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(0)}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Recipients</p>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <p className={`text-sm ${textSecondary} mb-1`}>Pending Applications</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
              </div>

              {/* Scholarships List */}
              <div className="space-y-4">
                {scholarships.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No scholarships configured yet</p>
                  </div>
                ) : (
                  scholarships.map((scholarship) => (
                    <div key={scholarship.id} className="border rounded-lg p-4">
                      <h3 className={`font-semibold ${textPrimary}`}>{scholarship.name}</h3>
                      <p className={textSecondary}>{scholarship.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === 'discounts' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Discount Management</h2>
                <button 
                  onClick={() => handleOpenModal('discount')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Discount</span>
                </button>
              </div>

              {/* Discounts List */}
              <div className="space-y-4">
                {discounts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Percent className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No discounts created yet</p>
                  </div>
                ) : (
                  discounts.map((discount) => (
                    <div key={discount.id} className="border rounded-lg p-4">
                      <h3 className={`font-semibold ${textPrimary}`}>{discount.code}</h3>
                      <p className={textSecondary}>{discount.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Dynamic Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>AI Dynamic Pricing</h2>
                  <p className={textSecondary}>Automatically adjust course prices based on demand, enrollment, and market trends</p>
                </div>
                <button 
                  onClick={() => {
                    setAiPricingEnabled(!aiPricingEnabled);
                    alert(`AI Dynamic Pricing ${!aiPricingEnabled ? 'enabled' : 'disabled'}`);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 ${aiPricingEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg transition-colors`}
                >
                  <Brain className="w-4 h-4" />
                  <span>{aiPricingEnabled ? 'Disable' : 'Enable'} AI Pricing</span>
                </button>
              </div>

              {/* AI Pricing Settings */}
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className={`font-semibold ${textPrimary} mb-4`}>Pricing Rules</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={textSecondary}>Demand-based pricing</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={pricingRules.demandBased}
                          onChange={(e) => setPricingRules(prev => ({ ...prev, demandBased: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={textSecondary}>Enrollment-based pricing</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={pricingRules.enrollmentBased}
                          onChange={(e) => setPricingRules(prev => ({ ...prev, enrollmentBased: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={textSecondary}>Market trend analysis</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={pricingRules.marketTrend}
                          onChange={(e) => setPricingRules(prev => ({ ...prev, marketTrend: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className={`font-semibold ${textPrimary} mb-4`}>Price Adjustment Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-2`}>Minimum Discount (%)</label>
                      <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-2`}>Maximum Increase (%)</label>
                      <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketing Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Marketing Promotions</h2>
                <button 
                  onClick={() => handleOpenModal('promotion')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Promotion</span>
                </button>
              </div>

              {/* Promotions List */}
              <div className="space-y-4">
                {promotions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No active promotions</p>
                  </div>
                ) : (
                  promotions.map((promo) => (
                    <div key={promo.id} className="border rounded-lg p-4">
                      <h3 className={`font-semibold ${textPrimary}`}>{promo.title}</h3>
                      <p className={textSecondary}>{promo.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Newsletters Tab */}
        {activeTab === 'newsletters' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Newsletter Management</h2>
                <button 
                  onClick={() => handleOpenModal('newsletter')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Newsletter</span>
                </button>
              </div>

              {/* Newsletters List */}
              <div className="space-y-4">
                {newsletters.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No newsletters created yet</p>
                  </div>
                ) : (
                  newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${textPrimary}`}>{newsletter.subject}</h3>
                          <p className={textSecondary}>{newsletter.sentDate}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => alert(`Viewing newsletter: ${newsletter.subject}`)}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => alert(`Sending newsletter: ${newsletter.subject}`)}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>
                    {modalType === 'scholarship' && 'Add Scholarship'}
                    {modalType === 'discount' && 'Create Discount'}
                    {modalType === 'promotion' && 'Create Promotion'}
                    {modalType === 'newsletter' && 'Create Newsletter'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className={`text-gray-400 hover:text-gray-600 ${textSecondary}`}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }} className="space-y-4">
                  {modalType === 'scholarship' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Scholarship Name</label>
                        <input
                          type="text"
                          required
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="e.g., Merit Scholarship"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Description</label>
                        <textarea
                          required
                          rows="3"
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="Scholarship description..."
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Amount (UGX)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="e.g., 1000000"
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'discount' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Discount Code</label>
                        <input
                          type="text"
                          required
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="e.g., SUMMER2024"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Discount Percentage</label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="e.g., 20"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Valid Until</label>
                        <input
                          type="date"
                          required
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'promotion' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Promotion Title</label>
                        <input
                          type="text"
                          required
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="e.g., Summer Sale"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Description</label>
                        <textarea
                          required
                          rows="3"
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="Promotion details..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Start Date</label>
                          <input
                            type="date"
                            required
                            className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>End Date</label>
                          <input
                            type="date"
                            required
                            className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {modalType === 'newsletter' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Subject</label>
                        <input
                          type="text"
                          required
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="Newsletter subject..."
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Content</label>
                        <textarea
                          required
                          rows="6"
                          className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                          placeholder="Newsletter content..."
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className={`px-4 py-2 border ${borderColor} rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipPricingPanel;

