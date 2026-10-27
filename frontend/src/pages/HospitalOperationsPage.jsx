import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, Stethoscope, AlertTriangle, ShieldCheck, Clock, 
  Heart, CheckCircle2, RefreshCw, Siren, Radio, User, Bed, 
  Sparkles, Check, ChevronRight, Filter, Play, CheckCircle, 
  AlertCircle, Building2, MapPin, Phone, ShieldAlert, Award,
  Users, Layers, Plus, Calendar, X, Wifi
} from 'lucide-react';
import { hospitalLiveOpsApi, bookingApi, hospitalProfileApi, taxonomyApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { AlertConfirmationModal } from '../components/AlertConfirmationModal';
import { Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';

export const HospitalOperationsPage = () => {
  const { showToast } = useNotification();
  const { user, token, activeRole } = useAuth();

  // Role permissions
  const isHospitalAdmin = ['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole || user?.role) ||
    user?.roles?.some(r => ['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN'].includes(r));
  const isDoctorOrAdmin = isHospitalAdmin || ['VETERINARY_DOCTOR', 'ROLE_VET_DOCTOR'].includes(activeRole || user?.role) ||
    user?.roles?.some(r => ['VETERINARY_DOCTOR', 'ROLE_VET_DOCTOR'].includes(r));
  const isStaffOrAbove = isDoctorOrAdmin || ['VET_STAFF', 'ROLE_VET_STAFF', 'ASSISTANT_VET_DOCTOR'].includes(activeRole || user?.role) ||
    user?.roles?.some(r => ['VET_STAFF', 'ROLE_VET_STAFF', 'ASSISTANT_VET_DOCTOR'].includes(r));

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DOCTORS'); // 'DOCTORS' | 'RESOURCES' | 'OT'
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('ALL');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL');

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'warning',
    highlightDetails: null,
    requireCheckbox: false,
    action: null,
    isSubmitting: false
  });

  // Triage Priorities from Database Taxonomy
  const [triagePriorities, setTriagePriorities] = useState([
    { code: 'CRITICAL', label: 'CRITICAL (Resuscitation / Immediate Trauma)', description: 'Immediate resuscitation, collapse, respiratory failure' },
    { code: 'EMERGENCY', label: 'EMERGENCY (Severe Pain / Acute Hemorrhage)', description: 'Acute abdomen, open trauma, active seizures' },
    { code: 'URGENT', label: 'URGENT (Prompt Clinical Care Required)', description: 'Severe vomiting, stable trauma, high fever' },
    { code: 'ROUTINE', label: 'ROUTINE (Standard Hospital Admission)', description: 'Stable observation, planned inpatient monitoring' }
  ]);
  const [loadingTriage, setLoadingTriage] = useState(false);

  // Admit to Bed Modal State
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admitResource, setAdmitResource] = useState(null);
  const [admitForm, setAdmitForm] = useState({
    patientName: '',
    ownerName: '',
    ownerPhone: '',
    assignedDoctorName: '',
    activeProcedureType: '',
    triagePriority: 'EMERGENCY'
  });

  // Schedule OT Procedure Modal State
  const [showScheduleOTModal, setShowScheduleOTModal] = useState(false);
  const [otForm, setOtForm] = useState({
    procedureName: 'Emergency Abdominal Exploratory / Splenectomy',
    patientName: '',
    species: 'Canine (Dog)',
    ownerName: '',
    resourceId: '',
    theatreName: 'Operation Theatre 1',
    leadSurgeonId: user?.userId || '',
    leadSurgeonName: (user?.fullName && !user.fullName.toLowerCase().includes('hospital') && !user.fullName.toLowerCase().includes('admin') && !user.fullName.toLowerCase().includes('clinic'))
      ? (user.fullName.startsWith('Dr.') ? user.fullName : `Dr. ${user.fullName}`)
      : 'Dr. Rajesh Kumar',
    anesthetistName: 'Dr. Priya Sharma',
    scrubNurseName: 'Nurse Anita',
    scheduledStart: new Date(Date.now() + 1800000).toISOString().slice(0, 16),
    scheduledEnd: new Date(Date.now() + 9000000).toISOString().slice(0, 16),
    priority: 'EMERGENCY',
    clinicalNotes: 'Severe internal bleeding, acute abdominal distention'
  });

  const stompClientRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    if (isStaffOrAbove) {
      loadHospitals();
    }
  }, [isStaffOrAbove]);

  useEffect(() => {
    if (selectedHospitalId) {
      loadSnapshot(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  // Fetch Triage Priorities dynamically from Database Taxonomy
  useEffect(() => {
    const loadTriagePriorities = async () => {
      try {
        setLoadingTriage(true);
        const res = await taxonomyApi.getCategory('TRIAGE_PRIORITIES', token);
        const items = res?.data || (Array.isArray(res) ? res : null);
        if (Array.isArray(items) && items.length > 0) {
          setTriagePriorities(items);
        }
      } catch (err) {
        console.warn('Could not load triage priorities from database taxonomy:', err);
      } finally {
        setLoadingTriage(false);
      }
    };
    loadTriagePriorities();
  }, [token]);

  // WebSocket Live Tracking & Polling Fallback
  useEffect(() => {
    if (!selectedHospitalId) return;

    // Resilient background auto-sync every 10 seconds
    const interval = setInterval(() => {
      loadSnapshot(selectedHospitalId, true);
    }, 10000);

    let client = null;
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const brokerUrl = `${wsProtocol}//${window.location.hostname}:8087/ws/medical`;

      client = new Client({
        brokerURL: brokerUrl,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setWsConnected(true);
          client.subscribe(`/topic/operations/${selectedHospitalId}`, (message) => {
            try {
              const data = JSON.parse(message.body);
              if (data) setSnapshot(data);
            } catch (err) {
              console.warn("WS parse err", err);
            }
          });
          client.subscribe('/topic/operations/live', (message) => {
            try {
              const data = JSON.parse(message.body);
              if (data && (!data.hospitalId || data.hospitalId === selectedHospitalId)) {
                setSnapshot(data);
              }
            } catch (err) {
              console.warn("WS live parse err", err);
            }
          });
        },
        onDisconnect: () => {
          setWsConnected(false);
        },
        onStompError: () => {
          setWsConnected(false);
        },
        onWebSocketClose: () => {
          setWsConnected(false);
        }
      });

      client.activate();
      stompClientRef.current = client;
    } catch (e) {
      console.warn("WebSocket initialization error", e);
    }

    return () => {
      clearInterval(interval);
      if (client) {
        try {
          client.deactivate();
        } catch (e) {}
      }
    };
  }, [selectedHospitalId]);

  const loadHospitals = async () => {
    try {
      let list = [];

      // Priority 1: Check if the user has an active Hospital Profile from Showcase
      try {
        const profileRes = await hospitalProfileApi.getMyProfile(null, token);
        if (profileRes && profileRes.data) {
          const prof = profileRes.data;
          list.push({
            organizationId: prof.organizationId || prof.id,
            registeredBusinessName: prof.hospitalName || 'My Veterinary Hospital',
            city: prof.city || (prof.address?.city) || 'Local'
          });
        }
      } catch (profErr) {
        console.warn("Could not load current user profile directly", profErr);
      }

      // Priority 2: Load hospitals directory
      try {
        const res = await bookingApi.getHospitals(token);
        let bookingList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        bookingList.forEach(b => {
          const name = b.registeredBusinessName || '';
          if (name.toLowerCase().includes('petcare veterinary hospital')) return;
          const isKarpagam = name.toLowerCase().includes('karpagam');
          const alreadyExists = list.some(item => 
            item.organizationId === b.organizationId || 
            (isKarpagam && (item.registeredBusinessName || '').toLowerCase().includes('karpagam'))
          );
          if (!alreadyExists) {
            list.push(b);
          }
        });
      } catch (bErr) {
        console.warn("Could not load booking directory", bErr);
      }

      if (list.length === 0) {
        list = [
          {
            organizationId: '11111111-1111-1111-1111-111111111111',
            registeredBusinessName: 'Karpagam Hospital & Research Center',
            city: 'Ottakalmadabam'
          }
        ];
      }
      setHospitals(list);
      setSelectedHospitalId(list[0].organizationId);
    } catch (e) {
      console.warn("Could not load hospitals directory", e);
      const fallbackId = '11111111-1111-1111-1111-111111111111';
      setSelectedHospitalId(fallbackId);
      loadSnapshot(fallbackId);
    }
  };

  const loadSnapshot = async (hospId, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await hospitalLiveOpsApi.getHospitalSnapshot(hospId, token);
      if (res && res.data) {
        setSnapshot(res.data);
      } else {
        setSnapshot(null);
      }
    } catch (e) {
      console.warn("Could not load hospital snapshot", e);
      if (!silent) showToast("Error retrieving live hospital operations", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Doctor Status Change with Confirmation Modal
  const handlePromptDoctorStatusChange = (doctor, newStatus) => {
    if (!isDoctorOrAdmin) {
      showToast("Role Restricted: Only authorized clinical personnel can update operational availability.", "error");
      return;
    }

    const isHighImpact = ['IN_SURGERY', 'HANDLING_EMERGENCY', 'OFF_DUTY'].includes(newStatus);

    setConfirmModal({
      isOpen: true,
      title: `Update Doctor Status: ${newStatus.replace('_', ' ')}`,
      message: `You are about to change ${doctor.doctorName}'s live operational status from ${doctor.operationalStatus} to ${newStatus}.`,
      confirmText: `Confirm Status: ${newStatus}`,
      variant: isHighImpact ? 'danger' : 'warning',
      requireCheckbox: isHighImpact,
      highlightDetails: (
        <div>
          <p><strong>Doctor:</strong> {doctor.doctorName} ({doctor.specialization || 'Surgeon'})</p>
          <p><strong>Impact:</strong> {newStatus === 'IN_SURGERY' ? 'Doctor will be locked in surgical theatre and excluded from emergency consultations.' : (newStatus === 'HANDLING_EMERGENCY' ? 'Doctor is designated for critical trauma triage.' : 'Operational availability will be recalculated across platform schedules.')}</p>
        </div>
      ),
      action: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
          await hospitalLiveOpsApi.updateDoctorStatus(doctor.doctorId, {
            operationalStatus: newStatus,
            currentLocation: newStatus === 'IN_SURGERY' ? 'Operation Theatre' : (newStatus === 'HANDLING_EMERGENCY' ? 'Emergency Trauma Bay' : 'Consultation Suite')
          }, token);
          showToast(`Dr. ${doctor.doctorName} status updated to ${newStatus}`, 'success');
          loadSnapshot(selectedHospitalId);
        } catch (err) {
          showToast('Failed to update doctor status', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }));
        }
      }
    });
  };

  // Bed / Resource Status Change with Confirmation
  const handlePromptResourceStatusChange = (resource, newStatus) => {
    if (!isStaffOrAbove) {
      showToast("Role Restricted: Only hospital staff or administrators can update bed/room status.", "error");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Update Resource: ${resource.resourceCode} (${newStatus})`,
      message: `Change ${resource.resourceName} status to ${newStatus}?`,
      confirmText: `Confirm ${newStatus}`,
      variant: newStatus === 'MAINTENANCE' ? 'danger' : 'warning',
      requireCheckbox: newStatus === 'MAINTENANCE',
      highlightDetails: (
        <div>
          <p><strong>Resource Code:</strong> {resource.resourceCode} ({resource.locationDescription})</p>
          <p><strong>Status Transition:</strong> {resource.operationalStatus} &rarr; {newStatus}</p>
          {newStatus === 'CLEANING' && <p className="text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0 inline mr-1" />Will initiate terminal sterilization checklist and 30-minute readiness window.</p>}
        </div>
      ),
      action: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
          await hospitalLiveOpsApi.updateResourceStatus(resource.resourceId, {
            operationalStatus: newStatus
          }, token);
          showToast(`Resource ${resource.resourceCode} marked as ${newStatus}`, 'success');
          loadSnapshot(selectedHospitalId);
        } catch (err) {
          showToast('Failed to update resource status', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }));
        }
      }
    });
  };

  // Handle Admission to Bed
  const handleSubmitAdmit = async (e) => {
    e.preventDefault();
    if (!admitForm.patientName) {
      showToast('Patient name is required', 'warning');
      return;
    }

    try {
      await hospitalLiveOpsApi.updateResourceStatus(admitResource.resourceId, {
        operationalStatus: 'OCCUPIED',
        currentPatientName: admitForm.patientName,
        currentOwnerName: admitForm.ownerName,
        currentOwnerPhone: admitForm.ownerPhone,
        assignedDoctorName: admitForm.assignedDoctorName || user?.fullName || 'On-Duty Trauma Surgeon',
        activeProcedureType: admitForm.activeProcedureType || 'Emergency Clinical Care',
        triagePriority: admitForm.triagePriority
      }, token);
      showToast(`Admitted ${admitForm.patientName} to ${admitResource?.resourceName || 'emergency bed'}`, 'success');
      setShowAdmitModal(false);
      loadSnapshot(selectedHospitalId);
    } catch (err) {
      showToast('Admission failed', 'error');
    }
  };

  // Schedule OT Procedure
  const handleScheduleProcedure = async (e) => {
    e.preventDefault();
    if (!otForm.procedureName || !otForm.patientName) {
      showToast('Procedure name and patient are required', 'warning');
      return;
    }

    try {
      const selectedOT = snapshot?.resources?.find(r => r.resourceType === 'OPERATION_THEATRE') || {};
      await hospitalLiveOpsApi.scheduleProcedure({
        hospitalId: selectedHospitalId,
        hospitalName: hospitals.find(h => h.organizationId === selectedHospitalId)?.registeredBusinessName || 'Hospital',
        resourceId: selectedOT.resourceId || '33333333-3333-3333-3333-333333333333',
        theatreName: selectedOT.resourceName || 'Operation Theatre 1',
        procedureName: otForm.procedureName,
        patientId: '44444444-4444-4444-4444-444444444444',
        patientName: otForm.patientName,
        species: otForm.species,
        ownerName: otForm.ownerName || 'Pet Guardian',
        leadSurgeonId: user?.userId || '55555555-5555-5555-5555-555555555555',
        leadSurgeonName: otForm.leadSurgeonName || user?.fullName || 'Dr. Rajesh Kumar',
        anesthetistName: otForm.anesthetistName,
        scrubNurseName: otForm.scrubNurseName,
        scheduledStart: otForm.scheduledStart,
        scheduledEnd: otForm.scheduledEnd,
        priority: otForm.priority,
        clinicalNotes: otForm.clinicalNotes
      }, token);

      showToast('Surgical procedure successfully scheduled', 'success');
      setShowScheduleOTModal(false);
      loadSnapshot(selectedHospitalId);
    } catch (err) {
      showToast('Failed to schedule procedure', 'error');
    }
  };

  // Start OT Procedure with Confirmation
  const handleStartProcedure = (proc) => {
    setConfirmModal({
      isOpen: true,
      title: 'Initiate Operation Theatre Surgery',
      message: `Begin active surgical operation for ${proc.patientName} (${proc.procedureName})?`,
      confirmText: 'Start Surgery Now',
      variant: 'danger',
      requireCheckbox: true,
      checkboxLabel: 'I confirm sterile OT preparation, anesthesia clearance & scrub team readiness',
      highlightDetails: (
        <div>
          <p><strong>Procedure:</strong> {proc.procedureName}</p>
          <p><strong>Patient:</strong> {proc.patientName} ({proc.species})</p>
          <p><strong>Lead Surgeon:</strong> {proc.leadSurgeonName}</p>
          <p className="text-rose-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0 inline mr-1" />Action will automatically mark OT Room as OCCUPIED and Surgeon as IN_SURGERY.</p>
        </div>
      ),
      action: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
          await hospitalLiveOpsApi.startProcedure(proc.procedureId, token);
          showToast(`Surgery started for ${proc.patientName}`, 'success');
          loadSnapshot(selectedHospitalId);
        } catch (err) {
          showToast('Failed to start procedure', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }));
        }
      }
    });
  };

  // Complete OT Procedure with Confirmation
  const handleCompleteProcedure = (proc) => {
    setConfirmModal({
      isOpen: true,
      title: 'Complete Surgery & Release Theatre',
      message: `Mark surgery complete for ${proc.patientName}?`,
      confirmText: 'Complete & Release to Cleaning',
      variant: 'success',
      highlightDetails: (
        <div>
          <p><strong>Patient:</strong> {proc.patientName}</p>
          <p className="text-emerald-800 flex items-center gap-1"><Check className="w-3.5 h-3.5 shrink-0 inline mr-1" />Action will release Lead Surgeon to AVAILABLE and transition OT to CLEANING (terminal sterilization).</p>
        </div>
      ),
      action: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
          await hospitalLiveOpsApi.completeProcedure(proc.procedureId, 'Surgery completed successfully. Patient transferred to Post-Op Recovery ICU.', token);
          showToast(`Surgery completed for ${proc.patientName}`, 'success');
          loadSnapshot(selectedHospitalId);
        } catch (err) {
          showToast('Failed to complete procedure', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }));
        }
      }
    });
  };

  // Strictly extract real doctor names (excluding hospital entities and admin accounts)
  const availableDoctorNames = useMemo(() => {
    const rawDocs = (snapshot?.doctors || [])
      .map(d => d.doctorName)
      .filter(n => {
        if (!n) return false;
        const low = n.toLowerCase();
        return !low.includes('hospital') && !low.includes('administrator') && !low.includes('admin') && !low.includes('center') && !low.includes('clinic');
      });
    const defaults = ['Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Ananya Sen', 'Dr. Vikram Malhotra'];
    return Array.from(new Set([...rawDocs, ...defaults]));
  }, [snapshot?.doctors]);

  // Filtered resources and doctors with strict deduplication
  const doctorsList = useMemo(() => {
    const raw = snapshot?.doctors || [];
    const seen = new Set();
    const result = [];
    for (const d of raw) {
      if (!d) continue;
      const normName = (d.doctorName || '')
        .toLowerCase()
        .replace(/^dr\.?\s*/i, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
      const key = normName || d.doctorId || String(Math.random());
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(d);
    }
    return result;
  }, [snapshot?.doctors]);

  const filteredDoctors = doctorsList.filter(d => {
    if (doctorStatusFilter === 'ALL') return true;
    return d.operationalStatus === doctorStatusFilter;
  });

  const resourcesList = snapshot?.resources || [];
  const filteredResources = resourcesList.filter(r => {
    if (resourceTypeFilter === 'ALL') return true;
    return r.resourceType === resourceTypeFilter;
  });

  const proceduresList = snapshot?.activeProcedures || [];

  if (!isStaffOrAbove) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Clinical Cockpit Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Live Doctor Availability & Resource Manager is an internal hospital operations system reserved for verified veterinary staff and doctors.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/hospitals"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center"
            >
              Find Veterinary Hospitals
            </Link>
            <Link
              to="/dashboard"
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all text-center"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header Banner */}
      <PageHeader
        badgeIcon={Activity}
        badgeText="Hospital Operations Cockpit"
        badgeVariant="emerald"
        title="Live Doctor Availability & Resource Manager"
        titleIcon={Stethoscope}
        description="Real-time operational tracking for Emergency Ward beds, Critical Care ICU units, Operation Theatres (OT), and On-Duty Veterinary Surgeons."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500/20"
            >
              {hospitals.map(h => (
                <option key={h.organizationId} value={h.organizationId}>
                  {h.registeredBusinessName}
                </option>
              ))}
            </select>
            {isHospitalAdmin && (
              <Link
                to="/hospital-profile"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Showcase & Profile</span>
              </Link>
            )}
            {/* Live WebSocket Status Indicator (Replaces Manual Refresh) */}
            <div className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black tracking-wide uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Live {wsConnected ? 'WebSocket' : 'Sync'}
              </span>
            </div>
          </div>
        }
      />

      {/* Hospital Profile Showcase Banner */}
      {snapshot && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  {snapshot.hospitalName || 'Veterinary Medical Center'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Showcase Synced
                </span>
                {snapshot.emergencySupport247 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Siren className="w-3 h-3 text-rose-400" />
                    24/7 Emergency
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {snapshot.city || 'Tamil Nadu'} {snapshot.branchName ? `• ${snapshot.branchName}` : ''}
                </span>
                {snapshot.emergencyPhone && (
                  <span className="flex items-center gap-1 text-rose-300 font-bold">
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    Hotline: {snapshot.emergencyPhone}
                  </span>
                )}
                {snapshot.profileCompletenessScore != null && (
                  <span className="text-slate-400 text-[11px]">
                    Completeness: <strong className="text-emerald-400">{snapshot.profileCompletenessScore}%</strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Live Inventory</p>
              <p className="text-xs font-black text-emerald-400">
                {snapshot.doctors?.length || 0} Vets • {snapshot.resources?.length || 0} Beds/Theatres
              </p>
            </div>
            {isHospitalAdmin && (
              <Link
                to="/hospital-profile"
                className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Edit Profile</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Hospital Real-Time Capacity KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Emergency Beds */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Siren className="w-4 h-4 text-rose-600" />
              Emergency Beds
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-black">
              24/7 Trauma
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {snapshot?.availableEmergencyBeds ?? 0}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {snapshot?.totalEmergencyBeds ?? 0} Available
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${snapshot?.totalEmergencyBeds ? (snapshot.availableEmergencyBeds / snapshot.totalEmergencyBeds) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* ICU Beds */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              ICU Critical Units
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-black">
              Ventilator Ready
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {snapshot?.availableIcuBeds ?? 0}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {snapshot?.totalIcuBeds ?? 0} Available
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-purple-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${snapshot?.totalIcuBeds ? (snapshot.availableIcuBeds / snapshot.totalIcuBeds) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Operation Theatres */}
        <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Operation Theatres
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-black">
              Sterile Pavilion
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {snapshot?.availableOperationTheatres ?? 0}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {snapshot?.totalOperationTheatres ?? 0} Ready
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${snapshot?.totalOperationTheatres ? (snapshot.availableOperationTheatres / snapshot.totalOperationTheatres) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Emergency Doctors */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              On-Duty Surgeons
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black">
              Live Active
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {snapshot?.availableDoctorsCount ?? 0}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Avail • {snapshot?.inSurgeryDoctorsCount ?? 0} In Surgery
            </span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            VCI Registered Medical Roster Live
          </p>
        </div>

      </div>

      {/* Interactive Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('DOCTORS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'DOCTORS' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span>Doctor Availability Board ({doctorsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RESOURCES')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'RESOURCES' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bed className="w-4 h-4 text-rose-600" />
            <span>Emergency & ICU Beds ({resourcesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('OT')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'OT' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Operation Theatre (OT) Cockpit ({proceduresList.length})</span>
          </button>
        </div>

        {/* Action Button depending on tab */}
        {activeTab === 'OT' && isDoctorOrAdmin && (
          <button
            onClick={() => {
              const defaultSurgeon = (user?.fullName && !user.fullName.toLowerCase().includes('hospital') && !user.fullName.toLowerCase().includes('admin') && !user.fullName.toLowerCase().includes('clinic'))
                ? (user.fullName.startsWith('Dr.') ? user.fullName : `Dr. ${user.fullName}`)
                : (availableDoctorNames[0] || 'Dr. Rajesh Kumar');
              const defaultAnesthetist = availableDoctorNames.find(n => n !== defaultSurgeon) || 'Dr. Priya Sharma';
              setOtForm(prev => ({
                ...prev,
                leadSurgeonName: defaultSurgeon,
                anesthetistName: defaultAnesthetist
              }));
              setShowScheduleOTModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Surgical Operation</span>
          </button>
        )}
      </div>

      {/* Tab 1: Doctor Live Availability Board */}
      {activeTab === 'DOCTORS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              Live Attending Doctor Roster
            </h3>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Filter:</span>
              {['ALL', 'AVAILABLE', 'IN_SURGERY', 'HANDLING_EMERGENCY', 'CONSULTING', 'ON_BREAK'].map(status => (
                <button
                  key={status}
                  onClick={() => setDoctorStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    doctorStatusFilter === status ? 'bg-emerald-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc, idx) => {
              const statusPill = {
                AVAILABLE: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500' },
                IN_SURGERY: { bg: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-600 animate-ping' },
                HANDLING_EMERGENCY: { bg: 'bg-rose-100 text-rose-900 border-rose-300', dot: 'bg-rose-600 animate-pulse' },
                CONSULTING: { bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' },
                ON_BREAK: { bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
                OFF_DUTY: { bg: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' }
              }[doc.operationalStatus] || { bg: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-400' };

              return (
                <div 
                  key={doc.doctorId || idx}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-800 text-base">
                        {doc.doctorName ? doc.doctorName.replace('Dr. ', '').charAt(0) : 'D'}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{doc.doctorName}</h4>
                        <p className="text-xs text-slate-500">{doc.specialization || 'Surgeon'}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 shrink-0 ${statusPill.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${statusPill.dot}`} />
                      {doc.operationalStatus?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Location:</span>
                      <span className="font-bold text-slate-800">{doc.currentLocation || 'Consultation Room'}</span>
                    </div>
                    {doc.currentEncounterInfo && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Current Activity:</span>
                        <span className="font-bold text-purple-700 truncate max-w-[180px]">{doc.currentEncounterInfo}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Live Heartbeat:</span>
                      <span className="font-mono text-emerald-600 font-bold">Active Just Now</span>
                    </div>
                  </div>

                  {/* Fast Status Toggle (Doctor & Admin Authorized) */}
                  {isDoctorOrAdmin && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Set Status:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePromptDoctorStatusChange(doc, 'AVAILABLE')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black transition-colors"
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handlePromptDoctorStatusChange(doc, 'IN_SURGERY')}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[10px] font-black transition-colors"
                        >
                          In Surgery
                        </button>
                        <button
                          onClick={() => handlePromptDoctorStatusChange(doc, 'HANDLING_EMERGENCY')}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-[10px] font-black transition-colors"
                        >
                          Emergency
                        </button>
                        <button
                          onClick={() => handlePromptDoctorStatusChange(doc, 'ON_BREAK')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black transition-colors"
                        >
                          Break
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Emergency Ward & ICU Live Beds */}
      {activeTab === 'RESOURCES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Bed className="w-4 h-4 text-rose-600" />
              Emergency Trauma & ICU Bed Manager
            </h3>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Type:</span>
              {['ALL', 'EMERGENCY_BED', 'ICU_BED', 'OPERATION_THEATRE'].map(t => (
                <button
                  key={t}
                  onClick={() => setResourceTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    resourceTypeFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((res, idx) => {
              const isOccupied = res.operationalStatus === 'OCCUPIED';
              const isCleaning = res.operationalStatus === 'CLEANING';
              const isAvailable = res.operationalStatus === 'AVAILABLE';

              return (
                <div
                  key={res.resourceId || idx}
                  className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                    isOccupied ? 'border-rose-200/90' : (isCleaning ? 'border-amber-200/90' : 'border-emerald-200/90')
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-black text-slate-500 uppercase">
                          {(res.resourceCode && res.resourceCode.length === 36 && res.resourceCode.includes('-'))
                            ? `BED-${res.resourceCode.substring(0, 4).toUpperCase()}`
                            : (res.resourceCode || 'BED')}
                        </span>
                        <h4 className="text-base font-black text-slate-900 leading-tight">
                          {res.resourceName}
                        </h4>
                        <p className="text-[11px] text-slate-400">{res.locationDescription}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 shrink-0 ${
                        isAvailable ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                        (isOccupied ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300')
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-600' : (isOccupied ? 'bg-rose-600' : 'bg-amber-600 animate-spin')}`} />
                        {res.operationalStatus}
                      </span>
                    </div>

                    {/* Occupancy Card or Available Message */}
                    {isOccupied ? (
                      <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold">Patient:</span>
                          <span className="font-black text-rose-950">{res.currentPatientName || 'Emergency Patient'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Attending:</span>
                          <span className="font-bold text-slate-900">{res.assignedDoctorName || 'Trauma Team'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Triage Priority:</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                            {res.triagePriority || 'CRITICAL'}
                          </span>
                        </div>
                      </div>
                    ) : isCleaning ? (
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs space-y-1 text-amber-900">
                        <p className="font-bold flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          Decontamination in Progress
                        </p>
                        <p className="text-[11px] text-amber-700">Sterilization protocol active. Ready in ~15 mins.</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Ready for Patient Intake
                        </p>
                        <p className="text-[11px] text-emerald-600">Sterilized, monitored & oxygen line checked.</p>
                      </div>
                    )}
                  </div>

                  {/* Operational Action Controls */}
                  {isStaffOrAbove && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {isAvailable && (
                        <button
                          onClick={() => {
                            setAdmitResource(res);
                            setAdmitForm({
                              patientName: '',
                              ownerName: '',
                              ownerPhone: '',
                              assignedDoctorName: user?.fullName || 'Dr. Rajesh Kumar',
                              activeProcedureType: 'Acute Emergency Intake',
                              triagePriority: triagePriorities[0]?.code || 'EMERGENCY'
                            });
                            setShowAdmitModal(true);
                          }}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Admit Emergency Case</span>
                        </button>
                      )}

                      {isOccupied && (
                        <button
                          onClick={() => handlePromptResourceStatusChange(res, 'CLEANING')}
                          className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Discharge & Clean</span>
                        </button>
                      )}

                      {isCleaning && (
                        <button
                          onClick={() => handlePromptResourceStatusChange(res, 'AVAILABLE')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Sterile & Ready</span>
                        </button>
                      )}

                      <button
                        onClick={() => handlePromptResourceStatusChange(res, 'MAINTENANCE')}
                        className="px-2.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold"
                        title="Flag Maintenance"
                      >
                        Out of Service
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Operation Theatre (OT) Surgery Cockpit */}
      {activeTab === 'OT' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Surgical Operations Roster & Theatre Allocations
            </h3>
          </div>

          {proceduresList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Activity className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-black text-slate-800">No Scheduled or In-Progress Surgeries</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All operation theatre suites are sanitized and currently free for emergency surgical intake.
              </p>
              {isDoctorOrAdmin && (
                <button
                  onClick={() => setShowScheduleOTModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Surgical Operation</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {proceduresList.map((proc, idx) => {
                const isInProgress = proc.status === 'IN_PROGRESS';
                const isCompleted = proc.status === 'COMPLETED';

                return (
                  <div
                    key={proc.procedureId || idx}
                    className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-4 ${
                      isInProgress ? 'border-purple-300 bg-purple-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                            {proc.theatreName || 'Operation Theatre 1'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isInProgress ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse' :
                            (isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700')
                          }`}>
                            {proc.status}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-1">{proc.procedureName}</h4>
                        <p className="text-xs text-slate-500">
                          Patient: <strong className="text-slate-800">{proc.patientName}</strong> ({proc.species}) • Owner: {proc.ownerName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {proc.status === 'SCHEDULED' && isDoctorOrAdmin && (
                          <button
                            onClick={() => handleStartProcedure(proc)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/20 flex items-center gap-2"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Surgery Now</span>
                          </button>
                        )}

                        {isInProgress && isDoctorOrAdmin && (
                          <button
                            onClick={() => handleCompleteProcedure(proc)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete & Decontaminate OT</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400">Lead Surgeon:</span>
                        <p className="font-bold text-slate-800">{proc.leadSurgeonName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Anesthetist:</span>
                        <p className="font-bold text-slate-800">{proc.anesthetistName || 'Dr. Assigned'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Scheduled Time:</span>
                        <p className="font-bold text-slate-800">{new Date(proc.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Priority:</span>
                        <p className="font-black text-rose-700">{proc.priority}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Emergency Admission Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-200">
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Emergency Bed Admission {admitResource?.resourceName ? `— ${admitResource.resourceName}` : ''}
                </h3>
              </div>
              <button onClick={() => setShowAdmitModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Pet Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bruno (Labrador)"
                  value={admitForm.patientName}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Guardian Name & Phone</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Owner Name"
                    value={admitForm.ownerName}
                    onChange={(e) => setAdmitForm({ ...admitForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={admitForm.ownerPhone}
                    onChange={(e) => setAdmitForm({ ...admitForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Triage Severity Priority</label>
                  <span className="text-[10px] text-slate-400 font-medium">Database Taxonomy</span>
                </div>
                <select
                  value={admitForm.triagePriority}
                  onChange={(e) => setAdmitForm({ ...admitForm, triagePriority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-rose-800 focus:ring-2 focus:ring-rose-500/20"
                >
                  {triagePriorities.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label || item.code}
                    </option>
                  ))}
                </select>
                {admitForm.triagePriority && (
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    {triagePriorities.find(p => p.code === admitForm.triagePriority)?.description || ''}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Active Clinical Concern</label>
                <input
                  type="text"
                  placeholder="e.g. Suspected gastric torsion, severe respiratory distress"
                  value={admitForm.activeProcedureType}
                  onChange={(e) => setAdmitForm({ ...admitForm, activeProcedureType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20"
                >
                  Confirm Emergency Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule OT Procedure Modal */}
      {showScheduleOTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-blue-200">
            <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Schedule Operation Theatre (OT) Surgery</h3>
              </div>
              <button onClick={() => setShowScheduleOTModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleProcedure} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Procedure / Surgery Name *</label>
                <input
                  type="text"
                  required
                  value={otForm.procedureName}
                  onChange={(e) => setOtForm({ ...otForm, procedureName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Pet Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={otForm.patientName}
                    onChange={(e) => setOtForm({ ...otForm, patientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Species</label>
                  <input
                    type="text"
                    value={otForm.species}
                    onChange={(e) => setOtForm({ ...otForm, species: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Lead Surgeon (Doctor Name) *</label>
                  <select
                    value={otForm.leadSurgeonName}
                    onChange={(e) => {
                      const sel = e.target.value;
                      const found = (snapshot?.doctors || []).find(d => d.doctorName === sel);
                      setOtForm({
                        ...otForm,
                        leadSurgeonName: sel,
                        leadSurgeonId: found?.doctorId || otForm.leadSurgeonId || '55555555-5555-5555-5555-555555555555'
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
                  >
                    {availableDoctorNames.map(docName => (
                      <option key={docName} value={docName}>{docName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Anesthetist (Doctor Name) *</label>
                  <select
                    value={otForm.anesthetistName}
                    onChange={(e) => setOtForm({ ...otForm, anesthetistName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
                  >
                    {availableDoctorNames
                      .filter(d => d !== otForm.leadSurgeonName)
                      .concat(['Dr. Priya Sharma', 'Dr. Sunita Patel (Clinical Anesthetist)'])
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map(docName => (
                        <option key={docName} value={docName}>{docName}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Scheduled Start Time</label>
                  <input
                    type="datetime-local"
                    value={otForm.scheduledStart}
                    onChange={(e) => setOtForm({ ...otForm, scheduledStart: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Surgical Priority</label>
                  <select
                    value={otForm.priority}
                    onChange={(e) => setOtForm({ ...otForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="ROUTINE">Routine Elective</option>
                    <option value="URGENT">Urgent Surgical Care</option>
                    <option value="EMERGENCY">Emergency Surgery (Immediate OT)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleOTModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20"
                >
                  Schedule Surgical Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Alert Confirmation Modal for high-stakes operational transitions */}
      <AlertConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        highlightDetails={confirmModal.highlightDetails}
        requireCheckbox={confirmModal.requireCheckbox}
        isSubmitting={confirmModal.isSubmitting}
      />

    </div>
  );
};
