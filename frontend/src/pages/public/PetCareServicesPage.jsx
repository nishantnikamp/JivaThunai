import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Search, MapPin, Star, Calendar, CheckCircle2, 
  ShieldCheck, Clock, ArrowRight, ChevronRight, Award, Scissors, UserCheck
} from 'lucide-react';
import { usePageNavigation } from '../../context/NavigationContext';

export const PetCareServicesPage = () => {
  const { registerSections } = usePageNavigation();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchLocation, setSearchLocation] = useState('');

  const sections = [
    { id: 'home', label: 'Services Overview' },
    { id: 'search', label: 'Search Providers' },
    { id: 'results', label: 'Care Offerings' },
    { id: 'how-it-works', label: 'Booking Process' },
    { id: 'trust', label: 'Care Standards' },
    { id: 'faq', label: 'FAQs' },
    { id: 'get-started', label: 'Join as Provider' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  const serviceCategories = [
    { id: 'GROOMING', title: 'Professional Grooming & Spa', desc: 'Baths, nail trimming, breed haircuts, and anti-tick medicated dips.', icon: Scissors },
    { id: 'WALKING', title: 'Daily Dog Walking', desc: 'GPS-tracked 30 to 60 minute exercise walks with certified handlers.', icon: Sparkles },
    { id: 'TRAINING', title: 'Behavioral & Obedience Training', desc: 'Positive reinforcement, basic puppy training, leash manners, and agility.', icon: Award },
    { id: 'BOARDING', title: 'Cage-Free Daycare & Boarding', desc: 'Home-style boarding, CCTV access, 24/7 attendant care, and social playtime.', icon: CheckCircle2 }
  ];

  const faqs = [
    { q: "Are pet care service providers verified?", a: "Yes. All groomers, trainers, and boarding facilities must provide government identity proof, certification credentials, and undergo physical facility reviews." },
    { q: "Can I receive real-time updates while my pet is being walked or groomed?", a: "Absolutely. Providers submit check-in timestamps, walk route photos, and care notes directly to your Pet Parent dashboard." },
    { q: "What happens in case of a medical emergency during care?", a: "Every booking requires the owner to pre-authorize emergency veterinary care and contacts, ensuring immediate transport to accredited clinics." }
  ];

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Service Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-pink-900 via-rose-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-pink-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Everyday Pet Care Department
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Trusted Grooming, Training, Walking & Boarding
            </h1>
            <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed font-normal">
              Book certified pet professionals who treat your companions like family. Verified background checks, transparent pricing, and instant scheduling.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="#search"
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-pink-50 transition-all shadow-md flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-pink-700" />
                <span>Find Care Providers</span>
              </a>
              <Link 
                to="/register"
                className="px-6 py-3 rounded-2xl bg-pink-600/80 text-white font-bold text-xs sm:text-sm hover:bg-pink-500 transition-all border border-pink-400/40"
              >
                <span>Register as a Professional</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Search and Filters — #search */}
      <section id="search" className="scroll-mt-28 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Search Local Pet Care Services
            </h2>
            <p className="text-xs text-slate-500">Select category or enter your locality/pincode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search grooming salon, dog trainer, cat sitting, holiday boarding..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Locality or Pincode (e.g. Adyar, Indiranagar)..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 03. Available Options — #results */}
      <section id="results" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Available Service Categories
          </h2>
          <span className="text-xs text-slate-500">Verified Doorstep & Salon Care</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-pink-500/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="p-3.5 w-fit rounded-2xl bg-pink-50 text-pink-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cat.title}</h3>
                    <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200/60 mt-1 inline-block">
                      Verified Care
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/marketplace"
                    className="text-xs font-bold text-pink-700 hover:text-pink-900 inline-flex items-center gap-1 group"
                  >
                    <span>Browse Providers</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04. How the Service Works — #how-it-works */}
      <section id="how-it-works" className="scroll-mt-28 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            Care Protocol
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How Jiva Thunai Pet Care Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Choose Care", desc: "Select grooming, walking, sitting, or obedience training packages." },
            { step: "02", title: "Review Vetted Pro", desc: "Check certifications, customer reviews, and service area radiuses." },
            { step: "03", title: "Authorize Tasks", desc: "Provide dietary, medical, and temperament guidelines for your pet." },
            { step: "04", title: "Receive Live Updates", desc: "Get real-time photo check-ins and session notes on completion." }
          ].map(st => (
            <div key={st.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-2">
              <span className="text-2xl font-black text-pink-600">{st.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 05. Trust and Important Information — #trust */}
      <section id="trust" className="scroll-mt-28 p-8 rounded-3xl bg-rose-950 text-white space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-pink-400" />
          <h2 className="text-xl font-bold tracking-tight">Vetted Professionals & Gentle Handling Standards</h2>
        </div>
        <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed max-w-3xl">
          All service providers adhere strictly to fear-free handling protocols and Indian municipal pet establishment standards. Providers are prohibited from administering invasive medical procedures without veterinary supervision.
        </p>
      </section>

      {/* 06. Frequently Asked Questions — #faq */}
      <section id="faq" className="scroll-mt-28 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 07. Call to Action — #get-started */}
      <section id="get-started" className="scroll-mt-28 text-center p-10 rounded-3xl bg-gradient-to-r from-pink-600 to-rose-700 text-white space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">Offer Grooming, Walking or Training Services</h2>
        <p className="text-xs sm:text-sm text-pink-100 max-w-xl mx-auto">
          Reach thousands of pet parents looking for certified, compassionate care in your city.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/register"
            className="px-6 py-3 rounded-2xl bg-white text-rose-950 font-bold text-xs sm:text-sm hover:bg-pink-50 shadow-md"
          >
            Sign Up as a Care Provider
          </Link>
        </div>
      </section>

    </div>
  );
};
