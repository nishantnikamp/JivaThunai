import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, Clock, CheckCircle2, AlertTriangle, AlertCircle, 
  ShieldCheck, ShieldAlert, Plus, Pill, RefreshCw, User, Dog, 
  Share2, Eye, Lock, ArrowRight, Check, X, Phone, Activity, 
  Sparkles, FileText, ChevronRight, ClipboardList, Stethoscope, Users
} from 'lucide-react';
import { 
  carePlanApi, missedCareApi, delegationApi, petApi, bookingApi 
} from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { AlertConfirmationModal } from '../components/AlertConfirmationModal';
import LandscapeModal from '../components/LandscapeModal';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CareContinuityPage = () => {
  const { showToast } = useNotification();
  const { user, token, activeRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isVetDoctorOrAdmin = [
    'VETERINARY_DOCTOR', 'VETERINARY_ADMIN', 'ROLE_VET_DOCTOR', 'ROLE_VET_ORGANIZATION', 
    'ADMIN', 'SUPER_ADMIN', 'ROLE_VET_STAFF', 'VET_STAFF', 'ASSISTANT_VET_DOCTOR'
  ].includes(activeRole || user?.role) ||
  user?.roles?.some(r => ['VETERINARY_DOCTOR', 'VETERINARY_ADMIN', 'ROLE_VET_DOCTOR', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN', 'ROLE_VET_STAFF', 'VET_STAFF', 'ASSISTANT_VET_DOCTOR'].includes(r));
  const isCaretakerRole = activeRole === 'CARETAKER';

  const [activeTab, setActiveTab] = useState(isCaretakerRole ? 'CARETAKER_VIEW' : 'CARE_PLANS');
  const [userPets, setUserPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(searchParams.get('petId') || '');
  const [loading, setLoading] = useState(true);

  // Baseline continuity care tasks
  const defaultTasks = [
    {
      taskType: 'MEDICATION',
      title: 'Administer Amoxyclav 625mg',
      instructions: '1 tablet twice daily after feeding. Complete 7 day course.',
      dueAt: new Date(Date.now() + 14400000).toISOString().slice(0, 16),
      priority: 'ROUTINE',
      responsibleRole: 'OWNER',
      sourceInstruction: 'Prescription Rx-894'
    },
    {
      taskType: 'RECOVERY_CHECK',
      title: 'Inspect Surgical Incision / Ear Canal',
      instructions: 'Check for swelling, redness, or discharge. Keep area dry.',
      dueAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      priority: 'URGENT',
      responsibleRole: 'OWNER',
      sourceInstruction: 'Discharge Instructions'
    },
    {
      taskType: 'FOLLOW_UP',
      title: 'Clinical Re-check Consultation',
      instructions: 'Return to clinic for otoscopic examination and cytology check.',
      dueAt: new Date(Date.now() + 604800000).toISOString().slice(0, 16),
      priority: 'ROUTINE',
      responsibleRole: 'OWNER',
      sourceInstruction: 'Doctor Follow-Up Order'
    }
  ];

  // Care Plan State
  const [activePlan, setActivePlan] = useState(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    toPatientId: '',
    prescribedBy: '',
    treatmentPlanTitle: 'Post-Consultation Care & Medication Regimen',
    diagnosedIllness: 'Canine Acute Otitis Externa & Skin Dermatitis',
    clinicalInstructions: 'Administer oral antibiotics with meals. Apply ear drops twice daily after gentle cleansing.',
    tasks: defaultTasks
  });

  const handleAddTask = () => {
    setNewPlanForm(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          taskType: 'MEDICATION',
          title: '',
          instructions: '',
          dueAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
          priority: 'ROUTINE',
          responsibleRole: 'OWNER',
          sourceInstruction: 'Clinical Prescription'
        }
      ]
    }));
  };

  const handleUpdateTask = (index, field, value) => {
    setNewPlanForm(prev => {
      const updated = [...prev.tasks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, tasks: updated };
    });
  };

  const handleRemoveTask = (index) => {
    setNewPlanForm(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const handleOpenCreatePlan = () => {
    const curDoctor = (user?.fullName && !user.fullName.toLowerCase().includes('hospital') && !user.fullName.toLowerCase().includes('admin'))
      ? (user.fullName.startsWith('Dr.') ? user.fullName : `Dr. ${user.fullName}`)
      : 'Dr. Rajesh Kumar';

    setNewPlanForm(prev => ({
      ...prev,
      prescribedBy: prev.prescribedBy || curDoctor,
      toPatientId: prev.toPatientId || selectedPetId || (userPets[0]?.petId || userPets[0]?.id || ''),
      tasks: prev.tasks && prev.tasks.length > 0 ? prev.tasks : defaultTasks
    }));
    setShowCreatePlanModal(true);
  };

  // Task Completion Modal State
  const [completingTask, setCompletingTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Missed Care Cases State
  const [missedCases, setMissedCases] = useState([]);
  const [evaluatingMissedCare, setEvaluatingMissedCare] = useState(false);

  // Delegations State
  const [delegations, setDelegations] = useState([]);
  const [showCreateDelegationModal, setShowCreateDelegationModal] = useState(false);
  const [newDelegationForm, setNewDelegationForm] = useState({
    caretakerEmail: '',
    caretakerName: '',
    startsAt: new Date().toISOString().slice(0, 16),
    expiresAt: new Date(Date.now() + 259200000).toISOString().slice(0, 16), // 3 days
    feedingSchedule: '2 cups dry kibble at 08:00 AM and 07:00 PM. Clean water always available.',
    emergencyVetContact: 'National 24/7 Vet Trauma: 1800-VET-911',
    notes: 'Please do not give table scraps or poultry bones. Keep on leash during walks.',
    allowedPermissions: [
      'VIEW_FEEDING',
      'VIEW_ALLERGIES',
      'VIEW_MEDICATIONS',
      'VIEW_EMERGENCY_CONTACTS',
      'VIEW_CARE_TASKS',
      'RECORD_TASK_COMPLETION'
    ]
  });

  // Caretaker Dashboard View State
  const [caretakerDashboardData, setCaretakerDashboardData] = useState(null);
  const [activeDelegationId, setActiveDelegationId] = useState('');

  // Universal Confirmation Modal State
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

  useEffect(() => {
    loadUserPets();
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      loadActiveCarePlan(selectedPetId);
      loadPetMissedCases(selectedPetId);
      loadPetDelegations(selectedPetId);
    }
  }, [selectedPetId]);

  useEffect(() => {
    if (isCaretakerRole) {
      loadCaretakerDelegations();
    }
  }, [activeRole]);

  const loadUserPets = async () => {
    const ownerId = user?.userId || user?.id;
    if (!ownerId) return;
    try {
      const res = await petApi.getPetsByOwner(ownerId, token);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setUserPets(list);
      if (list.length > 0 && !selectedPetId) {
        const firstId = list[0].petId || list[0].id;
        setSelectedPetId(firstId);
      }
    } catch (err) {
      console.warn("Could not load pets", err);
    }
  };

  const loadActiveCarePlan = async (petId) => {
    setLoading(true);
    try {
      const res = await carePlanApi.getActiveCarePlan(petId, token);
      if (res && res.data) {
        setActivePlan(res.data);
      } else {
        setActivePlan(null);
      }
    } catch (err) {
      console.warn("Could not load care plan", err);
      setActivePlan(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPetMissedCases = async (petId) => {
    try {
      const res = await missedCareApi.getCasesByPet(petId, token);
      if (res && res.data) {
        setMissedCases(res.data);
      } else {
        setMissedCases([]);
      }
    } catch (err) {
      console.warn("Could not load missed care cases", err);
      setMissedCases([]);
    }
  };

  const loadPetDelegations = async (petId) => {
    try {
      const res = await delegationApi.getDelegationsByPet(petId, token);
      if (res && res.data) {
        setDelegations(res.data);
      } else {
        setDelegations([]);
      }
    } catch (err) {
      console.warn("Could not load delegations", err);
      setDelegations([]);
    }
  };

  const loadCaretakerDelegations = async () => {
    try {
      const res = await delegationApi.getDelegationsForCaretaker(user?.userId, user?.email, token);
      const list = Array.isArray(res?.data) ? res.data : [];
      if (list.length > 0) {
        setActiveDelegationId(list[0].delegationId);
        loadCaretakerDashboard(list[0].delegationId);
      }
    } catch (err) {
      console.warn("Could not load caretaker delegations", err);
    }
  };

  const loadCaretakerDashboard = async (delId) => {
    try {
      const res = await delegationApi.getCaretakerDashboard(delId, token);
      if (res && res.data) {
        setCaretakerDashboardData(res.data);
      }
    } catch (err) {
      console.warn("Could not load caretaker dashboard", err);
    }
  };

  // Run Missed Care Evaluation Scan
  const handleRunEvaluation = async () => {
    setEvaluatingMissedCare(true);
    try {
      const res = await missedCareApi.runEvaluation(token);
      showToast(res?.message || "Missed-care evaluation completed", "success");
      if (selectedPetId) loadPetMissedCases(selectedPetId);
    } catch (err) {
      showToast("Evaluation failed", "error");
    } finally {
      setEvaluatingMissedCare(false);
    }
  };

  // Create Care Plan (Doctor / Staff / Admin)
  const handleCreateCarePlan = async (e) => {
    e.preventDefault();
    if (!isVetDoctorOrAdmin) {
      showToast("Only licensed veterinarians or hospital staff can create clinical care plans", "error");
      return;
    }

    const targetPetId = newPlanForm.toPatientId || selectedPetId || (userPets[0]?.petId || userPets[0]?.id) || '33333333-3333-3333-3333-333333333333';
    const selectedPet = userPets.find(p => (p.petId || p.id) === targetPetId);
    const petName = selectedPet?.basicProfile?.name || selectedPet?.name || 'Pet Patient';
    const doctorName = newPlanForm.prescribedBy || (user?.fullName && !user.fullName.toLowerCase().includes('hospital') ? user.fullName : 'Dr. Rajesh Kumar');

    try {
      await carePlanApi.createCarePlan({
        petId: targetPetId,
        petName: petName,
        ownerId: selectedPet?.ownerId || user?.userId || user?.id || '11111111-1111-1111-1111-111111111111',
        ownerName: selectedPet?.ownerName || 'Pet Guardian',
        doctorId: user?.userId || user?.id || '22222222-2222-2222-2222-222222222222',
        doctorName: doctorName,
        clinicName: user?.organizationName || 'Jiva Thunai Central Animal Hospital',
        treatmentPlanTitle: newPlanForm.treatmentPlanTitle,
        diagnosedIllness: newPlanForm.diagnosedIllness,
        clinicalInstructions: newPlanForm.clinicalInstructions,
        initialTasks: newPlanForm.tasks
      }, token);

      showToast(`Treatment Plan & Care Tasks generated for ${petName} successfully`, "success");
      setShowCreatePlanModal(false);
      setSelectedPetId(targetPetId);
      loadActiveCarePlan(targetPetId);
    } catch (err) {
      console.error("Failed to create care plan:", err);
      showToast("Failed to create care plan: " + (err.message || 'Please verify fields'), "error");
    }
  };

  // Complete Care Task with Notes
  const handleConfirmTaskCompletion = async () => {
    if (!completingTask || !activePlan) return;
    try {
      await carePlanApi.completeCareTask(activePlan.id, completingTask.taskId, {
        completionNotes: completionNotes || 'Completed as prescribed.',
        completedByUserId: user?.userId,
        completedByName: user?.fullName || 'Pet Guardian',
        completedByRole: activeRole || 'PET_OWNER'
      }, token);

      showToast(`Task "${completingTask.title}" marked COMPLETED`, "success");
      setCompletingTask(null);
      setCompletionNotes('');
      loadActiveCarePlan(selectedPetId);
      loadPetMissedCases(selectedPetId);
    } catch (err) {
      showToast("Failed to complete task", "error");
    }
  };

  // Cancel Task with Confirmation
  const handlePromptCancelTask = (task) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Care Task",
      message: `Are you sure you want to cancel the scheduled task: "${task.title}"?`,
      confirmText: "Yes, Cancel Task",
      variant: "danger",
      highlightDetails: (
        <div>
          <p><strong>Task:</strong> {task.title}</p>
          <p><strong>Instructions:</strong> {task.instructions}</p>
          <p className="text-rose-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0 inline mr-1" />Cancelling will remove this item from the care compliance tracker.</p>
        </div>
      ),
      action: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
          await carePlanApi.cancelCareTask(activePlan.id, task.taskId, "Discontinued by user/doctor", token);
          showToast("Task cancelled", "success");
          loadActiveCarePlan(selectedPetId);
        } catch (err) {
          showToast("Failed to cancel task", "error");
        } finally {
          setConfirmModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }));
        }
      }
    });
  };

  // Create Temporary Caretaker Delegation
  const handleCreateDelegation = async (e) => {
    e.preventDefault();
    if (!newDelegationForm.caretakerEmail) {
      showToast("Caretaker email is required", "warning");
      return;
    }

    try {
      const selectedPet = userPets.find(p => (p.petId || p.id) === selectedPetId);
      await delegationApi.createDelegation({
        petId: selectedPetId,
        petName: selectedPet?.basicProfile?.name || selectedPet?.name || 'Pet Patient',
        species: selectedPet?.species || 'Canine',
        breed: selectedPet?.breed || '',
        ownerUserId: user?.userId || '11111111-1111-1111-1111-111111111111',
        ownerName: user?.fullName || 'Pet Guardian',
        ownerPhone: user?.phone || '+91 98765 43210',
        caretakerEmail: newDelegationForm.caretakerEmail,
        caretakerName: newDelegationForm.caretakerName,
        startsAt: newDelegationForm.startsAt,
        expiresAt: newDelegationForm.expiresAt,
        allowedPermissions: newDelegationForm.allowedPermissions,
        notes: newDelegationForm.notes,
        feedingSchedule: newDelegationForm.feedingSchedule,
        emergencyVetContact: newDelegationForm.emergencyVetContact
      }, token);

      showToast("Temporary Pet Care access granted successfully", "success");
      setShowCreateDelegationModal(false);
      loadPetDelegations(selectedPetId);
    } catch (err) {
      showToast("Failed to create delegation", "error");
    }
  };

  // Revoke Delegation with Confirmation
  const handlePromptRevokeDelegation = (del) => {
    setConfirmModal({
      isOpen: true,
      title: "Revoke Temporary Care Access",
      message: `Immediately revoke ${del.caretakerEmail}'s access to ${del.petName}?`,
      confirmText: "Revoke Access Immediately",
      variant: "danger",
      requireCheckbox: true,
      checkboxLabel: "I confirm immediate termination of caretaker digital access and delegation privileges",
      highlightDetails: (
        <div>
          <p><strong>Caretaker:</strong> {del.caretakerEmail} ({del.caretakerName || 'Caretaker'})</p>
          <p><strong>Delegation Active Until:</strong> {new Date(del.expiresAt).toLocaleString()}</p>
          <p className="text-rose-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0 inline mr-1" />The caretaker will immediately lose visibility of feeding schedules, tasks, and medications.</p>
        </div>
      ),
      action: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
          await delegationApi.revokeDelegation(del.delegationId, "Revoked early by pet guardian", token);
          showToast("Caretaker access revoked successfully", "success");
          loadPetDelegations(selectedPetId);
        } catch (err) {
          showToast("Failed to revoke delegation", "error");
        } finally {
          setConfirmModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }));
        }
      }
    });
  };

  // Resolve Missed Care Case
  const handleResolveMissedCase = (mCase, actionType) => {
    setConfirmModal({
      isOpen: true,
      title: `Resolve Overdue Care: ${mCase.taskTitle}`,
      message: `Confirm action "${actionType}" for ${mCase.petName}'s overdue task?`,
      confirmText: "Confirm Resolution",
      variant: actionType === 'CONFIRM_COMPLETED' ? 'success' : 'warning',
      action: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, isSubmitting: true }));
          await missedCareApi.resolveCase(mCase.caseId, {
            actionType: actionType,
            resolutionNotes: `Action taken: ${actionType}`,
            actorUserId: user?.userId,
            actorName: user?.fullName || 'Pet Guardian'
          }, token);
          showToast("Missed-care case updated and resolved", "success");
          loadPetMissedCases(selectedPetId);
          loadActiveCarePlan(selectedPetId);
        } catch (err) {
          showToast("Failed to resolve case", "error");
        } finally {
          setConfirmModal(prev => ({ ...prev, isSubmitting: false, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header Banner */}
      <PageHeader
        badgeIcon={Heart}
        badgeText="Understand • Check • Act Platform"
        badgeVariant="emerald"
        title="Care Continuity & Missed Care Protection"
        titleIcon={ClipboardList}
        description="Structured next-care plans from veterinary consultations, automatic overdue care detection, and secure temporary caretaker delegation."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {userPets.length > 0 && (
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500/20"
              >
                {userPets.map(p => (
                  <option key={p.petId || p.id} value={p.petId || p.id}>
                    {p.basicProfile?.name || p.name || 'My Pet'} ({p.species || 'Dog'})
                  </option>
                ))}
              </select>
            )}

            {isVetDoctorOrAdmin && (
              <button
                onClick={() => setShowCreatePlanModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Care Plan</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateDelegationModal(true)}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Delegate Care</span>
            </button>
          </div>
        }
      />

      {/* Understand -> Check -> Act Concept Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-3xl border border-emerald-100/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">1</span>
            <span>UNDERSTAND</span>
          </div>
          <h4 className="text-sm font-black text-slate-900">What care does the pet need?</h4>
          <p className="text-xs text-slate-600">
            Converts prescriptions, vaccination boosters, and surgical follow-ups into structured digital tasks.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-3xl border border-amber-100/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wider">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px]">2</span>
            <span>CHECK</span>
          </div>
          <h4 className="text-sm font-black text-slate-900">Was the required care completed?</h4>
          <p className="text-xs text-slate-600">
            Monitors due dates against logged confirmations and distinguishes completed, pending, and overdue care.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-3xl border border-blue-100/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase tracking-wider">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">3</span>
            <span>ACT</span>
          </div>
          <h4 className="text-sm font-black text-slate-900">What should happen next?</h4>
          <p className="text-xs text-slate-600">
            Sends reminders, offers 1-click re-booking, or guides guardian to 24/7 veterinary trauma support.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('CARE_PLANS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'CARE_PLANS' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Care Plans & Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('MISSED_CARE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'MISSED_CARE' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Missed Care Alerts ({missedCases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DELEGATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'DELEGATIONS' 
                ? 'bg-white text-emerald-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Caretaker Delegations ({delegations.length})</span>
          </button>

          {isCaretakerRole && (
            <button
              onClick={() => setActiveTab('CARETAKER_VIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'CARETAKER_VIEW' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Caretaker Cockpit</span>
            </button>
          )}
        </div>

        {activeTab === 'MISSED_CARE' && (
          <button
            onClick={handleRunEvaluation}
            disabled={evaluatingMissedCare}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluatingMissedCare ? 'animate-spin' : ''}`} />
            <span>Evaluate Care Compliance Now</span>
          </button>
        )}
      </div>

      {/* Tab 1: Care Plans & Next-Care Tasks */}
      {activeTab === 'CARE_PLANS' && (
        <div className="space-y-5">
          {!activePlan ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-black text-slate-900">No Active Care Plan for this Pet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once a veterinarian completes a consultation, treatment instructions and medication schedules will automatically appear here.
              </p>
              {isVetDoctorOrAdmin && (
                <button
                  onClick={handleOpenCreatePlan}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Care Plan Now</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Active Plan Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Active Plan • Version {activePlan.version}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{activePlan.treatmentPlanTitle}</h3>
                    <p className="text-xs text-slate-500">
                      Prescribed by <strong className="text-slate-800">{activePlan.doctorName}</strong> ({activePlan.clinicName})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Diagnosed: <span className="text-rose-700">{activePlan.diagnosedIllness}</span>
                    </span>
                    {isVetDoctorOrAdmin && (
                      <button
                        onClick={handleOpenCreatePlan}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Prescribe New / Revised Plan</span>
                      </button>
                    )}
                  </div>
                </div>

                {activePlan.clinicalInstructions && (
                  <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-950">
                    <span className="font-bold">Veterinary Instructions:</span> {activePlan.clinicalInstructions}
                  </div>
                )}
              </div>

              {/* Tasks Timeline */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Scheduled Next-Care Tasks ({activePlan.tasks?.length || 0})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePlan.tasks?.map((task, idx) => {
                    const isDone = task.status === 'COMPLETED';
                    const isOverdue = task.status === 'OVERDUE';

                    return (
                      <div
                        key={task.taskId || idx}
                        className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-3 flex flex-col justify-between ${
                          isDone ? 'border-emerald-200 bg-emerald-50/10' :
                          (isOverdue ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200')
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                              {task.taskType}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isDone ? 'bg-emerald-100 text-emerald-800' :
                              (isOverdue ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-amber-100 text-amber-800')
                            }`}>
                              {task.status}
                            </span>
                          </div>

                          <h5 className="text-sm font-black text-slate-900 leading-snug">{task.title}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">{task.instructions}</p>

                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Due: {new Date(task.dueAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {isDone && task.completedByName && (
                            <div className="p-2 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Completed by <strong>{task.completedByName}</strong> ({new Date(task.completedAt).toLocaleDateString()})</span>
                            </div>
                          )}
                        </div>

                        {/* Task Action Buttons */}
                        {!isDone && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setCompletingTask(task);
                                setCompletionNotes('');
                              }}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Log Completed</span>
                            </button>

                            <button
                              onClick={() => handlePromptCancelTask(task)}
                              className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                              title="Cancel Task"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Tab 2: Missed Care Alerts */}
      {activeTab === 'MISSED_CARE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Detected Incomplete or Overdue Care Cases
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {missedCases.length} Active Compliance Alerts
            </span>
          </div>

          {missedCases.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-black text-slate-900">All Scheduled Pet Care is Up to Date</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No overdue medication doses, vaccinations, or unconfirmed veterinary follow-ups were detected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {missedCases.map((mCase, idx) => {
                const isCritical = mCase.severity === 'CRITICAL' || mCase.severity === 'HIGH';
                const isResolved = mCase.caseStatus === 'RESOLVED';

                return (
                  <div
                    key={mCase.caseId || idx}
                    className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-3 ${
                      isResolved ? 'border-slate-200 opacity-60' :
                      (isCritical ? 'border-rose-300 bg-rose-50/20' : 'border-amber-200 bg-amber-50/20')
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            mCase.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                            (mCase.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')
                          }`}>
                            {mCase.severity} SEVERITY
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            Due Date: {new Date(mCase.dueAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-slate-900 mt-1">{mCase.taskTitle}</h4>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{mCase.guidanceText}</p>
                      </div>

                      {/* Action Desk */}
                      {!isResolved && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleResolveMissedCase(mCase, 'CONFIRM_COMPLETED')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                          >
                            Confirm Completed
                          </button>

                          <button
                            onClick={() => navigate('/vet-appointments')}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            Re-book Visit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Caretaker Delegations */}
      {activeTab === 'DELEGATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                Temporary Caretaker Delegations
              </h3>
              <p className="text-xs text-slate-500">
                Least-privilege delegation granting temporary, time-bounded pet care access without sharing your account password.
              </p>
            </div>

            <button
              onClick={() => setShowCreateDelegationModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Trusted Caretaker</span>
            </button>
          </div>

          {delegations.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Share2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-black text-slate-900">No Active Caretaker Delegations</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Traveling or away? You can delegate feeding schedules, medication checklists, and emergency contacts to a pet-sitter or friend.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {delegations.map((del, idx) => {
                const isActive = del.delegationStatus === 'ACTIVE';

                return (
                  <div
                    key={del.delegationId || idx}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {del.delegationStatus}
                          </span>
                          <h4 className="text-base font-black text-slate-900 mt-1">
                            {del.caretakerName || del.caretakerEmail}
                          </h4>
                          <p className="text-xs text-slate-500">{del.caretakerEmail}</p>
                        </div>

                        <span className="text-[11px] font-bold text-slate-400">
                          Expires: {new Date(del.expiresAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Permissions Pills */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permitted Access:</span>
                        <div className="flex flex-wrap gap-1">
                          {del.allowedPermissions?.map(p => (
                            <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                              {p.replace('VIEW_', '').replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Protected Boundary Banner */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Owner Billing, Passwords & Diagnoses strictly hidden from caretaker.</span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => handlePromptRevokeDelegation(del)}
                          className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Revoke Access
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Caretaker Dedicated Cockpit (Restricted Least-Privilege View) */}
      {activeTab === 'CARETAKER_VIEW' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-3xl border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-purple-950">Caretaker Secure Workspace</h4>
                <p className="text-xs text-purple-800">
                  Least-privilege view active. Confidential owner billing and medical diagnoses are masked.
                </p>
              </div>
            </div>
          </div>

          {!caretakerDashboardData ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <Lock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Select an active delegation to view assigned instructions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Feeding Schedule & Instructions */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Feeding Schedule & Diet
                </h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                  {caretakerDashboardData.feedingSchedule}
                </p>
                <div className="text-xs text-slate-500">
                  <strong>Notes:</strong> {caretakerDashboardData.notes || 'None'}
                </div>
              </div>

              {/* Emergency Hotline */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  Emergency Vet Hotline
                </h4>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                  <span className="text-xs font-black text-rose-950">
                    {caretakerDashboardData.emergencyVetContact}
                  </span>
                  <a
                    href={`tel:${caretakerDashboardData.emergencyVetContact}`}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                  >
                    Call Now
                  </a>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Task Completion Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-200">
            <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Log Care Completion</h3>
              <button onClick={() => setCompletingTask(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Task:</p>
                <h4 className="text-sm font-black text-slate-800">{completingTask.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{completingTask.instructions}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Completion Notes (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Dose administered after meal with no adverse reaction."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTaskCompletion}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20"
                >
                  Confirm Completion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Care Plan Modal (Doctor / Admin) */}
      <LandscapeModal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        title="Generate Structured Pet Care Plan"
        subtitle="Clinical protocol automatically scheduled to pet health calendar and continuity timeline."
        icon={ClipboardList}
        maxWidth="max-w-5xl"
        colorTheme="emerald"
        badge="Care Protocol"
      >
        <form onSubmit={handleCreateCarePlan} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Treatment & Diagnosis Info with Prescribed By and To Patient */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prescribed By (Doctor / Staff) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={newPlanForm.prescribedBy}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, prescribedBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">To Patient (Pet Patient) *</label>
                  {userPets.length > 0 ? (
                    <select
                      value={newPlanForm.toPatientId}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, toPatientId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-emerald-500"
                    >
                      {userPets.map(p => (
                        <option key={p.petId || p.id} value={p.petId || p.id}>
                          {p.basicProfile?.name || p.name} ({p.basicProfile?.species || p.species || 'Pet'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Bruno (Dog)"
                      value={newPlanForm.toPatientId}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, toPatientId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-emerald-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Post-Op Gastroenteritis Recovery Protocol"
                  value={newPlanForm.treatmentPlanTitle}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, treatmentPlanTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosed Illness</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Canine Gastritis / Dietary Indiscretion"
                  value={newPlanForm.diagnosedIllness}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, diagnosedIllness: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Instructions & Parent Advisory</label>
                <textarea
                  rows="3"
                  placeholder="Detailed guidelines: feeding schedule, hydration, monitoring vitals..."
                  value={newPlanForm.clinicalInstructions}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, clinicalInstructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Right Column: Initial Generated Care Tasks (Interactive & Editable by User Vet Doctor / Staff) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Initial Generated Care Tasks ({newPlanForm.tasks.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                The following baseline continuity tasks will be dispatched to the guardian (editable without hardcodes):
              </p>
              
              <div className="space-y-2.5 pt-1 max-h-80 overflow-y-auto pr-1">
                {newPlanForm.tasks.map((t, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Task Title"
                        value={t.title}
                        onChange={(e) => handleUpdateTask(i, 'title', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(i)}
                        disabled={newPlanForm.tasks.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                        title="Remove Task"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Task Type</label>
                        <select
                          value={t.taskType}
                          onChange={(e) => handleUpdateTask(i, 'taskType', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold"
                        >
                          <option value="MEDICATION">MEDICATION</option>
                          <option value="RECOVERY_CHECK">RECOVERY_CHECK</option>
                          <option value="FOLLOW_UP">FOLLOW_UP</option>
                          <option value="VACCINATION_BOOSTER">VACCINATION_BOOSTER</option>
                          <option value="DIAGNOSTIC_TEST">DIAGNOSTIC_TEST</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                        <select
                          value={t.priority}
                          onChange={(e) => handleUpdateTask(i, 'priority', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-black text-rose-700"
                        >
                          <option value="ROUTINE">ROUTINE</option>
                          <option value="URGENT">URGENT</option>
                          <option value="EMERGENCY">EMERGENCY</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Due Date & Time</label>
                      <input
                        type="datetime-local"
                        value={t.dueAt}
                        onChange={(e) => handleUpdateTask(i, 'dueAt', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Instructions for guardian / parent"
                        value={t.instructions}
                        onChange={(e) => handleUpdateTask(i, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreatePlanModal(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Publish Care Plan
            </button>
          </div>
        </form>
      </LandscapeModal>

      {/* Create Caretaker Delegation Modal */}
      {showCreateDelegationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-blue-200">
            <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Delegate Pet Care Access</h3>
              <button onClick={() => setShowCreateDelegationModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDelegation} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Caretaker Email *</label>
                <input
                  type="email"
                  required
                  placeholder="caretaker@gmail.com"
                  value={newDelegationForm.caretakerEmail}
                  onChange={(e) => setNewDelegationForm({ ...newDelegationForm, caretakerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newDelegationForm.startsAt}
                    onChange={(e) => setNewDelegationForm({ ...newDelegationForm, startsAt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Expiry Time *</label>
                  <input
                    type="datetime-local"
                    value={newDelegationForm.expiresAt}
                    onChange={(e) => setNewDelegationForm({ ...newDelegationForm, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Feeding Schedule</label>
                <input
                  type="text"
                  value={newDelegationForm.feedingSchedule}
                  onChange={(e) => setNewDelegationForm({ ...newDelegationForm, feedingSchedule: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDelegationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Alert Confirmation Modal */}
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
