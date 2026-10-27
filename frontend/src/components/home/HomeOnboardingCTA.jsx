import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Building2, ArrowRight, ShieldCheck, Stethoscope, 
  Sparkles, CheckCircle2, UserPlus, Heart 
} from 'lucide-react';

export const HomeOnboardingCTA = () => {
  return (
    <section className="space-y-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
          <span>Get Started Today</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Join the Jiva Thunai Ecosystem
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Choose your dedicated path to start protecting, organizing, and delivering top-tier companion animal care.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: For Pet Parents */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 border border-emerald-600/40 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center border border-white/20">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">For Pet Parents</span>
              <h3 className="text-2xl font-black text-white mt-1">
                Make Your Pet's Care Effortless
              </h3>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-light">
              Create digital health passports, access automated vaccination and medication reminders, delegate temporary custody with granular permissions, and find emergency trauma care anytime.
            </p>
            <ul className="space-y-2 text-xs text-emerald-200/90 pt-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One account for all your dogs, cats, birds, and companion pets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant QR digital identity tag and medical records vault</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Section 11 PCA Act 1960 missed-care protection safety net</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-emerald-700/60 flex flex-wrap items-center gap-3 relative z-10">
            <Link
              to="/register"
              className="px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Pet Owner Sign Up</span>
              <ArrowRight className="w-4 h-4 text-emerald-800" />
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Sign In to Account</span>
            </Link>
          </div>
        </div>

        {/* Card 2: For Hospitals, Clinics & Professionals */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Building2 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">For Hospitals & Practitioners</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Deliver High-Impact Connected Care
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Connect with pet families, manage appointments, author digital post-consultation care plans, track live ICU beds and operation theatres, and prove Clinical Establishment Act credentials.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified institution showcase with branch GPS and equipment status</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live doctor availability rosters and automated patient appointment queues</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct care plan authoring preventing treatment abandonment</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <Link
              to="/vet/signup/hospital"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Vet Hospital Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/vet/signup/staff"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
              <span>Doctor / Staff Sign Up</span>
            </Link>
            <Link
              to="/vet/signup"
              className="px-4 py-3 text-slate-500 hover:text-emerald-700 font-bold text-xs transition-colors"
            >
              Provider Hub
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
};
