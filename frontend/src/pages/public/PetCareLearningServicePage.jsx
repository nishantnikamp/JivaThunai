import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, Clock, Calendar, ShieldCheck, 
  ArrowRight, ChevronRight, Sparkles, RefreshCw, Award 
} from 'lucide-react';
import { cmsApi } from '../../services/api';
import { usePageNavigation } from '../../context/NavigationContext';

export const PetCareLearningServicePage = () => {
  const { registerSections } = usePageNavigation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const sections = [
    { id: 'home', label: 'Learning Hub' },
    { id: 'search', label: 'Filter Guides' },
    { id: 'results', label: 'Clinical Articles' },
    { id: 'how-it-works', label: 'Editorial Process' },
    { id: 'trust', label: 'VCI Standards' },
    { id: 'faq', label: 'FAQs' },
    { id: 'get-started', label: 'Contribute Articles' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getNews(selectedCategory === 'ALL' ? null : selectedCategory);
      if (res && res.data) {
        const items = Array.isArray(res.data.content) ? res.data.content : (Array.isArray(res.data) ? res.data : []);
        setArticles(items);
      }
    } catch (err) {
      console.warn("Could not load educational guides", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => {
    if (searchQuery.trim() && !a.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const faqs = [
    { q: "Who writes and reviews the articles on Jiva Thunai?", a: "All clinical care guides and preventive medical protocols are authored or peer-reviewed by registered veterinary doctors holding valid VCI credentials." },
    { q: "Can veterinary doctors contribute articles?", a: "Yes. Registered veterinary doctors and animal welfare experts can submit clinical papers and guides through the veterinary portal for editorial review." },
    { q: "Is this medical advice substitute for a consultation?", a: "Educational articles provide general knowledge. For medical diagnoses and treatment plans, pet parents must consult an accredited veterinarian." }
  ];

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Service Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-purple-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-purple-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Pet Learning & Knowledge Center
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Clinically Reviewed Pet Care Guides
            </h1>
            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed font-normal">
              Empowering pet parents with evidence-based veterinary advice, preventive healthcare schedules, training techniques, and animal welfare regulations.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="#search"
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-purple-50 transition-all shadow-md flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-purple-700" />
                <span>Search Articles</span>
              </a>
              <Link 
                to="/community"
                className="px-6 py-3 rounded-2xl bg-purple-600/80 text-white font-bold text-xs sm:text-sm hover:bg-purple-500 transition-all border border-purple-400/40"
              >
                <span>Community Discussions</span>
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
              Browse Educational Guides
            </h2>
            <p className="text-xs text-slate-500">Filter by clinical topic or species</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vaccination, puppy training, diabetes, dental care, nutrition..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Filter className="w-4 h-4 text-purple-600 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="HEALTH_AND_CARE">Health & Preventive Care</option>
              <option value="NUTRITION">Nutrition & Diet</option>
              <option value="TRAINING_AND_BEHAVIOR">Training & Behavior</option>
              <option value="LEGAL_AND_POLICY">PCA Act & Animal Welfare</option>
              <option value="EMERGENCY_CARE">Emergency & First Aid</option>
            </select>
          </div>
        </div>
      </section>

      {/* 03. Available Options — #results */}
      <section id="results" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Published Knowledge Guides ({filteredArticles.length})
          </h2>
          <button 
            onClick={loadArticles} 
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Content</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Guides Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search terms or selecting 'All Categories'.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(art => (
              <Link
                key={art.id || art.slug}
                to={`/news/${art.slug || art.id}`}
                className="group flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-500/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 uppercase">
                      {art.category?.replace(/_/g, ' ') || 'VET CARE'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTimeMinutes || 5} min read
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-800 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {art.summary || art.content}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-900">
                  <span>Read Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 04. How the Service Works — #how-it-works */}
      <section id="how-it-works" className="scroll-mt-28 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Editorial Rigor
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Our Veterinary Review Process
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Author Drafting", desc: "Articles drafted by veterinarians and certified behaviorists." },
            { step: "02", title: "Clinical Peer Review", desc: "Checked against current VCI and international veterinary pharmacology." },
            { step: "03", title: "Plain Language Edit", desc: "Translated into clear, practical instructions for pet parents." },
            { step: "04", title: "Periodic Updates", desc: "Reviewed annually to align with new vaccine protocols and laws." }
          ].map(st => (
            <div key={st.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-2">
              <span className="text-2xl font-black text-purple-600">{st.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 05. Trust and Important Information — #trust */}
      <section id="trust" className="scroll-mt-28 p-8 rounded-3xl bg-purple-950 text-white space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold tracking-tight">Evidence-Based Clinical Integrity</h2>
        </div>
        <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed max-w-3xl">
          We reject sensationalism, unproven holistic home remedies, and dangerous medication claims. All published dosages and medical schedules must be verified by licensed practitioners in clinical practice.
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
      <section id="get-started" className="scroll-mt-28 text-center p-10 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">Are You a Veterinarian or Animal Behaviorist?</h2>
        <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto">
          Contribute evidence-based clinical articles to educate millions of pet parents across India.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/contact"
            className="px-6 py-3 rounded-2xl bg-white text-purple-950 font-bold text-xs sm:text-sm hover:bg-purple-50 shadow-md"
          >
            Submit an Article Proposal
          </Link>
        </div>
      </section>

    </div>
  );
};
