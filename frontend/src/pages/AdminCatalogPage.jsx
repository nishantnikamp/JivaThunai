import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Layers, Plus, Edit2, Trash2, Save, X, Tag, ListFilter } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export const AdminCatalogPage = () => {
  const { token, activeRole } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('species'); // species or category

  const [items, setItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });


  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const type = activeTab === 'species' ? 'PET_SPECIES' : 'PET_CATEGORY'; // Map your tabs to backend types
      const response = await fetch(`http://localhost:8080/api/v1/admin/catalog?type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || data); // Assuming response structure
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
      setItems([]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
      showToast(`${activeTab === 'species' ? 'Species' : 'Category'} updated successfully`, 'success');
    } else {
      const newItem = { id: Date.now(), ...formData };
      setItems(prev => [...prev, newItem]);
      showToast(`${activeTab === 'species' ? 'Species' : 'Category'} created successfully`, 'success');
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item? This may affect existing listings.')) {
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('Item deleted successfully', 'success');
    }
  };

  const openForm = (item = null) => {
    setEditingItem(item);
    setFormData(item || { name: '', description: '', isActive: true });
    setIsFormOpen(true);
  };

  if (activeRole !== 'SUPER_ADMIN') {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="bg-rose-100 text-rose-600 p-6 rounded-full inline-block">
            <X className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Access Denied</h2>
          <p className="text-slate-500 max-w-md mx-auto">You do not have the required permissions to view the dynamic catalog administration page.</p>
        </div>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
              {editingItem ? `Edit ${activeTab === 'species' ? 'Species' : 'Category'}` : `Create New ${activeTab === 'species' ? 'Species' : 'Category'}`}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage global dictionary entries used by the marketplace.</p>
          </div>
          <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-sm border border-slate-100 space-y-8 max-w-3xl">
          <section className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-600">Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-600">Description</label>
              <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"></textarea>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <span className="text-sm font-bold text-slate-700">Active (Visible in Marketplace Dropdowns)</span>
              </label>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors w-full sm:w-auto text-center">Cancel</button>
            <button type="submit" className="px-8 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"><Save className="w-5 h-5" /> Save {activeTab === 'species' ? 'Species' : 'Category'}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        badgeText="TAXONOMY & CATALOG"
        badgeIcon={Layers}
        title="Catalog Taxonomy Admin"
        titleIcon={Layers}
        description="Dynamically manage Species classifications and Product Categories across the global ecosystem."
        variant="teal"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
              <button 
                onClick={() => setActiveTab('species')} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'species' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" /> Species
              </button>
              <button 
                onClick={() => setActiveTab('category')} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'category' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" /> Categories
              </button>
            </div>
            <button 
              onClick={() => openForm()} 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add New {activeTab === 'species' ? 'Species' : 'Category'}
            </button>
          </div>
        }
      />

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-black">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-400">#{item.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openForm(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No {activeTab === 'species' ? 'species' : 'categories'} found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
