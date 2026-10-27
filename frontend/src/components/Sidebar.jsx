import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Package, Home, Shield, Dog, Stethoscope, Heart, Store, Truck, 
  BookOpen, FileCheck, Users, DollarSign, Calendar, Activity, AlertCircle, Award, 
  Sparkles, CheckSquare, MessageSquare, ClipboardList, ShieldAlert, QrCode, X, 
  Building2, Globe, LayoutDashboard, ChevronRight, UserCircle2
} from 'lucide-react';

import { ROLE_TO_SLUG, ROLE_HOMEPAGES_CONFIG } from '../config/roleHomepagesConfig';

export const Sidebar = ({ activeSection, isOpen = false, onClose }) => {
  const { activeRole, switchRole, user, SystemRoles } = useAuth();
  const navigate = useNavigate();

  const hasSuperAdmin = user?.roles?.includes('SUPER_ADMIN');
  const availableRoles = hasSuperAdmin 
    ? Object.keys(SystemRoles) 
    : (user?.roles || ['PET_OWNER']);

  const currentRoleSlug = ROLE_TO_SLUG[activeRole] || 'pet-owner';
  const roleConfig = ROLE_HOMEPAGES_CONFIG[currentRoleSlug] || ROLE_HOMEPAGES_CONFIG['pet-owner'];
  const roleMeta = SystemRoles[activeRole] || { name: activeRole, badgeColor: 'bg-emerald-100 text-emerald-800' };

  // Detect whether any dashboard or role home view is active
  const isDashboardActive = 
    activeSection === 'dashboard' || 
    activeSection.startsWith('dashboard/') || 
    activeSection === 'home' || 
    activeSection.startsWith('home/') || 
    (activeSection === 'platform-admin' && currentRoleSlug === 'platform-admin');

  // Primary Platform Modules
  const primaryPlatformModules = [
    { id: 'marketplace', label: 'Marketplace (Pets & Products)', icon: ShoppingBag },
    { id: 'hospitals', label: 'Find Vet Hospitals', icon: Building2 },
    { id: 'adoptions', label: 'PCA 1960 Adoption', icon: Heart },
    { id: 'Profile', label: 'Digital QR Profile', icon: QrCode },
    { id: 'medical', label: 'Medical Records', icon: Stethoscope },
    { id: 'care-continuity', label: 'Care Plans & Compliance', icon: ClipboardList },
  ];

  const getRoleMenuItems = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
      case 'PLATFORM_ADMIN':
      case 'MODERATOR':
      case 'CUSTOMER_SUPPORT':
      case 'FINANCE':
      case 'MARKETING':
        return [
          { id: 'dashboard/platform-admin', label: 'Platform Master Dashboard', icon: LayoutDashboard },
          { id: 'admin/website-settings', label: 'Website Content & CMS', icon: Globe },
          { id: 'hospital-profile', label: 'Hospital Profile & Services', icon: Building2 },
          { id: 'hospital-operations', label: 'Hospital Live ICU & OT', icon: Activity },
          { id: 'care-continuity', label: 'Care Plans & Missed Care', icon: ClipboardList },
          { id: 'kyc-approvals', label: 'KYC & License Verification', icon: FileCheck },
          { id: 'admin-users', label: 'User & Roles Management', icon: Users },
          { id: 'admin-vet-hospitals', label: 'Vet Hospital Verification', icon: Stethoscope },
          { id: 'admin-catalog', label: 'Dynamic Catalog (Species)', icon: Store },
          { id: 'create-product', label: 'Onboard Catalog Item', icon: Package },
          { id: 'compliance-audits', label: 'AWBI & PCA 1960 Logs', icon: CheckSquare },
          { id: 'platform-revenue', label: 'Revenue & Transactions', icon: DollarSign },
        ];
      case 'PET_OWNER':
        return [
          { id: 'dashboard/pet-owner', label: 'Pet Parent Dashboard', icon: LayoutDashboard },
          { id: 'my-pets', label: 'My Registered Pets', icon: Dog },
          { id: 'hospitals', label: 'Find Hospitals & Clinics', icon: Building2 },
          { id: 'care-continuity', label: 'Care Plans & Delegations', icon: Heart },
          { id: 'vet-appointments', label: 'Vet & Clinic Bookings', icon: Calendar },
          { id: 'lost-pet-alerts', label: 'Lost & Found Support', icon: AlertCircle },
        ];
      case 'BUYER':
        return [
          { id: 'dashboard/pet-owner', label: 'Buyer Dashboard', icon: LayoutDashboard },
          { id: 'verified-sellers', label: 'Registered Breeders', icon: Store },
          { id: 'my-applications', label: 'Adoption Applications', icon: ClipboardList },
          { id: 'trust-score', label: 'My Buyer Verification Score', icon: Award },
        ];
      case 'SELLER':
      case 'VENDOR':
      case 'PRODUCT_SHOP_OWNER':
      case 'PRODUCT_STAFF':
        return [
          { id: 'dashboard/vendor', label: 'Vendor & Seller Dashboard', icon: LayoutDashboard },
          { id: 'create-product', label: 'Onboard Catalog Item', icon: Package },
          { id: 'my-listings', label: 'Pet Sale Listings', icon: Dog },
          { id: 'awbi-license', label: 'Breeder Registration & GST', icon: FileCheck },
          { id: 'buyer-requests', label: 'Buyer Screening & Orders', icon: Users },
        ];
      case 'HOSPITAL_OWNER':
      case 'ROLE_VET_ORGANIZATION':
        return [
          { id: 'dashboard/hospital-owner', label: 'Hospital Owner Dashboard', icon: LayoutDashboard },
          { id: 'hospital-profile', label: 'Hospital Profile & Showcase', icon: Building2 },
          { id: 'hospital-operations', label: 'Live Operations & Resources', icon: Activity },
          { id: 'care-continuity', label: 'Care Plans & Compliance', icon: ClipboardList },
          { id: 'org-staff', label: 'Manage Staff & Doctors', icon: Users },
          { id: 'patients', label: 'Organization Patients', icon: Stethoscope },
          { id: 'appointments', label: 'Hospital Appointments', icon: Calendar },
        ];
      case 'VETERINARY_ADMIN':
      case 'HOSPITAL_ADMIN':
        return [
          { id: 'dashboard/hospital-admin', label: 'Hospital Admin Dashboard', icon: LayoutDashboard },
          { id: 'hospital-profile', label: 'Hospital Profile & Showcase', icon: Building2 },
          { id: 'hospital-operations', label: 'Live Operations & Resources', icon: Activity },
          { id: 'care-continuity', label: 'Care Plans & Compliance', icon: ClipboardList },
          { id: 'org-staff', label: 'Manage Staff & Doctors', icon: Users },
          { id: 'patients', label: 'Organization Patients', icon: Stethoscope },
          { id: 'appointments', label: 'Hospital Appointments', icon: Calendar },
        ];
      case 'VETERINARIAN':
      case 'VETERINARY_DOCTOR':
      case 'ROLE_VET_DOCTOR':
      case 'ASSISTANT_VET_DOCTOR':
        return [
          { id: 'dashboard/veterinarian', label: 'Veterinarian Clinical Dashboard', icon: LayoutDashboard },
          { id: 'hospital-profile', label: 'Hospital Profile & Services', icon: Building2 },
          { id: 'hospital-operations', label: 'Live ICU & OT Cockpit', icon: Activity },
          { id: 'care-continuity', label: 'Next-Care Plans', icon: ClipboardList },
          { id: 'patients', label: 'Pet Patient Records', icon: Stethoscope },
          { id: 'appointments', label: 'Clinic Appointments', icon: Calendar },
          { id: 'prescriptions', label: 'Digital Prescriptions', icon: ClipboardList },
          { id: 'emergency-cases', label: '24/7 Emergency Locator', icon: AlertCircle },
        ];
      case 'HOSPITAL_STAFF':
      case 'VET_STAFF':
      case 'ROLE_VET_STAFF':
        return [
          { id: 'dashboard/hospital-staff', label: 'Hospital Staff Dashboard', icon: LayoutDashboard },
          { id: 'hospital-operations', label: 'Live ICU & OT Cockpit', icon: Activity },
          { id: 'patients', label: 'Pet Patient Records', icon: Stethoscope },
          { id: 'appointments', label: 'Clinic Appointments', icon: Calendar },
          { id: 'prescriptions', label: 'Digital Prescriptions', icon: ClipboardList },
          { id: 'emergency-cases', label: '24/7 Emergency Locator', icon: AlertCircle },
        ];
      case 'GROOMING_OWNER':
      case 'GROOMING_STAFF':
        return [
          { id: 'dashboard/pet-care-provider', label: 'Grooming Care Dashboard', icon: LayoutDashboard },
          { id: 'salon-services', label: 'Grooming Packages', icon: Sparkles },
          { id: 'salon-bookings', label: 'Customer Bookings', icon: Calendar },
        ];
      case 'TRAINER_OWNER':
      case 'TRAINER_STAFF':
        return [
          { id: 'dashboard/pet-care-provider', label: 'Trainer Service Dashboard', icon: LayoutDashboard },
          { id: 'training-programs', label: 'Obedience & Skill Classes', icon: Award },
          { id: 'consultations', label: 'Online Consultations', icon: MessageSquare },
        ];
      case 'CARETAKER':
        return [
          { id: 'dashboard/caretaker', label: 'Caretaker Dashboard', icon: LayoutDashboard },
          { id: 'care-continuity', label: 'Assigned Pet Care Cockpit', icon: Heart },
          { id: 'boarding-facility', label: 'Boarding Facilities', icon: Home },
          { id: 'pet-sitting', label: 'Daily Care Logs', icon: Activity },
        ];
      case 'DELIVERY_PARTNER':
        return [
          { id: 'dashboard/pet-care-provider', label: 'Transport Delivery Dashboard', icon: LayoutDashboard },
          { id: 'deliveries', label: 'Active Transport Orders', icon: Truck },
        ];
      case 'NGO_SHELTER':
      case 'ADOPTION_RESCUE':
        return [
          { id: 'dashboard/adoption-rescue', label: 'Rescue NGO Dashboard', icon: LayoutDashboard },
          { id: 'shelter-pets', label: 'Rescue Pet Listings', icon: Heart },
          { id: 'adoption-requests', label: 'PCA Questionnaire Review', icon: CheckSquare },
          { id: 'home-inspections', label: 'Physical Home Inspections', icon: Home },
        ];
      case 'ANIMAL_WELFARE':
      case 'ANIMAL_WELFARE_OFFICER':
      case 'AUDITOR':
        return [
          { id: 'dashboard/animal-welfare', label: 'Animal Welfare Dashboard', icon: LayoutDashboard },
          { id: 'compliance-audits', label: 'AWBI & PCA 1960 Logs', icon: CheckSquare },
          { id: 'home-inspections', label: 'Physical Site Inspections', icon: Home },
        ];
      default:
        return [
          { id: `dashboard/${currentRoleSlug}`, label: `${roleMeta?.name || 'Workspace'} Dashboard`, icon: LayoutDashboard },
        ];
    }
  };

  const roleMenuItems = getRoleMenuItems(activeRole);

  const handleRoleSelection = (roleKey) => {
    switchRole(roleKey);
    const targetSlug = ROLE_TO_SLUG[roleKey] || 'pet-owner';
    navigate(`/dashboard/${targetSlug}`);
    onClose?.();
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Responsive Aside Drawer / Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl p-4 h-full overflow-y-auto flex flex-col justify-between shrink-0 custom-scrollbar transition-transform duration-300 ease-in-out
        lg:static lg:z-auto lg:w-64 lg:shadow-none lg:translate-x-0 lg:bg-white/90 lg:backdrop-blur-md lg:border-r lg:border-emerald-100
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-5">
          
          {/* Mobile Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 lg:hidden">
            <div>
              <span className="text-base font-black text-emerald-800">Workspace Menu</span>
              <p className="text-[10px] text-slate-400 font-medium">Jiva Thunai Role Dashboard</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Workspace Info & Quick Switcher on Mobile */}
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Workspace Role
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${roleMeta.badgeColor || 'bg-emerald-100 text-emerald-800'}`}>
                {roleMeta.name || activeRole}
              </span>
            </div>

            {/* Mobile Role Dropdown */}
            <div className="sm:hidden mt-2">
              <select
                value={activeRole}
                onChange={(e) => handleRoleSelection(e.target.value)}
                className="w-full px-3 py-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                aria-label="Switch active workspace role"
              >
                {availableRoles.map(r => (
                  <option key={r} value={r}>{SystemRoles[r]?.name || r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 1: PRIMARY ROLE-BASED DASHBOARD BUTTON (Visible for ALL Roles) */}
          <div className="space-y-1.5">
            <div className="px-3 text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center justify-between">
              <span>Main Workspace</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Live role workspace" />
            </div>
            
            <Link
              to={`/dashboard/${currentRoleSlug}`}
              id="sidebar-role-dashboard-btn"
              onClick={() => onClose?.()}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left group shadow-xs ${
                isDashboardActive
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-500/20'
                  : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-200/80 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl transition-all shrink-0 ${
                  isDashboardActive 
                    ? 'bg-white/20 text-white shadow-inner' 
                    : 'bg-emerald-600 text-white shadow-xs group-hover:scale-105'
                }`}>
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight">Dashboard</span>
                  </div>
                  <p className={`text-[10px] font-semibold truncate ${
                    isDashboardActive ? 'text-emerald-100' : 'text-slate-500'
                  }`}>
                    {roleConfig?.badgeText || `${roleMeta?.name || activeRole} Hub`}
                  </p>
                </div>
              </div>
              
              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                isDashboardActive ? 'text-white' : 'text-emerald-600'
              }`} />
            </Link>
          </div>

          {/* SECTION 2: Role Specific Controls */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Role Controls</span>
              <span className="text-[9px] text-slate-400 font-medium">({roleMenuItems.length})</span>
            </div>
            {roleMenuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id || 
                (item.id.startsWith('dashboard') && isDashboardActive && (
                  activeSection === item.id || 
                  activeSection === 'dashboard' || 
                  activeSection === `dashboard/${currentRoleSlug}` ||
                  (activeSection === 'platform-admin' && item.id.includes('platform-admin'))
                ));
              
              const linkTarget = item.id.startsWith('/') ? item.id : `/${item.id}`;

              return (
                <Link
                  key={item.id}
                  to={linkTarget}
                  onClick={() => onClose?.()}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* SECTION 3: Primary Platform Pages (Sidebar Navigation) */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Platform Pages
            </div>
            {primaryPlatformModules.map((item) => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  to={`/${item.id}`}
                  onClick={() => onClose?.()}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

        </div>

        {/* Footer User Profile & Workspace Status */}
        {user && (
          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200">
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate text-[11px] leading-tight">
                  {user.fullName || user.email || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-emerald-700 font-bold truncate">
                  {roleMeta?.name || activeRole}
                </p>
              </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Session active" />
          </div>
        )}

      </aside>
    </>
  );
};

export default Sidebar;
