import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { usePageNavigation } from '../context/NavigationContext';
import { 
  ROLE_HOMEPAGES_CONFIG, ROLE_SLUGS, ROLE_TO_SLUG 
} from '../config/roleHomepagesConfig';
import { RoleHomeHeader } from '../components/role-home/RoleHomeHeader';
import { RoleSummaryCards } from '../components/role-home/RoleSummaryCards';
import { RoleActionCenter } from '../components/role-home/RoleActionCenter';
import { RoleRecommendations } from '../components/role-home/RoleRecommendations';
import { RoleDynamicSections } from '../components/role-home/RoleDynamicSections';
import { 
  petApi, bookingApi, carePlanApi, medicalApi, 
  hospitalProfileApi, hospitalLiveOpsApi, vetDoctorApi, 
  marketplaceApi, adoptionApi, delegationApi, adminApi, cmsApi, emergencyApi 
} from '../services/api';
import { 
  AlertCircle, ShieldAlert, ArrowRight, RefreshCw, Building2, UserCheck
} from 'lucide-react';

export const RoleHomepage = () => {
  const { roleSlug: paramSlug } = useParams();
  const { user, token, activeRole, switchRole, SystemRoles } = useAuth();
  const { showToast } = useNotification();
  const { registerSections } = usePageNavigation();
  const navigate = useNavigate();

  // Resolve target role configuration:
  // If slug is present in URL, use it; otherwise resolve based on user's activeRole
  const effectiveSlug = paramSlug || ROLE_TO_SLUG[activeRole] || 'pet-owner';
  const roleConfig = ROLE_HOMEPAGES_CONFIG[effectiveSlug] || ROLE_HOMEPAGES_CONFIG['pet-owner'];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [contextualMessage, setContextualMessage] = useState('');
  const [dynamicGreeting, setDynamicGreeting] = useState('');

  // Determine available roles for the current user
  const hasSuperAdmin = user?.roles?.includes('SUPER_ADMIN');
  const userAssignedRoles = user?.roles || (user?.role ? [user.role] : ['PET_OWNER']);
  const isAuthorizedForThisRole = 
    hasSuperAdmin || 
    userAssignedRoles.includes(roleConfig.roleKey) ||
    (roleConfig.roleKey === 'PET_OWNER' && userAssignedRoles.includes('BUYER')) ||
    (roleConfig.roleKey === 'HOSPITAL_OWNER' && (userAssignedRoles.includes('VETERINARY_ADMIN') || userAssignedRoles.includes('ROLE_VET_ORGANIZATION'))) ||
    (roleConfig.roleKey === 'HOSPITAL_ADMIN' && (userAssignedRoles.includes('VETERINARY_ADMIN') || userAssignedRoles.includes('ROLE_VET_ORGANIZATION') || userAssignedRoles.includes('HOSPITAL_OWNER'))) ||
    (roleConfig.roleKey === 'HOSPITAL_STAFF' && (userAssignedRoles.includes('HOSPITAL_STAFF') || userAssignedRoles.includes('VET_STAFF') || userAssignedRoles.includes('ROLE_VET_STAFF') || userAssignedRoles.includes('VETERINARY_ADMIN'))) ||
    (roleConfig.roleKey === 'VETERINARIAN' && (userAssignedRoles.includes('VETERINARY_DOCTOR') || userAssignedRoles.includes('ROLE_VET_DOCTOR') || userAssignedRoles.includes('ASSISTANT_VET_DOCTOR'))) ||
    (roleConfig.roleKey === 'VENDOR' && (userAssignedRoles.includes('SELLER') || userAssignedRoles.includes('PRODUCT_SHOP_OWNER') || userAssignedRoles.includes('PRODUCT_STAFF'))) ||
    (roleConfig.roleKey === 'ADOPTION_RESCUE' && userAssignedRoles.includes('NGO_SHELTER')) ||
    (roleConfig.roleKey === 'SERVICE_PROVIDER' && (userAssignedRoles.includes('GROOMING_OWNER') || userAssignedRoles.includes('GROOMING_STAFF') || userAssignedRoles.includes('TRAINER_OWNER') || userAssignedRoles.includes('TRAINER_STAFF') || userAssignedRoles.includes('DELIVERY_PARTNER'))) ||
    (roleConfig.roleKey === 'ANIMAL_WELFARE' && (userAssignedRoles.includes('ANIMAL_WELFARE_OFFICER') || userAssignedRoles.includes('AUDITOR'))) ||
    (roleConfig.roleKey === 'PLATFORM_ADMIN' && (userAssignedRoles.includes('ADMIN') || userAssignedRoles.includes('SUPER_ADMIN') || userAssignedRoles.includes('MODERATOR') || userAssignedRoles.includes('CUSTOMER_SUPPORT') || userAssignedRoles.includes('FINANCE') || userAssignedRoles.includes('MARKETING'))) ||
    (ROLE_TO_SLUG[activeRole] === roleConfig.slug);

  const loadRoleData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const calculatedMetrics = {};
    let contextMsg = '';
    let greeting = roleConfig.description;

    try {
      switch (effectiveSlug) {
        case 'pet-owner': {
          // 1. Fetch user's registered pets
          let petsList = [];
          if (user.userId) {
            const petRes = await petApi.getPetsByOwner(user.userId, token);
            if (petRes && (Array.isArray(petRes.data) || Array.isArray(petRes))) {
              petsList = petRes.data || petRes;
            }
          }
          calculatedMetrics.petsCount = petsList.length;

          // 2. Fetch bookings
          let bookingsList = [];
          const bookingRes = await bookingApi.getBookings({ ownerId: user.userId }, token);
          if (bookingRes && (Array.isArray(bookingRes.data) || Array.isArray(bookingRes))) {
            bookingsList = bookingRes.data || bookingRes;
          }
          calculatedMetrics.appointmentsCount = bookingsList.length;

          // 3. Fetch care plans / reminders
          let careCount = 0;
          if (user.userId) {
            const careRes = await carePlanApi.getCarePlansByOwner(user.userId, token);
            if (careRes && (Array.isArray(careRes.data) || Array.isArray(careRes))) {
              careCount = (careRes.data || careRes).length;
            }
          }
          calculatedMetrics.careRemindersCount = careCount;
          calculatedMetrics.hospitalsNearbyCount = '24/7 Active';

          // Contextual dynamic messages based on user activity
          if (petsList.length === 0) {
            contextMsg = roleConfig.welcomeMessages.newUser;
            greeting = "Ready to start your companion journey? Register your first pet profile.";
          } else if (bookingsList.length === 0) {
            contextMsg = roleConfig.welcomeMessages.noAppointments;
            greeting = `You have ${petsList.length} registered companion animal(s). Book their routine health checkup.`;
          } else {
            contextMsg = roleConfig.welcomeMessages.upcomingAppointment;
            greeting = `Everything is set for your upcoming clinic visits and ongoing care plans.`;
          }
          if (careCount > 0) {
            contextMsg = roleConfig.welcomeMessages.careTasksDue;
          }
          break;
        }

        case 'hospital-owner': {
          let branchList = [];
          const profileRes = await hospitalProfileApi.getMyProfile(null, token);
          if (profileRes && profileRes.data) {
            const profileData = profileRes.data;
            calculatedMetrics.verifiedStatus = profileData.verificationStatus || 'REGISTERED';
            if (profileData.branches && Array.isArray(profileData.branches)) {
              branchList = profileData.branches;
            }
          }
          setBranches(branchList);
          setSelectedBranch(branchList[0] || null);
          calculatedMetrics.branchesCount = branchList.length;

          // Fetch bookings and doctors from database
          const bookingRes = await bookingApi.getBookings({}, token);
          const bookings = Array.isArray(bookingRes?.data) ? bookingRes.data : (Array.isArray(bookingRes) ? bookingRes : []);
          calculatedMetrics.appointmentsCount = bookings.length;

          const doctorsRes = await hospitalLiveOpsApi.getAllDoctors(null, token);
          const docs = Array.isArray(doctorsRes?.data) ? doctorsRes.data : (Array.isArray(doctorsRes) ? doctorsRes : []);
          calculatedMetrics.staffCount = docs.length;

          greeting = "Hospital management console. Centralized branches, staff rosters, and patient services.";
          contextMsg = `${bookings.length} patient appointments recorded in system.`;
          break;
        }

        case 'hospital-admin': {
          const bookingRes = await bookingApi.getBookings({}, token);
          const queue = Array.isArray(bookingRes?.data) ? bookingRes.data : (Array.isArray(bookingRes) ? bookingRes : []);
          calculatedMetrics.todayAppointmentsCount = queue.length;
          calculatedMetrics.pendingRequestsCount = queue.filter(b => b.status === 'PENDING' || b.status === 'REQUESTED').length;

          const doctorsRes = await hospitalLiveOpsApi.getAllDoctors(null, token);
          const doctorsList = Array.isArray(doctorsRes?.data) ? doctorsRes.data : (Array.isArray(doctorsRes) ? doctorsRes : []);
          calculatedMetrics.availableDoctorsCount = doctorsList.length;
          calculatedMetrics.activeProceduresCount = 0;

          greeting = "Daily hospital operations cockpit. Monitor live queues, doctor schedules, and admissions.";
          contextMsg = `${calculatedMetrics.todayAppointmentsCount} patient consultations queued in database.`;
          break;
        }

        case 'veterinarian': {
          const bookingRes = await bookingApi.getBookings({}, token);
          const appts = Array.isArray(bookingRes?.data) ? bookingRes.data : (Array.isArray(bookingRes) ? bookingRes : []);
          calculatedMetrics.appointmentsCount = appts.length;

          const patientsRes = await medicalApi.getAllPatients(token);
          const patientsList = Array.isArray(patientsRes?.data) ? patientsRes.data : (Array.isArray(patientsRes) ? patientsRes : []);
          calculatedMetrics.patientsCount = patientsList.length;

          const rxRes = await medicalApi.getAllPrescriptions(token);
          const rxList = Array.isArray(rxRes?.data) ? rxRes.data : (Array.isArray(rxRes) ? rxRes : []);
          calculatedMetrics.prescriptionsCount = rxList.length;

          calculatedMetrics.carePlansCount = 0;
          greeting = "Clinical practice console. Access assigned patients, diagnostics, and electronic prescriptions.";
          contextMsg = `${appts.length} appointments and ${patientsList.length} patients recorded in database.`;
          break;
        }

        case 'vendor': {
          const productsRes = await marketplaceApi.getProducts(token);
          const productsList = Array.isArray(productsRes?.data) ? productsRes.data : (Array.isArray(productsRes) ? productsRes : []);
          calculatedMetrics.productsCount = productsList.length;

          let ordersCount = 0;
          try {
            const ordersRes = await marketplaceApi.getMyOrders(token);
            const ords = Array.isArray(ordersRes?.data) ? ordersRes.data : (Array.isArray(ordersRes) ? ordersRes : []);
            ordersCount = ords.length;
          } catch (e) {}
          calculatedMetrics.ordersCount = ordersCount;

          greeting = "Pet business & retail cockpit. Manage inventory, process customer orders, and track payouts.";
          contextMsg = `${calculatedMetrics.productsCount} catalog items listed in database.`;
          break;
        }

        case 'adoption-rescue': {
          const listingsRes = await petApi.getAdoptionListings();
          const listings = Array.isArray(listingsRes?.data) ? listingsRes.data : (Array.isArray(listingsRes) ? listingsRes : []);
          calculatedMetrics.listingsCount = listings.length;

          const appsRes = await adoptionApi.getMyApplications(token);
          const apps = Array.isArray(appsRes?.data) ? appsRes.data : (Array.isArray(appsRes) ? appsRes : []);
          calculatedMetrics.applicationsCount = apps.length;

          calculatedMetrics.fosterCount = 0;
          calculatedMetrics.rescueCasesCount = 0;
          greeting = "Rescue & adoption mission center. Connect rescue animals with vetted, loving adoptive families.";
          contextMsg = `${listings.length} animal listings active in database.`;
          break;
        }

        case 'service-provider': {
          calculatedMetrics.servicesCount = 0;
          calculatedMetrics.bookingsCount = 0;
          greeting = "Pet care provider portal. Manage grooming, walking, sitting, and training bookings.";
          contextMsg = "Live provider schedule synchronized with database.";
          break;
        }

        case 'caretaker': {
          let delegationsList = [];
          if (user.userId || user.email) {
            const delRes = await delegationApi.getDelegationsForCaretaker(user.userId, user.email, token);
            if (delRes && (Array.isArray(delRes.data) || Array.isArray(delRes))) {
              delegationsList = delRes.data || delRes;
            }
          }
          calculatedMetrics.sharedPetsCount = delegationsList.length;
          calculatedMetrics.careTasksCount = 0;
          calculatedMetrics.loggedUpdatesCount = 0;
          greeting = "Authorized caretaker portal. Review feeding schedules, walking routines, and emergency contacts.";
          contextMsg = `${delegationsList.length} active companion care delegations authorized in database.`;
          break;
        }

        case 'animal-welfare': {
          calculatedMetrics.rescueCasesCount = 0;
          calculatedMetrics.followUpCount = 0;
          calculatedMetrics.volunteersCount = 0;
          calculatedMetrics.lostPetsCount = 0;
          greeting = "Animal welfare coordination hub. Safeguard community animals, dispatch rescue teams, and organize outreach.";
          contextMsg = "Welfare operations hub synchronized with database.";
          break;
        }

        case 'platform-admin': {
          let usersList = [];
          const usersRes = await adminApi.getUsersByRole('ALL', token);
          if (usersRes && (Array.isArray(usersRes.data) || Array.isArray(usersRes))) {
            usersList = usersRes.data || usersRes;
          }
          calculatedMetrics.usersCount = usersList.length;

          let pendingCount = 0;
          try {
            const pendingRes = await adminApi.getPendingHospitals(token);
            const pList = Array.isArray(pendingRes?.data) ? pendingRes.data : (Array.isArray(pendingRes) ? pendingRes : []);
            pendingCount = pList.length;
          } catch (e) {}
          calculatedMetrics.pendingVerificationsCount = pendingCount;

          greeting = "Platform administration and governance suite. Full visibility into security, users, and compliance.";
          contextMsg = `${usersList.length} registered platform users loaded from database.`;
          break;
        }

        default:
          break;
      }

      setMetrics(calculatedMetrics);
      setDynamicGreeting(greeting);
      setContextualMessage(contextMsg);
    } catch (err) {
      console.warn("Failed to fetch role metrics:", err);
      setError("Unable to sync live data from server. Displaying cached dashboard controls.");
    } finally {
      setLoading(false);
    }
  }, [effectiveSlug, user, token, roleConfig]);

  useEffect(() => {
    loadRoleData();
  }, [loadRoleData]);

  // Ensure page navigation bar sections are cleared for dashboard workspace
  useEffect(() => {
    registerSections([]);
  }, [registerSections]);

  // Canonicalize to active role workspace URL if on generic /dashboard or if not authorized
  useEffect(() => {
    if (user && !loading) {
      if (!isAuthorizedForThisRole || !paramSlug) {
        const mySlug = ROLE_TO_SLUG[activeRole] || 'pet-owner';
        navigate(`/dashboard/${mySlug}`, { replace: true });
      }
    }
  }, [user, loading, isAuthorizedForThisRole, activeRole, paramSlug, navigate]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Welcome Banner */}
      <RoleHomeHeader
        config={roleConfig}
        user={user}
        dynamicGreeting={dynamicGreeting}
        contextualMessage={contextualMessage}
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={(b) => setSelectedBranch(b)}
        onRefresh={loadRoleData}
        loading={loading}
      />

      {/* Error state alert if API connection fails */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadRoleData}
            className="px-3 py-1 rounded-xl bg-rose-200 hover:bg-rose-300 font-bold text-xs text-rose-900 transition-colors cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* 2. Overview & Quick Summary Cards */}
      <RoleSummaryCards
        cards={roleConfig.cards}
        metrics={metrics}
        loading={loading}
      />

      {/* 3. Role-Specific Canonical Sections (5 to 8 sections with HTML #id anchors) */}
      <RoleDynamicSections
        slug={effectiveSlug}
        roleConfig={roleConfig}
        metrics={metrics}
        user={user}
        token={token}
      />

      {/* 4. Action Center (Pending approvals, upcoming tasks, alerts) */}
      <RoleActionCenter
        actions={roleConfig.actionCenter}
        loading={loading}
      />

      {/* 5. Role-Specific Recommendations & Helpful Links */}
      <RoleRecommendations
        recommendations={roleConfig.recommendations}
      />

    </div>
  );
};
