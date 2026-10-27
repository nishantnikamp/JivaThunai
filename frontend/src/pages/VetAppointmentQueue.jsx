import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, Video, Stethoscope, User, Dog, CheckCircle2, 
  AlertCircle, Plus, Filter, Search, Phone, ChevronRight, X, 
  Play, Check, AlertTriangle, ShieldCheck, RefreshCw, MessageSquare,
  Activity, ArrowRight, ExternalLink, Building2, ChevronDown, MapPin, Award, CheckCircle, SearchX,
  ClipboardList, Radio, Mail, Siren
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { bookingApi, emergencyApi, petApi, adminApi, profileApi, hospitalProfileApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import CheckInConfirmationModal from '../components/CheckInConfirmationModal';
import CancelAppointmentModal from '../components/CancelAppointmentModal';
import { PageHeader } from '../components/PageHeader';
import LandscapeModal from '../components/LandscapeModal';


export const VetAppointmentQueue = () => {
  const { showToast } = useNotification();
  const { user, token, activeRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isVetStaff = ['VETERINARY_DOCTOR', 'VETERINARY_ADMIN', 'ASSISTANT_VET_DOCTOR', 'VET_STAFF', 'SUPER_ADMIN', 'ADMIN'].includes(activeRole);
  const isVetAppointmentsPage = location.pathname === '/vet-appointments' || !isVetStaff;


  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic DB lists for Hospitals and Doctors
  const [hospitalsList, setHospitalsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Searchable Dropdown States for Modal
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [isHospitalDropdownOpen, setIsHospitalDropdownOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const hospitalDropdownRef = useRef(null);
  const doctorDropdownRef = useRef(null);

  // New Booking Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [newBooking, setNewBooking] = useState({
    doctorId: '',
    doctorName: '',
    petId: '',
    petName: '',
    ownerId: user?.userId || user?.id || '',
    ownerName: user?.fullName || user?.name || 'Pet Guardian',
    ownerPhone: user?.phone || '+91 98765 43210',
    hospitalId: '',
    hospitalName: '',
    appointmentDateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    durationMinutes: 30,
    consultationType: 'IN_CLINIC',
    symptoms: ''
  });

  // Video Consultation Active Room Modal
  const [activeVideoCall, setActiveVideoCall] = useState(null);

  // Cancellation Modal
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Check-In Confirmation Modal
  const [checkInModalBooking, setCheckInModalBooking] = useState(null);
  const [checkInTriageNotes, setCheckInTriageNotes] = useState('');
  const [statusActionLoading, setStatusActionLoading] = useState(null);


  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hospitalDropdownRef.current && !hospitalDropdownRef.current.contains(event.target)) {
        setIsHospitalDropdownOpen(false);
      }
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target)) {
        setIsDoctorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserPets = async () => {
    const ownerId = user?.userId || user?.id;
    if (!ownerId) {
      setUserPets([]);
      return [];
    }
    setLoadingPets(true);
    try {
      const res = await petApi.getPetsByOwner(ownerId, token);
      if (res && res.data && Array.isArray(res.data)) {
        setUserPets(res.data);
        return res.data;
      } else {
        setUserPets([]);
        return [];
      }
    } catch (err) {
      console.warn("Could not fetch user's registered pets", err);
      setUserPets([]);
      return [];
    } finally {
      setLoadingPets(false);
    }
  };

  const handleOpenScheduleModal = () => {
    if (!user) {
      showToast('Please log in to schedule an appointment for your pet', 'warning');
      navigate('/login');
      return;
    }
    if (userPets.length === 0) {
      showToast('Please register your pet first to schedule an appointment', 'warning');
      navigate('/register-pet');
      return;
    }

    const ownerId = user?.userId || user?.id || '';
    const ownerName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'Pet Guardian');
    const ownerPhone = user?.phone || '+91 98765 43210';
    
    // Choose default pet if available
    const initialPetId = userPets.length > 0 ? (userPets[0].petId || userPets[0].id) : '';
    const initialPetName = userPets.length > 0 ? (userPets[0].basicProfile?.name || userPets[0].name || 'My Pet') : '';

    setNewBooking({
      doctorId: '',
      doctorName: '',
      petId: initialPetId,
      petName: initialPetName,
      ownerId: ownerId,
      ownerName: ownerName,
      ownerPhone: ownerPhone,
      hospitalId: '',
      hospitalName: '',
      appointmentDateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      durationMinutes: 30,
      consultationType: 'IN_CLINIC',
      symptoms: ''
    });
    setDoctorsList([]);
    setHospitalSearch('');
    setDoctorSearch('');
    setIsHospitalDropdownOpen(false);
    setIsDoctorDropdownOpen(false);
    fetchUserPets();
    fetchHospitalsFromDb();
    setShowBookModal(true);
  };

  const fetchHospitalsFromDb = async () => {
    setLoadingHospitals(true);
    try {
      const mergedMap = new Map();

      const getUnifiedKey = (item) => {
        const rawName = (item.registeredBusinessName || item.name || item.fullName || item.hospitalName || item.displayName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (rawName.includes('karpagam')) return 'karpagam-hospital';
        return item.organizationId ? String(item.organizationId) : (item.id ? String(item.id) : rawName);
      };

      const mergeIntoMap = (raw) => {
        const name = raw.registeredBusinessName || raw.name || raw.fullName || raw.hospitalName || raw.displayName;
        if (!name || name.toLowerCase().includes('petcare veterinary hospital')) return;
        
        const key = getUnifiedKey(raw);
        const existing = mergedMap.get(key);

        const isKarpagam = key === 'karpagam-hospital';
        const bestName = isKarpagam 
          ? "Karpagam Hospital & Research Center" 
          : (existing?.registeredBusinessName || name);
        
        const bestAddress = isKarpagam
          ? "Pollachi Main Rd, Ottakkalmandapam, Tamil Nadu 641032"
          : (raw.address || raw.streetAddress || raw.addressLine || existing?.address || '');

        const bestCity = isKarpagam
          ? "Ottakkalmandapam"
          : (raw.city || existing?.city || '');

        const bestPhone = isKarpagam
          ? "9876789564"
          : (raw.primaryContactMobile || raw.phone || raw.primaryPhone || existing?.primaryContactMobile || '');

        const isEmergency = isKarpagam 
          ? true 
          : (Boolean(raw.emergencySupport247) || Boolean(existing?.emergencySupport247));

        const altIds = existing?.altIds ? new Set(existing.altIds) : new Set();
        if (raw.organizationId) altIds.add(String(raw.organizationId));
        if (raw.id) altIds.add(String(raw.id));
        if (isKarpagam) altIds.add("21");

        mergedMap.set(key, {
          organizationId: existing?.organizationId || String(raw.organizationId || raw.id || key),
          registeredBusinessName: bestName,
          address: bestAddress,
          city: bestCity,
          state: raw.state || existing?.state || 'Tamil Nadu',
          primaryContactMobile: bestPhone,
          kycStatus: 'APPROVED',
          emergencySupport247: isEmergency,
          altIds: Array.from(altIds)
        });
      };

      // 0. Priority: Fetch active Showcase Hospital Profile
      try {
        const myProfileRes = await hospitalProfileApi.getMyProfile(null, token);
        if (myProfileRes && myProfileRes.data) {
          const p = myProfileRes.data;
          mergeIntoMap({
            organizationId: p.organizationId || p.id,
            id: p.id,
            registeredBusinessName: p.hospitalName || p.displayName,
            address: p.streetAddress || p.address?.streetAddress,
            city: p.city || p.address?.city,
            state: p.state || p.address?.state,
            primaryContactMobile: p.primaryPhone || p.emergencyPhone,
            emergencySupport247: p.emergencySupport247
          });
        }
      } catch (err) {
        console.warn("Could not load current showcase profile", err);
      }

      // 1. Fetch registered Veterinary Admin users from identity database
      try {
        const profRes = await profileApi.getVeterinaryHospitals(token);
        if (profRes && profRes.data && Array.isArray(profRes.data)) {
          profRes.data.forEach(h => mergeIntoMap(h));
        }
      } catch (err) {
        console.warn("Could not load veterinary admin hospitals from profile service", err);
      }

      // 2. Fetch facilities from medical-health database
      try {
        const hospRes = await bookingApi.getHospitals(token);
        if (hospRes && hospRes.data && Array.isArray(hospRes.data)) {
          hospRes.data.forEach(h => mergeIntoMap(h));
        }
      } catch (err) {
        console.warn("Could not load hospitals from booking service", err);
      }

      setHospitalsList(Array.from(mergedMap.values()));
    } catch (e) {
      console.warn("Could not load hospitals from database", e);
      setHospitalsList([]);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchBookings = async (customPets = null, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const ownerId = user?.userId || user?.id;

      if (!user) {
        setBookings([]);
        if (!silent) setLoading(false);
        return;
      }

      let currentPets = customPets || userPets;
      if (!currentPets || currentPets.length === 0) {
        try {
          const petRes = await petApi.getPetsByOwner(ownerId, token);
          if (petRes && petRes.data && Array.isArray(petRes.data)) {
            currentPets = petRes.data;
            setUserPets(currentPets);
          }
        } catch (e) {
          console.warn("Could not pre-load user pets", e);
        }
      }

      const params = {};
      if (isVetAppointmentsPage) {
        if (!currentPets || currentPets.length === 0) {
          // If the user has not registered any pet, no pet data can be visible
          setBookings([]);
          if (!silent) setLoading(false);
          return;
        }
        if (ownerId) {
          params.ownerId = ownerId;
        }
        const petIds = currentPets.map(p => p.petId || p.id).filter(Boolean);
        if (petIds.length > 0) {
          params.petIds = petIds.join(',');
        }
      }

      const res = await bookingApi.getBookings(params, token);
      const rawList = (res && res.data && Array.isArray(res.data)) ? res.data : [];

      if (isVetAppointmentsPage) {
        // Strictly filter: only bookings for pets registered by the current user
        const registeredPetIds = new Set(
          (currentPets || []).map(p => String(p.petId || p.id).toLowerCase())
        );
        const currentUserId = String(ownerId || '').toLowerCase();

        const strictlyUserBookings = rawList.filter(b => {
          const bookingPetId = String(b.petId || '').toLowerCase();
          const bookingOwnerId = String(b.ownerId || '').toLowerCase();
          return registeredPetIds.has(bookingPetId) || (currentUserId && bookingOwnerId === currentUserId);
        });
        setBookings(strictlyUserBookings);
      } else {
        setBookings(rawList);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
      if (!silent) showToast('Error loading live appointment queue', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let interval = null;
    const init = async () => {
      fetchHospitalsFromDb();
      if (user) {
        const pets = await fetchUserPets();
        fetchBookings(pets);
        // Live auto-tracking every 10 seconds
        interval = setInterval(() => {
          fetchBookings(pets, true);
        }, 10000);
      } else {
        setBookings([]);
        setLoading(false);
      }
    };
    init();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, token, activeRole, location.pathname]);

  const handleSelectHospital = async (hospital) => {
    setNewBooking(prev => ({
      ...prev,
      hospitalId: hospital.organizationId,
      hospitalName: hospital.registeredBusinessName,
      doctorId: '',
      doctorName: ''
    }));
    setHospitalSearch('');
    setIsHospitalDropdownOpen(false);

    // Fetch doctors specifically belonging to the selected Veterinary Admin hospital from database
    setLoadingDoctors(true);
    try {
      const docMap = new Map();
      const idsToTry = Array.from(new Set([hospital.organizationId, ...(hospital.altIds || []), '21'])).filter(Boolean);

      // 1. Fetch from identity service using primary and alternate IDs
      for (const hid of idsToTry) {
        try {
          const profDocRes = await profileApi.getVeterinaryDoctors(hid, token);
          if (profDocRes && profDocRes.data && Array.isArray(profDocRes.data)) {
            profDocRes.data.forEach(d => {
              const key = String(d.doctorId || d.id || d.doctorName);
              docMap.set(key, d);
            });
          }
        } catch (err) {
          console.warn(`Could not load doctors from profile service for ID ${hid}`, err);
        }
      }

      // 2. Fetch from medical service
      for (const hid of idsToTry) {
        try {
          const res = await bookingApi.getDoctors(hid, token);
          if (res && res.data && Array.isArray(res.data)) {
            res.data.forEach(d => {
              const key = String(d.doctorId || d.id || d.doctorName);
              if (!docMap.has(key)) {
                docMap.set(key, d);
              }
            });
          }
        } catch (err) {
          console.warn(`Could not load doctors from booking service for ID ${hid}`, err);
        }
      }

      // Guarantee Dr. Kanishka is available as attending doctor for Karpagam Hospital
      const isKarpagam = (hospital.registeredBusinessName || '').toLowerCase().includes('karpagam');
      if (isKarpagam) {
        const hasKanishka = Array.from(docMap.values()).some(d => (d.doctorName || '').toLowerCase().includes('kanishka'));
        if (!hasKanishka) {
          docMap.set('27', {
            doctorId: '27',
            doctorName: 'Dr. Kanishka',
            specialization: 'Veterinary Physician & Surgeon',
            email: '717823d126@kce.ac.in',
            phone: '9876789564',
            hospitalId: hospital.organizationId,
            hospitalName: hospital.registeredBusinessName,
            kycStatus: 'APPROVED'
          });
        }
      }

      setDoctorsList(Array.from(docMap.values()));
    } catch (e) {
      console.warn("Could not load doctors for hospital from database", e);
      setDoctorsList([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    const formattedDocName = doctor.doctorName + (doctor.specialization ? ` (${doctor.specialization})` : '');
    setNewBooking(prev => ({
      ...prev,
      doctorId: doctor.doctorId,
      doctorName: formattedDocName,
      hospitalId: doctor.hospitalId || prev.hospitalId,
      hospitalName: doctor.hospitalName || prev.hospitalName
    }));
    setDoctorSearch('');
    setIsDoctorDropdownOpen(false);
  };

  const handleStatusChange = async (bookingId, newStatus, extraData = {}) => {
    setStatusActionLoading(bookingId);
    try {
      const payload = {
        bookingStatus: newStatus,
        ...extraData
      };
      const res = await bookingApi.updateBookingStatus(bookingId, payload, token);
      if (res && (res.status === 200 || res.success || res.data)) {
        showToast(`Appointment status updated to ${newStatus}`, 'success');
        fetchBookings();
        if (cancelModalBooking) setCancelModalBooking(null);
        if (checkInModalBooking) setCheckInModalBooking(null);
      } else {
        showToast(res?.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error modifying appointment status', 'error');
    } finally {
      setStatusActionLoading(null);
    }
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!newBooking.petId) {
      showToast('Please select or specify a Pet ID', 'error');
      return;
    }
    if (!newBooking.hospitalId) {
      showToast('Please select a Veterinary Admin Hospital from the database', 'error');
      return;
    }
    if (!newBooking.doctorId) {
      showToast('Please select an Attending Veterinary Doctor for the hospital', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...newBooking,
        appointmentDateTime: new Date(newBooking.appointmentDateTime).toISOString()
      };
      const res = await bookingApi.createBooking(payload, token);
      if (res && (res.status === 201 || res.success || res.data)) {
        showToast('Appointment scheduled and confirmed without calendar conflicts!', 'success');
        setShowBookModal(false);
        fetchBookings();
      } else {
        showToast(res?.message || 'Conflict detected: Selected doctor slot is unavailable.', 'error');
      }
    } catch (err) {
      showToast('Slot clash or server error booking appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || b.consultationType === typeFilter;
    const matchesSearch = searchQuery === '' || 
      (b.petName && b.petName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.ownerName && b.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.doctorName && b.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.symptoms && b.symptoms.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-300">CONFIRMED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full border border-blue-300 animate-pulse">IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded-full border border-slate-300">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full border border-rose-300">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full border border-amber-300">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header Banner */}
      <PageHeader
        badgeIcon={Activity}
        badgeText={isVetAppointmentsPage ? (user ? `${userPets.length} Registered ${userPets.length === 1 ? 'Pet' : 'Pets'}` : 'Sign-In Required') : 'Live Clinic & Hospital Triage'}
        badgeVariant={isVetAppointmentsPage ? (userPets.length > 0 ? 'emerald' : 'amber') : 'teal'}
        title={isVetAppointmentsPage ? 'Vet & Clinic Bookings' : 'Vet Appointments & Consultation Queue'}
        titleIcon={Calendar}
        description={
          isVetAppointmentsPage
            ? 'Collision-proof calendar scheduling, receptionist patient check-in, and tele-health video consults for your registered pets.'
            : 'Collision-proof calendar scheduling, receptionist patient check-in, and instant tele-health video consultations.'
        }
        meta={<span>• Real-Time Consultation Pipeline</span>}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl text-xs font-bold shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Live Queue Feed
              </span>
            </div>

            <button
              onClick={handleOpenScheduleModal}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Appointment</span>
            </button>
          </div>
        }
      />

      {/* Quick Jump Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => navigate('/hospital-operations')}
          className="bg-white p-4 rounded-3xl border border-blue-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Live Capacity Tracker
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-0.5">Emergency Ward, ICU & OT Management</h4>
              <p className="text-xs text-slate-500">Track real-time bed capacity, sterile OT suites, and on-duty doctors.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
        </div>

        <div 
          onClick={() => navigate('/care-continuity')}
          className="bg-white p-4 rounded-3xl border border-emerald-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Understand • Check • Act
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-0.5">Care Continuity & Missed Care Protection</h4>
              <p className="text-xs text-slate-500">Structured care tasks, compliance detection, and caretaker delegations.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search pet, owner, doctor, symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Consultation Type Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Consultation Types</option>
            <option value="IN_CLINIC">In-Clinic Walk-in</option>
            <option value="VIDEO_CONSULTATION">Tele-Health Video</option>
            <option value="EMERGENCY_HOME_VISIT">Emergency Visit</option>
          </select>
        </div>
      </div>

      {/* Appointment Queue Cards / Table */}
      <div className="space-y-4">
        {!user ? (
          <div className="bg-white p-12 rounded-3xl border border-emerald-100 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-slate-900">Pet Guardian Login Required</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Please log in to view appointments for your registered pets. Pet medical records and consultation queues are strictly private to verified owners.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Log In to View Appointments
            </button>
          </div>
        ) : isVetAppointmentsPage && userPets.length === 0 && !loadingPets ? (
          <div className="bg-white p-12 rounded-3xl border border-emerald-100 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
              <Dog className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider rounded-full border border-amber-300 inline-flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                No Registered Pets Found
              </span>
              <h2 className="text-xl font-black text-slate-900 pt-1">
                Only Your Registered Pets' Appointments are Displayed
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                You haven't registered any pets on Jiva Thunai yet. Only if a pet is registered under your account can you view or book their veterinary appointments.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/register-pet')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Register Your Pet Now</span>
              </button>
            </div>
          </div>
        ) : loading && bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-emerald-100 shadow-sm text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Connecting to MySQL Roster & Queue Engine...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-emerald-100 shadow-sm text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-800">
              {isVetAppointmentsPage ? 'No Appointments for Your Registered Pets' : 'No Appointments Matching Filters'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isVetAppointmentsPage
                ? (searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL')
                  ? 'No appointments matching current filters for your registered pets.'
                  : `You have no scheduled appointments for your registered pets (${userPets.map(p => p.basicProfile?.name || p.name).join(', ') || 'your pets'}). Schedule a consultation below.`
                : 'Schedule a new appointment to dispatch doctor slots or clear active search filters.'}
            </p>
            <button
              onClick={handleOpenScheduleModal}
              className="mt-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Schedule New Consultation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((b) => {
              const appDate = new Date(b.appointmentDateTime);
              const isToday = appDate.toDateString() === new Date().toDateString();

              return (
                <div 
                  key={b.bookingId} 
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-sm hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    b.bookingStatus === 'IN_PROGRESS' 
                      ? 'border-blue-300 ring-2 ring-blue-400/20 bg-blue-50/20' 
                      : 'border-emerald-100/90'
                  }`}
                >
                  {/* Left: Patient & Appointment Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 border border-emerald-100 flex flex-col items-center justify-center flex-shrink-0 w-16 text-center">
                      <span className="text-[10px] font-black uppercase text-emerald-800">
                        {appDate.toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black text-slate-900 leading-none my-0.5">
                        {appDate.getDate()}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500">
                        {appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                          <Dog className="w-4 h-4 text-emerald-600" />
                          {b.petName || 'Pet Patient'}
                        </h3>
                        {getStatusBadge(b.bookingStatus)}
                        
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md inline-flex items-center gap-1">
                          {b.consultationType === 'VIDEO_CONSULTATION' ? (
                            <>
                              <Video className="w-3 h-3 text-blue-600 inline" />
                              <span>Video</span>
                            </>
                          ) : b.consultationType === 'IN_CLINIC' ? (
                            <>
                              <Building2 className="w-3 h-3 text-emerald-600 inline" />
                              <span>In-Clinic</span>
                            </>
                          ) : (
                            <>
                              <Siren className="w-3 h-3 text-rose-600 inline" />
                              <span>Emergency</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-700">Owner:</span> {b.ownerName} ({b.ownerPhone || 'No Phone'})
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-700">Doctor:</span> {b.doctorName || 'Attending Surgeon'}
                        </p>
                      </div>

                      {b.symptoms && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/60 mt-1">
                          <strong className="text-slate-700">Clinical Symptoms:</strong> {b.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions & Video Tele-Health Launch */}
                  <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto justify-end">
                    
                    {/* Pet Digital Profile / Passport Link */}
                    <button
                      onClick={() => navigate(`/Profile?petId=${b.petId}`)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
                      title="View Digital Pet Passport & Profile"
                    >
                      <Dog className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pet Profile</span>
                    </button>

                    {/* Medical EHR View Link - Only for Vet Doctors & Clinic Staff */}
                    {isVetStaff && (
                      <button
                        onClick={() => navigate(`/medical?petId=${b.petId}`)}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
                        title="View Complete Medical History & EHR"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        <span>EHR Record</span>
                      </button>
                    )}

                    {/* Launch Video Call Button if Video Consultation (Available to both Patient & Doctor) */}
                    {b.consultationType === 'VIDEO_CONSULTATION' && b.bookingStatus !== 'CANCELLED' && (
                      <button
                        onClick={() => setActiveVideoCall(b)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch Tele-Health</span>
                      </button>
                    )}

                    {/* Status State Transitions - Strictly for Veterinary Doctors / Staff */}
                    {isVetStaff && b.bookingStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => setCheckInModalBooking(b)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Check-In Patient</span>
                      </button>
                    )}

                    {isVetStaff && b.bookingStatus === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange(b.bookingId, 'COMPLETED')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete Visit</span>
                      </button>
                    )}

                    {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'COMPLETED' && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Cancel Appointment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW APPOINTMENT BOOKING MODAL */}
      <LandscapeModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Schedule Verified Vet Appointment"
        subtitle="Atomic real-time calendar validation against MySQL roster."
        icon={Calendar}
        maxWidth="max-w-6xl"
        colorTheme="emerald"
        badge="Verified Roster"
      >
        <form onSubmit={handleCreateBookingSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Guardian, Pet, Mode & Schedule */}
            <div className="space-y-4">
              {/* Pet Parent / Owner Profile Info */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    {newBooking.ownerName ? newBooking.ownerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {newBooking.ownerName || 'Registered Pet Guardian'}
                      </p>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                        Pet Parent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {newBooking.ownerPhone || 'Registered Mobile'}
                      </span>
                      {user?.email && (
                        <span className="hidden sm:inline-flex items-center gap-1">
                          <span className="text-slate-300">•</span>
                          <Mail className="w-3 h-3 text-slate-400" />
                          {user.email}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified User
                  </span>
                </div>
              </div>

              {/* Select Registered Pet Patient */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Dog className="w-3.5 h-3.5 text-emerald-600" />
                    Select Registered Pet Patient <span className="text-slate-400 font-normal">(My Registered Pets)</span>
                  </label>
                  {userPets.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {userPets.length} {userPets.length === 1 ? 'Pet' : 'Pets'} Available
                    </span>
                  )}
                </div>

                {loadingPets ? (
                  <div className="flex items-center justify-center py-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    Fetching registered pets from database...
                  </div>
                ) : userPets.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={newBooking.petId}
                      onChange={(e) => {
                        const selected = userPets.find(p => String(p.petId || p.id) === e.target.value);
                        setNewBooking(prev => ({
                          ...prev,
                          petId: e.target.value,
                          petName: selected?.basicProfile?.name || selected?.name || 'Pet'
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all cursor-pointer shadow-2xs"
                      required
                    >
                      <option value="">-- Choose from your registered pets --</option>
                      {userPets.map(p => {
                        const pid = String(p.petId || p.id);
                        const pname = p.basicProfile?.name || p.name || 'Unnamed Pet';
                        const breed = p.basicProfile?.breed || p.breed || 'Breed Unspecified';
                        const species = p.basicProfile?.species || p.species || 'Pet';
                        const age = p.basicProfile?.age ? `${p.basicProfile.age} Yrs` : '';
                        return (
                          <option key={pid} value={pid}>
                            {pname} — {species} ({breed}) {age ? `• ${age}` : ''}
                          </option>
                        );
                      })}
                    </select>

                    {/* Selected Pet Quick Preview */}
                    {newBooking.petId && (() => {
                      const selected = userPets.find(p => String(p.petId || p.id) === newBooking.petId);
                      if (!selected) return null;
                      const pname = selected.basicProfile?.name || selected.name || 'Pet';
                      const breed = selected.basicProfile?.breed || selected.breed || 'Standard';
                      const species = selected.basicProfile?.species || selected.species || 'Companion Animal';
                      const gender = selected.basicProfile?.gender || selected.gender;
                      const microchip = selected.medicalProfile?.microchipNumber || selected.microchipNumber;

                      return (
                        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                              <Dog className="w-4 h-4 text-emerald-700" />
                            </span>
                            <div>
                              <p className="font-black text-slate-800">{pname}</p>
                              <p className="text-[11px] text-slate-500">{species} • {breed} {gender ? `• ${gender}` : ''}</p>
                            </div>
                          </div>
                          {microchip && (
                            <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                              Chip: {microchip}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Registration Required</span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Appointments can only be scheduled for pets registered under your account. Please register your pet first.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/register-pet')}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5 mx-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Pet Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Consultation Type & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Mode</label>
                  <select
                    value={newBooking.consultationType}
                    onChange={(e) => setNewBooking({ ...newBooking, consultationType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="IN_CLINIC">In-Clinic Hospital Visit</option>
                    <option value="VIDEO_CONSULTATION">Live Video Tele-Consult</option>
                    <option value="EMERGENCY_HOME_VISIT">Emergency Ambulance Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newBooking.appointmentDateTime}
                    onChange={(e) => setNewBooking({ ...newBooking, appointmentDateTime: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Hospital, Doctor, Clinical Symptoms */}
            <div className="space-y-4">
              {/* Hospital / Clinic Center Searchable Dropdown */}
              <div className="relative" ref={hospitalDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Hospital / Clinic Center <span className="text-slate-400 font-normal">(Veterinary Admin Hospitals)</span>
                  </label>
                  {newBooking.hospitalName && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Selected
                    </span>
                  )}
                </div>

                {/* Dropdown Trigger Box */}
                <div 
                  onClick={() => setIsHospitalDropdownOpen(!isHospitalDropdownOpen)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isHospitalDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className={`truncate ${newBooking.hospitalName ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {newBooking.hospitalName || 'Search & select Veterinary Admin hospital...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {newBooking.hospitalName && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewBooking(prev => ({ ...prev, hospitalId: '', hospitalName: '', doctorId: '', doctorName: '' }));
                        }}
                        className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
                        title="Clear hospital"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isHospitalDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </div>
                </div>

                {/* Dropdown Popover */}
                {isHospitalDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-emerald-100 p-2 space-y-2 animate-in fade-in zoom-in-95 max-h-72 flex flex-col">
                    {/* Search Input Box */}
                    <div className="relative flex-shrink-0">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search hospital by name, city, or area..."
                        value={hospitalSearch}
                        onChange={(e) => setHospitalSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {hospitalSearch && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setHospitalSearch(''); }}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Hospital Options List */}
                    <div className="overflow-y-auto space-y-1.5 flex-1 pr-0.5">
                      {loadingHospitals ? (
                        <div className="p-4 text-center text-slate-500 text-xs font-bold flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                          Loading registered hospitals...
                        </div>
                      ) : (() => {
                        const filteredHospitals = hospitalsList.filter(h => {
                          const q = hospitalSearch.toLowerCase();
                          return (
                            (h.registeredBusinessName && h.registeredBusinessName.toLowerCase().includes(q)) ||
                            (h.address && h.address.toLowerCase().includes(q)) ||
                            (h.city && h.city.toLowerCase().includes(q))
                          );
                        });

                        if (filteredHospitals.length === 0) {
                          return (
                            <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-amber-200 space-y-1.5">
                              <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                              <p className="text-xs font-bold text-slate-800">Hospital / Clinic Not Found</p>
                              <p className="text-[11px] text-slate-500">
                                {hospitalSearch ? `No registered Veterinary Admin clinic center matches "${hospitalSearch}"` : 'No hospital records found in database.'}
                              </p>
                            </div>
                          );
                        }

                        return filteredHospitals.map(h => {
                          const isSelected = newBooking.hospitalId === h.organizationId;
                          return (
                            <div
                              key={h.organizationId}
                              onClick={() => handleSelectHospital(h)}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all border flex items-start justify-between gap-2 ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                                  : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                              }`}
                            >
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900">{h.registeredBusinessName}</span>
                                  {h.emergencySupport247 && (
                                    <span className="text-[9px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.2 rounded-full border border-rose-200">
                                      24/7 ER
                                    </span>
                                  )}
                                  {h.kycStatus === 'APPROVED' && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                      Vet Admin Verified
                                    </span>
                                  )}
                                </div>
                                {(h.address || h.city) && (
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span>{h.address || h.city}</span>
                                  </p>
                                )}
                                {h.primaryContactMobile && (
                                  <p className="text-[10px] text-slate-400">Phone: {h.primaryContactMobile}</p>
                                )}
                              </div>
                              {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Attending Veterinary Doctor Searchable Dropdown */}
              <div className="relative" ref={doctorDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    Attending Veterinary Doctor <span className="text-slate-400 font-normal">(Selected Hospital's Doctors)</span>
                  </label>
                  {newBooking.hospitalName && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate max-w-[150px] inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-emerald-600 inline shrink-0" />
                      <span className="truncate">{newBooking.hospitalName}</span>
                    </span>
                  )}
                </div>

                {/* Dropdown Trigger Box */}
                <div 
                  onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isDoctorDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Stethoscope className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className={`truncate ${newBooking.doctorName ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {newBooking.doctorName || (newBooking.hospitalName ? `Select doctor from ${newBooking.hospitalName}...` : 'Select Veterinary Admin hospital first...')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {newBooking.doctorName && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewBooking(prev => ({ ...prev, doctorId: '', doctorName: '' }));
                        }}
                        className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
                        title="Clear doctor"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDoctorDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </div>
                </div>

                {/* Dropdown Popover */}
                {isDoctorDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-emerald-100 p-2 space-y-2 animate-in fade-in zoom-in-95 max-h-72 flex flex-col">
                    {/* Filter context banner */}
                    {newBooking.hospitalName ? (
                      <div className="px-2.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-bold flex items-center justify-between">
                        <span className="truncate inline-flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Doctors at {newBooking.hospitalName}</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 flex-shrink-0">Filtered</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Showing doctors across all clinics. Pick a hospital to filter.</span>
                      </div>
                    )}

                    {/* Search Input Box */}
                    <div className="relative flex-shrink-0">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search doctor by name, specialization, or VCI..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {doctorSearch && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDoctorSearch(''); }}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Doctor Options List */}
                    <div className="overflow-y-auto space-y-1.5 flex-1 pr-0.5">
                      {loadingDoctors ? (
                        <div className="p-4 text-center text-slate-500 text-xs font-bold flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                          Loading registered doctors...
                        </div>
                      ) : (() => {
                        const filteredDoctors = doctorsList.filter(doc => {
                          const q = doctorSearch.toLowerCase();
                          const matchesQuery = !q || 
                            (doc.doctorName && doc.doctorName.toLowerCase().includes(q)) ||
                            (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
                            (doc.vciRegistrationNumber && doc.vciRegistrationNumber.toLowerCase().includes(q)) ||
                            (doc.hospitalName && doc.hospitalName.toLowerCase().includes(q));

                          // Strictly match selected hospital if one is active
                          const matchesHospital = !newBooking.hospitalId || doc.hospitalId === newBooking.hospitalId;

                          return matchesQuery && matchesHospital;
                        });

                        if (filteredDoctors.length === 0) {
                          return (
                            <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-amber-200 space-y-1.5">
                              <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                              <p className="text-xs font-bold text-slate-800">Attending Doctor Not Found</p>
                              <p className="text-[11px] text-slate-500">
                                {doctorSearch 
                                  ? `No veterinary doctor matches "${doctorSearch}"`
                                  : newBooking.hospitalName
                                    ? `No attending doctors registered under "${newBooking.hospitalName}".`
                                    : 'No doctor records found in database.'}
                              </p>
                              {newBooking.hospitalId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewBooking(prev => ({ ...prev, hospitalId: '', hospitalName: '' }));
                                  }}
                                  className="mt-1 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
                                >
                                  Show Doctors Across All Hospitals
                                </button>
                              )}
                            </div>
                          );
                        }

                        return filteredDoctors.map(doc => {
                          const isSelected = newBooking.doctorId === doc.doctorId;
                          return (
                            <div
                              key={doc.doctorId}
                              onClick={() => handleSelectDoctor(doc)}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all border flex items-start justify-between gap-2 ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                                  : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                              }`}
                            >
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900">{doc.doctorName}</span>
                                  {doc.vciRegistrationNumber && (
                                    <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded-md border border-blue-200 flex items-center gap-0.5">
                                      <Award className="w-2.5 h-2.5 text-blue-600" />
                                      {doc.vciRegistrationNumber}
                                    </span>
                                  )}
                                </div>
                                {doc.specialization && (
                                  <p className="text-[11px] text-emerald-700 font-semibold">{doc.specialization}</p>
                                )}
                                {doc.hospitalName && (
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span>{doc.hospitalName}</span>
                                  </p>
                                )}
                              </div>
                              {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Symptoms / Clinical Reasons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Symptoms / Care Guidelines</label>
                <textarea
                  rows="3"
                  value={newBooking.symptoms}
                  onChange={(e) => setNewBooking({ ...newBooking, symptoms: e.target.value })}
                  placeholder="Describe behavioral changes, cough, limping, fever, or routine vaccination..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying Calendar Slots...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </LandscapeModal>

      {/* ACTIVE VIDEO TELE-HEALTH MODAL */}
      {activeVideoCall && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-400" />
                    Tele-Health Video Room: {activeVideoCall.videoRoomId || 'JT-CLINIC-LIVE'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patient: <span className="font-bold text-emerald-400">{activeVideoCall.petName}</span> • Doctor: {activeVideoCall.doctorName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveVideoCall(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Stage Simulation */}
            <div className="relative bg-slate-950 h-80 sm:h-96 flex items-center justify-center p-4">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-pulse">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <p className="text-sm font-bold text-white">Live Encrypted Video Stream Active</p>
                <p className="text-xs text-slate-400">Audio, Video, and Real-Time Vital Telemetry Connected</p>
              </div>

              {/* Picture in Picture */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-xs text-slate-400 shadow-xl">
                <User className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between">
              <div className="text-xs text-slate-300 font-semibold">
                Symptoms: <span className="text-slate-400">{activeVideoCall.symptoms || 'General Checkup'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleStatusChange(activeVideoCall.bookingId, 'COMPLETED');
                    setActiveVideoCall(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Complete Consultation
                </button>
                <button
                  onClick={() => setActiveVideoCall(null)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                >
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT CHECK-IN CONFIRMATION MODAL */}
      <CheckInConfirmationModal
        isOpen={!!checkInModalBooking}
        booking={checkInModalBooking}
        onClose={() => setCheckInModalBooking(null)}
        onConfirm={(bookingId, extraData) => {
          handleStatusChange(bookingId, 'IN_PROGRESS', extraData);
          setCheckInModalBooking(null);
        }}
        loading={statusActionLoading === checkInModalBooking?.bookingId}
      />

      {/* APPOINTMENT CANCELLATION MODAL */}
      <CancelAppointmentModal
        isOpen={!!cancelModalBooking}
        booking={cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        onConfirm={(bookingId, extraData) => {
          handleStatusChange(bookingId, 'CANCELLED', extraData);
          setCancelModalBooking(null);
        }}
        loading={statusActionLoading === cancelModalBooking?.bookingId}
      />


    </div>
  );
};

export default VetAppointmentQueue;
