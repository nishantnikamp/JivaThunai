import { 
  Dog, Heart, Stethoscope, ShieldCheck, Plus, CheckCircle, AlertTriangle, 
  Award, QrCode, FileText, UserCheck, Calendar, Activity, Upload, Eye,
  Building2, Users, ShoppingBag, Store, Sparkles, Clock, MapPin, 
  Search, ShieldAlert, ArrowRight, Bell, Settings, ExternalLink,
  BookOpen, HelpCircle, Briefcase, FileCheck, PhoneCall, CheckSquare
} from 'lucide-react';

// Maps role slug in URL (/dashboard/:slug, /home/:slug) to system role code and vice versa
export const ROLE_SLUGS = {
  'pet-owner': 'PET_OWNER',
  'hospital-owner': 'HOSPITAL_OWNER',
  'hospital-admin': 'HOSPITAL_ADMIN',
  'veterinarian': 'VETERINARIAN',
  'vendor': 'VENDOR',
  'adoption-rescue': 'ADOPTION_RESCUE',
  'pet-care-provider': 'SERVICE_PROVIDER',
  'service-provider': 'SERVICE_PROVIDER',
  'caretaker': 'CARETAKER',
  'animal-welfare': 'ANIMAL_WELFARE',
  'platform-admin': 'PLATFORM_ADMIN',
  'hospital-staff': 'HOSPITAL_STAFF',
  'public': 'PUBLIC_GUEST'
};

export const ROLE_TO_SLUG = {
  'PET_OWNER': 'pet-owner',
  'HOSPITAL_OWNER': 'hospital-owner',
  'ROLE_VET_ORGANIZATION': 'hospital-owner',
  'VETERINARY_ADMIN': 'hospital-admin',
  'HOSPITAL_ADMIN': 'hospital-admin',
  'HOSPITAL_STAFF': 'hospital-staff',
  'VET_STAFF': 'hospital-staff',
  'ROLE_VET_STAFF': 'hospital-staff',
  'VETERINARIAN': 'veterinarian',
  'VETERINARY_DOCTOR': 'veterinarian',
  'ROLE_VET_DOCTOR': 'veterinarian',
  'ASSISTANT_VET_DOCTOR': 'veterinarian',
  'VENDOR': 'vendor',
  'PRODUCT_SHOP_OWNER': 'vendor',
  'SELLER': 'vendor',
  'ADOPTION_RESCUE': 'adoption-rescue',
  'NGO_SHELTER': 'adoption-rescue',
  'SERVICE_PROVIDER': 'pet-care-provider',
  'GROOMING_OWNER': 'pet-care-provider',
  'GROOMING_STAFF': 'pet-care-provider',
  'TRAINER_OWNER': 'pet-care-provider',
  'TRAINER_STAFF': 'pet-care-provider',
  'DELIVERY_PARTNER': 'pet-care-provider',
  'CARETAKER': 'caretaker',
  'ANIMAL_WELFARE': 'animal-welfare',
  'ANIMAL_WELFARE_OFFICER': 'animal-welfare',
  'AUDITOR': 'animal-welfare',
  'PRODUCT_STAFF': 'vendor',
  'PLATFORM_ADMIN': 'platform-admin',
  'SUPER_ADMIN': 'platform-admin',
  'ADMIN': 'platform-admin',
  'MODERATOR': 'platform-admin',
  'CUSTOMER_SUPPORT': 'platform-admin',
  'FINANCE': 'platform-admin',
  'MARKETING': 'platform-admin',
  'BUYER': 'pet-owner'
};

