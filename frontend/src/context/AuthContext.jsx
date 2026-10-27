import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const SystemRoles = {
  SUPER_ADMIN: { code: 'SUPER_ADMIN', name: 'Super Administrator', badgeColor: 'bg-purple-100 text-purple-800', description: 'Full system access & platform governance' },
  ADMIN: { code: 'ADMIN', name: 'Administrator', badgeColor: 'bg-indigo-100 text-indigo-800', description: 'Platform management, verification & user role approvals' },
  PLATFORM_ADMIN: { code: 'PLATFORM_ADMIN', name: 'Platform Administrator', badgeColor: 'bg-purple-100 text-purple-900 font-bold', description: 'Complete system visibility, verification & website CMS' },
  PET_OWNER: { code: 'PET_OWNER', name: 'Pet Owner', badgeColor: 'bg-emerald-100 text-emerald-800', description: 'Manage registered pets, medical records, digital Profile & reminders' },
  HOSPITAL_OWNER: { code: 'HOSPITAL_OWNER', name: 'Hospital Owner', badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold', description: 'Manage hospital organization, branches, staff & capacity' },
  HOSPITAL_ADMIN: { code: 'HOSPITAL_ADMIN', name: 'Hospital Administrator', badgeColor: 'bg-teal-100 text-teal-900 border border-teal-300 font-bold', description: 'Hospital daily queues, staff schedules & patient triage' },
  VETERINARIAN: { code: 'VETERINARIAN', name: 'Veterinarian', badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold', description: 'Clinical examinations, patient records & electronic prescriptions' },
  VENDOR: { code: 'VENDOR', name: 'Pet Product / Shop Vendor', badgeColor: 'bg-blue-100 text-blue-900 font-bold', description: 'Manage online pet store, products, inventory & orders' },
  ADOPTION_RESCUE: { code: 'ADOPTION_RESCUE', name: 'Adoption & Rescue Organization', badgeColor: 'bg-pink-100 text-pink-900 font-bold', description: 'Manage animal listings, adoption applications & foster coordination' },
  SERVICE_PROVIDER: { code: 'SERVICE_PROVIDER', name: 'Pet Care Service Provider', badgeColor: 'bg-rose-100 text-rose-900 font-bold', description: 'Manage grooming, walking, training & sitting services' },
  CARETAKER: { code: 'CARETAKER', name: 'Temporary Caretaker', badgeColor: 'bg-lime-100 text-lime-800 font-bold', description: 'Manage pet sitting, daycare & authorized task delegations' },
  ANIMAL_WELFARE: { code: 'ANIMAL_WELFARE', name: 'Animal Welfare Organization', badgeColor: 'bg-emerald-800 text-white font-bold', description: 'Coordinate rescue cases, volunteers & outreach campaigns' },
  BUYER: { code: 'BUYER', name: 'Pet / Product Buyer', badgeColor: 'bg-teal-100 text-teal-800', description: 'Browse & buy pets, products, submit adoption applications' },
  SELLER: { code: 'SELLER', name: 'Verified Breeder / Seller', badgeColor: 'bg-amber-100 text-amber-800', description: 'List pets for sale under PCA 1960 & Dog Breeding Rules' },
  PRODUCT_SHOP_OWNER: { code: 'PRODUCT_SHOP_OWNER', name: 'Product Shop Owner', badgeColor: 'bg-blue-100 text-blue-800', description: 'Manage pet food, accessories & medical inventory' },
  PRODUCT_STAFF: { code: 'PRODUCT_STAFF', name: 'Product Staff', badgeColor: 'bg-cyan-100 text-cyan-800', description: 'Order fulfillment & inventory management' },
  VETERINARY_ADMIN: { code: 'VETERINARY_ADMIN', name: 'Veterinary Admin', badgeColor: 'bg-emerald-200 text-emerald-900 font-bold border border-emerald-500', description: 'Hospital admin, manage docs, staff, & monitor organization' },
  VETERINARY_DOCTOR: { code: 'VETERINARY_DOCTOR', name: 'Veterinary Doctor', badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-400', description: 'Manage appointments, issue prescriptions, sign medical logs' },
  ASSISTANT_VET_DOCTOR: { code: 'ASSISTANT_VET_DOCTOR', name: 'Assistant Vet Doctor', badgeColor: 'bg-teal-100 text-teal-900 border border-teal-400', description: 'Assist veterinary doctors with medical tasks and prescriptions' },
  VET_STAFF: { code: 'VET_STAFF', name: 'Veterinary Staff', badgeColor: 'bg-green-100 text-green-800', description: 'Clinic schedule, patient check-in & record uploads' },
  GROOMING_OWNER: { code: 'GROOMING_OWNER', name: 'Grooming Salon Owner', badgeColor: 'bg-pink-100 text-pink-800', description: 'Manage grooming services, staff & booking packages' },
  GROOMING_STAFF: { code: 'GROOMING_STAFF', name: 'Grooming Staff', badgeColor: 'bg-rose-100 text-rose-800', description: 'Execute grooming appointments & upload photos' },
  TRAINER_OWNER: { code: 'TRAINER_OWNER', name: 'Training Owner', badgeColor: 'bg-orange-100 text-orange-800', description: 'Manage training programs, classes & online consultation' },
  TRAINER_STAFF: { code: 'TRAINER_STAFF', name: 'Pet Trainer Staff', badgeColor: 'bg-amber-100 text-amber-900', description: 'Conduct pet training sessions & issue certificates' },
  DELIVERY_PARTNER: { code: 'DELIVERY_PARTNER', name: 'Delivery Partner', badgeColor: 'bg-sky-100 text-sky-800', description: 'Handle pet transportation & supply delivery' },
  NGO_SHELTER: { code: 'NGO_SHELTER', name: 'NGO / Animal Shelter', badgeColor: 'bg-emerald-200 text-emerald-900 font-bold', description: 'List rescue pets, review PCA adoption applications' },
  MODERATOR: { code: 'MODERATOR', name: 'Content Moderator', badgeColor: 'bg-violet-100 text-violet-800', description: 'Review community posts, listings & flag illegal pet trade' },
  CUSTOMER_SUPPORT: { code: 'CUSTOMER_SUPPORT', name: 'Customer Support', badgeColor: 'bg-blue-100 text-blue-900', description: 'Handle support tickets, user disputes & helpline' },
  FINANCE: { code: 'FINANCE', name: 'Finance Executive', badgeColor: 'bg-emerald-100 text-emerald-800', description: 'Platform payments, wallet transactions & seller payouts' },
  MARKETING: { code: 'MARKETING', name: 'Marketing Executive', badgeColor: 'bg-fuchsia-100 text-fuchsia-800', description: 'Promotions, contests, pet meetups & campaigns' },
  AUDITOR: { code: 'AUDITOR', name: 'Compliance Auditor', badgeColor: 'bg-red-100 text-red-800', description: 'Audit KYC, municipal licenses & PCA Act compliance logs' },
  ANIMAL_WELFARE_OFFICER: { code: 'ANIMAL_WELFARE_OFFICER', name: 'Animal Welfare Officer (AWBI)', badgeColor: 'bg-emerald-800 text-white', description: 'AWBI legal oversight, inspection & shelter verification' }
};

export const AuthProvider = ({ children }) => {
  // Using sessionStorage instead of localStorage so different tabs in the same browser keep isolated user sessions!
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('jiva_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    return sessionStorage.getItem('jiva_active_role') || 'PET_OWNER';
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('jiva_jwt_token') || null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('jiva_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('jiva_user');
    }
  }, [user]);

  useEffect(() => {
    if (activeRole) {
      sessionStorage.setItem('jiva_active_role', activeRole);
    }
  }, [activeRole]);

  // Login handler with isolated per-tab session storage
  const login = (authData) => {
    const newUser = {
      userId: authData.userId || '123e4567-e89b-12d3-a456-426614174000',
      fullName: authData.fullName || 'User',
      email: authData.email || '',
      phone: authData.phone || '',
      roles: authData.roles || ['PET_OWNER'],
      kycStatus: authData.kycStatus || 'VERIFIED',
      emailVerified: authData.emailVerified ?? true
    };

    setUser(newUser);
    setToken(authData.token || 'jwt-session-token');

    const primaryRole = (authData.roles && authData.roles.length > 0) ? authData.roles[0] : 'PET_OWNER';
    setActiveRole(primaryRole);

    sessionStorage.setItem('jiva_user', JSON.stringify(newUser));
    sessionStorage.setItem('jiva_active_role', primaryRole);
    sessionStorage.setItem('jiva_jwt_token', authData.token || 'jwt-session-token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveRole('PET_OWNER');
    sessionStorage.removeItem('jiva_user');
    sessionStorage.removeItem('jiva_jwt_token');
    sessionStorage.removeItem('jiva_active_role');
  };

  const switchRole = (newRole) => {
    setActiveRole(newRole);
    sessionStorage.setItem('jiva_active_role', newRole);
  };

  return (
    <AuthContext.Provider value={{ user, token, activeRole, login, logout, switchRole, SystemRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
