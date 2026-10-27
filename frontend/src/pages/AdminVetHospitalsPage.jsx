import React, { useState, useEffect } from 'react';
import { Building, CheckCircle, XCircle, Settings, ShieldAlert, ToggleLeft, ToggleRight, Search, FileText, RefreshCw, Eye } from 'lucide-react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export const AdminVetHospitalsPage = () => {
  const { token } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [autoVerify, setAutoVerify] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsersByRole('VETERINARY_ADMIN', token);
      if (response && response.success) {
        const users = response.data.content || response.data || [];
        const mapped = users.map(u => ({
          id: u.id,
          name: u.fullName,
          kycStatus: u.kycStatus,
          gstin: u.kycStatus === 'VERIFIED' ? 'VERIFIED-KYC' : (u.pinCode ? `PIN-${u.pinCode}` : 'UNVERIFIED'),
          contact: u.phone,
          email: u.email,
          status: u.kycStatus === 'VERIFIED' ? 'APPROVED' : (u.kycStatus === 'REJECTED' ? 'REJECTED' : 'PENDING_VERIFICATION')
        }));
        setHospitals(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch hospitals", err);
      showToast?.("Failed to fetch hospitals list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminApi.getVerificationMode(token);
        if (response && response.success) {
          setAutoVerify(response.data.autoVerify);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    if (token) {
      fetchHospitals();
      fetchSettings();
    }
  }, [token]);
  
  const handleToggleAutoVerify = async () => {
    const newValue = !autoVerify;
    setAutoVerify(newValue);
    try {
      await adminApi.updateVerificationMode(newValue, token);
      showToast?.(`Auto-verification turned ${newValue ? 'ON' : 'OFF'}`, 'success');
    } catch (err) {
      console.error("Failed to update setting", err);
      setAutoVerify(!newValue); // Revert on failure
      showToast?.("Failed to update auto-verification setting", "error");
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveUser(id, token);
      setHospitals(prev => prev.map(h => h.id === id ? { ...h, status: 'APPROVED', kycStatus: 'VERIFIED', gstin: 'VERIFIED-KYC' } : h));
      showToast?.("Hospital approved and marked as VERIFIED", "success");
    } catch (err) {
      console.error(err);
      showToast?.("Failed to approve hospital verification", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectUser(id, token);
      setHospitals(prev => prev.map(h => h.id === id ? { ...h, status: 'REJECTED', kycStatus: 'REJECTED', gstin: 'UNVERIFIED' } : h));
      showToast?.("Hospital verification marked as REJECTED", "info");
    } catch (err) {
      console.error(err);
      showToast?.("Failed to reject hospital", "error");
    }
  };

  const handleResetToPending = async (id) => {
    try {
      await adminApi.resetUserKyc(id, token);
      setHospitals(prev => prev.map(h => h.id === id ? { ...h, status: 'PENDING_VERIFICATION', kycStatus: 'PENDING_VERIFICATION', gstin: 'UNVERIFIED' } : h));
      showToast?.("Hospital verification reset to PENDING", "info");
    } catch (err) {
      console.error(err);
      showToast?.("Failed to reset verification status", "error");
    }
  };

  const filteredHospitals = hospitals.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.gstin.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      
      <PageHeader
        badgeText="INSTITUTIONAL DIRECTORY"
        badgeIcon={Building}
        title="Vet Hospital Management"
        titleIcon={Building}
        description="Review, verify, and authenticate veterinary healthcare organizations and mobile care units."
        variant="emerald"
        actions={
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-2.5 px-4 flex items-center gap-4 shadow-sm">
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Verification
              </span>
              <span className="text-[10px] text-slate-500">
                {autoVerify ? 'Automated KYC Approval' : 'Manual Review Required'}
              </span>
            </div>
            <button 
              onClick={handleToggleAutoVerify}
              className={`p-1.5 rounded-xl transition-all ${autoVerify ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
              title={autoVerify ? 'Disable auto-verification' : 'Enable auto-verification'}
            >
              {autoVerify ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
            </button>
          </div>
        }
      />

      {/* Hospital List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">Registered Organizations</h2>
            <button
              onClick={fetchHospitals}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-xs font-bold text-slate-500 uppercase">Hospital Details</th>
                <th className="pb-3 text-xs font-bold text-slate-500 uppercase">Contact</th>
                <th className="pb-3 text-xs font-bold text-slate-500 uppercase">Verification Status</th>
                <th className="pb-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-sm font-semibold text-slate-500">
                    Loading hospitals...
                  </td>
                </tr>
              ) : filteredHospitals.map(hospital => (
                <tr key={hospital.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{hospital.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" /> License / GST: {hospital.gstin}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-sm font-semibold text-slate-700">{hospital.email}</p>
                    <p className="text-xs text-slate-500">{hospital.contact}</p>
                  </td>
                  <td className="py-4">
                    {hospital.status === 'PENDING_VERIFICATION' && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase flex w-fit items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> PENDING REVIEW
                      </span>
                    )}
                    {hospital.status === 'APPROVED' && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase flex w-fit items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> VERIFIED & APPROVED
                      </span>
                    )}
                    {hospital.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black uppercase flex w-fit items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> REJECTED
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {hospital.status === 'PENDING_VERIFICATION' && (
                        <>
                          <button 
                            onClick={() => handleReject(hospital.id)} 
                            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1" 
                            title="Reject Verification"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button 
                            onClick={() => handleApprove(hospital.id)} 
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1" 
                            title="Approve Hospital"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Verify & Approve</span>
                          </button>
                        </>
                      )}
                      {hospital.status === 'APPROVED' && (
                        <>
                          <button
                            onClick={() => handleReject(hospital.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                            title="Revoke Verification"
                          >
                            Revoke
                          </button>
                          <button
                            onClick={() => handleResetToPending(hospital.id)}
                            className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                            title="Reset to Pending Review"
                          >
                            Reset
                          </button>
                        </>
                      )}
                      {hospital.status === 'REJECTED' && (
                        <button
                          onClick={() => handleApprove(hospital.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          title="Re-Approve Hospital"
                        >
                          Re-Approve
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/admin/vet-hospitals/${hospital.id}`)}
                        className="px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHospitals.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-sm font-semibold text-slate-500">
                    No hospitals found.
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
