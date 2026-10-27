import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { RecoverAccountPage } from './pages/RecoverAccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPetPage } from './pages/RegisterPetPage';
import { PetProfilePage } from './pages/PetProfilePage';
import { AdoptionPage } from './pages/AdoptionPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminVetHospitalsPage } from './pages/AdminVetHospitalsPage';
import { AdminVetHospitalDetailsPage } from './pages/AdminVetHospitalDetailsPage';
import { OrgStaffManagementPage } from './pages/OrgStaffManagementPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MarketplaceItemPage } from './pages/MarketplaceItemPage';
import { KycOnboardingPage } from './pages/KycOnboardingPage';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { CreateProductPage } from './pages/CreateProductPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { UserProfilePage } from './pages/UserProfilePage';
import VetSignupLandingPage from './pages/VetSignupLandingPage';
import VetHospitalSignupPage from './pages/VetHospitalSignupPage';
import VetStaffSignupPage from './pages/VetStaffSignupPage';
import { MyPetsPage } from './pages/MyPetsPage';
import { VetAppointmentQueue } from './pages/VetAppointmentQueue';
import { PetPatientsPage } from './pages/PetPatientsPage';
import { DigitalPrescriptionsPage } from './pages/DigitalPrescriptionsPage';
import { EmergencyLocatorPage } from './pages/EmergencyLocatorPage';
import { PublicPetProfilePage } from './pages/PublicPetProfilePage';
import { HospitalOperationsPage } from './pages/HospitalOperationsPage';
import { CareContinuityPage } from './pages/CareContinuityPage';
import { HospitalProfileManagerPage } from './pages/HospitalProfileManagerPage';
import { HospitalPublicProfilePage } from './pages/HospitalPublicProfilePage';
import { HospitalDirectoryPage } from './pages/HospitalDirectoryPage';
import { LegalDocumentPage } from './pages/LegalDocumentPage';
import { NewsCommunityPage } from './pages/NewsCommunityPage';
import { WebsiteSettingsAdminPage } from './pages/WebsiteSettingsAdminPage';
import { RoleHomepage } from './pages/RoleHomepage';
import { ROLE_TO_SLUG } from './config/roleHomepagesConfig';
import { NavigationProvider } from './context/NavigationContext';
import { VeterinaryHospitalsServicePage } from './pages/public/VeterinaryHospitalsServicePage';
import { PetCareServicesPage } from './pages/public/PetCareServicesPage';
import { PetShopServicePage } from './pages/public/PetShopServicePage';
import { AdoptionRescueServicePage } from './pages/public/AdoptionRescueServicePage';
import { LostFoundServicePage } from './pages/public/LostFoundServicePage';
import { PetCareLearningServicePage } from './pages/public/PetCareLearningServicePage';
import { AboutUsPage } from './pages/public/AboutUsPage';
import { ContactSupportPage } from './pages/public/ContactSupportPage';
import { Footer } from './components/Footer';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, activeRole } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = activeRole || user.role;
    const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);

    const isAuthorized = 
      allowedRoles.includes(currentRole) ||
      userRoles.some(r => allowedRoles.includes(r)) ||
      userRoles.includes('SUPER_ADMIN') ||
      currentRole === 'SUPER_ADMIN';

    if (!isAuthorized) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const scrollableMain = document.querySelector('main.overflow-y-auto');
      if (scrollableMain) {
        scrollableMain.scrollTop = 0;
      }
    }
  }, [pathname, search, hash]);

  return null;
}

