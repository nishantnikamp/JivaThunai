import React from 'react';
import { 
  Heart, Building2, Stethoscope, Users, ShoppingBag, 
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Activity, 
  FileCheck, Clock, Lock, Compass, Eye, AlertTriangle, Layers
} from 'lucide-react';

export const HomeConnectedEcosystem = () => {
  return (
    <section className="space-y-12">
      
      {/* Ecosystem Architecture Flow */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-700 shadow-xl space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
            <Layers className="w-3.5 h-3.5" />
            <span>Connected System Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How Jiva Thunai Connects the Entire Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Information should be shared only when needed and authorized. The platform connects these services without giving every provider unrestricted access to a pet's records.
          </p>
        </div>

        {/* Diagram Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Node 1: Pet and Pet Parent */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-black text-white">Pet & Pet Parent</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Biometric identity, digital pet passport, allergy declarations, dietary preferences, and lifelong health history vault.
            </p>
            <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Data Ownership & Consent Control</span>
            </div>
          </div>

          {/* Node 2: The Jiva Thunai Hub */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 border border-emerald-400/40 shadow-xl space-y-3 text-left ring-2 ring-emerald-400/30">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-black text-white">Jiva Thunai Core Platform</h3>
            <p className="text-xs text-emerald-100 leading-relaxed font-light">
              Discovery engines, real-time booking, care plans, missed-care detection, role-based encryption, and legal compliance.
            </p>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Zero-Trust Role-Based Access Engine</span>
            </div>
          </div>

          {/* Node 3: The Connected Network */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-base font-black text-white">Authorized Care Network</h3>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed font-light">
              <li className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hospitals & Vets: Consultations & Surgery</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Caregivers: Daily & temporary care access</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Marketplace: Regulated foods & medicines</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Signature Innovations: Understand -> Check -> Act Engine */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-12 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Signature Innovations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            The Continuous Care Paradigm: Understand → Check → Act
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Jiva Thunai is far more than a business directory. It is an active safety net that prevents medical relapses and legal neglect.
          </p>
        </div>

        {/* 3 Step Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1: Understand */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                01
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Understand
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">Veterinary Instructions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Captures prescriptions, dosage regimens, surgical recovery checks, and dietary guidelines directly from attending veterinary specialists.
            </p>
          </div>

          {/* Step 2: Check */}
          <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm">
                02
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Check
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">Continuous Monitoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitors what has been administered, what recovery check was performed, and detects overdue follow-ups or unconfirmed medications.
            </p>
          </div>

          {/* Step 3: Act */}
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-sm">
                03
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Act
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">Automated Intervention</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Triggers urgent notifications, offers one-tap rebooking, alerts authorized caretakers, or directs to emergency veterinary trauma care.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};
