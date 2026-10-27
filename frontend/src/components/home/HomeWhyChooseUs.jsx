import React from 'react';
import { 
  ShieldCheck, FileText, Calendar, Users, Award, Lock, Sparkles, CheckCircle2 
} from 'lucide-react';

export const HomeWhyChooseUs = () => {
  const pillars = [
    {
      title: 'Centralized Ecosystem Access',
      description: 'Find hospitals, book appointments, order food, discover adoption opportunities, and find lost pets all in one integrated platform.',
      icon: Sparkles
    },
    {
      title: 'Tamper-Proof Pet Health Records',
      description: 'Lifelong digital pet passports with verified vaccination history, electronic prescriptions, microchip ID, and diagnostic lab reports.',
      icon: FileText
    },
    {
      title: 'Verified Clinical Providers',
      description: 'Accreditation verification with State Veterinary Councils, transparent doctor credentials, and confirmed surgical OT availability.',
      icon: ShieldCheck
    },
    {
      title: 'Seamless Care Coordination',
      description: 'Empower temporary caretakers with authorized daily feeding tasks, walk routines, and emergency protocols without exposing private records.',
      icon: Users
    },
    {
      title: 'Real-Time Appointment Workflows',
      description: 'Direct clinic slot reservations, live waiting room triage tracking, electronic prescriptions, and automated booster reminders.',
      icon: Calendar
    },
    {
      title: 'Statutory Animal Welfare Compliance',
      description: 'Fully aligned with the Prevention of Cruelty to Animals (PCA) Act 1960 and AWBI guidelines for ethical adoption and pet safety.',
      icon: Award
    }
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white p-8 sm:p-12 lg:p-16 border border-emerald-800/40 shadow-2xl relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/30">
            The Jiva Thunai Standard
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Why Pet Parents & Professionals Choose Jiva Thunai
          </h2>
          <p className="text-sm text-emerald-100/80 leading-relaxed font-normal">
            Built from the ground up to solve fragmented pet care, protect companion animals, and provide clinical transparency across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 transition-all duration-200"
              >
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