function AppContent() {
  const { user, activeRole } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Automatically close mobile sidebar on route navigation
  React.useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const isAuthPage = ['/login', '/register', '/forgot-password', '/recover-account', '/vet/signup', '/vet/signup/hospital', '/vet/signup/staff'].includes(location.pathname);
  const isPublicPetPage = location.pathname.startsWith('/pet/public') || location.pathname.startsWith('/public-pet') || location.pathname.startsWith('/public/passport');

  const currentRoleSlug = ROLE_TO_SLUG[activeRole] || 'pet-owner';

  return (
    <div className={`${user && !isAuthPage && !isPublicPetPage ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col bg-white selection:bg-emerald-200`}>
      <ScrollToTop />
      {!isAuthPage && !isPublicPetPage && (
        <Navbar 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
      )}

      {/* App Body Layout */}
      {!user && !isAuthPage ? (
        <main className="flex-1 w-full min-w-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home/public" element={<HomePage />} />
            
            {/* Dedicated Public Service Pages */}
            <Route path="/hospitals" element={<HospitalDirectoryPage />} />
            <Route path="/services/hospitals" element={<VeterinaryHospitalsServicePage />} />
            <Route path="/pet-services" element={<PetCareServicesPage />} />
            <Route path="/shop" element={<PetShopServicePage />} />
            <Route path="/adoption" element={<AdoptionRescueServicePage />} />
            <Route path="/lost-found" element={<LostFoundServicePage />} />
            <Route path="/learn" element={<PetCareLearningServicePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactSupportPage />} />

            {/* Public Role Previews & Homepages */}
            <Route path="/home/:roleSlug" element={<RoleHomepage />} />
            <Route path="/home" element={<RoleHomepage />} />
            <Route path="/dashboard/:roleSlug" element={<RoleHomepage />} />
            <Route path="/dashboard" element={<RoleHomepage />} />
            <Route path="/platform-admin" element={<RoleHomepage />} />

            {/* Public Pet Profile Showcase */}
            <Route path="/pet/public/:identifier" element={<PublicPetProfilePage />} />
            <Route path="/public-pet/:identifier" element={<PublicPetProfilePage />} />
            <Route path="/public-pet" element={<PublicPetProfilePage />} />
            <Route path="/public/passport/:identifier" element={<PublicPetProfilePage />} />
            <Route path="/Profile" element={<PetProfilePage />} />
            <Route path="/profile" element={<PetProfilePage />} />
            <Route path="/passport" element={<PetProfilePage />} />

            {/* Legal Documents */}
            <Route path="/terms" element={<LegalDocumentPage policyKey="LEGAL_TERMS" />} />
            <Route path="/privacy" element={<LegalDocumentPage policyKey="LEGAL_PRIVACY" />} />
            <Route path="/cookie-policy" element={<LegalDocumentPage policyKey="LEGAL_COOKIE" />} />
            <Route path="/refund-policy" element={<LegalDocumentPage policyKey="LEGAL_REFUND" />} />

            {/* News and Community */}
            <Route path="/news" element={<NewsCommunityPage />} />
            <Route path="/news/:slugOrId" element={<NewsCommunityPage />} />
            <Route path="/community" element={<NewsCommunityPage />} />

            {/* Hospital Profiles */}
            <Route path="/hospital/:slugOrId" element={<HospitalPublicProfilePage />} />
            <Route path="/public/hospital/:slugOrId" element={<HospitalPublicProfilePage />} />

            {/* Protected Redirects */}
            <Route path="/medical" element={<Navigate to="/login" />} />
            <Route path="/vet-appointments" element={<Navigate to="/login" />} />
            <Route path="/appointments" element={<Navigate to="/login" />} />
            <Route path="/patients" element={<Navigate to="/login" />} />
            <Route path="/prescriptions" element={<DigitalPrescriptionsPage />} />
            <Route path="/emergency-cases" element={<EmergencyLocatorPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      ) : (
        <div className="flex-1 flex w-full overflow-hidden relative">
          {user && !isAuthPage && !isPublicPetPage && (
            <Sidebar 
              activeSection={location.pathname.substring(1) || 'dashboard'}
              isOpen={isMobileSidebarOpen}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          )}

          <main className={`flex-1 overflow-y-auto w-full min-w-0 flex flex-col justify-between ${!isAuthPage && !isPublicPetPage ? 'p-3.5 sm:p-6 lg:p-8 xl:p-10' : ''}`}>
            <div className="flex-1">
              <Routes>
                {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/recover-account" element={<RecoverAccountPage />} />
              
              {/* Public Pet Profile Showcase - accessible to all */}
              <Route path="/pet/public/:identifier" element={<PublicPetProfilePage />} />
              <Route path="/public-pet/:identifier" element={<PublicPetProfilePage />} />
              <Route path="/public-pet" element={<PublicPetProfilePage />} />
              <Route path="/public/passport/:identifier" element={<PublicPetProfilePage />} />

              {/* Veterinary Medical Health Specific Routes */}
              <Route path="/vet/signup" element={<VetSignupLandingPage />} />
              <Route path="/vet/signup/hospital" element={<VetHospitalSignupPage />} />
              <Route path="/vet/signup/staff" element={<VetStaffSignupPage />} />

              {/* Individual Role Homepages with dedicated URLs (Specification standard /dashboard/:roleSlug) */}
              <Route path="/dashboard" element={<ProtectedRoute><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/:roleSlug" element={<ProtectedRoute><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/pet-owner" element={<ProtectedRoute><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/hospital-owner" element={<ProtectedRoute allowedRoles={['HOSPITAL_OWNER', 'ROLE_VET_ORGANIZATION', 'VETERINARY_ADMIN', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/hospital-admin" element={<ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'VET_STAFF', 'ROLE_VET_STAFF', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/veterinarian" element={<ProtectedRoute allowedRoles={['VETERINARIAN', 'VETERINARY_DOCTOR', 'ROLE_VET_DOCTOR', 'ASSISTANT_VET_DOCTOR', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/vendor" element={<ProtectedRoute allowedRoles={['VENDOR', 'PRODUCT_SHOP_OWNER', 'SELLER', 'PRODUCT_STAFF', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/adoption-rescue" element={<ProtectedRoute allowedRoles={['ADOPTION_RESCUE', 'NGO_SHELTER', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/pet-care-provider" element={<ProtectedRoute allowedRoles={['SERVICE_PROVIDER', 'GROOMING_OWNER', 'GROOMING_STAFF', 'TRAINER_OWNER', 'TRAINER_STAFF', 'DELIVERY_PARTNER', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/service-provider" element={<ProtectedRoute allowedRoles={['SERVICE_PROVIDER', 'GROOMING_OWNER', 'GROOMING_STAFF', 'TRAINER_OWNER', 'TRAINER_STAFF', 'DELIVERY_PARTNER', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/caretaker" element={<ProtectedRoute><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/animal-welfare" element={<ProtectedRoute allowedRoles={['ANIMAL_WELFARE', 'ANIMAL_WELFARE_OFFICER', 'AUDITOR', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/hospital-staff" element={<ProtectedRoute allowedRoles={['HOSPITAL_STAFF', 'VET_STAFF', 'ROLE_VET_STAFF', 'VETERINARY_ADMIN', 'ADMIN', 'SUPER_ADMIN']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/dashboard/platform-admin" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CUSTOMER_SUPPORT', 'FINANCE', 'MARKETING']}><RoleHomepage /></ProtectedRoute>} />
              <Route path="/platform-admin" element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CUSTOMER_SUPPORT', 'FINANCE', 'MARKETING']}><RoleHomepage /></ProtectedRoute>} />

              {/* Aliases for backwards compatibility */}
              <Route path="/home" element={<ProtectedRoute><RoleHomepage /></ProtectedRoute>} />
              <Route path="/home/:roleSlug" element={<ProtectedRoute><RoleHomepage /></ProtectedRoute>} />
              <Route path="/home/public" element={<HomePage />} />

              {/* Dedicated Service Pages within Authenticated Workspace */}
              <Route path="/hospitals" element={<HospitalDirectoryPage />} />
              <Route path="/services/hospitals" element={<VeterinaryHospitalsServicePage />} />
              <Route path="/pet-services" element={<PetCareServicesPage />} />
              <Route path="/shop" element={<PetShopServicePage />} />
              <Route path="/adoption" element={<AdoptionRescueServicePage />} />
              <Route path="/lost-found" element={<LostFoundServicePage />} />
              <Route path="/learn" element={<PetCareLearningServicePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactSupportPage />} />

              {/* Protected Clinical and Operational Routes */}
              <Route path="/register-pet" element={<ProtectedRoute><RegisterPetPage /></ProtectedRoute>} />
              <Route path="/user-profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
              <Route path="/my-pets" element={<ProtectedRoute><MyPetsPage /></ProtectedRoute>} />
              <Route path="/kyc-onboarding" element={<ProtectedRoute><KycOnboardingPage /></ProtectedRoute>} />
              <Route path="/adoptions" element={<ProtectedRoute><AdoptionPage /></ProtectedRoute>} />
              <Route path="/Profile" element={<ProtectedRoute><PetProfilePage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><PetProfilePage /></ProtectedRoute>} />
              <Route path="/passport" element={<ProtectedRoute><PetProfilePage /></ProtectedRoute>} />
              <Route path="/medical" element={<ProtectedRoute><MedicalRecordsPage /></ProtectedRoute>} />
              <Route path="/care-continuity" element={<ProtectedRoute><CareContinuityPage /></ProtectedRoute>} />
              <Route path="/care-plans" element={<ProtectedRoute><CareContinuityPage /></ProtectedRoute>} />
              <Route path="/hospital-operations" element={<ProtectedRoute allowedRoles={['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'VETERINARY_DOCTOR', 'ROLE_VET_DOCTOR', 'VET_STAFF', 'ROLE_VET_STAFF', 'ASSISTANT_VET_DOCTOR', 'ADMIN', 'SUPER_ADMIN']}><HospitalOperationsPage /></ProtectedRoute>} />
              <Route path="/live-operations" element={<ProtectedRoute allowedRoles={['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'VETERINARY_DOCTOR', 'ROLE_VET_DOCTOR', 'VET_STAFF', 'ROLE_VET_STAFF', 'ASSISTANT_VET_DOCTOR', 'ADMIN', 'SUPER_ADMIN']}><HospitalOperationsPage /></ProtectedRoute>} />
              <Route path="/hospital-profile" element={<ProtectedRoute allowedRoles={['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN']}><HospitalProfileManagerPage /></ProtectedRoute>} />
              <Route path="/hospital-management" element={<ProtectedRoute allowedRoles={['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN']}><HospitalProfileManagerPage /></ProtectedRoute>} />
              <Route path="/hospital/:slugOrId" element={<HospitalPublicProfilePage />} />
              <Route path="/public/hospital/:slugOrId" element={<HospitalPublicProfilePage />} />
              <Route path="/vet-appointments" element={<ProtectedRoute><VetAppointmentQueue /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><VetAppointmentQueue /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute allowedRoles={['VETERINARY_DOCTOR', 'ROLE_VET_DOCTOR', 'VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'VET_STAFF', 'ROLE_VET_STAFF', 'ASSISTANT_VET_DOCTOR', 'ADMIN', 'SUPER_ADMIN']}><PetPatientsPage /></ProtectedRoute>} />
              <Route path="/prescriptions" element={<DigitalPrescriptionsPage />} />
              <Route path="/emergency-cases" element={<EmergencyLocatorPage />} />
              <Route path="/admin-users" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin-vet-hospitals" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminVetHospitalsPage /></ProtectedRoute>} />
              <Route path="/admin/vet-hospitals/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminVetHospitalDetailsPage /></ProtectedRoute>} />
              <Route path="/org-staff" element={<ProtectedRoute allowedRoles={['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN']}><OrgStaffManagementPage /></ProtectedRoute>} />
              <Route path="/admin-catalog" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminCatalogPage /></ProtectedRoute>} />
              <Route path="/create-product" element={<ProtectedRoute allowedRoles={['SELLER', 'ADMIN', 'SUPER_ADMIN']}><CreateProductPage /></ProtectedRoute>} />
              <Route path="/edit-product" element={<ProtectedRoute allowedRoles={['SELLER', 'ADMIN', 'SUPER_ADMIN']}><CreateProductPage /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
              <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceItemPage /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />

              {/* Legal & Policies Standalone Pages (Main Screen) */}
              <Route path="/terms" element={<LegalDocumentPage policyKey="LEGAL_TERMS" />} />
              <Route path="/privacy" element={<LegalDocumentPage policyKey="LEGAL_PRIVACY" />} />
              <Route path="/cookie-policy" element={<LegalDocumentPage policyKey="LEGAL_COOKIE" />} />
              <Route path="/refund-policy" element={<LegalDocumentPage policyKey="LEGAL_REFUND" />} />

              {/* News & Community Standalone Pages (Main Screen) */}
              <Route path="/news" element={<NewsCommunityPage />} />
              <Route path="/news/:slugOrId" element={<NewsCommunityPage />} />
              <Route path="/community" element={<NewsCommunityPage />} />

              {/* Super Admin CMS & Website Settings */}
              <Route path="/admin/website-settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><WebsiteSettingsAdminPage /></ProtectedRoute>} />
              <Route path="/admin-settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><WebsiteSettingsAdminPage /></ProtectedRoute>} />
              <Route path="/website-settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><WebsiteSettingsAdminPage /></ProtectedRoute>} />
              
              {/* Default redirect to active role's dashboard */}
              <Route path="/" element={<Navigate to={`/dashboard/${currentRoleSlug}`} replace />} />
              <Route path="*" element={<Navigate to={`/dashboard/${currentRoleSlug}`} replace />} />
            </Routes>
          </div>
        </main>
      </div>
    )}

      {/* Global Dynamic CMS Footer (Public Website & Home Page) */}
      {!isAuthPage && !user && (
        <Footer />
      )}

    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
