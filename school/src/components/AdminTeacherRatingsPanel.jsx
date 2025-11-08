import React, { useState, useEffect } from 'react';
import { Star, Users, Filter, Search, Trash2, Edit, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminTeacherRatingsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [ratings, setRatings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // TODO: replace with backend call
        setRatings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Manage Teacher Ratings</h1>
        <p className={`${textSecondary}`}>Review, edit, or remove teacher ratings and feedback.</p>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg p-4 mb-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teacher or subject" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300" />
          </div>
          <div>
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="w-full py-2 px-3 rounded-lg border border-gray-300">
              <option value="all">All Ratings</option>
              <option value="flagged">Flagged</option>
              <option value="low">Low Rated (&lt; 3.0)</option>
              <option value="high">High Rated (&ge; 4.5)</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className={textSecondary}>Filters</span>
          </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-xl shadow-lg p-4`}>
        {loading ? (
          <p className={textSecondary}>Loading ratings...</p>
        ) : ratings.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className={textSecondary}>No ratings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ratings.map((r) => (
              <div key={r.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>{r.teacherName}</p>
                    <p className={`text-sm ${textSecondary}`}>{r.subject}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(r.overall) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button className="p-2 rounded bg-white border border-gray-300 hover:bg-gray-100" title="Edit"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 rounded bg-white border border-gray-300 hover:bg-gray-100" title="Approve"><CheckCircle className="w-4 h-4 text-green-600" /></button>
                  <button className="p-2 rounded bg-white border border-gray-300 hover:bg-gray-100" title="Flag"><AlertTriangle className="w-4 h-4 text-yellow-600" /></button>
                  <button className="p-2 rounded bg-white border border-gray-300 hover:bg-gray-100" title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeacherRatingsPanel;


