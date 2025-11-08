import React, { useEffect, useState } from 'react';

// Lightweight charts without external deps
const Bar = ({ label, value, color = 'bg-blue-500' }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded h-3">
      <div className={`${color} h-3 rounded`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  </div>
);

const Spark = ({ points, color = '#3b82f6' }) => (
  <svg viewBox="0 0 100 30" className="w-full h-12">
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="2"
      points={points.map((v, i) => `${(i/(points.length-1))*100},${30 - (v/100)*30}`).join(' ')}
    />
  </svg>
);

const AnalyticsChartsPanel = ({ userRole }) => {
  const [stats, setStats] = useState({ attendance: [], performance: [], revenue: [] });

  useEffect(() => {
    // Demo data; in production fetch aggregates from /api endpoints
    setStats({
      attendance: [92, 91, 93, 95, 94, 96, 97],
      performance: [68, 70, 72, 71, 74, 76, 78],
      revenue: [45, 48, 46, 50, 52, 55, 58], // millions UGX
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">Attendance Trend</h3>
        <Spark points={stats.attendance} color="#10b981" />
        <div className="mt-4">
          <Bar label="This Week" value={stats.attendance.slice(-1)[0] || 0} color="bg-green-500" />
          <Bar label="Target" value={95} color="bg-green-300" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">Performance Trend</h3>
        <Spark points={stats.performance} color="#6366f1" />
        <div className="mt-4">
          <Bar label="Average Score" value={stats.performance.slice(-1)[0] || 0} color="bg-indigo-500" />
          <Bar label="Target" value={80} color="bg-indigo-300" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">Revenue (UGX M)</h3>
        <Spark points={stats.revenue.map(v => (v/60)*100)} color="#f59e0b" />
        <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 text-gray-600">
          {stats.revenue.map((v, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded">{v}M</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChartsPanel;
