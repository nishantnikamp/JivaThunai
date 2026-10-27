import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, MapPin, Phone, Star, ShieldCheck, 
  Calendar, ChevronRight, Activity, Filter, RefreshCw, Compass
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hospitalProfileApi } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export const HospitalDirectoryPage = () => {
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialCity = searchParams.get('city');
  const initialQuery = searchParams.get('query') || searchParams.get('q') || '';

  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity || 'ALL');
  const [emergencyOnly, setEmergencyOnly] = useState(initialCategory === 'EMERGENCY');

  // Do not show hospital admin cockpit to pet owners, buyers, caretakers, or unauthenticated guests
  const canAccessHospitalAdmin = Boolean(
    user &&
    activeRole !== 'PET_OWNER' &&
    ['VETERINARY_ADMIN', 'ROLE_VET_ORGANIZATION', 'HOSPITAL_ADMIN', 'HOSPITAL_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole)
  );

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

  return (
    <div className="space-y-6 pb-28 max-w-7xl mx-auto">
      <PageHeader 
        badgeText="ACCREDITED NETWORK"
        badgeIcon={Building2}
        title="Find Veterinary Hospitals & Specialty Clinics"
        titleIcon={Building2}
        description="Discover verified multi-service veterinary hospitals, sterile surgical centres, and 24/7 critical emergency trauma clinics across India."
        variant="emerald"
        actions={
          canAccessHospitalAdmin ? (
            <button
              onClick={() => navigate('/hospital-management')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hospital Admin Cockpit</span>
            </button>
          ) : null
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by hospital name, service, or specialty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Cities (Pan India)</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Secunderabad">Secunderabad</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Chennai">Chennai</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi NCR</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200/60 rounded-xl text-xs font-black text-rose-800 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={e => setEmergencyOnly(e.target.checked)}
                className="rounded-sm text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span>24/7 Emergency Only</span>
            </label>
          </div>
        </div>

        {/* Hospital Directory Cards */}
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((h) => {
              const branch = h.branches?.[0] || {};
              const coverImg = h.coverPhotoUrl || "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80";

              return (
                <div 
                  key={h.id || h.slug}
                  onClick={() => navigate(`/hospital/${h.slug || h.id}`)}
                  className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Card Cover */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img 
                        src={coverImg} 
                        alt={h.hospitalName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                          VERIFIED
                        </span>
                        {h.emergencySupport247 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white shadow-xs">
                            24/7 ICU
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {h.displayName || h.hospitalName}
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>4.9</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{branch.city || 'Hyderabad'}, {branch.stateName || 'Telangana'}</span>
                      </p>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {h.description || 'Comprehensive clinical examination, digital diagnostics, surgical facilities, and compassionate recovery.'}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100">
                          {h.services?.length || 0} Services
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100">
                          {h.doctors?.length || 0} Doctors
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                          Open Now
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">View Verified Showcase</span>
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-900">No Hospitals Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Try clearing search filters or selecting All Cities to discover nearby clinics.</p>
          </div>
        )}
      </div>
    </div>
  );
};
