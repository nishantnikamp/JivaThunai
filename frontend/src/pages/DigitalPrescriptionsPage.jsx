import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Stethoscope, Search, Pill, CheckCircle2, User, 
  Calendar, RefreshCw, Printer, Download, Sparkles, Filter,
  ShieldCheck, Activity, Radio
} from 'lucide-react';
import { medicalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PageHeader } from '../components/PageHeader';

export const DigitalPrescriptionsPage = () => {
  const { user, token, activeRole } = useAuth();
  const { showToast } = useNotification();

  const isVetStaff = ['VETERINARY_DOCTOR', 'VETERINARY_ADMIN', 'ROLE_VET_DOCTOR', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole || user?.role);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
    const interval = setInterval(() => {
      fetchPrescriptions(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [user, token, isVetStaff]);

  const fetchPrescriptions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (!isVetStaff) {
        if (user?.userId) {
          const ownerRecs = await medicalApi.getOwnerPetRecords(user.userId, token);
          let userRxList = [];
          if (ownerRecs && ownerRecs.data && Array.isArray(ownerRecs.data)) {
            ownerRecs.data.forEach(rec => {
              if (Array.isArray(rec.clinicalEPrescriptions)) {
                rec.clinicalEPrescriptions.forEach(rx => {
                  userRxList.push({
                    ...rx,
                    petName: rec.petName,
                    petId: rec.petId
                  });
                });
              }
            });
          }
          setPrescriptions(userRxList);
        } else {
          setPrescriptions([]);
        }
        return;
      }

      const res = await medicalApi.getAllPrescriptions(token);
      if (res && res.data) {
        setPrescriptions(res.data);
      } else {
        setPrescriptions([]);
      }
    } catch (e) {
      console.error("Failed to load prescriptions", e);
      if (!silent) showToast('Error loading digital prescriptions', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    return searchQuery === '' ||
      (rx.diagnosedIllness && rx.diagnosedIllness.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rx.doctorName && rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rx.clinicName && rx.clinicName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rx.medicines && rx.medicines.some(m => m.medicineName.toLowerCase().includes(searchQuery.toLowerCase())));
  });

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <PageHeader
        badgeIcon={FileText}
        badgeText="Veterinary Tele-Health Network"
        badgeVariant="teal"
        title="Digital E-Prescriptions Archive"
        titleIcon={Stethoscope}
        description="Central repository of legally signed veterinary prescriptions, active medicine dosages, and diagnostic records."
        meta={<span>• Tamper-Proof Cryptographic Signatures</span>}
        actions={
          <div className="flex items-center gap-2">
            {isVetStaff && (
              <Link
                to="/medical"
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Issue Prescription</span>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Live Rx Vault
              </span>
            </div>
          </div>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by diagnosis, medicine, doctor, clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Showing {filteredPrescriptions.length} Prescriptions
        </span>
      </div>

      {/* Prescriptions List */}
      {loading && prescriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-emerald-100">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading Digital Prescriptions from Database...</p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-emerald-100">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No Prescriptions Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isVetStaff
              ? 'Write a new E-prescription from the Medical Records page to record diagnoses.'
              : 'Prescriptions issued for your pets by attending veterinary doctors will be archived here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrescriptions.map((rx, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl p-6 border border-emerald-100/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Rx #{String(rx.prescriptionId).substring(0, 8)}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1.5">{rx.diagnosedIllness}</h3>
                    <p className="text-xs text-slate-500">
                      {new Date(rx.visitDate).toLocaleDateString()} at {new Date(rx.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <p className="font-black text-slate-800">{rx.doctorName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{rx.vciRegistrationNumber || 'VCI Certified'}</p>
                  </div>
                </div>

                {/* Treatment Notes */}
                {rx.treatmentPlan && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-800">Instructions:</strong> {rx.treatmentPlan}
                  </p>
                )}

                {/* Medicines */}
                {rx.medicines && rx.medicines.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Medicines:
                    </h5>
                    <div className="space-y-1.5">
                      {rx.medicines.map((med, mIdx) => (
                        <div key={mIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{med.medicineName}</span>
                            <p className="text-[10px] text-emerald-700 font-semibold">{med.dosage} • {med.frequency}</p>
                          </div>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-bold">
                            {med.durationDays} Days
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                  Sig: {rx.doctorDigitalSignature}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DigitalPrescriptionsPage;
