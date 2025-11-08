import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users, Calendar, Award, Download, TrendingDown, Calculator, Receipt, AlertTriangle, CheckCircle } from 'lucide-react';

const RevenueDashboard = ({ user }) => {
  const [revenueData, setRevenueData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('revenue'); // revenue, profits, taxes

  useEffect(() => {
    loadRevenueData();
    loadAnalytics();
    loadFinancialData();
    loadTaxData();
  }, [dateRange]);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      if (user.role === 'teacher') {
        params.append('teacher_id', user.id);
      }
      
      const response = await fetch(`http://localhost:5000/api/content/revenue/summary?${params}`);
      const data = await response.json();
      if (data.success) {
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/content/revenue/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadFinancialData = async () => {
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(`http://localhost:5000/api/financial/profits-losses?${params}`);
      const data = await response.json();
      if (data.success) {
        setFinancialData(data);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const loadTaxData = async () => {
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(`http://localhost:5000/api/financial/tax-management?${params}`);
      const data = await response.json();
      if (data.success) {
        setTaxData(data);
      }
    } catch (error) {
      console.error('Error loading tax data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {user.role === 'admin' ? 'Financial Dashboard' : 'My Earnings'}
          </h2>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'revenue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Revenue
          </button>
          <button
            onClick={() => setActiveTab('profits')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profits'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Profits & Losses
          </button>
          <button
            onClick={() => setActiveTab('taxes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'taxes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            Tax Management
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Revenue Tab Content */}
      {activeTab === 'revenue' && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading revenue data...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Today's Revenue</p>
                    <DollarSign className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(analytics?.today?.today_revenue || 0)}</p>
                  <p className="text-sm opacity-90 mt-1">{analytics?.today?.today_purchases || 0} purchases</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">This Month</p>
                    <Calendar className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(analytics?.month?.month_revenue || 0)}</p>
                  <p className="text-sm opacity-90 mt-1">{analytics?.month?.month_purchases || 0} purchases</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Total Revenue</p>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(revenueData?.totals?.total_revenue || 0)}
                  </p>
                  <p className="text-sm opacity-90 mt-1">{revenueData?.totals?.total_purchases || 0} total sales</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Net Earnings</p>
                    <Award className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(revenueData?.totals?.net_revenue || 0)}
                  </p>
                  <p className="text-sm opacity-90 mt-1">After commission</p>
                </div>
              </div>
            </>
          )}

      {/* Daily Revenue Chart */}
      {revenueData && revenueData.daily_revenue && revenueData.daily_revenue.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Revenue Trend</h3>
          <div className="space-y-2">
            {revenueData.daily_revenue.slice(0, 10).map((day, index) => {
              const maxRevenue = Math.max(...revenueData.daily_revenue.map(d => parseFloat(d.total_revenue || 0)));
              const percentage = maxRevenue > 0 ? (parseFloat(day.total_revenue || 0) / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-full flex items-center px-3 text-white text-sm font-semibold"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && formatCurrency(day.total_revenue || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(day.total_revenue || 0)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({day.transaction_count || 0} sales)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Revenue Trend</h3>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No revenue data available for the selected period</p>
          </div>
        </div>
      )}

      {/* Top Selling Content */}
      {analytics && analytics.top_content && analytics.top_content.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Selling Content</h3>
          <div className="space-y-3">
            {analytics.top_content.map((item, index) => (
              <div key={item.id || index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.title || 'Untitled'}</h4>
                  <p className="text-sm text-gray-600">{item.purchase_count || 0} purchases</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(item.total_revenue || 0)}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price || 0)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Selling Content</h3>
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No content sales data available</p>
          </div>
        </div>
      )}

      {/* Top Earning Teachers (Admin Only) */}
      {user.role === 'admin' && analytics && analytics.top_teachers && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Earning Teachers</h3>
          <div className="space-y-3">
            {analytics.top_teachers.map((teacher, index) => (
              <div key={teacher.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {teacher.first_name} {teacher.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">{teacher.sales_count} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(teacher.total_earnings)}</p>
                  <p className="text-sm text-gray-500">Net earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading revenue data...</p>
            </div>
          )}
        </>
      )}

      {/* Profits & Losses Tab Content */}
      {activeTab === 'profits' && (
        <div className="space-y-6">
          {/* Financial Overview Cards */}
          {financialData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <DollarSign className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(financialData.total_revenue)}</p>
                <p className="text-sm opacity-90 mt-1">Gross income</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Total Expenses</p>
                  <TrendingDown className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(financialData.total_expenses)}</p>
                <p className="text-sm opacity-90 mt-1">Operating costs</p>
              </div>

              <div className={`rounded-lg shadow-md p-6 text-white ${
                financialData.net_profit >= 0 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Net Profit/Loss</p>
                  {financialData.net_profit >= 0 ? (
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  ) : (
                    <TrendingDown className="w-8 h-8 opacity-80" />
                  )}
                </div>
                <p className="text-3xl font-bold">{formatCurrency(financialData.net_profit)}</p>
                <p className="text-sm opacity-90 mt-1">
                  {financialData.net_profit >= 0 ? 'Profit' : 'Loss'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Profit Margin</p>
                  <Calculator className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">{financialData.profit_margin}%</p>
                <p className="text-sm opacity-90 mt-1">Efficiency ratio</p>
              </div>
            </div>
          )}

          {/* Profit & Loss 3D Bar Chart */}
          {financialData && financialData.monthly_data && financialData.monthly_data.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Profit & Loss Trend (3D View)</h3>
              <div className="relative" style={{ perspective: '1000px', height: '400px' }}>
                <div className="flex items-end justify-center space-x-4 h-full" style={{ transformStyle: 'preserve-3d' }}>
                  {financialData.monthly_data.map((data, index) => {
                    const maxValue = Math.max(...financialData.monthly_data.map(d => Math.max(d.revenue || 0, d.expenses || 0)));
                    const revenueHeight = maxValue > 0 ? ((data.revenue || 0) / maxValue) * 300 : 0;
                    const expensesHeight = maxValue > 0 ? ((data.expenses || 0) / maxValue) * 300 : 0;
                    const profitHeight = maxValue > 0 ? ((Math.abs(data.profit || 0)) / maxValue) * 300 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center" style={{ transform: `rotateY(${index * 5}deg) translateZ(20px)` }}>
                        {/* Revenue Bar (Green) */}
                        <div className="relative mb-2" style={{ width: '60px' }}>
                          <div
                            className="bg-gradient-to-t from-green-600 via-green-500 to-green-400 rounded-t-lg relative shadow-lg"
                            style={{
                              height: `${revenueHeight}px`,
                              transform: 'perspective(500px) rotateX(20deg)',
                              transformStyle: 'preserve-3d',
                              boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 -5px 10px rgba(0,0,0,0.2)'
                            }}
                          >
                            {/* 3D Top Face */}
                            <div
                              className="absolute top-0 left-0 right-0 bg-green-400 rounded-t-lg"
                              style={{
                                height: '20px',
                                transform: 'translateZ(15px)',
                                boxShadow: '0 -5px 10px rgba(0,0,0,0.2)'
                              }}
                            />
                            {/* 3D Right Face */}
                            <div
                              className="absolute top-0 right-0 bg-green-700 rounded-tr-lg"
                              style={{
                                width: '15px',
                                height: '100%',
                                transform: 'rotateY(90deg) translateZ(15px)',
                                transformOrigin: 'right center'
                              }}
                            />
                            {/* Value Label */}
                            {revenueHeight > 30 && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                {formatCurrency(data.revenue || 0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expenses Bar (Red) */}
                        <div className="relative mb-2" style={{ width: '60px' }}>
                          <div
                            className="bg-gradient-to-t from-red-600 via-red-500 to-red-400 rounded-t-lg relative shadow-lg"
                            style={{
                              height: `${expensesHeight}px`,
                              transform: 'perspective(500px) rotateX(20deg)',
                              transformStyle: 'preserve-3d',
                              boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 -5px 10px rgba(0,0,0,0.2)'
                            }}
                          >
                            {/* 3D Top Face */}
                            <div
                              className="absolute top-0 left-0 right-0 bg-red-400 rounded-t-lg"
                              style={{
                                height: '20px',
                                transform: 'translateZ(15px)',
                                boxShadow: '0 -5px 10px rgba(0,0,0,0.2)'
                              }}
                            />
                            {/* 3D Right Face */}
                            <div
                              className="absolute top-0 right-0 bg-red-700 rounded-tr-lg"
                              style={{
                                width: '15px',
                                height: '100%',
                                transform: 'rotateY(90deg) translateZ(15px)',
                                transformOrigin: 'right center'
                              }}
                            />
                            {/* Value Label */}
                            {expensesHeight > 30 && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                {formatCurrency(data.expenses || 0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Profit/Loss Bar (Blue/Orange) */}
                        <div className="relative mb-2" style={{ width: '60px' }}>
                          <div
                            className={`rounded-t-lg relative shadow-lg ${
                              (data.profit || 0) >= 0
                                ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400'
                                : 'bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400'
                            }`}
                            style={{
                              height: `${profitHeight}px`,
                              transform: 'perspective(500px) rotateX(20deg)',
                              transformStyle: 'preserve-3d',
                              boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 -5px 10px rgba(0,0,0,0.2)'
                            }}
                          >
                            {/* 3D Top Face */}
                            <div
                              className={`absolute top-0 left-0 right-0 rounded-t-lg ${
                                (data.profit || 0) >= 0 ? 'bg-blue-400' : 'bg-orange-400'
                              }`}
                              style={{
                                height: '20px',
                                transform: 'translateZ(15px)',
                                boxShadow: '0 -5px 10px rgba(0,0,0,0.2)'
                              }}
                            />
                            {/* 3D Right Face */}
                            <div
                              className={`absolute top-0 right-0 rounded-tr-lg ${
                                (data.profit || 0) >= 0 ? 'bg-blue-700' : 'bg-orange-700'
                              }`}
                              style={{
                                width: '15px',
                                height: '100%',
                                transform: 'rotateY(90deg) translateZ(15px)',
                                transformOrigin: 'right center'
                              }}
                            />
                            {/* Value Label */}
                            {profitHeight > 30 && (
                              <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold whitespace-nowrap ${
                                (data.profit || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'
                              }`}>
                                {(data.profit || 0) >= 0 ? '+' : ''}{formatCurrency(data.profit || 0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Month Label */}
                        <div className="mt-2 text-sm font-medium text-gray-700 text-center">
                          {data.month || `Month ${index + 1}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
                  <span className="text-sm text-gray-700">Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                  <span className="text-sm text-gray-700">Expenses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                  <span className="text-sm text-gray-700">Profit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded"></div>
                  <span className="text-sm text-gray-700">Loss</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Profit & Loss Trend</h3>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No financial data available</p>
                <p className="text-sm mt-2">Financial data will appear here once available</p>
              </div>
            </div>
          )}

          {/* Expense Breakdown */}
          {financialData && financialData.expense_breakdown && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {financialData.expense_breakdown.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }}></div>
                      <span className="font-medium text-gray-800">{expense.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(expense.amount)}</p>
                      <p className="text-sm text-gray-500">{expense.percentage}% of total</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tax Management Tab Content */}
      {activeTab === 'taxes' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading tax data...</p>
            </div>
          ) : taxData ? (
            <>
              {/* Tax Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Taxable Income</p>
                    <Receipt className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(taxData.taxable_income || 0)}</p>
                  <p className="text-sm opacity-90 mt-1">Before deductions</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Tax Owed</p>
                    <Calculator className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(taxData.tax_owed || 0)}</p>
                  <p className="text-sm opacity-90 mt-1">Current period</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Tax Paid</p>
                    <CheckCircle className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(taxData.tax_paid || 0)}</p>
                  <p className="text-sm opacity-90 mt-1">Amount paid</p>
                </div>

                <div className={`rounded-lg shadow-md p-6 text-white ${
                  (taxData.tax_balance || 0) >= 0 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm opacity-90">Tax Balance</p>
                    {(taxData.tax_balance || 0) >= 0 ? (
                      <CheckCircle className="w-8 h-8 opacity-80" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 opacity-80" />
                    )}
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(taxData.tax_balance || 0)}</p>
                  <p className="text-sm opacity-90 mt-1">
                    {(taxData.tax_balance || 0) >= 0 ? 'Overpaid' : 'Outstanding'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-12 text-gray-500">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No tax data available for the selected period</p>
                <p className="text-sm mt-2">Tax data will appear here once available</p>
              </div>
            </div>
          )}

          {/* Tax Compliance Status */}
          {taxData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tax Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">VAT Registration</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      taxData.vat_registered 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {taxData.vat_registered ? 'Registered' : 'Not Registered'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">VAT Number: {taxData.vat_number || 'N/A'}</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">Tax Filing Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      taxData.filing_status === 'current' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {taxData.filing_status === 'current' ? 'Current' : taxData.filing_status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Last Filed: {taxData.last_filed || 'Never'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tax Deadlines */}
          {taxData && taxData.upcoming_deadlines && taxData.upcoming_deadlines.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tax Deadlines</h3>
              <div className="space-y-3">
                {taxData.upcoming_deadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{deadline.description || 'Tax Deadline'}</p>
                      <p className="text-sm text-gray-600">Due: {deadline.due_date || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      (deadline.days_remaining || 0) <= 7 
                        ? 'bg-red-100 text-red-800' 
                        : (deadline.days_remaining || 0) <= 30 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {deadline.days_remaining || 0} days
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : taxData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tax Deadlines</h3>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No upcoming tax deadlines</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default RevenueDashboard;
