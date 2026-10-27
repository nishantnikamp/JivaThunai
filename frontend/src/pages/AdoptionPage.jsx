import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Heart, FileCheck, CheckCircle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export const AdoptionPage = () => {
  const { token, user, activeRole } = useAuth();
  const { showToast } = useNotification();
  const [apps, setApps] = useState([]);

  // RBAC Flags
  const isShelterAdmin = ['SUPER_ADMIN', 'NGO_SHELTER'].includes(activeRole);
  const canApply = ['PET_OWNER', 'BUYER', 'SUPER_ADMIN'].includes(activeRole);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ housingType: 'APARTMENT', hasPetExperience: false, hasRwaApproval: false });

  useEffect(() => {
    fetchApps();
  }, [activeRole]);

  const fetchApps = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/adoptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        let data = await res.json();
        if (!isShelterAdmin) {
           data = data.filter(a => a.applicantId === user?.id);
        }
        setApps(data);
      }
    } catch (e) {
      showToast('Failed to load adoptions', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to withdraw/delete this application?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/v1/adoptions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Application deleted successfully', 'success');
        fetchApps();
      } else {
        showToast('Not authorized to delete', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editingItem 
      ? `http://localhost:8080/api/v1/adoptions/${editingItem.id}` 
      : `http://localhost:8080/api/v1/adoptions`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const payload = { ...formData };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Successfully ${editingItem ? 'updated' : 'submitted'} application`, 'success');
        setIsFormOpen(false);
        fetchApps();
      } else {
        showToast('Action forbidden', 'error');
      }
    } catch (err) {
      showToast('Network error during save', 'error');
    }
  };

  const signAgreement = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/adoptions/${id}/sign-agreement`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Agreement Signed & Deed Generated!', 'success');
        fetchApps();
      } else {
        showToast('Only Shelters or Admins can sign agreements', 'error');
      }
    } catch (e) {
      showToast('Error signing agreement', 'error');
    }
  };

  const openForm = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ housingType: item.housingType, hasPetExperience: item.hasPetExperience, hasRwaApproval: item.hasRwaApproval });
    } else {
      setFormData({ housingType: 'APARTMENT', hasPetExperience: false, hasRwaApproval: false });
    }
    setIsFormOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        badgeText={isShelterAdmin ? 'PCA 1960 COMPLIANCE' : 'PET ADOPTION'}
        badgeIcon={Heart}
        title="Adoption & Compliance"
        titleIcon={Heart}
        description={isShelterAdmin ? 'Manage PCA 1960 legal adoption workflows, RWA approvals, and digital deed verifications.' : 'Explore companion pet adoption applications, track verification progress, and manage legal deeds.'}
        variant="emerald"
        actions={
          canApply && !isShelterAdmin && (
            <button 
              onClick={() => openForm()} 
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Apply for Adoption
            </button>
          )
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-6 py-4">Application ID</th>
              <th className="px-6 py-4">Housing / RWA</th>
              <th className="px-6 py-4">Verification Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Deed</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {apps.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4 font-mono text-xs">{a.id}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700">{a.housingType}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">RWA Approved: {a.hasRwaApproval ? 'Yes' : 'No'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${a.verificationScore}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{a.verificationScore}/100</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{a.status}</span></td>
                <td className="px-6 py-4">
                  {a.digitalDeedUrl ? <a href="#" className="text-emerald-600 font-bold underline text-xs">View Deed</a> : <span className="text-xs text-slate-400">Pending</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isShelterAdmin && a.status === 'HOME_VERIFICATION_PENDING' && (
                      <button onClick={() => signAgreement(a.id)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 font-bold shadow-sm">Sign Deed</button>
                    )}
                    {(isShelterAdmin || a.applicantId === user?.id) && (
                      <>
                        <button onClick={() => openForm(a)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {apps.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-slate-500">No applications found.</td></tr>}
          </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Application' : 'Adoption Questionnaire'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Housing Type</label>
                <select value={formData.housingType} onChange={e => setFormData({...formData, housingType: e.target.value})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="APARTMENT">Apartment</option>
                  <option value="INDEPENDENT_HOUSE">Independent House</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
                <input type="checkbox" id="petExp" checked={formData.hasPetExperience} onChange={e => setFormData({...formData, hasPetExperience: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <label htmlFor="petExp" className="text-sm font-bold text-slate-700">I have previous pet experience</label>
              </div>

              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
                <input type="checkbox" id="rwaApp" checked={formData.hasRwaApproval} onChange={e => setFormData({...formData, hasRwaApproval: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <label htmlFor="rwaApp" className="text-sm font-bold text-slate-700">I have obtained RWA (Resident Welfare) Approval</label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-2"><Save className="w-4 h-4" /> {editingItem ? 'Save Updates' : 'Submit Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