export const ROLE_HOMEPAGES_CONFIG = {
  // A. Pet Owner Homepage (/dashboard/pet-owner)
  'pet-owner': {
    slug: 'pet-owner',
    roleKey: 'PET_OWNER',
    badgeText: 'PET OWNER DASHBOARD',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    headline: "Your Pet's Health and Happiness Start Here.",
    description: 'Manage your pets, schedule veterinary visits, follow care plans, and find trusted services in one place.',
    icon: Dog,
    sections: [
      { id: 'overview', label: 'Pet Overview' },
      { id: 'appointments', label: 'Appointment Center' },
      { id: 'care-plans', label: 'Care Plans & Reminders' },
      { id: 'find-services', label: 'Find Services' },
      { id: 'health-records', label: 'Health Records' },
      { id: 'shop', label: 'Shop & Orders' },
      { id: 'community', label: 'Adoption & Community' },
      { id: 'sharing', label: 'Caretaker Sharing' }
    ],
    primaryAction: {
      label: 'Book Veterinary Appointment',
      link: '/vet-appointments',
      icon: Calendar,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Add a Pet Profile',
      link: '/register-pet',
      icon: Plus,
      variant: 'secondary'
    },
    welcomeMessages: {
      newUser: "Welcome to Jiva Thunai! Start by adding your pet's profile.",
      noAppointments: "Your next step to better pet care starts here. Find a veterinary professional.",
      upcomingAppointment: "You have an upcoming veterinary appointment. Review the details before your visit.",
      careTasksDue: "Some care tasks are coming up. Review your pet's approved care plan."
    },
    cards: [
      {
        id: 'appointments',
        title: 'My Appointments',
        description: 'View upcoming visits and manage bookings.',
        icon: Calendar,
        metricKey: 'appointmentsCount',
        unit: 'upcoming',
        link: '/vet-appointments',
        emptyText: 'No upcoming visits scheduled',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800'
      },
      {
        id: 'pets',
        title: 'My Pets',
        description: 'Manage pet profiles, records, and health information.',
        icon: Dog,
        metricKey: 'petsCount',
        unit: 'registered',
        link: '/my-pets',
        emptyText: 'No pets added yet',
        color: 'from-teal-500/10 to-cyan-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'care-reminders',
        title: 'Care Reminders',
        description: 'Review upcoming vaccinations and approved care tasks.',
        icon: Bell,
        metricKey: 'careRemindersCount',
        unit: 'tasks due',
        link: '/care-continuity',
        emptyText: 'All care tasks up-to-date',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800'
      },
      {
        id: 'nearby-care',
        title: 'Find Nearby Care',
        description: 'Discover hospitals, veterinarians, and pet services.',
        icon: MapPin,
        metricKey: 'hospitalsNearbyCount',
        unit: 'verified clinics',
        link: '/hospitals',
        emptyText: 'Explore verified clinics',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-1',
        title: 'Upcoming Consultations',
        description: 'Confirm attendance or reschedule clinic appointments.',
        type: 'APPOINTMENT',
        link: '/vet-appointments',
        actionLabel: 'Review Schedule'
      },
      {
        id: 'act-2',
        title: 'Vaccination & Deworming Due',
        description: 'Rabies booster and seasonal deworming schedules require attention.',
        type: 'CARE_TASK',
        link: '/care-continuity',
        actionLabel: 'View Schedule'
      },
      {
        id: 'act-3',
        title: 'Care Delegations',
        description: 'Active temporary caretaker authorizations for your companion animals.',
        type: 'DELEGATION',
        link: '/care-continuity',
        actionLabel: 'Manage Access'
      }
    ],
    recommendations: [
      { title: 'Add a new pet profile', description: 'Create verified digital health records & QR pet passport.', link: '/register-pet', icon: Plus },
      { title: 'Book a veterinary appointment', description: 'Connect with certified clinical specialists near you.', link: '/vet-appointments', icon: Calendar },
      { title: 'View medical records & care plans', description: 'Access lab results, prescriptions, and post-op care plans.', link: '/medical', icon: FileText },
      { title: 'Find a groomer, walker, or trainer', description: 'Verified pet care professionals tailored to your area.', link: '/pet-services', icon: Sparkles },
      { title: 'Explore pet products & shop', description: 'Quality food, toys, and care essentials for your companions.', link: '/shop', icon: ShoppingBag },
      { title: 'Invite a temporary caretaker', description: 'Safely delegate authorized care tasks with time limits.', link: '/care-continuity', icon: Users }
    ]
  },

  // B. Hospital Owner Homepage (/dashboard/hospital-owner)
  'hospital-owner': {
    slug: 'hospital-owner',
    roleKey: 'HOSPITAL_OWNER',
    badgeText: 'HOSPITAL OWNER DASHBOARD',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    headline: 'Build a Better-Managed Veterinary Hospital.',
    description: 'Manage your hospital organization, branches, veterinary team, appointments, services, and operational performance from one centralized workspace.',
    icon: Building2,
    hasBranchSelector: true,
    sections: [
      { id: 'overview', label: 'Hospital Overview' },
      { id: 'branches', label: 'Branch Management' },
      { id: 'team', label: 'Doctors & Staff' },
      { id: 'services', label: 'Services & Pricing' },
      { id: 'appointments', label: 'Appointments' },
      { id: 'resources', label: 'Hospital Resources' },
      { id: 'reports', label: 'Business Reports' },
      { id: 'settings', label: 'Compliance & Settings' }
    ],
    primaryAction: {
      label: 'Manage Hospital & Branches',
      link: '/hospital-profile',
      icon: Building2,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Add Doctors & Staff',
      link: '/org-staff',
      icon: Users,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'branches',
        title: 'Hospital & Branches',
        description: 'Manage profiles, facilities, and branch details.',
        icon: Building2,
        metricKey: 'branchesCount',
        unit: 'facilities',
        link: '/hospital-profile',
        emptyText: 'No branches configured',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800'
      },
      {
        id: 'team',
        title: 'Doctors & Staff',
        description: 'Manage team members, roles, and assignments.',
        icon: Users,
        metricKey: 'staffCount',
        unit: 'active members',
        link: '/org-staff',
        emptyText: 'No team members registered',
        color: 'from-teal-500/10 to-cyan-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'appointments-overview',
        title: 'Appointments',
        description: 'Monitor bookings, schedules, and assignments.',
        icon: Calendar,
        metricKey: 'appointmentsCount',
        unit: 'today bookings',
        link: '/vet-appointments',
        emptyText: 'No active appointments',
        color: 'from-indigo-500/10 to-blue-500/10 border-indigo-200 text-indigo-800'
      },
      {
        id: 'reports',
        title: 'Business Reports',
        description: 'Review operational and financial reports you are authorized to access.',
        icon: Activity,
        metricKey: 'verifiedStatus',
        unit: 'compliance',
        link: '/hospital-operations',
        emptyText: 'View performance logs',
        color: 'from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-ho-1',
        title: 'Hospital Verification Status',
        description: 'Submit council registration and clinical license for official platform verification.',
        type: 'VERIFICATION',
        link: '/hospital-profile',
        actionLabel: 'Complete Verification'
      },
      {
        id: 'act-ho-2',
        title: 'Pending Staff Invitations',
        description: 'Verify licensed veterinarians and clinical assistants requesting affiliation.',
        type: 'STAFF',
        link: '/org-staff',
        actionLabel: 'Manage Team'
      },
      {
        id: 'act-ho-3',
        title: 'Facility Operational Alerts',
        description: 'Review ICU, Surgery OT, and diagnostic resource availability across branches.',
        type: 'OPERATIONS',
        link: '/hospital-operations',
        actionLabel: 'Live Operations'
      }
    ],
    recommendations: [
      { title: 'Complete hospital verification', description: 'Upload State Veterinary Council registration certificates.', link: '/hospital-profile', icon: FileCheck },
      { title: 'Register a new branch', description: 'Expand your hospital network with new clinic locations.', link: '/hospital-profile', icon: Plus },
      { title: 'Add doctors and staff', description: 'Invite licensed veterinarians and technical staff.', link: '/org-staff', icon: Users },
      { title: 'Configure services & pricing', description: 'Setup OPD, dental, radiology, and surgery fees.', link: '/hospital-profile', icon: Settings },
      { title: 'Review appointment capacity', description: 'Adjust slot lengths and consultation protocols.', link: '/vet-appointments', icon: Calendar },
      { title: 'Monitor operational capacity', description: 'Track real-time ward beds and emergency readiness.', link: '/hospital-operations', icon: Activity }
    ]
  },

  // C. Hospital Admin Homepage (/dashboard/hospital-admin)
  'hospital-admin': {
    slug: 'hospital-admin',
    roleKey: 'HOSPITAL_ADMIN',
    badgeText: 'HOSPITAL ADMIN PORTAL',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300 font-bold',
    headline: 'Keep Every Hospital Operation on Track.',
    description: 'Coordinate daily appointments, doctor availability, staff assignments, and hospital resources efficiently.',
    icon: Activity,
    hasBranchSelector: true,
    sections: [
      { id: 'overview', label: 'Daily Operations' },
      { id: 'requests', label: 'Appointment Requests' },
      { id: 'doctors', label: 'Doctor Availability' },
      { id: 'staff', label: 'Staff & Shifts' },
      { id: 'patient-flow', label: 'Patient Flow' },
      { id: 'resources', label: 'Rooms & Resources' },
      { id: 'reports', label: 'Activity Reports' }
    ],
    primaryAction: {
      label: 'Manage Daily Queue',
      link: '/hospital-operations',
      icon: Activity,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Appointment Requests',
      link: '/vet-appointments',
      icon: Calendar,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'today-schedule',
        title: "Today's Schedule",
        description: 'Manage appointments and scheduling conflicts.',
        icon: Calendar,
        metricKey: 'todayAppointmentsCount',
        unit: 'patients queued',
        link: '/vet-appointments',
        emptyText: 'Queue currently empty',
        color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'booking-requests',
        title: 'Booking Requests',
        description: 'Review and process pending requests.',
        icon: Clock,
        metricKey: 'pendingRequestsCount',
        unit: 'pending review',
        link: '/vet-appointments',
        emptyText: 'No pending requests',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800'
      },
      {
        id: 'doctor-availability',
        title: 'Doctor Availability',
        description: 'View authorized schedules and assignments.',
        icon: Stethoscope,
        metricKey: 'availableDoctorsCount',
        unit: 'on duty',
        link: '/hospital-operations',
        emptyText: 'No doctors clocked in',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800'
      },
      {
        id: 'hospital-operations',
        title: 'Hospital Operations',
        description: 'Monitor queues, facilities, and operational tasks.',
        icon: Activity,
        metricKey: 'activeProceduresCount',
        unit: 'active cases',
        link: '/hospital-operations',
        emptyText: 'Facilities clear',
        color: 'from-purple-500/10 to-violet-500/10 border-purple-200 text-purple-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-ha-1',
        title: 'Incoming Appointment Requests',
        description: 'Confirm or reschedule pending bookings submitted by pet owners.',
        type: 'QUEUE',
        link: '/vet-appointments',
        actionLabel: 'Process Requests'
      },
      {
        id: 'act-ha-2',
        title: 'Staff Shift Management',
        description: 'Adjust on-call doctors, nursing assignments, and front-desk coverage.',
        type: 'STAFF',
        link: '/hospital-operations',
        actionLabel: 'Update Roster'
      },
      {
        id: 'act-ha-3',
        title: 'ICU & Ward Bed Capacity',
        description: 'Review inpatient occupancy and allocate surgical recovery beds.',
        type: 'RESOURCES',
        link: '/hospital-operations',
        actionLabel: 'Manage Beds'
      }
    ],
    recommendations: [
      { title: 'Confirm or reject appointment requests', description: 'Review patient details and allocate slots by policy.', link: '/vet-appointments', icon: CheckSquare },
      { title: 'Assign eligible doctors', description: 'Route consultations to available veterinary specialists.', link: '/vet-appointments', icon: Stethoscope },
      { title: 'Update staff shifts and leave', description: 'Maintain accurate operational schedules and duty rosters.', link: '/hospital-operations', icon: Users },
      { title: 'Manage check-in and patient queues', description: 'Streamline reception triage and reduce wait times.', link: '/hospital-operations', icon: Activity },
      { title: 'Update resource availability', description: 'Reflect ultrasound, X-ray, and OT sanitization status.', link: '/hospital-operations', icon: Settings },
      { title: 'Review administrative alerts', description: 'Investigate missed check-ins or delayed appointments.', link: '/vet-appointments', icon: Bell }
    ]
  },

  // D. Veterinarian Homepage (/dashboard/veterinarian)
  'veterinarian': {
    slug: 'veterinarian',
    roleKey: 'VETERINARIAN',
    badgeText: 'VETERINARIAN DASHBOARD',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    headline: 'Better Clinical Organization. More Consistent Pet Care.',
    description: 'Review your appointments, access authorized patient records, document consultations, and manage follow-up care.',
    icon: Stethoscope,
    sections: [
      { id: 'overview', label: 'Clinical Overview' },
      { id: 'appointments', label: 'Appointment Schedule' },
      { id: 'patients', label: 'Patient Records' },
      { id: 'consultations', label: 'Consultations' },
      { id: 'treatment', label: 'Treatment & E-Rx' },
      { id: 'follow-ups', label: 'Follow-up Care' },
      { id: 'profile', label: 'Professional Profile' }
    ],
    primaryAction: {
      label: 'Consultation Queue',
      link: '/vet-appointments',
      icon: Calendar,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Digital Prescriptions',
      link: '/prescriptions',
      icon: FileText,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'vet-appointments',
        title: 'My Appointments',
        description: "View today's consultations and upcoming visits.",
        icon: Calendar,
        metricKey: 'appointmentsCount',
        unit: 'consultations',
        link: '/vet-appointments',
        emptyText: 'No consultations today',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800'
      },
      {
        id: 'patient-records',
        title: 'Patient Records',
        description: 'Review relevant medical histories and clinical records.',
        icon: Dog,
        metricKey: 'patientsCount',
        unit: 'patients',
        link: '/patients',
        emptyText: 'No assigned patients',
        color: 'from-teal-500/10 to-cyan-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'clinical-notes',
        title: 'Clinical Notes',
        description: 'Document examination findings and diagnoses.',
        icon: FileText,
        metricKey: 'prescriptionsCount',
        unit: 'e-prescriptions',
        link: '/prescriptions',
        emptyText: 'No pending notes',
        color: 'from-indigo-500/10 to-blue-500/10 border-indigo-200 text-indigo-800'
      },
      {
        id: 'care-plans',
        title: 'Care Plans',
        description: 'Create or update treatment and follow-up instructions.',
        icon: Heart,
        metricKey: 'carePlansCount',
        unit: 'active plans',
        link: '/care-continuity',
        emptyText: 'No active plans',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-vet-1',
        title: 'Active Patient Triage',
        description: 'Open currently checked-in animals waiting in the consultation room.',
        type: 'QUEUE',
        link: '/vet-appointments',
        actionLabel: 'Call Next Patient'
      },
      {
        id: 'act-vet-2',
        title: 'Pending E-Prescriptions',
        description: 'Sign and issue digital prescriptions with QR verification.',
        type: 'RX',
        link: '/prescriptions',
        actionLabel: 'Create E-Rx'
      },
      {
        id: 'act-vet-3',
        title: 'Post-Op Follow-up Tasks',
        description: 'Review recovery status and medical adherence for discharge cases.',
        type: 'FOLLOWUP',
        link: '/care-continuity',
        actionLabel: 'Review Cases'
      }
    ],
    recommendations: [
      { title: 'Review the consultation queue', description: 'Monitor incoming patients and priority emergencies.', link: '/vet-appointments', icon: Activity },
      { title: 'Open assigned patient record', description: 'Inspect historical vaccination, vitals, and allergies.', link: '/patients', icon: Dog },
      { title: 'Complete clinical documentation', description: 'Record SOAP notes, differentials, and lab tests.', link: '/medical', icon: FileText },
      { title: 'Issue authorized prescriptions', description: 'Generate compliant electronic prescriptions with dosages.', link: '/prescriptions', icon: FileCheck },
      { title: 'Schedule follow-up care', description: 'Assign next suture removal or diagnostic re-check date.', link: '/care-continuity', icon: Calendar },
      { title: 'Review missed care alerts', description: 'Address non-compliance triggers generated for chronic patients.', link: '/care-continuity', icon: Bell }
    ]
  },

  // E. Pet Product / Shop Vendor Homepage (/dashboard/vendor)
  'vendor': {
    slug: 'vendor',
    roleKey: 'VENDOR',
    badgeText: 'VENDOR DASHBOARD',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
    headline: 'Grow Your Pet Business with Jiva Thunai.',
    description: 'Manage your catalogue, inventory, customer orders, fulfilment, and store information in one place.',
    icon: Store,
    sections: [
      { id: 'overview', label: 'Store Overview' },
      { id: 'products', label: 'Product Catalogue' },
      { id: 'inventory', label: 'Inventory' },
      { id: 'orders', label: 'Order Management' },
      { id: 'returns', label: 'Returns & Support' },
      { id: 'sales', label: 'Sales & Payouts' },
      { id: 'settings', label: 'Store Settings' }
    ],
    primaryAction: {
      label: 'Add New Product',
      link: '/create-product',
      icon: Plus,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Manage Store Catalog',
      link: '/marketplace',
      icon: ShoppingBag,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'my-store',
        title: 'My Store',
        description: 'Manage store information and verification.',
        icon: Store,
        metricKey: 'storeStatus',
        unit: 'status',
        link: '/kyc-onboarding',
        emptyText: 'Store verified',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800'
      },
      {
        id: 'products',
        title: 'Products',
        description: 'Add products, images, prices, and variants.',
        icon: ShoppingBag,
        metricKey: 'productsCount',
        unit: 'listed items',
        link: '/marketplace',
        emptyText: 'No products listed yet',
        color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'orders',
        title: 'Orders',
        description: 'Process orders and update fulfilment status.',
        icon: FileText,
        metricKey: 'ordersCount',
        unit: 'active orders',
        link: '/orders',
        emptyText: 'No pending orders',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800'
      },
      {
        id: 'inventory-sales',
        title: 'Inventory & Sales',
        description: 'Monitor stock, revenue, and payouts.',
        icon: Activity,
        metricKey: 'revenueStatus',
        unit: 'in stock',
        link: '/marketplace',
        emptyText: 'Stock healthy',
        color: 'from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-v-1',
        title: 'Order Dispatch Queue',
        description: 'Process new orders, print shipping labels, and mark packages dispatched.',
        type: 'ORDERS',
        link: '/orders',
        actionLabel: 'Fulfill Orders'
      },
      {
        id: 'act-v-2',
        title: 'Low Stock Alerts',
        description: 'Top-selling kibble, supplements, or toys running under 5 units.',
        type: 'INVENTORY',
        link: '/marketplace',
        actionLabel: 'Restock Products'
      },
      {
        id: 'act-v-3',
        title: 'Store Verification & Tax Compliance',
        description: 'Ensure GSTIN and trade license details remain updated.',
        type: 'KYC',
        link: '/kyc-onboarding',
        actionLabel: 'Review Documents'
      }
    ],
    recommendations: [
      { title: 'Complete store verification', description: 'Upload FSSAI or trade permits for verified seller badge.', link: '/kyc-onboarding', icon: FileCheck },
      { title: 'Add your first product', description: 'List high-demand pet nutrition, accessories, or grooming tools.', link: '/create-product', icon: Plus },
      { title: 'Update low-stock items', description: 'Keep inventory synchronised to avoid backorders.', link: '/marketplace', icon: Store },
      { title: 'Process new orders', description: 'Prompt shipping improves seller ratings and customer retention.', link: '/orders', icon: ShoppingBag },
      { title: 'Review returns & refunds', description: 'Handle customer exchanges swiftly under platform policy.', link: '/orders', icon: HelpCircle },
      { title: 'Track payouts & revenue reports', description: 'Inspect weekly settlement statements and banking details.', link: '/orders', icon: Activity }
    ]
  },

  // F. Adoption and Rescue Organization Homepage (/dashboard/adoption-rescue)
  'adoption-rescue': {
    slug: 'adoption-rescue',
    roleKey: 'ADOPTION_RESCUE',
    badgeText: 'ADOPTION & RESCUE DASHBOARD',
    badgeClass: 'bg-pink-100 text-pink-900 border-pink-300 font-bold',
    headline: 'Help Every Pet Find a Safe and Loving Home.',
    description: 'Publish animal listings, review adoption applications, coordinate foster care, and support responsible rescue outcomes.',
    icon: Heart,
    sections: [
      { id: 'overview', label: 'Organization Overview' },
      { id: 'animals', label: 'Animal Listings' },
      { id: 'applications', label: 'Applications' },
      { id: 'foster', label: 'Foster Care' },
      { id: 'rescue', label: 'Rescue & Lost Pets' },
      { id: 'volunteers', label: 'Volunteers' },
      { id: 'outcomes', label: 'Outcomes & Follow-up' }
    ],
    primaryAction: {
      label: 'Publish Adoption Listing',
      link: '/adoptions',
      icon: Plus,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Review Applications',
      link: '/adoptions',
      icon: FileCheck,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'listings',
        title: 'Animal Listings',
        description: 'Create and update adoption profiles.',
        icon: Dog,
        metricKey: 'listingsCount',
        unit: 'active profiles',
        link: '/adoptions',
        emptyText: 'No animals listed for adoption',
        color: 'from-pink-500/10 to-rose-500/10 border-pink-200 text-pink-800'
      },
      {
        id: 'applications',
        title: 'Applications',
        description: 'Review and manage adoption requests.',
        icon: FileCheck,
        metricKey: 'applicationsCount',
        unit: 'under review',
        link: '/adoptions',
        emptyText: 'No pending adoption requests',
        color: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-800'
      },
      {
        id: 'foster-care',
        title: 'Foster Care',
        description: 'Coordinate temporary homes and care arrangements.',
        icon: Users,
        metricKey: 'fosterCount',
        unit: 'in foster homes',
        link: '/care-continuity',
        emptyText: 'No active foster placements',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800'
      },
      {
        id: 'rescue-lost',
        title: 'Rescue & Lost Pets',
        description: 'Manage rescue cases and reunification workflows.',
        icon: AlertTriangle,
        metricKey: 'rescueCasesCount',
        unit: 'open cases',
        link: '/emergency-cases',
        emptyText: 'No active rescue reports',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-ar-1',
        title: 'Pending Adoption Screenings',
        description: 'Review applicant questionnaires under PCA Act 1960 animal welfare guidelines.',
        type: 'APPLICATIONS',
        link: '/adoptions',
        actionLabel: 'Screen Applicants'
      },
      {
        id: 'act-ar-2',
        title: 'Foster Placement Renewals',
        description: 'Check up on puppies & injured animals currently residing with volunteers.',
        type: 'FOSTER',
        link: '/care-continuity',
        actionLabel: 'View Fosters'
      },
      {
        id: 'act-ar-3',
        title: 'Urgent Rescue Dispatch',
        description: 'Coordinate volunteer response for reported injured community animals.',
        type: 'EMERGENCY',
        link: '/emergency-cases',
        actionLabel: 'Emergency Map'
      }
    ],
    recommendations: [
      { title: 'Publish an animal listing', description: 'Upload photos, temperament, sterilization, and vaccine history.', link: '/adoptions', icon: Plus },
      { title: 'Review new applications', description: 'Verify home environment and adopter suitability.', link: '/adoptions', icon: FileCheck },
      { title: 'Update animal availability', description: 'Mark animals as Reserved or Adopted to keep listings accurate.', link: '/adoptions', icon: Dog },
      { title: 'Coordinate foster arrangements', description: 'Establish clear feeding and medical delegation tasks.', link: '/care-continuity', icon: Users },
      { title: 'Record adoption outcomes', description: 'Issue official adoption certificates with digital ID.', link: '/adoptions', icon: Award },
      { title: 'Schedule follow-up checks', description: 'Set 30-day post-adoption welfare verification dates.', link: '/care-continuity', icon: Calendar }
    ]
  },

  // G. Pet Care Service Provider Homepage (/dashboard/pet-care-provider)
  'pet-care-provider': {
    slug: 'pet-care-provider',
    roleKey: 'SERVICE_PROVIDER',
    badgeText: 'PET CARE PROVIDER DASHBOARD',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
    headline: 'Deliver Reliable Care. Build Trust with Pet Owners.',
    description: 'Present your services, manage availability, accept bookings, and keep customers informed about care activities.',
    icon: Sparkles,
    sections: [
      { id: 'overview', label: 'Provider Overview' },
      { id: 'services', label: 'My Services' },
      { id: 'service-area', label: 'Service Area' },
      { id: 'calendar', label: 'Availability Calendar' },
      { id: 'bookings', label: 'Bookings & Requests' },
      { id: 'care-updates', label: 'Care Updates' },
      { id: 'performance', label: 'Reviews & Earnings' }
    ],
    primaryAction: {
      label: 'Manage Services & Pricing',
      link: '/marketplace',
      icon: Sparkles,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'View Bookings Calendar',
      link: '/vet-appointments',
      icon: Calendar,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'my-services',
        title: 'My Services',
        description: 'Manage grooming, walking, training, sitting, or boarding.',
        icon: Sparkles,
        metricKey: 'servicesCount',
        unit: 'active services',
        link: '/marketplace',
        emptyText: 'No services created yet',
        color: 'from-pink-500/10 to-rose-500/10 border-pink-200 text-pink-800'
      },
      {
        id: 'bookings',
        title: 'Bookings',
        description: 'Accept, manage, and complete service bookings.',
        icon: Calendar,
        metricKey: 'bookingsCount',
        unit: 'scheduled',
        link: '/vet-appointments',
        emptyText: 'No pending bookings',
        color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'calendar',
        title: 'Calendar',
        description: 'Set working hours and availability.',
        icon: Clock,
        metricKey: 'scheduleStatus',
        unit: 'slots open',
        link: '/hospital-operations',
        emptyText: 'Availability set',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800'
      },
      {
        id: 'reviews-earnings',
        title: 'Reviews & Earnings',
        description: 'Review customer feedback and payment records.',
        icon: Award,
        metricKey: 'ratingStatus',
        unit: 'client reviews',
        link: '/user-profile',
        emptyText: '5.0 Star Rating',
        color: 'from-amber-500/10 to-yellow-500/10 border-amber-200 text-amber-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-sp-1',
        title: 'Today Grooming & Boarding Schedule',
        description: 'Review check-ins scheduled for your salon or boarding facility.',
        type: 'SCHEDULE',
        link: '/vet-appointments',
        actionLabel: 'View Schedule'
      },
      {
        id: 'act-sp-2',
        title: 'New Customer Booking Requests',
        description: 'Confirm appointments for walking, pet training, or sitting sessions.',
        type: 'BOOKINGS',
        link: '/vet-appointments',
        actionLabel: 'Accept Requests'
      },
      {
        id: 'act-sp-3',
        title: 'Service Area & Pricing Settings',
        description: 'Update local pincodes and pricing for peak holiday boarding.',
        type: 'SETTINGS',
        link: '/marketplace',
        actionLabel: 'Update Rates'
      }
    ],
    recommendations: [
      { title: 'Complete provider verification', description: 'Upload certification, identity proof, and salon address.', link: '/kyc-onboarding', icon: FileCheck },
      { title: 'Add a service and price', description: 'Create spa baths, basic grooming, puppy training packages.', link: '/create-product', icon: Plus },
      { title: 'Set your service area', description: 'Specify doorstep radius and serviceable localities.', link: '/user-profile', icon: MapPin },
      { title: 'Update availability calendar', description: 'Block off public holidays or unavailable time slots.', link: '/vet-appointments', icon: Clock },
      { title: 'Review booking requests', description: 'Promptly accept client bookings to maintain top tier search ranking.', link: '/vet-appointments', icon: Calendar },
      { title: 'Record service completion', description: 'Trigger payment release and prompt customer for reviews.', link: '/vet-appointments', icon: Award }
    ]
  },

  // Service Provider alias for pet-care-provider
  'service-provider': {
    slug: 'service-provider',
    roleKey: 'SERVICE_PROVIDER',
    badgeText: 'PET CARE PROVIDER DASHBOARD',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
    headline: 'Deliver Reliable Care. Build Trust with Pet Owners.',
    description: 'Present your services, manage availability, accept bookings, and keep customers informed about care activities.',
    icon: Sparkles,
    sections: [
      { id: 'overview', label: 'Provider Overview' },
      { id: 'services', label: 'My Services' },
      { id: 'service-area', label: 'Service Area' },
      { id: 'calendar', label: 'Availability Calendar' },
      { id: 'bookings', label: 'Bookings & Requests' },
      { id: 'care-updates', label: 'Care Updates' },
      { id: 'performance', label: 'Reviews & Earnings' }
    ],
    primaryAction: {
      label: 'Manage Services & Pricing',
      link: '/marketplace',
      icon: Sparkles,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'View Bookings Calendar',
      link: '/vet-appointments',
      icon: Calendar,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'my-services',
        title: 'My Services',
        description: 'Manage grooming, walking, training, sitting, or boarding.',
        icon: Sparkles,
        metricKey: 'servicesCount',
        unit: 'active services',
        link: '/marketplace',
        emptyText: 'No services created yet',
        color: 'from-pink-500/10 to-rose-500/10 border-pink-200 text-pink-800'
      },
      {
        id: 'bookings',
        title: 'Bookings',
        description: 'Accept, manage, and complete service bookings.',
        icon: Calendar,
        metricKey: 'bookingsCount',
        unit: 'scheduled',
        link: '/vet-appointments',
        emptyText: 'No pending bookings',
        color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'calendar',
        title: 'Calendar',
        description: 'Set working hours and availability.',
        icon: Clock,
        metricKey: 'scheduleStatus',
        unit: 'slots open',
        link: '/hospital-operations',
        emptyText: 'Availability set',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800'
      },
      {
        id: 'reviews-earnings',
        title: 'Reviews & Earnings',
        description: 'Review customer feedback and payment records.',
        icon: Award,
        metricKey: 'ratingStatus',
        unit: 'client reviews',
        link: '/user-profile',
        emptyText: '5.0 Star Rating',
        color: 'from-amber-500/10 to-yellow-500/10 border-amber-200 text-amber-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-sp-1',
        title: 'Today Grooming & Boarding Schedule',
        description: 'Review check-ins scheduled for your salon or boarding facility.',
        type: 'SCHEDULE',
        link: '/vet-appointments',
        actionLabel: 'View Schedule'
      },
      {
        id: 'act-sp-2',
        title: 'New Customer Booking Requests',
        description: 'Confirm appointments for walking, pet training, or sitting sessions.',
        type: 'BOOKINGS',
        link: '/vet-appointments',
        actionLabel: 'Accept Requests'
      },
      {
        id: 'act-sp-3',
        title: 'Service Area & Pricing Settings',
        description: 'Update local pincodes and pricing for peak holiday boarding.',
        type: 'SETTINGS',
        link: '/marketplace',
        actionLabel: 'Update Rates'
      }
    ],
    recommendations: [
      { title: 'Complete provider verification', description: 'Upload certification, identity proof, and salon address.', link: '/kyc-onboarding', icon: FileCheck },
      { title: 'Add a service and price', description: 'Create spa baths, basic grooming, puppy training packages.', link: '/create-product', icon: Plus },
      { title: 'Set your service area', description: 'Specify doorstep radius and serviceable localities.', link: '/user-profile', icon: MapPin },
      { title: 'Update availability calendar', description: 'Block off public holidays or unavailable time slots.', link: '/vet-appointments', icon: Clock },
      { title: 'Review booking requests', description: 'Promptly accept client bookings to maintain top tier search ranking.', link: '/vet-appointments', icon: Calendar },
      { title: 'Record service completion', description: 'Trigger payment release and prompt customer for reviews.', link: '/vet-appointments', icon: Award }
    ]
  },

  // H. Temporary Pet Caretaker Homepage (/dashboard/caretaker)
  'caretaker': {
    slug: 'caretaker',
    roleKey: 'CARETAKER',
    badgeText: 'CARETAKER DASHBOARD',
    badgeClass: 'bg-lime-100 text-lime-900 border-lime-300 font-bold',
    headline: 'Everything You Need for Their Pet’s Care.',
    description: 'View the care instructions shared with you, complete assigned tasks, and keep the pet owner informed.',
    icon: Users,
    sections: [
      { id: 'pets', label: 'Shared Pet Overview' },
      { id: 'tasks', label: 'Assigned Care Tasks' },
      { id: 'routine', label: 'Feeding & Routine' },
      { id: 'instructions', label: 'Medication & Instructions' },
      { id: 'updates', label: 'Care Updates' },
      { id: 'emergency', label: 'Emergency Contacts' },
      { id: 'access', label: 'Access & Permissions' }
    ],
    primaryAction: {
      label: 'View Care Tasks',
      link: '/care-continuity',
      icon: CheckSquare,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Emergency Locator',
      link: '/emergency-cases',
      icon: AlertTriangle,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'shared-pets',
        title: 'Shared Pets',
        description: 'View pets for which you have active access.',
        icon: Dog,
        metricKey: 'sharedPetsCount',
        unit: 'active delegations',
        link: '/care-continuity',
        emptyText: 'No pets shared with you yet',
        color: 'from-lime-500/10 to-emerald-500/10 border-lime-200 text-lime-800'
      },
      {
        id: 'care-tasks',
        title: 'Care Tasks',
        description: 'Review feeding, walking, and authorized care tasks.',
        icon: CheckSquare,
        metricKey: 'careTasksCount',
        unit: 'due today',
        link: '/care-continuity',
        emptyText: 'All daily tasks complete',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800'
      },
      {
        id: 'report-updates',
        title: 'Report Updates',
        description: 'Report task completion and concerns.',
        icon: FileText,
        metricKey: 'loggedUpdatesCount',
        unit: 'logged reports',
        link: '/care-continuity',
        emptyText: 'Ready to log task completion',
        color: 'from-teal-500/10 to-cyan-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'emergency-info',
        title: 'Emergency Information',
        description: 'Access permitted emergency contacts and essential instructions.',
        icon: PhoneCall,
        metricKey: 'contactsCount',
        unit: 'emergency contacts',
        link: '/emergency-cases',
        emptyText: '24/7 Hotline & Vet contacts ready',
        color: 'from-rose-500/10 to-red-500/10 border-rose-200 text-rose-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-ct-1',
        title: "Today's Feeding & Medication Schedule",
        description: 'Log breakfast, evening stroll, and prescribed joint supplements.',
        type: 'TASKS',
        link: '/care-continuity',
        actionLabel: 'Mark Complete'
      },
      {
        id: 'act-ct-2',
        title: 'Pet Care Instructions',
        description: 'Owner-approved guidelines regarding dietary restrictions, allergies, and exercise limits.',
        type: 'GUIDELINES',
        link: '/care-continuity',
        actionLabel: 'View Instructions'
      },
      {
        id: 'act-ct-3',
        title: 'Authorized Emergency Protocol',
        description: 'Approved veterinary hospital location and pre-authorized medical treatment consent.',
        type: 'EMERGENCY',
        link: '/emergency-cases',
        actionLabel: 'Emergency Contacts'
      }
    ],
    recommendations: [
      { title: 'Check active pet delegations', description: 'Verify current delegation period and pet owner instructions.', link: '/care-continuity', icon: Dog },
      { title: 'Log feeding and medication', description: 'Instantly notify pet parents when care milestones are finished.', link: '/care-continuity', icon: CheckSquare },
      { title: 'Record daily activity & photo', description: 'Upload walk photos and bathroom notes for the pet parent.', link: '/care-continuity', icon: Upload },
      { title: 'Review allergy and dietary warnings', description: 'Strictly adhere to the pet health profile to avoid incidents.', link: '/medical', icon: AlertTriangle },
      { title: 'Report behavior or health concerns', description: 'Alert pet parents immediately if pet exhibits lethargy or vomiting.', link: '/care-continuity', icon: Bell },
      { title: 'Locate 24/7 emergency clinic', description: 'Pre-check nearby veterinary emergency units on map.', link: '/emergency-cases', icon: MapPin }
    ]
  },

  // I. Animal Welfare Organization Homepage (/dashboard/animal-welfare)
  'animal-welfare': {
    slug: 'animal-welfare',
    roleKey: 'ANIMAL_WELFARE',
    badgeText: 'ANIMAL WELFARE DASHBOARD',
    badgeClass: 'bg-emerald-800 text-white font-bold',
    headline: 'Coordinate Action. Protect Animals. Strengthen Communities.',
    description: 'Organize welfare cases, coordinate volunteers, support rescue efforts, and monitor case progress.',
    icon: ShieldCheck,
    sections: [
      { id: 'overview', label: 'Welfare Overview' },
      { id: 'cases', label: 'Rescue Cases' },
      { id: 'volunteers', label: 'Volunteer Coordination' },
      { id: 'foster', label: 'Foster & Temporary Care' },
      { id: 'lost-found', label: 'Lost-and-Found' },
      { id: 'campaigns', label: 'Outreach & Campaigns' },
      { id: 'reports', label: 'Welfare Reports' }
    ],
    primaryAction: {
      label: 'Register Rescue Case',
      link: '/emergency-cases',
      icon: AlertTriangle,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Community Initiatives',
      link: '/news',
      icon: BookOpen,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'rescue-cases',
        title: 'Active Rescue Cases',
        description: 'Immediate response and stray welfare tracking.',
        icon: AlertTriangle,
        metricKey: 'rescueCasesCount',
        unit: 'active cases',
        link: '/emergency-cases',
        emptyText: 'No emergency rescues open',
        color: 'from-amber-500/10 to-red-500/10 border-amber-200 text-amber-800'
      },
      {
        id: 'follow-ups',
        title: 'Animals Requiring Follow-up',
        description: 'Ongoing treatment & recovery checks.',
        icon: Heart,
        metricKey: 'followUpCount',
        unit: 'in treatment',
        link: '/care-continuity',
        emptyText: 'All follow-ups handled',
        color: 'from-rose-500/10 to-pink-500/10 border-rose-200 text-rose-800'
      },
      {
        id: 'volunteers',
        title: 'Volunteer Assignments',
        description: 'Community field team distribution.',
        icon: Users,
        metricKey: 'volunteersCount',
        unit: 'assigned',
        link: '/adoptions',
        emptyText: 'Volunteers deployed',
        color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'shelter-capacity',
        title: 'Foster & Shelter Capacity',
        description: 'Real-time space availability.',
        icon: Building2,
        metricKey: 'capacityStatus',
        unit: 'shelter beds',
        link: '/care-continuity',
        emptyText: 'Capacity available',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800'
      },
      {
        id: 'lost-pet-reunification',
        title: 'Lost-Pet Reunification Cases',
        description: 'Matching lost reports with found animals.',
        icon: Search,
        metricKey: 'lostPetsCount',
        unit: 'matching alerts',
        link: '/emergency-cases',
        emptyText: 'No open lost pet cases',
        color: 'from-purple-500/10 to-violet-500/10 border-purple-200 text-purple-800'
      },
      {
        id: 'outreach',
        title: 'Outreach & Events',
        description: 'Rabies vaccination drives & adoption camps.',
        icon: Calendar,
        metricKey: 'eventsCount',
        unit: 'upcoming drives',
        link: '/news',
        emptyText: 'No campaigns scheduled',
        color: 'from-indigo-500/10 to-cyan-500/10 border-indigo-200 text-indigo-800'
      },
      {
        id: 'welfare-records',
        title: 'Reports & Welfare Records',
        description: 'AWBI and PCA 1960 documentation.',
        icon: FileCheck,
        metricKey: 'auditStatus',
        unit: 'records logged',
        link: '/terms',
        emptyText: 'Compliance up-to-date',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-aw-1',
        title: 'Critical Rescue Dispatch',
        description: 'Coordinate rescue van and veterinary care for highway / street accidents.',
        type: 'RESCUE',
        link: '/emergency-cases',
        actionLabel: 'Dispatch Help'
      },
      {
        id: 'act-aw-2',
        title: 'Anti-Rabies Drive Schedule',
        description: 'Organize municipal ward vaccination and ear-notching programs.',
        type: 'VACCINATION',
        link: '/care-continuity',
        actionLabel: 'View Schedule'
      },
      {
        id: 'act-aw-3',
        title: 'PCA Act 1960 Inspection Reports',
        description: 'Document pet shop and breeder compliance visits under AWBI rules.',
        type: 'COMPLIANCE',
        link: '/admin-vet-hospitals',
        actionLabel: 'File Report'
      }
    ],
    recommendations: [
      { title: 'Register a rescue case', description: 'Log incoming distress calls with geo-coordinates and injury severity.', link: '/emergency-cases', icon: AlertTriangle },
      { title: 'Assign a volunteer', description: 'Designate on-ground volunteers for transit and shelter intake.', link: '/adoptions', icon: Users },
      { title: 'Coordinate a foster placement', description: 'Place recovered animals in vetted foster homes.', link: '/care-continuity', icon: Heart },
      { title: 'Update a welfare report', description: 'Submit official observation notes for legal authorities.', link: '/terms', icon: FileCheck },
      { title: 'Manage an outreach event', description: 'Organize community awareness, adoption, and sterilization drives.', link: '/news', icon: Calendar },
      { title: 'Review open cases & follow-ups', description: 'Track post-operative releases of neutered animals.', link: '/emergency-cases', icon: CheckSquare }
    ]
  },

  // J. Platform Administrator Homepage (/platform-admin)
  'platform-admin': {
    slug: 'platform-admin',
    roleKey: 'PLATFORM_ADMIN',
    badgeText: 'PLATFORM ADMIN DASHBOARD',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-400 font-bold',
    headline: 'Manage the Platform with Confidence and Control.',
    description: 'Oversee users, verification, content, platform configuration, moderation, and operational security.',
    icon: ShieldCheck,
    sections: [
      { id: 'overview', label: 'Platform Overview' },
      { id: 'users', label: 'Users & Roles' },
      { id: 'verification', label: 'Verification Center' },
      { id: 'website-management', label: 'Website Management' },
      { id: 'legal', label: 'Legal & Policies' },
      { id: 'moderation', label: 'Complaints & Moderation' },
      { id: 'marketplace', label: 'Marketplace & Services' },
      { id: 'security', label: 'Audit & Security' }
    ],
    primaryAction: {
      label: 'Review Verifications',
      link: '/admin-vet-hospitals',
      icon: FileCheck,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Website CMS & Settings',
      link: '/admin/website-settings',
      icon: Settings,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'user-management',
        title: 'User Management',
        description: 'Manage accounts, roles, and account status.',
        icon: Users,
        metricKey: 'usersCount',
        unit: 'registered users',
        link: '/admin-users',
        emptyText: 'All accounts verified',
        color: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-800'
      },
      {
        id: 'verification',
        title: 'Verification',
        description: 'Review hospitals, professionals, vendors, and organizations.',
        icon: FileCheck,
        metricKey: 'pendingVerificationsCount',
        unit: 'pending audit',
        link: '/admin-vet-hospitals',
        emptyText: 'No pending verifications',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800'
      },
      {
        id: 'website-management',
        title: 'Website Management',
        description: 'Edit homepage sections, footer, and company information.',
        icon: Settings,
        metricKey: 'cmsStatus',
        unit: 'CMS active',
        link: '/admin/website-settings',
        emptyText: 'Live configuration synchronized',
        color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-800'
      },
      {
        id: 'legal-compliance',
        title: 'Legal & Compliance',
        description: 'Manage legal pages, policies, and version history.',
        icon: ShieldCheck,
        metricKey: 'legalVersion',
        unit: 'PCA 1960',
        link: '/terms',
        emptyText: 'Statutory compliance active',
        color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-pa-1',
        title: 'Pending Hospital & Clinic Onboarding',
        description: 'Review council licenses and physical clinic proofs for incoming veterinary institutions.',
        type: 'VERIFICATION',
        link: '/admin-vet-hospitals',
        actionLabel: 'Audit Applications'
      },
      {
        id: 'act-pa-2',
        title: 'Platform Role Escalations & Access',
        description: 'Approve doctor privileges, administrator roles, and seller accounts.',
        type: 'USERS',
        link: '/admin-users',
        actionLabel: 'Manage Users'
      },
      {
        id: 'act-pa-3',
        title: 'Public Portal Configuration & News',
        description: 'Manage homepage hero banners, emergency alerts, and community articles.',
        type: 'CMS',
        link: '/admin/website-settings',
        actionLabel: 'Open CMS'
      }
    ],
    recommendations: [
      { title: 'Review pending verification requests', description: 'Vet hospital, doctor license, and seller store approvals.', link: '/admin-vet-hospitals', icon: FileCheck },
      { title: 'Resolve complaints & moderation', description: 'Investigate reported listings or inappropriate trade flags.', link: '/admin-users', icon: ShieldAlert },
      { title: 'Update public homepage content', description: 'Configure hero banners, verified providers, and services.', link: '/admin/website-settings', icon: Settings },
      { title: 'Publish approved legal policy updates', description: 'Update Terms of Service, Privacy Policy, and Refund Policy.', link: '/terms', icon: BookOpen },
      { title: 'Monitor security alerts & audit logs', description: 'Inspect authentication attempts, JWT renewals, and admin actions.', link: '/admin-users', icon: Activity },
      { title: 'Review platform operational reports', description: 'Track system health, API response latency, and database integrity.', link: '/hospital-operations', icon: Activity }
    ]
  },

  // K. Hospital Staff Homepage (/dashboard/hospital-staff)
  'hospital-staff': {
    slug: 'hospital-staff',
    roleKey: 'HOSPITAL_STAFF',
    badgeText: 'HOSPITAL STAFF DASHBOARD',
    badgeClass: 'bg-green-100 text-green-900 border-green-300 font-bold',
    headline: 'Support Smooth Hospital Operations Every Day.',
    description: 'Manage the tasks assigned to you and keep appointments and patient flow organized.',
    icon: Activity,
    hasBranchSelector: true,
    sections: [
      { id: 'overview', label: 'Work Overview' },
      { id: 'appointments', label: 'Appointment Support' },
      { id: 'queue', label: 'Check-in & Queue' },
      { id: 'tasks', label: 'Assigned Tasks' },
      { id: 'notices', label: 'Hospital Notices' },
      { id: 'profile', label: 'Profile & Help' }
    ],
    primaryAction: {
      label: 'Patient Check-in Desk',
      link: '/vet-appointments',
      icon: UserCheck,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Hospital Notices',
      link: '/news',
      icon: Bell,
      variant: 'secondary'
    },
    cards: [
      {
        id: 'shift-tasks',
        title: 'Assigned Tasks',
        description: 'Complete reception check-in, sanitization, and patient logistics.',
        icon: CheckSquare,
        metricKey: 'staffTasksCount',
        unit: 'tasks active',
        link: '/hospital-operations',
        emptyText: 'Shift duties assigned',
        color: 'from-green-500/10 to-teal-500/10 border-green-200 text-green-800'
      },
      {
        id: 'queue-support',
        title: 'Check-in & Queue',
        description: 'Manage waiting room arrivals and triage urgency.',
        icon: Clock,
        metricKey: 'queueCount',
        unit: 'patients checked in',
        link: '/vet-appointments',
        emptyText: 'Queue smooth',
        color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-800'
      },
      {
        id: 'today-shift',
        title: 'Current Shift',
        description: 'Hours and branch location for your active shift.',
        icon: Calendar,
        metricKey: 'shiftStatus',
        unit: '09:00 - 18:00',
        link: '/hospital-operations',
        emptyText: 'Shift Active',
        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800'
      },
      {
        id: 'notices',
        title: 'Hospital Notices',
        description: 'Operational memos, shift handovers, and equipment protocols.',
        icon: Bell,
        metricKey: 'noticesCount',
        unit: 'unread notice',
        link: '/news',
        emptyText: 'All notices acknowledged',
        color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-800'
      }
    ],
    actionCenter: [
      {
        id: 'act-hs-1',
        title: 'Waiting Room Patient Check-in',
        description: 'Scan digital QR pet passport or enter phone number to mark client arrived.',
        type: 'QUEUE',
        link: '/vet-appointments',
        actionLabel: 'Check-in Client'
      },
      {
        id: 'act-hs-2',
        title: 'Ward Sanitization Protocol',
        description: 'Confirm examination table and OT preparation after morning procedures.',
        type: 'OPERATIONS',
        link: '/hospital-operations',
        actionLabel: 'Log Checklist'
      },
      {
        id: 'act-hs-3',
        title: 'Appointment Rescheduling Support',
        description: 'Update phone requests from clients needing modified afternoon slots.',
        type: 'APPOINTMENT',
        link: '/vet-appointments',
        actionLabel: 'Update Slots'
      }
    ],
    recommendations: [
      { title: 'Check in waiting patients', description: 'Assign token numbers to maintain smooth consultation flow.', link: '/vet-appointments', icon: UserCheck },
      { title: 'View today assigned doctor shifts', description: 'Confirm consulting rooms and on-duty emergency surgeons.', link: '/hospital-operations', icon: Stethoscope },
      { title: 'Update reception notices', description: 'Read operational briefing and municipal vaccination drive updates.', link: '/news', icon: Bell },
      { title: 'Contact hospital administrator', description: 'Report resource delays, laundry shortages, or facility issues.', link: '/org-staff', icon: HelpCircle }
    ]
  }
};
