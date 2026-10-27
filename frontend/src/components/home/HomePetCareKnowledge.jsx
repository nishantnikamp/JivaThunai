import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cmsApi } from '../../services/api';

export const HomePetCareKnowledge = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const res = await cmsApi.getNews(null, 1, 3);
      if (res && res.data) {
        const items = Array.isArray(res.data.content) ? res.data.content : (Array.isArray(res.data) ? res.data : []);
        setArticles(items.slice(0, 3));
      }
    } catch (err) {
      console.warn("Could not load knowledge articles:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pet Care Knowledge & Education</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Veterinary Insights & Responsible Parenting
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Clinically reviewed articles, statutory animal welfare policies, and everyday nutrition guidance for happy, healthy companions.
          </p>
        </div>

        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 self-start sm:self-auto shrink-0"
        >
          <span>View All Knowledge Guides</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-48 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Knowledge Articles Published Yet</h3>
          <p className="text-xs text-slate-400 mt-1">Articles published via the CMS will appear here dynamically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <Link
              key={art.id || art.slug}
              to={`/learn/${art.slug || art.id}`}
              className="group flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 uppercase">
                    {art.category?.replace(/_/g, ' ') || 'HEALTH & CARE'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {art.readTimeMinutes || 5} min read
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {art.summary || art.content}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
