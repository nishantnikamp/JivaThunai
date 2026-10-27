import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Building2, Stethoscope, Store, Users, Heart, 
  ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';

export const HomeStakeholderPersonas = ({ onRestrictedAction }) => {
  const personas = [
    {
      id: 'pet_parents',
      title: 'Pet Parents',
      icon: User,
      badge: 'Family & Guardians',
      description: 'Find trusted veterinary care, manage multiple pet health passports, schedule appointments, and coordinate daily care routines.',
      ctaText: 'Register as Pet Parent',
      route: '/register',
      isDirectLink: true
    },
    {
      id: 'hospitals',
      title: 'Hospitals & Clinics',
      icon: Building2,
      badge: 'Veterinary Institutions',
      description: 'Manage hospital branches, showcase clinical services, allocate ICU/OT resources, and manage live doctor availability rosters.',
      ctaText: 'Register Hospital',
      route: '/vet/signup/hospital',
      isDirectLink: true
    },
    {
      id: 'veterinarians',
      title: 'Veterinary Professionals',
      icon: Stethoscope,
      badge: 'Specialists & Surgeons',
      description: 'Manage verified VCI credentials, clinical appointments, digital prescriptions, patient histories, and author treatment care plans.',
      ctaText: 'Join as Doctor / Staff',
      route: '/vet/signup/staff',
      isDirectLink: true
    },
    {
      id: 'providers',
      title: 'Pet Care Providers',
      icon: Store,
      badge: 'Groomers, Boarding & Sitters',
      description: 'Offer certified pet grooming, boarding, walking, and training packages to verified pet families in your service radius.',
      ctaText: 'Onboard Pet Business',
      route: '/vet/signup',
      isDirectLink: true
    },
    {
      id: 'caretakers',
      title: 'Family & Caretakers',
      icon: Users,
      badge: 'Temporary Custodians',
      description: 'Receive time-bounded, scoped custody access to feeding schedules, medication doses, and emergency hotlines while owners are away.',
      ctaText: 'Access Care Cockpit',
      route: '/care-continuity',
      isDirectLink: false
    },
    {
      id: 'shelters',
      title: 'Shelters & Rescuers',
      icon: Heart,
      badge: 'Animal Welfare & PCA 1960',
      description: 'Post rescue adoption listings, review housing questionnaires, coordinate lost-and-found broadcasts, and stop animal cruelty.',
      ctaText: 'Browse Adoption Desk',
      route: '/adoptions',
      isDirectLink: false
    }
  ];

  return (
    <section className="space-y-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ecosystem Participants</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Who Can Use Jiva Thunai?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          A shared, transparent platform designed specifically for each participant in the companion animal welfare community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona) => {
          const Icon = persona.icon;
          return (
            <div
              key={persona.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {persona.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                    {persona.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {persona.description}
                  </p>
                </div>

              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                {persona.isDirectLink ? (
                  <Link
                    to={persona.route}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-between cursor-pointer"
                  >
                    <span>{persona.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => onRestrictedAction(persona.route.replace('/', ''))}
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>{persona.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
