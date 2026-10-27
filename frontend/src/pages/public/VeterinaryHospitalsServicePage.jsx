import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Search, MapPin, Phone, Star, ShieldCheck, 
  Calendar, ChevronRight, Activity, Filter, RefreshCw, Compass,
  CheckCircle2, Clock, HelpCircle, ArrowRight, Stethoscope
} from 'lucide-react';
import { hospitalProfileApi } from '../../services/api';
import { usePageNavigation } from '../../context/NavigationContext';

export const VeterinaryHospitalsServicePage = () => {
  const navigate = useNavigate();
  const { registerSections } = usePageNavigation();
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const sections = [
    { id: 'home', label: 'Overview' },
    { id: 'search', label: 'Search & Filters' },
    { id: 'results', label: 'Accredited Hospitals' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'trust', label: 'Clinical Standards' },
    { id: 'faq', label: 'FAQs' },
    { id: 'get-started', label: 'Register Hospital' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, selectedCity]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const cityParam = selectedCity === 'ALL' ? null : selectedCity;
      const res = await hospitalProfileApi.listPublishedHospitals(searchQuery, cityParam);
      if (res && res.data) {
        setHospitals(res.data);
      }
    } catch (err) {
      console.warn("Could not load hospital directory", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    if (emergencyOnly && !h.emergencySupport247) return false;
    return true;
  });

  const faqs = [
    { q: "How are veterinary hospitals verified on Jiva Thunai?", a: "Every listed hospital must submit valid State Veterinary Council establishment registrations, practitioner VCI registration certificates, and municipal trade authorizations." },
    { q: "Can I book appointments online with a specialist?", a: "Yes. Once you select a hospital and specialist veterinarian, you can choose an available slot and receive confirmed e-tokens." },
    { q: "How do I access emergency ICU care after hours?", a: "Filter by '24/7 Emergency & ICU' to view verified hospitals equipped with sterile surgical suites, blood banks, and on-duty veterinary trauma doctors." }
  ];

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Service Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-emerald-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Veterinary Care Department
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Veterinary Hospitals & Specialty Clinics
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
              Find state-of-the-art multi-specialty veterinary hospitals, accredited surgeons, diagnostic laboratories, and 24/7 emergency centers near you.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="#search"
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-md flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-emerald-700" />
                <span>Find Hospitals Nearby</span>
              </a>
              <Link 
                to="/vet/signup/hospital"
                className="px-6 py-3 rounded-2xl bg-emerald-600/80 text-white font-bold text-xs sm:text-sm hover:bg-emerald-500 transition-all border border-emerald-400/40"
              >
                <span>Register a Hospital Branch</span>
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
              Search Clinical Facilities
            </h2>
            <p className="text-xs text-slate-500">Filter by location, specialty, or emergency trauma readiness</p>
          </div>
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              emergencyOnly 
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-600" />
            <span>24/7 Emergency & ICU Only</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital name, doctor name, surgery, cardiology..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Cities / States</option>
              <option value="Chennai">Chennai, TN</option>
              <option value="Bengaluru">Bengaluru, KA</option>
              <option value="Mumbai">Mumbai, MH</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad, TS</option>
              <option value="Coimbatore">Coimbatore, TN</option>
            </select>
          </div>
        </div>
      </section>

      {/* 03. Available Options — #results */}
      <section id="results" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Accredited Hospitals & Clinics ({filteredHospitals.length})
          </h2>
          <button 
            onClick={fetchHospitals} 
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Hospitals Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No facilities matched your current search filters. Try selecting 'All Cities' or clearing the keyword query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map(hospital => (
              <div 
                key={hospital.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
                      <Building2 className="w-6 h-6" />
                    </div>
                    {hospital.verificationStatus === 'PUBLISHED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {hospital.hospitalName || hospital.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hospital.city || 'City Center'}, {hospital.state || 'India'}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {hospital.about || "Accredited multi-specialty facility providing preventive health checks, surgical care, and diagnostics."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/hospital/${hospital.slug || hospital.id}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 group"
                  >
                    <span>View Hospital Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to={`/appointments?hospitalId=${hospital.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 04. How the Service Works — #how-it-works */}
      <section id="how-it-works" className="scroll-mt-28 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Booking Workflow
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How Hospital Consultations Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Find Facility", desc: "Select verified hospital branch matching your pet's medical needs." },
            { step: "02", title: "Choose Doctor & Slot", desc: "Select accredited specialist and pick convenient consultation timing." },
            { step: "03", title: "Check-in Live", desc: "Arrive at clinic, show QR token, and wait in triaged waiting queue." },
            { step: "04", title: "Digital Prescription", desc: "Consultation findings and e-Rx sync directly into your digital Pet Passport." }
          ].map(st => (
            <div key={st.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-2">
              <span className="text-2xl font-black text-emerald-600">{st.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 05. Trust and Important Information — #trust */}
      <section id="trust" className="scroll-mt-28 p-8 rounded-3xl bg-emerald-950 text-white space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold tracking-tight">Clinical Establishment & VCI Standards</h2>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-3xl">
          All participating veterinary hospitals on Jiva Thunai are audited against statutory State Veterinary Council standards and the Prevention of Cruelty to Animals (PCA) Act 1960. Only verified doctors holding recognized B.V.Sc & A.H. degrees or postgraduate diplomas are permitted to issue electronic prescriptions.
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
      <section id="get-started" className="scroll-mt-28 text-center p-10 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">Are You a Hospital Director or Veterinarian?</h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
          Join India's connected clinical ecosystem. Digitize hospital queues, e-prescriptions, and multi-branch operations today.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/vet/signup/hospital"
            className="px-6 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 shadow-md"
          >
            Register Your Hospital
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-2xl bg-emerald-900/40 text-white font-bold text-xs sm:text-sm border border-white/20 hover:bg-emerald-900/60"
          >
            Contact Hospital Partnerships
          </Link>
        </div>
      </section>

    </div>
  );
};
