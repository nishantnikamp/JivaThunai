import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Building2, Stethoscope, Calendar, FileText, Heart, 
  AlertTriangle, Users, Siren, Sparkles, Utensils, ShoppingBag, 
  ShieldAlert, BookOpen, Layers, Award, Bell, ShieldCheck, 
  ArrowRight, CheckCircle2, Clock, Check
} from 'lucide-react';

export const HomeEcosystemGrid = ({ onRestrictedAction }) => {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'UPCOMING'

  const services = [
    {
      id: 1,
      title: "Pet Parent Account & Pet Profiles",
      tagline: "Your pet's personal digital space",
      icon: User,
      status: "Available Now",
      statusVariant: "available",
      route: "/Profile",
      requiresAuth: true,
      features: [
        "Pet parent registration and secure login",
        "Multiple pet profiles under one unified account",
        "Breed, species, age, weight, and biometric photo gallery",
        "Allergies, conditions, and microchip identifier tracking"
      ]
    },
    {
      id: 2,
      title: "Veterinary Hospitals & Clinics",
      tagline: "Find the right care near you",
      icon: Building2,
      status: "Available Now",
      statusVariant: "available",
      route: "/hospitals",
      requiresAuth: false,
      features: [
        "Location-based hospital and clinic discovery",
        "Search by distance, specialty, species, and services",
        "Verified registration and Clinical Establishment Act indicators",
        "Facilities, ICU/OT equipment, and branch-level availability"
      ]
    },
    {
      id: 3,
      title: "Veterinarians & Health Specialists",
      tagline: "Connect with qualified professionals",
      icon: Stethoscope,
      status: "Available Now",
      statusVariant: "available",
      route: "/hospitals",
      requiresAuth: false,
      features: [
        "Doctor profiles, qualifications, and VCI registration numbers",
        "Specialties in surgery, dermatology, dentistry, and orthopedics",
        "Doctor schedules and on-duty live shift tracking",
        "Continuity of care linked to hospital branches"
      ]
    },
    {
      id: 4,
      title: "Smart Appointment Booking",
      tagline: "Book care without unnecessary confusion",
      icon: Calendar,
      status: "Available Now",
      statusVariant: "available",
      route: "/vet-appointments",
      requiresAuth: true,
      features: [
        "Select pet, hospital, clinical service, and preferred doctor",
        "View real-time time slots and pre-consultation requirements",
        "Routine, urgent triage, and scheduled follow-up visits",
        "Digital check-in, reminders, and doctor assignment tracking"
      ]
    },
    {
      id: 5,
      title: "Digital Pet Health Records",
      tagline: "Important health information in one place",
      icon: FileText,
      status: "Available Now",
      statusVariant: "available",
      route: "/medical",
      requiresAuth: true,
      features: [
        "Consultation records, diagnoses, and clinical visit history",
        "Vaccination certificates and preventive care timelines",
        "Digital prescriptions and veterinarian dosage instructions",
        "Secure, consent-based medical records sharing"
      ]
    },
    {
      id: 6,
      title: "Smart Care Plans & Reminders",
      tagline: "Help pet parents stay on track",
      icon: Heart,
      status: "Available Now",
      statusVariant: "available",
      route: "/care-continuity",
      requiresAuth: true,
      features: [
        "Doctor-authored medication schedules and dosage alerts",
        "Post-operative incision and recovery inspection tasks",
        "Follow-up consultation reminders and diagnostic dates",
        "Task completion reports and clinical compliance history"
      ]
    },
    {
      id: 7,
      title: "Missed Care Detection & Escalation",
      tagline: "Prevent critical care from falling through the cracks",
      icon: AlertTriangle,
      status: "Available Now",
      statusVariant: "available",
      route: "/care-continuity",
      requiresAuth: true,
      features: [
        "Automated detection of overdue medications and treatments",
        "Section 11 PCA Act 1960 legal anti-neglect protection",
        "Owner rebooking prompts and attending clinic notifications",
        "Audit trail of resolved and confirmed follow-ups"
      ]
    },
    {
      id: 8,
      title: "Family & Temporary Caretaker Access",
      tagline: "Keep care connected when someone else looks after your pet",
      icon: Users,
      status: "Available Now",
      statusVariant: "available",
      route: "/care-continuity",
      requiresAuth: true,
      features: [
        "Time-bounded delegations for sitters and boarding providers",
        "Scoped permissions: feeding, allergies, and emergency hotlines",
        "Shields private financial documents and unrelated pets",
        "Automatic expiration and instant digital revocation"
      ]
    },
    {
      id: 9,
      title: "Pet Emergency Assistance (24/7 Trauma)",
      tagline: "Find urgent help when time matters",
      icon: Siren,
      status: "Available Now",
      statusVariant: "available",
      route: "/emergency-cases",
      requiresAuth: false,
      features: [
        "Nearby 24/7 veterinary emergency hospital discovery",
        "Real-time ICU trauma bed and emergency hotline locator",
        "Urgent clinical intake guidance for life-threatening cases",
        "Emergency case triage coordination with on-duty surgeons"
      ]
    },
    {
      id: 10,
      title: "Grooming, Boarding & Daycare",
      tagline: "Everyday services for happier, healthier pets",
      icon: Sparkles,
      status: "Coming Soon",
      statusVariant: "coming_soon",
      route: "/marketplace",
      requiresAuth: false,
      features: [
        "Doorstep grooming, bathing, and coat health packages",
        "Verified boarding facilities and supervised daycare",
        "Dog walking, exercise logs, and home pet sitting visits",
        "Transparent provider profiles, pricing, and reviews"
      ]
    },
    {
      id: 11,
      title: "Pet Nutrition & Wellness Tracking",
      tagline: "Support everyday wellbeing",
      icon: Utensils,
      status: "Coming Soon",
      statusVariant: "coming_soon",
      route: "/care-continuity",
      requiresAuth: true,
      features: [
        "Feeding schedules, caloric guidelines, and hydration logs",
        "Weight monitoring, growth charts, and life-stage nutrition",
        "Veterinary-approved dietary consultations for medical conditions",
        "Breed- and species-specific preventive wellness guides"
      ]
    },
    {
      id: 12,
      title: "Pet Products & Regulated Marketplace",
      tagline: "Discover verified products and supplies",
      icon: ShoppingBag,
      status: "Available Now",
      statusVariant: "available",
      route: "/marketplace",
      requiresAuth: true,
      features: [
        "Nutritious food, treats, toys, and species accessories",
        "Verified seller credentials under Pet Shop Rules 2018",
        "Secure payments, escrow safeguards, and order tracking",
        "Prescription medicine verification with clinical safeguards"
      ]
    },
    {
      id: 13,
      title: "Adoption, Rescue & Lost Pets",
      tagline: "Help pets find safety, families, and support",
      icon: ShieldAlert,
      status: "Available Now",
      statusVariant: "available",
      route: "/adoptions",
      requiresAuth: true,
      features: [
        "PCA Act 1960 compliant adoption from verified shelters",
        "Housing suitability questionnaire and digital legal agreements",
        "Lost pet broadcasts with geo-tagged last-seen locations",
        "Direct reunification tools for owners and community rescuers"
      ]
    },
    {
      id: 14,
      title: "Pet Learning & Community Education",
      tagline: "Learn, connect, and care with confidence",
      icon: BookOpen,
      status: "Coming Soon",
      statusVariant: "coming_soon",
      route: null,
      requiresAuth: false,
      features: [
        "Verified veterinary articles on behavior and preventive care",
        "Puppy and kitten onboarding guides by veterinary specialists",
        "Responsible pet guardianship guidelines and AWBI advisories",
        "Educational webinars that augment professional veterinary advice"
      ]
    },
    {
      id: 15,
      title: "Hospital & Clinic Management Cockpit",
      tagline: "Tools for veterinary institutions & clinical teams",
      icon: Layers,
      status: "Available Now",
      statusVariant: "available",
      route: "/hospital-operations",
      requiresAuth: true,
      features: [
        "Live ICU/OT bed inventory, surgical scheduling, and on-duty doctors",
        "Clinical establishment registration and branch address evidence",
        "Staff permissions, doctor rosters, and patient intake queue",
        "Clinical treatment plan authoring and public service showcase"
      ]
    },
    {
      id: 16,
      title: "Professional Provider Network",
      tagline: "Connect the wider pet care industry",
      icon: Award,
      status: "Available Now",
      statusVariant: "available",
      route: "/vet/signup",
      requiresAuth: false,
      features: [
        "Dedicated onboarding for hospitals, independent vets, and staff",
        "VCI registration number validation and credential screening",
        "Service catalog, pricing rules, and operating hours configuration",
        "Professional profile integration across patient search engines"
      ]
    },
    {
      id: 17,
      title: "Real-Time Notifications & Alerts",
      tagline: "The right information at the right time",
      icon: Bell,
      status: "Available Now",
      statusVariant: "available",
      route: "/dashboard",
      requiresAuth: true,
      features: [
        "Instant booking confirmations, rescheduling, and doctor alerts",
        "Automated vaccination, medication, and care plan reminders",
        "Caretaker delegation acceptance, expiry, and revocation notices",
        "Urgent hospital announcements and emergency status updates"
      ]
    },
    {
      id: 18,
      title: "Trust, Safety & AWBI Compliance",
      tagline: "A safer, more accountable ecosystem",
      icon: ShieldCheck,
      status: "Available Now",
      statusVariant: "available",
      route: "/compliance-audits",
      requiresAuth: true,
      features: [
        "Strict Role-Based Access Control (RBAC) and JWT security",
        "Prevention of Cruelty to Animals Act 1960 compliance checks",
        "Consent-based medical record access and detailed audit logs",
        "Breeder verification under Dog Breeding & Marketing Rules"
      ]
    }
  ];

  const filteredServices = services.filter(s => {
    if (activeFilter === 'AVAILABLE') return s.statusVariant === 'available';
    if (activeFilter === 'UPCOMING') return s.statusVariant === 'coming_soon' || s.statusVariant === 'planned';
    return true;
  });

  return (
    <section className="space-y-8">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>The Complete Product Blueprint</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          18 Core Capabilities. One Unified Platform.
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          From finding qualified veterinary specialists to coordinating daily home care and legal adoptions, Jiva Thunai unites the entire pet care journey.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Features (18)
          </button>
          <button
            onClick={() => setActiveFilter('AVAILABLE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available Now (15)</span>
          </button>
          <button
            onClick={() => setActiveFilter('UPCOMING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'UPCOMING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Coming Soon / Planned (3)</span>
          </button>
        </div>
      </div>

      {/* Grid of 18 Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const isAvailable = service.statusVariant === 'available';

          return (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                {/* Header with Icon and Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Icon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    isAvailable 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {isAvailable ? (
                      <Check className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Clock className="w-3 h-3 text-blue-700" />
                    )}
                    <span>{service.status}</span>
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    {service.tagline}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <ul className="space-y-2 pt-1 border-t border-slate-100">
                  {service.features.map((feat, fIdx) => (
                    <li key={fIdx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

              </div>

              {/* Action Button at bottom */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                {service.route ? (
                  service.requiresAuth ? (
                    <button
                      onClick={() => onRestrictedAction(service.route.replace('/', ''))}
                      className="w-full py-2.5 px-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>Explore Feature</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  ) : (
                    <Link
                      to={service.route}
                      className="w-full py-2.5 px-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>Explore Feature</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    </Link>
                  )
                ) : (
                  <div className="w-full py-2 px-3 bg-slate-50 text-slate-400 rounded-xl text-[11px] font-semibold text-center">
                    In Platform Roadmap
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
