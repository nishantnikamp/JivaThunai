import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ShieldAlert, ArrowRight, Dog, Users, Home } from 'lucide-react';
import { petApi } from '../../services/api';

export const HomeAnimalWelfareSection = () => {
  const [adoptionPets, setAdoptionPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await petApi.getAdoptionListings();
      if (res && res.data) {
        const items = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setAdoptionPets(items.slice(0, 3));
      }
    } catch (err) {
      console.warn("Could not load public adoption listings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-rose-800 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200/80">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>Adoption, Rescue & Animal Welfare</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Every Companion Deserves a Loving, Safe Home
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Meet verified rescue animals seeking ethical adoption, report lost companions, and coordinate volunteer foster arrangements under PCA Act 1960.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/lost-found"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lost & Found Network</span>
          </Link>
          <Link
            to="/adoption"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
          >
            <span>View All Adoptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Welfare Capability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/adoption"
          className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200/80 hover:border-rose-400 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-rose-100 text-rose-700 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-800 transition-colors">
              Ethical Adoption
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sterilized, vaccinated rescue animals with complete medical history and transparent adopter screening.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-rose-200/50 flex items-center justify-between text-xs font-bold text-rose-700">
            <span>Browse Adoptable Pets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/lost-found"
          className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              Lost & Found Network
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant community broadcast for missing pets with microchip and photo matching to reunite families quickly.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-amber-200/50 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>Report or Search Lost Pet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/emergency-cases"
          className="p-6 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-200/80 hover:border-red-400 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-red-100 text-red-700 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-red-800 transition-colors">
              Rescue Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              24/7 coordination with animal welfare NGOs and volunteer transit for injured street and wildlife cases.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-red-200/50 flex items-center justify-between text-xs font-bold text-red-700">
            <span>Emergency Locator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/pet-services"
          className="p-6 rounded-3xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-200/80 hover:border-teal-400 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-teal-100 text-teal-700 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
              Volunteer Foster Care
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open your home for temporary rehabilitation of recuperating puppies, kittens, and post-surgery animals.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-teal-200/50 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>Apply as Foster Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
};
