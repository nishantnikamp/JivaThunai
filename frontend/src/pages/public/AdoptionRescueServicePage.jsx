import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Search, Filter, ShieldCheck, ArrowRight, RefreshCw, 
  ChevronRight, Dog, Home, Users, CheckCircle2 
} from 'lucide-react';
import { petApi } from '../../services/api';
import { usePageNavigation } from '../../context/NavigationContext';

export const AdoptionRescueServicePage = () => {
  const { registerSections } = usePageNavigation();
  const [adoptionPets, setAdoptionPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState('ALL');
  const [searchLocation, setSearchLocation] = useState('');

  const sections = [
    { id: 'home', label: 'Adoption Overview' },
    { id: 'search', label: 'Filter Companions' },
    { id: 'results', label: 'Available Animals' },
    { id: 'how-it-works', label: 'Adoption Process' },
    { id: 'trust', label: 'PCA 1960 Standards' },
    { id: 'faq', label: 'FAQs' },
    { id: 'get-started', label: 'List Rescue Animal' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  useEffect(() => {
    loadAdoptions();
  }, []);

  const loadAdoptions = async () => {
    setLoading(true);
    try {
      const res = await petApi.getAdoptionListings();
      if (res && res.data) {
        const items = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setAdoptionPets(items);
      }
    } catch (err) {
      console.warn("Could not load adoption listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = adoptionPets.filter(p => {
    if (selectedSpecies !== 'ALL' && p.species !== selectedSpecies) return false;
    return true;
  });

  const faqs = [
    { q: "What are the legal requirements for pet adoption?", a: "Under the Prevention of Cruelty to Animals (PCA) Act 1960 and Animal Welfare Board guidelines, adopters must be adults, provide proof of residence, undergo a home environment questionnaire, and commit to life-long companion care without abandonment." },
    { q: "Are adopted animals vaccinated and sterilized?", a: "Yes. Animals listed by accredited NGOs are vaccinated, dewormed, and sterilized (if age-appropriate) before handover." },
    { q: "Is there an adoption fee?", a: "Jiva Thunai advocates ethical adoption. NGOs may charge a nominal statutory processing fee covering vaccination certificates and microchipping costs." }
  ];

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Service Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-rose-900 via-pink-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-rose-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-rose-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Humane Adoption & Rescue
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Adopt, Don't Shop. Save a Companion Life.
            </h1>
            <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed font-normal">
              Connect with accredited animal shelters and verified rescues across India. Every adoption application is screened ethically to ensure lifelong happiness.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="#search"
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-rose-50 transition-all shadow-md flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-700" />
                <span>Meet Adoptable Animals</span>
              </a>
              <Link 
                to="/register"
                className="px-6 py-3 rounded-2xl bg-rose-600/80 text-white font-bold text-xs sm:text-sm hover:bg-rose-500 transition-all border border-rose-400/40"
              >
                <span>Register as an NGO / Shelter</span>
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
              Search Rescue Animals
            </h2>
            <p className="text-xs text-slate-500">Filter by species, age, or rescue organization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search puppy, indie dog, kitten, persian cat, rabbit, shelter name..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Filter className="w-4 h-4 text-rose-600 shrink-0" />
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Species</option>
              <option value="DOG">Dogs & Puppies</option>
              <option value="CAT">Cats & Kittens</option>
              <option value="BIRD">Birds</option>
              <option value="RABBIT">Rabbits & Small Pets</option>
            </select>
          </div>
        </div>
      </section>

      {/* 03. Available Options — #results */}
      <section id="results" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Animals Awaiting Homes ({filteredPets.length})
          </h2>
          <button 
            onClick={loadAdoptions} 
            className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Listings</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Listings Match Current Filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Check back soon as rescue shelters upload new companion profiles daily.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map(p => (
              <div 
                key={p.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-500/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="h-44 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Dog className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                        {p.species || 'COMPANION'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{p.age || 'Young'}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{p.name || 'Friendly Companion'}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.bio || "Healthy, friendly animal looking for a compassionate home."}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    Vaccinated
                  </span>
                  <Link
                    to={`/adoptions?petId=${p.id}`}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                  >
                    Apply to Adopt
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
          <span className="text-xs font-black uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Adoption Pathway
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How Ethical Adoption Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Discover Pet", desc: "Browse profiles of rescued companions with health notes." },
            { step: "02", title: "Submit Questionnaire", desc: "Fill out adopter readiness details under PCA Act standards." },
            { step: "03", title: "Shelter Interaction", desc: "Visit shelter or coordinate a video interaction with the animal." },
            { step: "04", title: "Welcome Home", desc: "Complete handover agreement and receive digital Pet Passport." }
          ].map(st => (
            <div key={st.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-2">
              <span className="text-2xl font-black text-rose-600">{st.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 05. Trust and Important Information — #trust */}
      <section id="trust" className="scroll-mt-28 p-8 rounded-3xl bg-rose-950 text-white space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl font-bold tracking-tight">Prevention of Cruelty to Animals (PCA) Act 1960</h2>
        </div>
        <p className="text-xs sm:text-sm text-rose-100/80 leading-relaxed max-w-3xl">
          Jiva Thunai is strictly non-commercial regarding companion adoption. Commercial breeding, illegal pet trades, or trafficking of unverified animals is prohibited and reported to the Animal Welfare Board of India (AWBI).
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
      <section id="get-started" className="scroll-mt-28 text-center p-10 rounded-3xl bg-gradient-to-r from-rose-600 to-pink-700 text-white space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">Are You an Animal Welfare Organization?</h2>
        <p className="text-xs sm:text-sm text-rose-100 max-w-xl mx-auto">
          List rescued animals, streamline foster networks, and manage digital adoption paperwork in one workspace.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/register"
            className="px-6 py-3 rounded-2xl bg-white text-rose-950 font-bold text-xs sm:text-sm hover:bg-rose-50 shadow-md"
          >
            Register Shelter / NGO
          </Link>
        </div>
      </section>

    </div>
  );
};
