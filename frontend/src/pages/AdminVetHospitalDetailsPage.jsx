import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Building, MapPin, Mail, Phone, Calendar, ShieldCheck, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { apiCall, adminApi } from '../services/api';
import { SecurePdfViewer } from '../components/SecurePdfViewer';
import { PageHeader } from '../components/PageHeader';

export const AdminVetHospitalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, activeRole } = useAuth();
  const { showToast } = useNotification();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCertificate, setActiveCertificate] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await apiCall(`/profile/${id}`, 'GET', null, token);
        if (response && response.success) {
          setHospital(response.data);
        } else {
          showToast('Failed to load hospital details', 'error');
        }
      } catch (err) {
        showToast('Error loading details', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id, token, showToast]);

  const handleApprove = async () => {
    try {
      const response = await adminApi.approveUser(id, token);
      if (response && response.success) {
        setHospital(prev => ({ ...prev, kycStatus: 'VERIFIED' }));
        showToast('Hospital verification approved successfully', 'success');
      } else {
        showToast(response?.message || 'Failed to approve hospital', 'error');
      }
    } catch (err) {
      showToast('Error approving hospital', 'error');
    }
  };

  const handleReject = async () => {
    try {
      const response = await adminApi.rejectUser(id, token);
      if (response && response.success) {
        setHospital(prev => ({ ...prev, kycStatus: 'REJECTED' }));
        showToast('Hospital verification marked as rejected', 'info');
      } else {
        showToast(response?.message || 'Failed to reject hospital', 'error');
      }
    } catch (err) {
      showToast('Error rejecting hospital', 'error');
    }
  };

  const handleResetToPending = async () => {
    try {
      const response = await adminApi.resetUserKyc(id, token);
      if (response && response.success) {
        setHospital(prev => ({ ...prev, kycStatus: 'PENDING_VERIFICATION' }));
        showToast('Hospital verification reset to pending review', 'info');
      } else {
        showToast(response?.message || 'Failed to reset verification', 'error');
      }
    } catch (err) {
      showToast('Error resetting verification status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Hospital Not Found</h2>
        <button onClick={() => navigate('/admin-vet-hospitals')} className="mt-4 text-emerald-600 font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const isVerified = hospital.kycStatus === 'VERIFIED';
  const isRejected = hospital.kycStatus === 'REJECTED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <PageHeader
        badgeText={`INSTITUTION KYC: ${isVerified ? 'VERIFIED & APPROVED' : (isRejected ? 'REJECTED' : 'PENDING REVIEW')}`}
        badgeIcon={isVerified ? CheckCircle : (isRejected ? XCircle : ShieldCheck)}
        title={hospital.fullName}
        titleIcon={Building}
        description={`Organization ID: #${hospital.id || id} • Member since ${new Date(hospital.createdAt || Date.now()).toLocaleDateString()}`}
        variant={isVerified ? 'emerald' : (isRejected ? 'rose' : 'amber')}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button 
              onClick={() => navigate('/admin-vet-hospitals')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to Directory
            </button>
            {isVerified ? (
              <>
                <button 
                  onClick={handleReject} 
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors border border-rose-200"
                >
                  Revoke & Reject
                </button>
                <button 
                  onClick={handleResetToPending} 
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                >
                  Reset to Pending
                </button>
              </>
            ) : isRejected ? (
              <button 
                onClick={handleApprove} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                Re-Approve Hospital
              </button>
            ) : (
              <>
                <button 
                  onClick={handleReject} 
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors border border-rose-200"
                >
                  Reject
                </button>
                <button 
                  onClick={handleApprove} 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  Approve Hospital
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Billing Email</p>
                <p className="text-sm font-semibold text-slate-800">{hospital.email}</p>
                {hospital.emailVerified && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">Verified</span>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Primary Contact</p>
                <p className="text-sm font-semibold text-slate-800">{hospital.phone}</p>
                {hospital.phoneVerified && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">Verified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Facility Location</h2>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{hospital.addressLine || 'N/A'}</p>
              <p className="text-sm text-slate-600 mt-1">
                {hospital.city ? `${hospital.city}, ` : ''}
                {hospital.state ? `${hospital.state} ` : ''}
                {hospital.pinCode || ''}
              </p>
            </div>
          </div>
        </div>
        
        {/* Compliance Documents */}
        {(activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 md:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center justify-between">
              <span>Compliance & Documents</span>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">RESTRICTED ACCESS</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Clinical Establishment License</p>
                  <p className={`text-sm font-semibold ${hospital.clinicalLicenseUploaded ? 'text-slate-800' : 'text-slate-400'}`}>
                    {hospital.clinicalLicenseUploaded ? 'Uploaded' : 'Pending'}
                  </p>
                </div>
                {hospital.clinicalLicenseUploaded ? (
                  <button onClick={() => setActiveCertificate({ type: 'Clinical Establishment License', url: `http://localhost:8080/api/v1/profile/${id}/documents/clinical-license.pdf` })} className="text-xs font-bold text-emerald-600 hover:underline">View PDF</button>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Not available</span>
                )}
              </div>
              <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">GST Registration</p>
                  <p className={`text-sm font-semibold ${hospital.gstRegistrationUploaded ? 'text-slate-800' : 'text-slate-400'}`}>
                    {hospital.gstRegistrationUploaded ? 'Uploaded' : 'Pending'}
                  </p>
                </div>
                {hospital.gstRegistrationUploaded ? (
                  <button onClick={() => setActiveCertificate({ type: 'GST Registration', url: `http://localhost:8080/api/v1/profile/${id}/documents/gst.pdf` })} className="text-xs font-bold text-emerald-600 hover:underline">View PDF</button>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Not available</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Certificate Viewer */}
      {activeCertificate && (
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-200 overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between p-6 border-b border-emerald-100 bg-emerald-50">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                <div>
                   <h3 className="text-xl font-black text-emerald-900">{activeCertificate.type}</h3>
                   <p className="text-xs text-emerald-700 font-bold">Viewing secure document. Screenshots and downloads are disabled.</p>
                </div>
             </div>
             <button 
                onClick={() => setActiveCertificate(null)}
                className="px-4 py-2 text-rose-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
             >
                Close Document
             </button>
          </div>
          <div className="flex-1 p-8 bg-slate-100 flex justify-center items-center">
             <SecurePdfViewer url={activeCertificate.url} token={token} />
          </div>
        </div>
      )}
    </div>
  );
};
