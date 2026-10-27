import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PageHeader } from '../components/PageHeader';
import { 
  Dog, Heart, Stethoscope, ShieldCheck, Plus, CheckCircle, AlertTriangle, 
  Award, QrCode, FileText, UserCheck, Calendar, Activity, Upload, Eye,
  Building2, MapPin, ShoppingBag, Package, Truck, Star, Sparkles, Filter, 
  Check, X, ShieldAlert, AlertCircle, TrendingUp, Scissors, Compass, Phone, 
  FileCheck, Layers, ChevronRight, ArrowUpRight, CheckCircle2, Clock, Users,
  Send, RefreshCw, DollarSign, BarChart3, AlertOctagon, Shield
} from 'lucide-react';
import { 
  hospitalProfileApi, bookingApi, medicalApi, adminApi, 
  marketplaceApi, carePlanApi 
} from '../services/api';

export const DashboardPage = () => {
  const { user, token, activeRole, switchRole, SystemRoles } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Role Metadata
  const roleMeta = SystemRoles[activeRole] || { name: activeRole, description: 'Operational Console' };

  // -------------------------------------------------------------
  // Data States for All Personas
  // -------------------------------------------------------------
  const [myPetsList, setMyPetsList] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [loadingHospital, setLoadingHospital] = useState(false);

  const [doctorQueue, setDoctorQueue] = useState([]);
  const [loadingDoctorQueue, setLoadingDoctorQueue] = useState(false);

  const [adminHospitals, setAdminHospitals] = useState([]);
  const [loadingAdminHospitals, setLoadingAdminHospitals] = useState(false);

  const [vendorProducts, setVendorProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [adoptionApps, setAdoptionApps] = useState([]);
  const [loadingAdoptions, setLoadingAdoptions] = useState(false);

  // -------------------------------------------------------------
  // Dynamic Data Loaders based on Active Role
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Pet Owner / Caretaker Data
    if (['PET_OWNER', 'BUYER', 'CARETAKER'].includes(activeRole)) {
      fetchMyPets();
    }

    // 2. Hospital Admin / Owner Data
    if (['VETERINARY_ADMIN', 'HOSPITAL_OWNER', 'HOSPITAL_ADMIN'].includes(activeRole)) {
      fetchHospitalProfile();
    }

    // 3. Veterinary Doctor Data
    if (['VETERINARY_DOCTOR', 'VETERINARIAN', 'ASSISTANT_VET_DOCTOR', 'VET_STAFF'].includes(activeRole)) {
      fetchDoctorQueue();
    }

    // 4. Platform Admin Data
    if (['SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN', 'AUDITOR', 'MODERATOR'].includes(activeRole)) {
      fetchAdminHospitals();
    }

    // 5. Vendor / Shop Data
    if (['VENDOR', 'PRODUCT_SHOP_OWNER', 'PRODUCT_STAFF'].includes(activeRole)) {
      fetchVendorProducts();
    }

    // 6. Shelter / NGO Data
    if (['NGO_SHELTER', 'ADOPTION_RESCUE', 'ANIMAL_WELFARE', 'ANIMAL_WELFARE_OFFICER'].includes(activeRole)) {
      fetchAdoptionApplications();
    }
  }, [activeRole, user?.userId, token]);

  const fetchMyPets = async () => {
    if (!user?.userId) {
      setLoadingPets(false);
      return;
    }
    setLoadingPets(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/pets/owner/${user.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyPetsList(data.data || data || []);
      }
    } catch (err) {
      console.warn("Could not fetch pets from live API", err);
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchHospitalProfile = async () => {
    setLoadingHospital(true);
    try {
      const res = await hospitalProfileApi.getMyProfile(null, token);
      if (res && res.data) {
        setHospitalProfile(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch hospital profile", err);
    } finally {
      setLoadingHospital(false);
    }
  };

  const fetchDoctorQueue = async () => {
    setLoadingDoctorQueue(true);
    try {
      const res = await bookingApi.getBookings({}, token);
      if (res && Array.isArray(res)) {
        setDoctorQueue(res);
      } else if (res && res.data && Array.isArray(res.data)) {
        setDoctorQueue(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch doctor appointments queue", err);
    } finally {
      setLoadingDoctorQueue(false);
    }
  };

  const fetchAdminHospitals = async () => {
    setLoadingAdminHospitals(true);
    try {
      const res = await adminApi.getUsersByRole('VETERINARY_ADMIN', token);
      if (res && Array.isArray(res)) {
        setAdminHospitals(res);
      } else if (res && res.data && Array.isArray(res.data)) {
        setAdminHospitals(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch admin hospitals", err);
    } finally {
      setLoadingAdminHospitals(false);
    }
  };

  const fetchVendorProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await marketplaceApi.getProducts(token);
      if (res && Array.isArray(res)) {
        setVendorProducts(res);
      } else if (res && res.data && Array.isArray(res.data)) {
        setVendorProducts(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch vendor products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchAdoptionApplications = async () => {
    setLoadingAdoptions(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/adoptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdoptionApps(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Could not fetch adoption apps", err);
    } finally {
      setLoadingAdoptions(false);
    }
  };

  // -------------------------------------------------------------
  // Role Classification & Icon Helpers
  // -------------------------------------------------------------
  const getRoleIcon = () => {
    if (['VETERINARY_DOCTOR', 'VETERINARIAN', 'ASSISTANT_VET_DOCTOR'].includes(activeRole)) return Stethoscope;
    if (['VETERINARY_ADMIN', 'HOSPITAL_OWNER', 'HOSPITAL_ADMIN'].includes(activeRole)) return Building2;
    if (['VENDOR', 'PRODUCT_SHOP_OWNER', 'PRODUCT_STAFF'].includes(activeRole)) return ShoppingBag;
    if (['NGO_SHELTER', 'ADOPTION_RESCUE', 'ANIMAL_WELFARE', 'ANIMAL_WELFARE_OFFICER'].includes(activeRole)) return Heart;
    if (['SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN'].includes(activeRole)) return ShieldCheck;
    if (['SERVICE_PROVIDER', 'GROOMING_OWNER', 'TRAINER_OWNER'].includes(activeRole)) return Scissors;
    return Dog;
  };

  const CurrentRoleIcon = getRoleIcon();

  // Role Overview Tagline
  const getRoleSubtitle = () => {
    const map = {
      PET_OWNER: "Unified companion animal health, digital Profile QR, and municipal licensing portal.",
      BUYER: "Browse verified pets for adoption, PCA 1960 compliance, and approved pet healthcare products.",
      CARETAKER: "Authorized pet sitting, temporary caretaking, and medication task management.",
      VETERINARY_DOCTOR: "Clinical examination cockpit, electronic prescriptions (E-Rx), and triage queues.",
      VETERINARIAN: "Licensed medical practice, patient electronic health records (EHR), and diagnostics.",
      ASSISTANT_VET_DOCTOR: "Clinical assistance, patient monitoring, and prescription preparation console.",
      VET_STAFF: "Clinic reception check-in, patient queues, and digital record uploads.",
      VETERINARY_ADMIN: "Hospital operations cockpit, statutory licensing, staff credentials, and branch GPS proofs.",
      HOSPITAL_OWNER: "Multi-campus veterinary governance, revenue performance, and facility infrastructure.",
      HOSPITAL_ADMIN: "Hospital bed capacity, emergency triage, and operating theatre resource allocation.",
      VENDOR: "Pet merchandise store, order fulfillment pipeline, and inventory reorder controls.",
      PRODUCT_SHOP_OWNER: "Retail catalog management, sales analytics, and pet supply inventory.",
      PRODUCT_STAFF: "Order packing, courier dispatch, and warehouse stock tracking.",
      NGO_SHELTER: "Rescue animal housing, PCA 1960 legal adoption deeds, and shelter capacity tracking.",
      ADOPTION_RESCUE: "Companion animal rescue intake, applicant vetting, and deed notarization.",
      ANIMAL_WELFARE: "Animal welfare campaigns, cruelty prevention audits, and rescue logistics.",
      ANIMAL_WELFARE_OFFICER: "AWBI legal oversight, inspection compliance, and shelter audit trails.",
      SUPER_ADMIN: "Ecosystem-wide governance, institutional KYC approvals, and platform security audits.",
      ADMIN: "User management, veterinary hospital approvals, and compliance verification.",
      PLATFORM_ADMIN: "Full platform observability, CMS announcements, and service availability.",
      SERVICE_PROVIDER: "Professional pet care appointments, grooming packages, and client tracking.",
      GROOMING_OWNER: "Salon appointment schedules, grooming staff rosters, and customer ratings.",
      TRAINER_OWNER: "Behavioral training programs, obedience certificates, and consultation booking."
    };
    return map[activeRole] || "Operational management and companion animal care console.";
  };

  // -------------------------------------------------------------
  // Role Switcher Simulator Chips (Quick Preview of Any Role)
  // -------------------------------------------------------------
  const quickRoleList = [
    { code: 'PET_OWNER', label: 'Pet Owner', icon: Dog },
    { code: 'VETERINARY_DOCTOR', label: 'Vet Doctor', icon: Stethoscope },
    { code: 'VETERINARY_ADMIN', label: 'Hospital Admin', icon: Building2 },
    { code: 'VENDOR', label: 'Shop Vendor', icon: ShoppingBag },
    { code: 'NGO_SHELTER', label: 'Animal Shelter', icon: Heart },
    { code: 'SUPER_ADMIN', label: 'Super Admin', icon: ShieldCheck },
    { code: 'SERVICE_PROVIDER', label: 'Groomer / Trainer', icon: Scissors }
  ];

  return (
    <div className="w-full space-y-8 pb-20 max-w-7xl mx-auto animate-in fade-in">
      
      {/* ============================================================== */}
      {/* 1. STANDARDIZED PAGE HEADER WITH ROLE-BASED QUICK ACTIONS */}
      {/* ============================================================== */}
      <PageHeader
        title={`${roleMeta.name} Cockpit`}
        titleIcon={CurrentRoleIcon}
        description={
          <span>
            Welcome back, <strong className="text-slate-900 font-extrabold">{user?.fullName || 'Doctor Tony'}</strong>! {getRoleSubtitle()}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Pet Owner Actions */}
            {['PET_OWNER', 'BUYER', 'CARETAKER'].includes(activeRole) && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/my-pets')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>My Pets ({myPetsList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register-pet')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Pet</span>
                </button>
              </>
            )}

            {/* Doctor Actions */}
            {['VETERINARY_DOCTOR', 'VETERINARIAN', 'ASSISTANT_VET_DOCTOR', 'VET_STAFF'].includes(activeRole) && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/appointments')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Clinic Queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/prescriptions')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Write E-Rx</span>
                </button>
              </>
            )}

            {/* Hospital Admin Actions */}
            {['VETERINARY_ADMIN', 'HOSPITAL_OWNER', 'HOSPITAL_ADMIN'].includes(activeRole) && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/hospital-operations')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Live Operations</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/hospital-profile')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Hospital Profile Cockpit</span>
                </button>
              </>
            )}

            {/* Vendor Actions */}
            {['VENDOR', 'PRODUCT_SHOP_OWNER', 'PRODUCT_STAFF'].includes(activeRole) && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/my-orders')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Fulfillment Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/create-product')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </>
            )}

            {/* Shelter Actions */}
            {['NGO_SHELTER', 'ADOPTION_RESCUE', 'ANIMAL_WELFARE', 'ANIMAL_WELFARE_OFFICER'].includes(activeRole) && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/adoptions')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Review Applications</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register-pet')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span>List Rescue Animal</span>
                </button>
              </>
            )}

            {/* Super Admin Actions */}
            {['SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN', 'AUDITOR', 'MODERATOR'].includes(activeRole) && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin-users')}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>User Roles</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin-vet-hospitals')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Hospital KYC Queue</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {/* ============================================================== */}
      {/* 2. ROLE SWITCHER SIMULATOR BAR (EXPLORE ROLE COCKPITS) */}
      {/* ============================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Active Persona Cockpit:</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            {roleMeta.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden lg:inline">Switch Role:</span>
          {quickRoleList.map((r) => {
            const Icon = r.icon;
            const isCurrent = activeRole === r.code;
            return (
              <button
                key={r.code}
                type="button"
                onClick={() => {
                  switchRole(r.code);
                  showToast(`Switched active cockpit to ${r.label}`, 'info');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isCurrent 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ROLE-BASED PERSONALIZED KPIS & WORKSPACES */}
      {/* ============================================================== */}

      {/* -------------------------------------------------------------- */}
      {/* ROLE 1: PET OWNER & COMPANION FAMILY DASHBOARD                 */}
      {/* -------------------------------------------------------------- */}
      {['PET_OWNER', 'BUYER', 'CARETAKER'].includes(activeRole) && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Personalized Core KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/my-pets')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Pets</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <Dog className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">{myPetsList.length}</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {myPetsList.length > 0 ? "Active Digital Profiles" : "No Pets Registered Yet"}
              </p>
            </div>

            <div 
              onClick={() => navigate('/care-continuity')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vaccinations Due</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">0 Due</div>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">All pet immunizations up-to-date</p>
            </div>

            <div 
              onClick={() => navigate('/user-profile')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KYC Compliance</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-lg font-black text-emerald-700 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{user?.kycStatus || 'VERIFIED'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Aadhaar / PAN Identity Matched</p>
            </div>

            <div 
              onClick={() => navigate('/adoptions')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pet Parent Trust Score</span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">{user?.trustScore || 96} / 100</div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">PCA 1960 Adoption Pre-Approved</p>
            </div>
          </div>

          {/* Quick Action Navigation Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Book Vet Visit', sub: 'Clinical consultations', icon: Stethoscope, path: '/vet-appointments', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Browse Pet Store', sub: 'Food, toys & meds', icon: ShoppingBag, path: '/marketplace', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Care Continuity', sub: 'Daily tasks & doses', icon: Activity, path: '/care-continuity', color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: '24/7 Emergency', sub: 'Nearest pet trauma ICU', icon: Phone, path: '/emergency', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.label}
                  onClick={() => navigate(act.path)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${act.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{act.label}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{act.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Widget 1: My Registered Pets & Digital QR Profiles */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Dog className="w-5 h-5 text-emerald-600" />
                  <span>My Companion Animals & Digital Profiles ({myPetsList.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Tamper-proof digital tags, municipal license details, and electronic medical histories.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/my-pets')}
                  className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View All Pets</span>
                </button>
                <button 
                  onClick={() => navigate('/register-pet')}
                  className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pet</span>
                </button>
              </div>
            </div>

            {loadingPets ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Loading companion animals...</p>
              </div>
            ) : myPetsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <Dog className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-black text-slate-900">No Pets Registered Yet</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Register your first companion animal to generate tamper-proof QR identity tags, maintain compliant vaccination logs, and access veterinary services.
                </p>
                <button
                  onClick={() => navigate('/register-pet')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register First Pet</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPetsList.map((pet) => {
                  const name = pet.basicProfile?.name || pet.name || 'Unknown Pet';
                  const species = pet.basicProfile?.species || pet.species || 'Canine';
                  const breed = pet.basicProfile?.breed || pet.breed || 'Companion';
                  const photoUrl = (pet.mediaGallery?.photos?.find(p => p.isPrimary)?.url) || (pet.mediaGallery?.photos?.[0]?.url) || pet.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";
                  const qrHash = pet.qrProfileMetadata?.qrCodePayloadString || pet.qrCodeHash || 'N/A';
                  const municipalLicense = pet.basicProfile?.municipalLicenseNumber || pet.municipalLicenseNumber || 'GHMC-2024-Verified';
                  const petId = pet.petId || pet.id;

                  return (
                    <div key={petId} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex items-start gap-4">
                        <img 
                          src={photoUrl} 
                          alt={name} 
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-black text-slate-900">{name}</h4>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-200">
                              {species} • {breed}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1">
                            <p className="flex items-center gap-1.5 font-mono text-[11px]">
                              <QrCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-slate-400">ID:</span>
                              <strong className="text-slate-700 truncate max-w-[160px]">{qrHash}</strong>
                            </p>
                            <p className="flex items-center gap-1.5 text-[11px]">
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-slate-400">License:</span>
                              <span className="font-semibold text-slate-700">{municipalLicense}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        <button 
                          type="button"
                          onClick={() => {
                            if (qrHash && qrHash !== 'N/A') {
                              navigate(`/Profile?hash=${encodeURIComponent(qrHash)}`);
                            } else {
                              navigate(`/Profile?petId=${petId}`);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all cursor-pointer text-center"
                        >
                          Profile
                        </button>
                        <button 
                          type="button"
                          onClick={() => navigate(`/medical?petId=${petId}`)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer text-center"
                        >
                          Medical EHR
                        </button>
                        <button 
                          type="button"
                          onClick={() => navigate(`/vet-appointments?petId=${petId}`)}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-all cursor-pointer text-center"
                        >
                          Book Vet
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Widget 2: 24/7 Emergency Trauma & Triage Locator Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white rounded-3xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  24/7 EMERGENCY TRIAGE
                </span>
                <span className="text-xs font-bold text-slate-300">Live GPS Locator</span>
              </div>
              <h3 className="text-lg font-black text-white">Emergency Pet Hospital Finder</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Instant routing to nearest verified critical veterinary trauma centers, ICUs with oxygen cages, and on-call veterinary surgeons.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/emergency')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start md:self-auto shrink-0 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Locate Nearest Emergency Vet</span>
            </button>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* ROLE 2: VETERINARY DOCTOR & CLINICAL SPECIALIST DASHBOARD      */}
      {/* -------------------------------------------------------------- */}
      {['VETERINARY_DOCTOR', 'VETERINARIAN', 'ASSISTANT_VET_DOCTOR', 'VET_STAFF'].includes(activeRole) && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Personalized Doctor KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/appointments')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Patients</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">{doctorQueue.length || 8}</div>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">3 In-Clinic • 5 Scheduled</p>
            </div>

            <div 
              onClick={() => navigate('/prescriptions')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-Prescriptions (E-Rx)</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">24 Authored</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Tamper-Proof Digital E-Rx</p>
            </div>

            <div 
              onClick={() => navigate('/patients')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Patient Records</span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">142 Cases</div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Lifetime Patient EHRs</p>
            </div>

            <div 
              onClick={() => navigate('/user-profile')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">VCI Credential</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-base font-black text-emerald-700 font-mono mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>VCI-TS-2024-VERIFIED</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">State Veterinary Council Registered</p>
            </div>
          </div>

          {/* Quick Action Navigation Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Write New E-Rx', sub: 'Digital prescription', icon: FileText, path: '/prescriptions', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Patient Queue', sub: 'Today triage appointments', icon: Clock, path: '/appointments', color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Patient Directory', sub: 'Full EHR history', icon: Dog, path: '/patients', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'OT & Surgery', sub: 'Live surgical suites', icon: Activity, path: '/hospital-operations', color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.label}
                  onClick={() => navigate(act.path)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${act.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{act.label}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{act.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Doctor Widget 1: Today's Clinical Appointment Queue & Triage */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <span>Today's Clinical Appointment Queue & Patient Triage</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time patient check-ins, scheduled consultations, and urgency classification.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Full Queue Manager</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { pet: 'Max', breed: 'Golden Retriever (3 yrs)', owner: 'Anita Rao', reason: 'Annual Booster & Skin Allergy Check', time: '10:30 AM', status: 'IN_CLINIC', triage: 'ROUTINE' },
                { pet: 'Luna', breed: 'Persian Cat (2 yrs)', owner: 'Vikram Singh', reason: 'Post-Op Suture Removal & Dressing', time: '11:15 AM', status: 'SCHEDULED', triage: 'POST_OP' },
                { pet: 'Rocky', breed: 'German Shepherd (5 yrs)', owner: 'Meera Patel', reason: 'Acute Vomiting & Lethargy', time: '11:45 AM', status: 'UNDER_EXAM', triage: 'URGENT' },
                { pet: 'Bella', breed: 'Beagle (1 yr)', owner: 'Rohit Sharma', reason: 'Dental Prophylaxis Consultation', time: '02:00 PM', status: 'SCHEDULED', triage: 'ROUTINE' },
              ].map((pt, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-800 font-black text-xs flex items-center justify-center shrink-0">
                      {pt.pet.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-900">{pt.pet}</h4>
                        <span className="text-xs text-slate-500 font-medium">({pt.breed})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          pt.triage === 'URGENT' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          pt.triage === 'POST_OP' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {pt.triage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Parent: <strong className="text-slate-800">{pt.owner}</strong> • Concern: {pt.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {pt.time}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/prescriptions')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Start Consult / E-Rx</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Widget 2: Recent E-Prescriptions & VCI Verified Record */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Recent Authored E-Prescriptions</span>
                </h4>
                <button
                  type="button"
                  onClick={() => navigate('/prescriptions')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { rxId: 'RX-2026-8812', pet: 'Max (Golden Retriever)', date: 'Today, 10:45 AM', drugs: 'Amoxicillin 250mg, Meloxicam 1.5mg/ml' },
                  { rxId: 'RX-2026-8809', pet: 'Rocky (German Shepherd)', date: 'Today, 09:20 AM', drugs: 'Ondansetron 4mg, Pantoprazole 20mg' },
                  { rxId: 'RX-2026-8795', pet: 'Milo (Labrador)', date: 'Yesterday, 04:15 PM', drugs: 'Cephalexin 500mg, Omega-3 Fish Oil' }
                ].map((rx) => (
                  <div key={rx.rxId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-700">{rx.rxId}</span>
                      <p className="font-bold text-slate-800 mt-0.5">{rx.pet}</p>
                      <p className="text-[11px] text-slate-500">{rx.drugs}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{rx.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>VCI Registered Practitioner Credentials</span>
                </h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-200">
                  ACTIVE LICENSE
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Registered Name:</span>
                  <span className="text-xs font-black text-slate-900">Dr. Tony Stark, B.V.Sc & A.H</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">VCI Registration Number:</span>
                  <span className="text-xs font-black font-mono text-emerald-800">VCI-TS-2024-001</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Issuing Council:</span>
                  <span className="text-xs font-bold text-slate-800">Telangana State Veterinary Council</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Validity Status:</span>
                  <span className="text-xs font-bold text-emerald-700">Permanent Registration (Compliant)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* ROLE 3: VETERINARY HOSPITAL ADMINISTRATOR & OWNER             */}
      {/* -------------------------------------------------------------- */}
      {['VETERINARY_ADMIN', 'HOSPITAL_OWNER', 'HOSPITAL_ADMIN'].includes(activeRole) && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Personalized Hospital KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/hospital-profile')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Readiness</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {hospitalProfile?.completenessScore || 92}%
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {hospitalProfile?.status === 'PUBLISHED' ? 'Published & Live on Directory' : 'Ready to Submit for KYC'}
              </p>
            </div>

            <div 
              onClick={() => navigate('/org-staff')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Licensed Doctors</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {hospitalProfile?.doctors?.length || 6}
              </div>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">Verified VCI Specialists</p>
            </div>

            <div 
              onClick={() => navigate('/hospital-operations')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bed & ICU Capacity</span>
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {hospitalProfile?.facilities?.length || 18} Units
              </div>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">8 ICU Beds • 2 Sterile OT</p>
            </div>

            <div 
              onClick={() => navigate('/hospital-profile')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Services</span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {hospitalProfile?.services?.length || 12}
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Transparent Public Pricing</p>
            </div>
          </div>

          {/* Quick Action Navigation Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Hospital Profile Cockpit', sub: 'Services & CEA info', icon: Building2, path: '/hospital-profile', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Manage Staff & Doctors', sub: 'VCI verification', icon: Users, path: '/org-staff', color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Live Operations & Wards', sub: 'ICU & emergency triage', icon: Activity, path: '/hospital-operations', color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Public Showcase Page', sub: 'Preview listing', icon: Eye, path: `/hospital/${hospitalProfile?.slug || 'upper-arlington-veterinary-hospital'}`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.label}
                  onClick={() => navigate(act.path)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${act.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{act.label}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{act.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hospital Widget 1: Real-Time ICU Beds & OT Surgical Capacity Monitor */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>Real-Time Facility Infrastructure & Emergency Ward Capacity</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Live monitoring of ICU beds, sterile operating suites, recovery kennels, and oxygen cages.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/hospital-operations')}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Live Ward Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Critical ICU Bed #1', status: 'OCCUPIED', note: 'Post-op canine trauma', badge: 'bg-rose-100 text-rose-800 border-rose-300' },
                { title: 'Critical ICU Bed #2', status: 'AVAILABLE', note: 'Sterilized & oxygen ready', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                { title: 'Sterile OT Suite Alpha', status: 'IN_SURGERY', note: 'Orthopedic cruciate repair', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
                { title: 'Sterile OT Suite Beta', status: 'AVAILABLE', note: 'Ready for emergency intake', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
              ].map((res, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{res.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${res.badge}`}>
                      {res.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{res.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Widget 2: CEA Statutory Compliance & Geolocation Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Establishment Act (CEA) Credentials</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  VERIFIED STATUTORY
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Reg Number (CEA):</span>
                  <span className="font-mono font-black text-slate-800">{hospitalProfile?.clinicalEstablishmentRegNumber || 'CEA-TS-2023-7749'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">GSTIN Identification:</span>
                  <span className="font-mono font-black text-slate-800">{hospitalProfile?.gstin || '36AABCU9603R1ZM'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">24/7 Emergency Triage:</span>
                  <span className="font-black text-emerald-700">Active & Published</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Branch Coordinates & Address Verification</span>
                </h4>
                <button
                  type="button"
                  onClick={() => navigate('/hospital-profile')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Manage Branches
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black">MAIN CAMPUS</span>
                  <span className="text-xs font-black text-slate-900">{hospitalProfile?.hospitalName || 'Upper Arlington Veterinary Hospital'}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {hospitalProfile?.streetAddress || 'Plot No. 45, Road No. 12, Jubilee Hills'}, {hospitalProfile?.city || 'Hyderabad'}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-700 font-bold">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GPS: 17.432560, 78.407280 (Verified)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* ROLE 4: PET PRODUCT & SHOP VENDOR DASHBOARD                    */}
      {/* -------------------------------------------------------------- */}
      {['VENDOR', 'PRODUCT_SHOP_OWNER', 'PRODUCT_STAFF'].includes(activeRole) && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Personalized Vendor KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/marketplace')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Products</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">{vendorProducts.length || 38}</div>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Active Catalog Listings</p>
            </div>

            <div 
              onClick={() => navigate('/my-orders')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orders Pending Dispatch</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">12 Orders</div>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Requires Courier Pickup Today</p>
            </div>

            <div 
              onClick={() => navigate('/my-orders')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">₹1,48,200</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">+18.4% vs Previous Cycle</p>
            </div>

            <div 
              onClick={() => navigate('/marketplace')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Merchant Rating</span>
                <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100 group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 fill-yellow-500" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">4.9 / 5.0</div>
              <p className="text-[11px] text-yellow-600 font-semibold mt-1">Based on 320 Pet Parent Reviews</p>
            </div>
          </div>

          {/* Quick Action Navigation Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Create Product', sub: 'Add new item', icon: Plus, path: '/create-product', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Fulfillment Orders', sub: 'Manage courier dispatch', icon: Package, path: '/my-orders', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Storefront Catalog', sub: 'View live listings', icon: ShoppingBag, path: '/marketplace', color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'Merchant Profile', sub: 'GSTIN & banking', icon: ShieldCheck, path: '/user-profile', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.label}
                  onClick={() => navigate(act.path)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${act.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{act.label}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{act.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vendor Widget: Order Fulfillment Pipeline */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Order Fulfillment & Dispatch Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Track live customer orders, generate shipping labels, and mark packages dispatched.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Full Orders Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'OD-9921', item: 'Premium Grain-Free Puppy Kibble (10kg)', customer: 'Priya Nair', total: '₹3,450', status: 'AWAITING_DISPATCH' },
                { id: 'OD-9924', item: 'Orthopedic Waterproof Memory Foam Pet Bed (Large)', customer: 'Rahul Verma', total: '₹2,890', status: 'READY_COURIER' },
                { id: 'OD-9928', item: 'Ayurvedic Flea & Tick Herbal Spray (500ml)', customer: 'Suman Das', total: '₹650', status: 'DISPATCHED' },
              ].map((od) => (
                <div key={od.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-blue-700">{od.id}</span>
                      <span className="text-xs font-black text-slate-900">{od.item}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Customer: <strong className="text-slate-700">{od.customer}</strong> • Total: <strong className="text-slate-900 font-mono">{od.total}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      od.status === 'AWAITING_DISPATCH' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      od.status === 'READY_COURIER' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {od.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/my-orders')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Process Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* ROLE 5: SHELTER & RESCUE NGO DASHBOARD                         */}
      {/* -------------------------------------------------------------- */}
      {['NGO_SHELTER', 'ADOPTION_RESCUE', 'ANIMAL_WELFARE', 'ANIMAL_WELFARE_OFFICER'].includes(activeRole) && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Personalized Shelter KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/adoptions')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PCA Applications</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">{adoptionApps.length || 14}</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Pending Background Review</p>
            </div>

            <div 
              onClick={() => navigate('/marketplace')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rescue Animals</span>
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">28 Rescues</div>
              <p className="text-[11px] text-pink-600 font-semibold mt-1">Sheltered & In Rehabilitation</p>
            </div>

            <div 
              onClick={() => navigate('/adoptions')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Digital Deeds Signed</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">42 Completed</div>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">PCA 1960 Legal Proof Generated</p>
            </div>

            <div 
              onClick={() => navigate('/user-profile')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AWBI Compliance</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-base font-black text-emerald-800 font-mono mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% ACCREDITED</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Annual Shelter Audit Passed</p>
            </div>
          </div>

          {/* Shelter Widget: PCA 1960 Adoption Applications Review Table */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span>PCA 1960 Legal Adoption Applications Queue</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Review applicant background check, RWA housing approval, and execute digital adoption deeds.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/adoptions')}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Adoptions & Compliance Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { app: 'ADP-441', pet: 'Bruno (Indie Pup, 4 mos)', applicant: 'Tanvi Joshi', housing: 'Independent Villa with Lawn', rwa: 'VERIFIED_OK', deed: 'READY_SIGN' },
                { app: 'ADP-448', pet: 'Mittens (Rescued Tabby, 1 yr)', applicant: 'Karthik S.', housing: 'Gated Apartment (3 BHK)', rwa: 'RWA_NOC_SUBMITTED', deed: 'UNDER_REVIEW' },
                { app: 'ADP-452', pet: 'Sheru (Lab Mix, 2 yrs)', applicant: 'Vandana Rao', housing: 'Rowhouse with Courtyard', rwa: 'VERIFIED_OK', deed: 'DEED_EXECUTED' },
              ].map((item) => (
                <div key={item.app} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-emerald-700">{item.app}</span>
                      <span className="text-xs font-black text-slate-900">{item.pet}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Applicant: <strong className="text-slate-700">{item.applicant}</strong> • Housing: {item.housing}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.rwa}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/adoptions')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      {item.deed === 'READY_SIGN' ? 'Sign Legal Deed' : 'Review File'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* ROLE 6: PLATFORM & SUPER ADMINISTRATOR DASHBOARD               */}
      {/* -------------------------------------------------------------- */}
      {['SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN', 'AUDITOR', 'MODERATOR'].includes(activeRole) && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Personalized Super Admin KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/admin-vet-hospitals')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vet Hospital KYC Queue</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">{adminHospitals.length || 3} Pending</div>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Awaiting Institutional KYC Review</p>
            </div>

            <div 
              onClick={() => navigate('/admin-users')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total System Users</span>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">1,248</div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">RBAC Roles Across 7 Personas</p>
            </div>

            <div 
              onClick={() => navigate('/admin-catalog')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marketplace Listings</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">84 Listings</div>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">PCA 1960 Compliant Verification</p>
            </div>

            <div 
              onClick={() => navigate('/admin-website-settings')}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Security Health</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">99.9% Uptime</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Spring Cloud Gateway Protected</p>
            </div>
          </div>

          {/* Quick Action Navigation Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Vet Hospital Verifications', sub: 'Institutional KYC review', icon: Building2, path: '/admin-vet-hospitals', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'User Role Governance', sub: 'RBAC permissions', icon: Users, path: '/admin-users', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Catalog Moderation', sub: 'Pet & supply audits', icon: ShoppingBag, path: '/admin-catalog', color: 'text-teal-600', bg: 'bg-teal-50' },
              { label: 'CMS & Platform Settings', sub: 'Announcements & banner', icon: Sparkles, path: '/admin-website-settings', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.label}
                  onClick={() => navigate(act.path)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${act.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{act.label}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{act.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Super Admin Widget: Institutional Vet Hospital KYC Verification Queue */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span>Institutional Veterinary Hospital KYC Review Queue</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Authorize clinical establishments, audit state CEA numbers, and certify statutory organizations.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin-vet-hospitals')}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Full Review Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'Upper Arlington Veterinary Hospital', cea: 'CEA-TS-2023-7749', gstin: '36AABCU9603R1ZM', admin: 'dr.tony@hospital.vet', status: 'VERIFIED' },
                { name: 'Apollo Animal Emergency Trauma Care', cea: 'CEA-MH-2024-1102', gstin: '27AABCP1145K1ZQ', admin: 'apollo.vet@care.org', status: 'PENDING_VERIFICATION' },
                { name: 'Care & Cure Feline Specialty Center', cea: 'CEA-KA-2024-8841', gstin: '29AABCC4412M1ZX', admin: 'contact@carecurevet.in', status: 'PENDING_VERIFICATION' },
              ].map((h, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{h.name}</span>
                      <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {h.cea}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      GSTIN: <strong className="text-slate-700 font-mono">{h.gstin}</strong> • Admin: {h.admin}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      h.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {h.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/admin-vet-hospitals')}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Audit Credentials
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* ROLE 7: SERVICE PROVIDERS & GROOMING / TRAINING                */}
      {/* -------------------------------------------------------------- */}
      {['SERVICE_PROVIDER', 'GROOMING_OWNER', 'GROOMING_STAFF', 'TRAINER_OWNER', 'TRAINER_STAFF'].includes(activeRole) && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Personalized Service Provider KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Sessions</span>
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                  <Scissors className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">6 Bookings</div>
              <p className="text-[11px] text-pink-600 font-semibold mt-1">4 Grooming • 2 Obedience</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Pets</span>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Dog className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">48 Regulars</div>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">Monthly Care Club Members</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">128 Sessions</div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">This Billing Month</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Rating</span>
                <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
                  <Star className="w-5 h-5 fill-yellow-500" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">4.95 / 5.0</div>
              <p className="text-[11px] text-yellow-600 font-semibold mt-1">Top Rated Grooming Studio</p>
            </div>
          </div>

          {/* Service Provider Widget: Today's Pet Service Schedule */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-pink-600" />
                  <span>Today's Grooming & Training Schedule</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pet parent appointments, styling packages, and completed attendance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { pet: 'Simba (Shih Tzu)', package: 'Full Spa Bath & Breed Scissor Cut', time: '11:00 AM', parent: 'Swati M.', status: 'IN_SERVICE' },
                { pet: 'Bruno (Labrador)', package: 'Deshedding Therapy & Nail Trim', time: '01:30 PM', parent: 'Deepak V.', status: 'SCHEDULED' },
                { pet: 'Cooper (Beagle)', package: 'Puppy Socialization & Leash Manners', time: '04:00 PM', parent: 'Rohan G.', status: 'SCHEDULED' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{s.pet}</span>
                      <span className="text-xs text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200 font-bold">
                        {s.package}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Pet Parent: <strong className="text-slate-700">{s.parent}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.time}
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast(`Service session marked active for ${s.pet}`, 'success')}
                      className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      {s.status === 'IN_SERVICE' ? 'Complete Session' : 'Start Session'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
