import React, { useEffect, useState } from 'react';

const AwardsPanel = ({ userRole }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', recipient_user_id: '', recipient_class_id: '', category: 'academic', awarded_on: '' });
  const [filters, setFilters] = useState({ category: 'all', search: '', from: '', to: '' });
  const token = localStorage.getItem('token') || '';

  const fetchItems = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/awards/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchItems(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, recipient_user_id: form.recipient_user_id || null, recipient_class_id: form.recipient_class_id || null, created_by: 1 };
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/awards/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) { setForm({ title: '', description: '', recipient_user_id: '', recipient_class_id: '', category: 'academic', awarded_on: '' }); fetchItems(); }
      else alert(data.message || 'Failed to create award');
    } catch (e) { console.error(e); alert('Network error'); }
  };

  const filtered = items.filter(a => {
    const cat = filters.category === 'all' || a.category === filters.category;
    const q = (filters.search || '').toLowerCase();
    const txt = `${a.title} ${a.description || ''}`.toLowerCase();
    const matchSearch = !q || txt.includes(q);
    const d = a.awarded_on ? new Date(a.awarded_on) : null;
    const fromOk = !filters.from || (d && d >= new Date(filters.from));
    const toOk = !filters.to || (d && d <= new Date(filters.to));
    return cat && matchSearch && fromOk && toOk;
  });

  const stats = {
    total: items.length,
    academic: items.filter(i => i.category === 'academic').length,
    sports: items.filter(i => i.category === 'sports').length,
    behavior: items.filter(i => i.category === 'behavior').length,
    leadership: items.filter(i => i.category === 'leadership').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl shadow p-4 text-center"><div className="text-xs text-gray-500">Total</div><div className="text-xl font-bold">{stats.total}</div></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><div className="text-xs text-gray-500">Academic</div><div className="text-xl font-bold text-blue-600">{stats.academic}</div></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><div className="text-xs text-gray-500">Sports</div><div className="text-xl font-bold text-green-600">{stats.sports}</div></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><div className="text-xs text-gray-500">Behavior</div><div className="text-xl font-bold text-yellow-600">{stats.behavior}</div></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><div className="text-xs text-gray-500">Leadership</div><div className="text-xl font-bold text-purple-600">{stats.leadership}</div></div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Create Award</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          <select className="border rounded p-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            <option>academic</option>
            <option>sports</option>
            <option>behavior</option>
            <option>leadership</option>
            <option>other</option>
          </select>
          <input className="border rounded p-2" type="date" value={form.awarded_on} onChange={e=>setForm({...form,awarded_on:e.target.value})} />
          <input className="border rounded p-2 md:col-span-3" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <input className="border rounded p-2" placeholder="Recipient User ID (optional)" value={form.recipient_user_id} onChange={e=>setForm({...form,recipient_user_id:e.target.value})} />
          <input className="border rounded p-2" placeholder="Recipient Class ID (optional)" value={form.recipient_class_id} onChange={e=>setForm({...form,recipient_class_id:e.target.value})} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Award</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Awards</h3>
          <div className="flex gap-2">
            <select className="border rounded p-2 text-sm" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}>
              <option value="all">All</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="behavior">Behavior</option>
              <option value="leadership">Leadership</option>
              <option value="other">Other</option>
            </select>
            <input className="border rounded p-2 text-sm" placeholder="Search..." value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} />
            <input className="border rounded p-2 text-sm" type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})} />
            <input className="border rounded p-2 text-sm" type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="border rounded p-4">
              <div className="font-semibold">{a.title}</div>
              <div className="text-xs text-gray-500 mb-2">{a.category} • {a.awarded_on}</div>
              <div className="text-sm text-gray-700">{a.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AwardsPanel;
