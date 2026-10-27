import React from 'react';
import { Link } from 'react-router-dom';
import { Siren, Phone, MapPin, AlertTriangle, ArrowRight, Activity, ShieldAlert } from 'lucide-react';

export const HomeEmergencyBanner = () => {
  return (
    <section className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-rose-800/60 shadow-xl relative overflow-hidden">
      
      {/* Background Pulse Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Left Information Content */}
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-400/30">
            <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>24/7 Veterinary Emergency Care</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Find Immediate Help When Every Minute Matters
          </h2>

          {/* Clinical Life-Threatening Safety Callout (Mandatory per Product Blueprint) */}
          <div className="p-4 rounded-2xl bg-black/30 border border-rose-500/40 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Critical Medical Notice</span>
            </div>
            <p className="text-xs text-rose-100 leading-relaxed font-medium">
              For acute, potentially life-threatening emergencies (e.g. trauma, severe bleeding, acute poisoning, seizures), <strong>contact the nearest emergency veterinary hospital immediately</strong> by phone or proceed directly to their trauma ward rather than waiting for an online booking confirmation.
            </p>
          </div>

          <p className="text-xs text-slate-300 flex flex-wrap items-center gap-4 pt-1 font-medium">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live ICU & Trauma Bed Status
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              GPS Directions & Hotline
            </span>
          </p>
        </div>

        {/* Right CTA Column */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <Link
            to="/emergency-cases"
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Siren className="w-4 h-4" />
            <span>Find Emergency Hospital</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/hospitals?category=EMERGENCY"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-rose-300" />
            <span>Emergency Hotlines Directory</span>
          </Link>
        </div>

      </div>

    </section>
  );
};
