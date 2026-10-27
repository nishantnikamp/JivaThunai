import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, AlertTriangle, MapPin, Phone, ShieldCheck, 
  ArrowRight, QrCode, Clock, Dog, Siren, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { usePageNavigation } from '../../context/NavigationContext';

export const LostFoundServicePage = () => {
  const { registerSections } = usePageNavigation();
  const [reportType, setReportType] = useState('ALL'); // 'ALL' | 'LOST' | 'FOUND'

  const sections = [
    { id: 'home', label: 'Emergency Overview' },
    { id: 'search', label: 'Filter Alerts' },
    { id: 'results', label: 'Active Alerts' },
    { id: 'how-it-works', label: 'Reunification Process' },
    { id: 'trust', label: 'Reporting Standards' },
    { id: 'faq', label: 'FAQs' },
    { id: 'get-started', label: 'File a Report' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  const [alerts, setAlerts] = useState([]);

  const filteredAlerts = alerts.filter(a => {
    if (reportType !== 'ALL' && a.type !== reportType) return false;
    return true;
  });

  const faqs = [
    { q: "What should I do immediately if my pet is lost?", a: "1. File an alert here immediately. 2. Print or share the digital flyer with QR code. 3. Check with nearby veterinary clinics and municipal animal shelters." },
    { q: "How does the digital QR collar tag help?", a: "Anyone scanning the pet's Jiva Thunai QR tag is directed to a secure contact portal to instantly notify the verified pet parent with geo-coordinates." },
    { q: "Is reporting a lost or found companion animal free?", a: "Yes. The community lost-and-found registry is completely free and public to facilitate swift reunification." }
  ];

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Service Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-amber-900 via-orange-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-amber-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Emergency Reunification Network
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Lost & Found Pets Community Network
            </h1>
            <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-normal">
              Every second counts when a companion goes missing. Broadcast geo-tagged lost pet notices, report stray sightings, and leverage QR pet tags.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="#get-started"
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Missing Pet Now</span>
              </a>
              <a 
                href="#search"
                className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                <span>Search Reported Animals</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Search and Filters — #search */}
      <section id="search" className="scroll-mt-28 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Filter Lost & Found Broadcasts
            </h2>
            <p className="text-xs text-slate-500">Filter by missing status or city area</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
            {['ALL', 'LOST', 'FOUND'].map(t => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  reportType === t ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Alerts' : t === 'LOST' ? 'Lost Pets' : 'Found Pets'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by breed, color, unique marks, collar type, microchip number..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <input
              type="text"
              placeholder="City or neighborhood..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 03. Available Options — #results */}
      <section id="results" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Active Community Alerts ({filteredAlerts.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Updated 5 mins ago</span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <Dog className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Active Community Reports</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no reported lost or found companion animals recorded in the database.
            </p>
            <div className="pt-2">
              <a href="#get-started" className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs">
                File a Lost or Found Report
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredAlerts.map(a => (
              <div 
                key={a.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-500/60 shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                      a.type === 'LOST' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {a.type} REPORT
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{a.date}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{a.petName}</h3>
                    <span className="text-xs font-semibold text-slate-500">{a.species}</span>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{a.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {a.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{a.contact}</span>
                  </span>
                  <button
                    onClick={() => alert(`Contacting coordinates for ${a.petName}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                  >
                    I Spotted This Pet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 04. How the Service Works — #how-it-works */}
      <section id="how-it-works" className="scroll-mt-28 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Emergency Workflow
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How Lost & Found Reunification Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Submit Alert", desc: "Upload clear photo, last seen coordinates, and identifying marks." },
            { step: "02", title: "Geo Broadcast", desc: "Automatic notification sent to pet parents, vets, and shelters within 15 km." },
            { step: "03", title: "QR Scan Matching", desc: "If someone scans your pet's collar tag, you get immediate GPS notification." },
            { step: "04", title: "Safe Reunion", desc: "Coordinate safe handover and close the missing report." }
          ].map(st => (
            <div key={st.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-2">
              <span className="text-2xl font-black text-amber-600">{st.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 05. Trust and Important Information — #trust */}
      <section id="trust" className="scroll-mt-28 p-8 rounded-3xl bg-amber-950 text-white space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold tracking-tight">Safe Handover & Identity Verification</h2>
        </div>
        <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed max-w-3xl">
          To protect animals and pet parents from extortion or illegal trading, proof of ownership (such as adoption papers, vaccination booklets, or biometric photographs) must be verified prior to animal handover.
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
      <section id="get-started" className="scroll-mt-28 text-center p-10 rounded-3xl bg-gradient-to-r from-amber-600 to-orange-700 text-white space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">Is Your Companion Missing Right Now?</h2>
        <p className="text-xs sm:text-sm text-amber-100 max-w-xl mx-auto">
          Broadcast an urgent alert to our volunteer and clinic network across your neighborhood.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => alert("Redirecting to Lost Pet Incident Report Form")}
            className="px-6 py-3 rounded-2xl bg-slate-950 text-white font-bold text-xs sm:text-sm hover:bg-slate-900 shadow-md"
          >
            File Lost Pet Report
          </button>
          <Link
            to="/emergency-cases"
            className="px-6 py-3 rounded-2xl bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 hover:bg-white/30"
          >
            Locate 24/7 Trauma Clinic
          </Link>
        </div>
      </section>

    </div>
  );
};
