import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cmsApi } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { 
  FileText, Calendar, User, Eye, Video, Image as ImageIcon, 
  ArrowLeft, Search, Share2, Sparkles, Download, ExternalLink, 
  Clock, CheckCircle2, ChevronRight 
} from 'lucide-react';

export const NewsCommunityPage = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [category, setCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slugOrId) {
      loadSingleArticle(slugOrId);
    } else {
      setSelectedArticle(null);
      loadArticles();
    }
  }, [slugOrId, category]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getNews(category, 1, 30);
      if (res && res.data && res.data.content) {
        setArticles(res.data.content);
      }
    } catch (err) {
      console.warn("Could not load news articles from database", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSingleArticle = async (id) => {
    setLoading(true);
    try {
      const res = await cmsApi.getNewsArticle(id);
      if (res && res.data) {
        setSelectedArticle(res.data);
      }
    } catch (err) {
      console.warn("Article not found", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(art => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (art.title && art.title.toLowerCase().includes(q)) ||
      (art.summary && art.summary.toLowerCase().includes(q)) ||
      (art.authorName && art.authorName.toLowerCase().includes(q))
    );
  });

  const categories = [
    { id: 'ALL', label: 'All Articles' },
    { id: 'NEWS', label: 'Platform News' },
    { id: 'COMMUNITY', label: 'Community Stories' },
    { id: 'ANNOUNCEMENT', label: 'Statutory Announcements' },
    { id: 'PET_CARE_GUIDE', label: 'Pet Care & Veterinary Guides' },
    { id: 'RESCUE_STORY', label: 'PCA 1960 Rescues' }
  ];

  // SINGLE ARTICLE DETAIL VIEW
  if (selectedArticle) {
    return (
      <div className="space-y-8 pb-24 max-w-4xl mx-auto animate-in fade-in">
        
        {/* Back Link */}
        <Link
          to="/news"
          className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All News & Community</span>
        </Link>

        {/* Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
          
          {/* Header Metadata */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {selectedArticle.category?.replace('_', ' ')}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {selectedArticle.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                {selectedArticle.authorName || 'Jiva Thunai Editorial Desk'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(selectedArticle.publishedAt || selectedArticle.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                {selectedArticle.viewsCount || 1} views
              </span>
            </div>
          </div>

          {/* Featured Photo Attachment (if present) */}
          {selectedArticle.photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-[460px] bg-slate-900">
              <img 
                src={selectedArticle.photoUrl} 
                alt={selectedArticle.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video Attachment Player (if present) */}
          {selectedArticle.videoUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-2 space-y-2">
              <div className="px-2 pt-1 flex items-center gap-2 text-xs font-bold text-slate-300">
                <Video className="w-4 h-4 text-purple-400" />
                <span>Attached Video Media</span>
              </div>
              <video 
                controls 
                src={selectedArticle.videoUrl} 
                className="w-full max-h-[420px] rounded-xl bg-black"
              >
                Your browser does not support the video element.
              </video>
            </div>
          )}

          {/* PDF Document Attachment Card (if present) */}
          {selectedArticle.pdfUrl && (
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-950">
                    {selectedArticle.pdfFileName || 'Official PDF Document Attachment'}
                  </p>
                  <p className="text-[11px] text-rose-700/80">
                    Statutory / Community Report Attached to this Article
                  </p>
                </div>
              </div>
              <a
                href={selectedArticle.pdfUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          )}

          {/* Formatted Rich Text Content Body */}
          <div 
            className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-800 leading-relaxed space-y-4 pt-2"
            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
          />

          {/* Return & Share Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/news"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Browse More Articles
            </Link>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: selectedArticle.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }
              }}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Article</span>
            </button>
          </div>

        </article>

      </div>
    );
  }

  // ALL ARTICLES DIRECTORY VIEW
  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <PageHeader
        badgeIcon={FileText}
        badgeText="COMMUNITY & NEWS"
        badgeVariant="emerald"
        title="News, Welfare Updates & Community Stories"
        titleIcon={FileText}
        description="Official platform announcements, PCA Act 1960 welfare guidelines, veterinary articles, and rescue stories."
      />

      {/* Search and Category Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                category === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles & stories..."
            className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none"
          />
        </div>

      </div>

      {/* Grid of Articles */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading articles from database...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-700">No articles found</h3>
          <p className="text-xs text-slate-400">Try selecting a different category or refining your search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(art => (
            <Link
              key={art.id}
              to={`/news/${art.slug || art.id}`}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Featured Photo Banner */}
                {art.photoUrl ? (
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img 
                      src={art.photoUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-emerald-600 opacity-60" />
                  </div>
                )}

                {/* Article Info */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {art.category?.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      {art.videoUrl && <Video className="w-3.5 h-3.5 text-purple-600" title="Includes Video" />}
                      {art.pdfUrl && <FileText className="w-3.5 h-3.5 text-rose-600" title="Includes PDF" />}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-900 transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                    {art.summary || 'Read full article details, updates, and community findings.'}
                  </p>
                </div>
              </div>

              {/* Footer with date and Read link */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Read Article</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};
