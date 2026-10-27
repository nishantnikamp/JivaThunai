import React from 'react';
import { 
  Award, ShieldCheck, CheckCircle2, Lock, FileCheck, 
  Layers, ArrowRight, Activity, Clock, Shield 
} from 'lucide-react';

export const HomeRoadmapLegal = () => {
  const releases = [
    {
      release: 'Release 1',
      title: 'Core Platform Foundation',
      status: 'Active',
      statusVariant: 'completed',
      features: 'Authentication, RBAC roles, pet profiles, hospital profiles, location discovery, service catalog & appointment booking'
    },
    {
      release: 'Release 2',
      title: 'Connected Clinical Care',
      status: 'Active',
      statusVariant: 'completed',
      features: 'Digital pet health records, clinical prescriptions, treatment care plans, dosage reminders, and follow-up consultation timelines'
    },
    {
      release: 'Release 3',
      title: 'Care Coordination & Protection',
      status: 'Active',
      statusVariant: 'completed',
      features: 'Section 11 missed-care detection, temporary caretaker delegation access, and 24/7 veterinary trauma emergency locators'
    },
    {
      release: 'Release 4',
      title: 'Wider Service Ecosystem',
      status: 'In Progress',
      statusVariant: 'in_progress',
      features: 'Grooming packages, verified boarding facilities, obedience training bookings, and regulated pet marketplace'
    },
    {
      release: 'Release 5',
      title: 'Community & Adoption Support',
      status: 'Active',
      statusVariant: 'completed',
      features: 'PCA 1960 legal adoption agreements, lost & found geo-tag broadcasts, and responsible pet guardianship resources'
    },
    {
      release: 'Release 6',
      title: 'Advanced Clinical Operations',
      status: 'Active',
      statusVariant: 'completed',
      features: 'Live ICU/OT capacity tracking, on-duty surgical rosters, branch evidence verification, and clinical audit trails'
    }
  ];

  return (
    <section className="space-y-12">
      
      {/* 6-Stage Phased Roadmap Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Structured Implementation Roadmap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built for Scalability: Phased Release Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Clear distinction between operational capabilities, active enhancements, and upcoming platform milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {releases.map((r, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  {r.release}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  r.statusVariant === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{r.status}</span>
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">
                {r.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                {r.features}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Legal & Anti-Cruelty Policy Section */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl p-8 sm:p-10 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="space-y-3 max-w-xl text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-widest bg-emerald-200/60 px-3 py-1 rounded-full border border-emerald-300">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Legal Regulatory Framework</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Anti-Cruelty, Welfare & Evidence-Based Verification
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            All pet adoptions, clinical services, breeder registrations, and healthcare records on Jiva Thunai adhere strictly to the <strong>Prevention of Cruelty to Animals (PCA) Act 1960</strong>, <strong>Dog Breeding and Marketing Rules</strong>, and <strong>Pet Shop Rules 2018</strong> mandated by the Animal Welfare Board of India (AWBI).
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-950 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AWBI & Municipal Corporation Verification</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-950 shadow-2xs">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero-Trust Role-Based Access Control (RBAC)</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-950 shadow-2xs">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Consent-Based Medical Record Disclosures</span>
          </div>
        </div>

      </div>

    </section>
  );
};
