import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${color}-500 overflow-hidden`}>
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-gray-600 text-sm truncate" title={title}>{title}</p>
        <p className="text-2xl font-bold text-gray-800 truncate" title={String(value)}>{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <svg className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">{trend}</span>
          </div>
        )}
      </div>
      <div className={`bg-${color}-100 rounded-full p-3`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

export default DashboardCard;
