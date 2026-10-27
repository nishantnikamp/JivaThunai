import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Stethoscope, Siren, Sparkles, Filter, 
  Building2, ArrowRight, CheckCircle2 
} from 'lucide-react';

export const HomeSearchSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query.trim());
    if (location.trim()) params.append('city', location.trim());
    if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
    navigate(`/hospitals?${params.toString()}`);
  };

  const quickFilters = [
    { id: 'ALL', label: 'All Services', icon: Building2 },
    { id: 'EMERGENCY', label: '24/7 Emergency & ICU', icon: Siren },
    { id: 'VACCINATION', label: 'Vaccines & Checkups', icon: Stethoscope },
    { id: 'SURGERY', label: 'Specialty Surgery & OT', icon: Sparkles },
  ];

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md shadow-slate-100 space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Search Near You</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Find Veterinary Hospitals, Clinics & Pet Specialists
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse verified veterinary facilities with real-time on-duty doctors, ICU bed availability, and transparent pricing.
          </p>
        </div>

        {/* Quick link to full directory */}
        <button
          onClick={() => navigate('/hospitals')}
          className="self-start md:self-auto text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All Registered Hospitals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Search Bar Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        
        {/* Service / Hospital Name Input */}
        <div className="md:col-span-5 flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, doctors, surgery, dermatology..."
            className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Location / City Input */}
        <div className="md:col-span-4 flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, District or PIN Code (e.g. Chennai, Coimbatore)..."
            className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-3">
          <button
            type="submit"
            className="w-full h-full min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Care</span>
          </button>
        </div>

      </form>

      {/* Quick Filter Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Quick Filters:
        </span>
        {quickFilters.map((f) => {
          const Icon = f.icon;
          const active = selectedCategory === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedCategory(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                active 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

    </section>
  );
};
