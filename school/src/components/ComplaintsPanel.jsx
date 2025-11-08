import React, { useEffect, useState } from 'react';

const ComplaintsPanel = ({ userRole }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'other', description: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: 'all', category: 'all', priority: 'all' });

  const fetchItems = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/complaints/`);
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (e) { console.error(e); }
  };

  // Filters and summary
  const filtered = items.filter(it => {
    const matchStatus = filters.status === 'all' || it.status === filters.status;
    const matchCategory = filters.category === 'all' || it.category === filters.category;
    const matchPriority = filters.priority === 'all' || it.priority === filters.priority;
    const q = (filters.search || '').toLowerCase();
    const matchSearch = !q || `${it.title} ${it.description || ''}`.toLowerCase().includes(q);
    return matchStatus && matchCategory && matchPriority && matchSearch;
  });

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'open').length,
    in_review: items.filter(i => i.status === 'in_review').length,
    resolved: items.filter(i => i.status === 'resolved').length,
    urgent: items.filter(i => i.priority === 'urgent').length,
    high: items.filter(i => i.priority === 'high').length,
  };

  useEffect(() => { fetchItems(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/complaints/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setForm({ title: '', category: 'other', description: '', priority: 'normal' });
        fetchItems();
      } else {
        alert(data.message || 'Failed to create complaint');
      }
    } catch (e) { console.error(e); alert('Network error'); } finally { setLoading(false); }
  };

  const updateStatus = async (id, patch) => {
    try {
      const token = localStorage.getItem('token') || '';
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch)
      });
      const data = await res.json();
      if (data.success) fetchItems();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500">Open</div>
          <div className="text-xl font-bold text-red-600">{stats.open}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500">In Review</div>
          <div className="text-xl font-bold text-yellow-600">{stats.in_review}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500">Resolved</div>
          <div className="text-xl font-bold text-green-600">{stats.resolved}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500">Urgent</div>
          <div className="text-xl font-bold text-red-700">{stats.urgent}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500">High</div>
          <div className="text-xl font-bold text-orange-600">{stats.high}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Submit Complaint</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded p-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          <select className="border rounded p-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            <option value="discipline">Discipline</option>
            <option value="facilities">Facilities</option>
            <option value="academics">Academics</option>
            <option value="finance">Finance</option>
            <option value="other">Other</option>
          </select>
          <select className="border rounded p-2" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
            <option>low</option>
            <option>normal</option>
            <option>high</option>
            <option>urgent</option>
          </select>
          <input className="border rounded p-2" placeholder="Target User ID (optional)" value={form.target_user_id || ''} onChange={e=>setForm({...form,target_user_id:e.target.value})} />
          <textarea className="border rounded p-2 md:col-span-2" rows={4} placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-2">{loading? 'Submitting...' : 'Submit'}</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Complaints</h3>
          <div className="flex gap-2">
            <input className="border rounded p-2 text-sm" placeholder="Search..." value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} />
            <select className="border rounded p-2 text-sm" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select className="border rounded p-2 text-sm" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}>
              <option value="all">All Categories</option>
              <option value="discipline">Discipline</option>
              <option value="facilities">Facilities</option>
              <option value="academics">Academics</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
            <select className="border rounded p-2 text-sm" value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}>
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Status</th>
                <th className="p-2">Target</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(it => (
                <tr key={it.id} className="border-t">
                  <td className="p-2 font-medium">{it.title}</td>
                  <td className="p-2">{it.category}</td>
                  <td className="p-2">{it.priority}</td>
                  <td className="p-2">{it.status}</td>
                  <td className="p-2">{it.target_user_id || '-'}</td>
                  <td className="p-2">{new Date(it.created_at).toLocaleString()}</td>
                  <td className="p-2 space-x-2">
                    {userRole==='admin' && (
                      <>
                        <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={()=>updateStatus(it.id,{status:'resolved'})}>Resolve</button>
                        <button className="px-2 py-1 bg-yellow-600 text-white rounded" onClick={()=>updateStatus(it.id,{status:'in_review'})}>Review</button>
                        <button className="px-2 py-1 bg-gray-600 text-white rounded" onClick={()=>updateStatus(it.id,{status:'dismissed'})}>Dismiss</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPanel;
