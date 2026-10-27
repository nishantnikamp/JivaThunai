import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { cmsApi } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { RichTextEditor } from '../components/RichTextEditor';
import { 
  Globe, Shield, FileText, Building2, Share2, HelpCircle, 
  Search, Plus, Trash2, Edit3, Save, RefreshCw, Eye, CheckCircle2, 
  AlertTriangle, UploadCloud, Video, Image as ImageIcon, Link2, 
  Check, X, Clock, Layers, ShieldAlert, ArrowRight, ExternalLink
} from 'lucide-react';

export const WebsiteSettingsAdminPage = () => {
  const { user, token, activeRole } = useAuth();
  const { showToast } = useNotification();

  const isSuperAdmin = activeRole === 'SUPER_ADMIN' || user?.roles?.includes('SUPER_ADMIN');

  const [activeTab, setActiveTab] = useState('footer'); // footer, legal, company, website, social, contact, seo, news
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [footerConfig, setFooterConfig] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({});
  const [websiteInfo, setWebsiteInfo] = useState({});
  const [socialMedia, setSocialMedia] = useState({});
  const [contactSupport, setContactSupport] = useState({});
  const [seoMetadata, setSeoMetadata] = useState({});
  
  // Legal Policies State
  const [activePolicyKey, setActivePolicyKey] = useState('LEGAL_TERMS');
  const [legalPolicies, setLegalPolicies] = useState({
    LEGAL_TERMS: { title: 'Terms and Conditions of Service', version: 'v2.4', effectiveDate: 'October 2026', content: '' },
    LEGAL_PRIVACY: { title: 'Privacy Policy & Health Data Protection', version: 'v2.1', effectiveDate: 'October 2026', content: '' },
    LEGAL_COOKIE: { title: 'Cookie & Local Storage Policy', version: 'v1.5', effectiveDate: 'October 2026', content: '' },
    LEGAL_REFUND: { title: 'Refund, Cancellation & Appointment Policy', version: 'v2.0', effectiveDate: 'October 2026', content: '' }
  });

  // News & Community State
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('ALL');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    category: 'NEWS',
    summary: '',
    content: '',
    photoUrl: '',
    videoUrl: '',
    pdfUrl: '',
    pdfFileName: '',
    authorName: 'Jiva Thunai Editorial Desk',
    published: true
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      loadAllSettings();
      loadNewsArticles();
    }
  }, [isSuperAdmin]);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getAdminSettings(token);
      if (res && res.data) {
        const data = res.data;
        if (data.FOOTER_MANAGEMENT) setFooterConfig(data.FOOTER_MANAGEMENT);
        if (data.COMPANY_INFO) setCompanyInfo(data.COMPANY_INFO);
        if (data.WEBSITE_INFO) setWebsiteInfo(data.WEBSITE_INFO);
        if (data.SOCIAL_MEDIA) setSocialMedia(data.SOCIAL_MEDIA);
        if (data.CONTACT_SUPPORT) setContactSupport(data.CONTACT_SUPPORT);
        if (data.SEO_METADATA) setSeoMetadata(data.SEO_METADATA);

        setLegalPolicies(prev => ({
          LEGAL_TERMS: data.LEGAL_TERMS || prev.LEGAL_TERMS,
          LEGAL_PRIVACY: data.LEGAL_PRIVACY || prev.LEGAL_PRIVACY,
          LEGAL_COOKIE: data.LEGAL_COOKIE || prev.LEGAL_COOKIE,
          LEGAL_REFUND: data.LEGAL_REFUND || prev.LEGAL_REFUND
        }));
      }
    } catch (err) {
      showToast("Failed to load CMS settings from database", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadNewsArticles = async () => {
    try {
      const res = await cmsApi.getAdminNews(newsCategoryFilter, 1, 50, token);
      if (res && res.data && res.data.content) {
        setNewsArticles(res.data.content);
      }
    } catch (err) {
      console.warn("Could not fetch news articles", err);
    }
  };

  // Direct File Upload Helper for Photos, Videos, and PDFs
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8080/api/v1/media/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data && data.url) {
        if (fieldName === 'pdfUrl') {
          setArticleForm(prev => ({
            ...prev,
            pdfUrl: data.url,
            pdfFileName: file.name
          }));
          showToast(`PDF document "${file.name}" uploaded successfully`, 'success');
        } else {
          setArticleForm(prev => ({
            ...prev,
            [fieldName]: data.url
          }));
          showToast(`Media uploaded successfully`, 'success');
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      showToast('File upload failed. Ensure backend service is reachable.', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Save Settings Handlers
  const handleSaveSetting = async (key, payload, categoryName) => {
    setSaving(true);
    try {
      const res = await cmsApi.updateAdminSetting(key, payload, categoryName, token);
      if (res && res.data) {
        showToast(`${categoryName} settings persisted in database!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update setting', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Footer Management Helpers
  const handleAddFooterColumn = () => {
    if (!footerConfig) return;
    const newCol = {
      title: 'New Column',
      links: [{ label: 'Example Link', url: '/' }]
    };
    setFooterConfig(prev => ({
      ...prev,
      columns: [...(prev.columns || []), newCol]
    }));
  };

  const handleRemoveFooterColumn = (colIdx) => {
    setFooterConfig(prev => ({
      ...prev,
      columns: prev.columns.filter((_, idx) => idx !== colIdx)
    }));
  };

  const handleAddFooterLink = (colIdx) => {
    const updated = { ...footerConfig };
    updated.columns[colIdx].links.push({ label: 'New Link', url: '/' });
    setFooterConfig(updated);
  };

  const handleRemoveFooterLink = (colIdx, linkIdx) => {
    const updated = { ...footerConfig };
    updated.columns[colIdx].links = updated.columns[colIdx].links.filter((_, idx) => idx !== linkIdx);
    setFooterConfig(updated);
  };

  // News Article Handlers
  const handleOpenArticleModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setArticleForm({
        title: article.title || '',
        slug: article.slug || '',
        category: article.category || 'NEWS',
        summary: article.summary || '',
        content: article.content || '',
        photoUrl: article.photoUrl || '',
        videoUrl: article.videoUrl || '',
        pdfUrl: article.pdfUrl || '',
        pdfFileName: article.pdfFileName || '',
        authorName: article.authorName || 'Jiva Thunai Editorial Desk',
        published: article.published !== false
      });
    } else {
      setEditingArticle(null);
      setArticleForm({
        title: '',
        slug: '',
        category: 'NEWS',
        summary: '',
        content: '<p>Write your news article or community story here...</p>',
        photoUrl: '',
        videoUrl: '',
        pdfUrl: '',
        pdfFileName: '',
        authorName: 'Jiva Thunai Editorial Desk',
        published: true
      });
    }
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) {
      showToast('Title and content are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingArticle?.id) {
        await cmsApi.updateNews(editingArticle.id, articleForm, token);
        showToast('Article updated in database successfully', 'success');
      } else {
        await cmsApi.createNews(articleForm, token);
        showToast('New article published to database successfully', 'success');
      }
      setIsArticleModalOpen(false);
      loadNewsArticles();
    } catch (err) {
      showToast('Failed to save article', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await cmsApi.deleteNews(id, token);
      showToast('Article deleted successfully', 'info');
      loadNewsArticles();
    } catch (err) {
      showToast('Failed to delete article', 'error');
    }
  };

  // Access Restriction Gate: Strictly Super Admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Super Admin Access Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Public website content, legal policies, footer configurations, and system settings are strictly managed by Super Administrators.
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Return to Role Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'footer', label: 'Footer Management', icon: Layers },
    { id: 'legal', label: 'Legal & Policies (CMS)', icon: Shield },
    { id: 'company', label: 'Company Information', icon: Building2 },
    { id: 'website', label: 'Website Information', icon: Globe },
    { id: 'social', label: 'Social Media Links', icon: Share2 },
    { id: 'contact', label: 'Contact & Support', icon: HelpCircle },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
    { id: 'news', label: 'News & Community CMS', icon: FileText },
  ];

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <PageHeader
        badgeIcon={Globe}
        badgeText="PLATFORM CMS COCKPIT"
        badgeVariant="emerald"
        title="Website Content & System Settings"
        titleIcon={SettingsIcon}
        description="Full CRUD management of public website information, legal policies, footer columns, and community media articles stored in database."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadAllSettings();
                loadNewsArticles();
                showToast("Refreshed all settings from database", "info");
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Reload DB</span>
            </button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/80 no-scrollbar">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                active 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FOOTER MANAGEMENT */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Footer Management</h3>
              <p className="text-xs text-slate-500">Configure footer columns, links, copyright statement, and bottom-bar text.</p>
            </div>
            <button
              onClick={() => handleSaveSetting('FOOTER_MANAGEMENT', footerConfig, 'FOOTER')}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Footer Settings</span>
            </button>
          </div>

          {footerConfig && (
            <div className="space-y-6">
              
              {/* Copyright & Bottom Bar Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Copyright Text</label>
                  <input
                    type="text"
                    value={footerConfig.copyrightText || ''}
                    onChange={e => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bottom Tagline</label>
                  <input
                    type="text"
                    value={footerConfig.bottomTagline || ''}
                    onChange={e => setFooterConfig({ ...footerConfig, bottomTagline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Legal / Anti-Cruelty Statutory Disclaimer</label>
                  <textarea
                    rows={2}
                    value={footerConfig.legalDisclaimer || ''}
                    onChange={e => setFooterConfig({ ...footerConfig, legalDisclaimer: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Footer Columns & Links */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">Footer Columns ({footerConfig.columns?.length || 0})</h4>
                  <button
                    type="button"
                    onClick={handleAddFooterColumn}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Column</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(footerConfig.columns || []).map((col, colIdx) => (
                    <div key={colIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={col.title}
                          onChange={e => {
                            const updated = { ...footerConfig };
                            updated.columns[colIdx].title = e.target.value;
                            setFooterConfig(updated);
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-black text-slate-900 w-full mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFooterColumn(colIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Column"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(col.links || []).map((link, linkIdx) => (
                          <div key={linkIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={link.label}
                              onChange={e => {
                                const updated = { ...footerConfig };
                                updated.columns[colIdx].links[linkIdx].label = e.target.value;
                                setFooterConfig(updated);
                              }}
                              placeholder="Label"
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-800 w-1/2"
                            />
                            <input
                              type="text"
                              value={link.url}
                              onChange={e => {
                                const updated = { ...footerConfig };
                                updated.columns[colIdx].links[linkIdx].url = e.target.value;
                                setFooterConfig(updated);
                              }}
                              placeholder="URL"
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-600 w-1/2"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFooterLink(colIdx, linkIdx)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddFooterLink(colIdx)}
                          className="w-full py-1 text-[11px] font-bold text-emerald-700 bg-white border border-dashed border-emerald-300 rounded hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEGAL & POLICIES CMS (WYSIWYG RICH TEXT EDITOR) */}
      {activeTab === 'legal' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Legal Content Management System</h3>
              <p className="text-xs text-slate-500">
                Author and update official Terms & Conditions, Privacy Policy, Cookie Policy, and Refund Policy using the Rich Text (WYSIWYG) Editor.
              </p>
            </div>
            <button
              onClick={() => handleSaveSetting(activePolicyKey, legalPolicies[activePolicyKey], 'LEGAL')}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Publish Policy to Database</span>
            </button>
          </div>

          {/* Policy Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'LEGAL_TERMS', label: 'Terms & Conditions', pageUrl: '/terms' },
              { key: 'LEGAL_PRIVACY', label: 'Privacy Policy', pageUrl: '/privacy' },
              { key: 'LEGAL_COOKIE', label: 'Cookie Policy', pageUrl: '/cookie-policy' },
              { key: 'LEGAL_REFUND', label: 'Refund & Cancellation', pageUrl: '/refund-policy' }
            ].map(p => (
              <div key={p.key} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActivePolicyKey(p.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePolicyKey === p.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
                <a
                  href={p.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title={`View live ${p.label} page`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          {/* Policy Metadata Form */}
          {legalPolicies[activePolicyKey] && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={legalPolicies[activePolicyKey].title || ''}
                    onChange={e => setLegalPolicies({
                      ...legalPolicies,
                      [activePolicyKey]: { ...legalPolicies[activePolicyKey], title: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Version Number</label>
                  <input
                    type="text"
                    value={legalPolicies[activePolicyKey].version || ''}
                    onChange={e => setLegalPolicies({
                      ...legalPolicies,
                      [activePolicyKey]: { ...legalPolicies[activePolicyKey], version: e.target.value }
                    })}
                    placeholder="e.g. v2.4"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Effective Date</label>
                  <input
                    type="text"
                    value={legalPolicies[activePolicyKey].effectiveDate || ''}
                    onChange={e => setLegalPolicies({
                      ...legalPolicies,
                      [activePolicyKey]: { ...legalPolicies[activePolicyKey], effectiveDate: e.target.value }
                    })}
                    placeholder="e.g. October 2026"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Rich Text Editor for Legal Body */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Legal Body & Clauses (Rich Text with Font, Size, Bullets, and Highlights)
                </label>
                <RichTextEditor
                  value={legalPolicies[activePolicyKey].content || ''}
                  onChange={(html) => {
                    setLegalPolicies(prev => ({
                      ...prev,
                      [activePolicyKey]: {
                        ...prev[activePolicyKey],
                        content: html
                      }
                    }));
                  }}
                  minHeight="400px"
                  placeholder="Draft policy clauses, statutory requirements, and legal undertakings..."
                />
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 3: COMPANY INFORMATION */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Company Information</h3>
              <p className="text-xs text-slate-500">Corporate entity name, registered office address, CIN, GSTIN, and business details.</p>
            </div>
            <button
              onClick={() => handleSaveSetting('COMPANY_INFO', companyInfo, 'COMPANY')}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Info</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Registered Name</label>
              <input
                type="text"
                value={companyInfo.companyName || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Platform Name</label>
              <input
                type="text"
                value={companyInfo.brandName || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Identification Number (CIN)</label>
              <input
                type="text"
                value={companyInfo.cin || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, cin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={companyInfo.gstin || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, gstin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Corporate Email</label>
              <input
                type="email"
                value={companyInfo.corporateEmail || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, corporateEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Corporate Phone</label>
              <input
                type="text"
                value={companyInfo.corporatePhone || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, corporatePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Address</label>
              <textarea
                rows={2}
                value={companyInfo.registeredAddress || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, registeredAddress: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hours</label>
              <input
                type="text"
                value={companyInfo.operatingHours || ''}
                onChange={e => setCompanyInfo({ ...companyInfo, operatingHours: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEBSITE INFORMATION */}
      {activeTab === 'website' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Website Information</h3>
              <p className="text-xs text-slate-500">Website name, logo, favicon, domain details and emergency contact.</p>
            </div>
            <button
              onClick={() => handleSaveSetting('WEBSITE_INFO', websiteInfo, 'WEBSITE')}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Website Info</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website Name</label>
              <input
                type="text"
                value={websiteInfo.websiteName || ''}
                onChange={e => setWebsiteInfo({ ...websiteInfo, websiteName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Tagline</label>
              <input
                type="text"
                value={websiteInfo.tagline || ''}
                onChange={e => setWebsiteInfo({ ...websiteInfo, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Domain</label>
              <input
                type="text"
                value={websiteInfo.domain || ''}
                onChange={e => setWebsiteInfo({ ...websiteInfo, domain: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">National 24/7 Emergency Hotline</label>
              <input
                type="text"
                value={websiteInfo.emergencyHotline || ''}
                onChange={e => setWebsiteInfo({ ...websiteInfo, emergencyHotline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Logo Image URL</label>
              <input
                type="text"
                value={websiteInfo.logoUrl || ''}
                onChange={e => setWebsiteInfo({ ...websiteInfo, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Favicon URL</label>
              <input
                type="text"
                value={websiteInfo.faviconUrl || ''}
                onChange={e => setWebsiteInfo({ ...websiteInfo, faviconUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SOCIAL MEDIA LINKS */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Social Media Links</h3>
              <p className="text-xs text-slate-500">Official links to social channels displayed in header, footer, and community pages.</p>
            </div>
            <button
              onClick={() => handleSaveSetting('SOCIAL_MEDIA', socialMedia, 'SOCIAL')}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Social Profiles</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facebook URL</label>
              <input
                type="text"
                value={socialMedia.facebook || ''}
                onChange={e => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                placeholder="https://facebook.com/jivathunai"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instagram URL</label>
              <input
                type="text"
                value={socialMedia.instagram || ''}
                onChange={e => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                placeholder="https://instagram.com/jivathunai"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={socialMedia.youtube || ''}
                onChange={e => setSocialMedia({ ...socialMedia, youtube: e.target.value })}
                placeholder="https://youtube.com/@jivathunai"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={socialMedia.linkedin || ''}
                onChange={e => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/jivathunai"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Twitter / X Profile</label>
              <input
                type="text"
                value={socialMedia.twitter || ''}
                onChange={e => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                placeholder="https://twitter.com/jivathunai"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Official Channel / Support</label>
              <input
                type="text"
                value={socialMedia.whatsappSupport || ''}
                onChange={e => setSocialMedia({ ...socialMedia, whatsappSupport: e.target.value })}
                placeholder="+919999988888"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONTACT & SUPPORT */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Contact & Support Details</h3>
              <p className="text-xs text-slate-500">Customer care email, helpline numbers, grievance officer, and business enquiry channels.</p>
            </div>
            <button
              onClick={() => handleSaveSetting('CONTACT_SUPPORT', contactSupport, 'CONTACT')}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Support Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">General Support Email</label>
              <input
                type="email"
                value={contactSupport.supportEmail || ''}
                onChange={e => setContactSupport({ ...contactSupport, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Legal / Compliance Email</label>
              <input
                type="email"
                value={contactSupport.legalEmail || ''}
                onChange={e => setContactSupport({ ...contactSupport, legalEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Toll-Free Support Helpline</label>
              <input
                type="text"
                value={contactSupport.tollFreePhone || ''}
                onChange={e => setContactSupport({ ...contactSupport, tollFreePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">24/7 Emergency Line</label>
              <input
                type="text"
                value={contactSupport.emergencyPhone || ''}
                onChange={e => setContactSupport({ ...contactSupport, emergencyPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Help Center URL</label>
              <input
                type="text"
                value={contactSupport.helpCenterUrl || ''}
                onChange={e => setContactSupport({ ...contactSupport, helpCenterUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Partnership & Hospital Inquiries</label>
              <input
                type="email"
                value={contactSupport.businessInquiries || ''}
                onChange={e => setContactSupport({ ...contactSupport, businessInquiries: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">SEO & OpenGraph Metadata</h3>
              <p className="text-xs text-slate-500">Default meta tags, search keywords, social share preview image.</p>
            </div>
            <button
              onClick={() => handleSaveSetting('SEO_METADATA', seoMetadata, 'SEO')}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save SEO Settings</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Page Title</label>
              <input
                type="text"
                value={seoMetadata.defaultTitle || ''}
                onChange={e => setSeoMetadata({ ...seoMetadata, defaultTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Description (Max 160 characters)</label>
              <textarea
                rows={3}
                value={seoMetadata.metaDescription || ''}
                onChange={e => setSeoMetadata({ ...seoMetadata, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keywords (Comma separated)</label>
              <input
                type="text"
                value={seoMetadata.keywords || ''}
                onChange={e => setSeoMetadata({ ...seoMetadata, keywords: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Social Sharing Image URL (OpenGraph)</label>
              <input
                type="text"
                value={seoMetadata.ogImage || ''}
                onChange={e => setSeoMetadata({ ...seoMetadata, ogImage: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: NEWS & COMMUNITY CMS (WITH PHOTO, VIDEO, AND PDF UPLOADS) */}
      {activeTab === 'news' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">News & Community Article CMS</h3>
              <p className="text-xs text-slate-500">Publish articles, community stories, welfare guidelines with embedded photo, video, and PDF attachments.</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/news"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Public News Page</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <button
                onClick={() => handleOpenArticleModal()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Article</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'NEWS', 'COMMUNITY', 'ANNOUNCEMENT', 'PET_CARE_GUIDE', 'RESCUE_STORY'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setNewsCategoryFilter(cat);
                  cmsApi.getAdminNews(cat, 1, 50, token).then(res => {
                    if (res?.data?.content) setNewsArticles(res.data.content);
                  });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  newsCategoryFilter === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Articles Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Media Attachments</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {newsArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No articles found in this category. Click "Create New Article" to add one.
                    </td>
                  </tr>
                ) : (
                  newsArticles.map(art => (
                    <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {art.photoUrl ? (
                            <img src={art.photoUrl} alt="Thumbnail" className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-black text-slate-900 line-clamp-1">{art.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono">/{art.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {art.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {art.photoUrl && <span title="Photo Included"><ImageIcon className="w-3.5 h-3.5 text-blue-600" /></span>}
                          {art.videoUrl && <span title="Video Included"><Video className="w-3.5 h-3.5 text-purple-600" /></span>}
                          {art.pdfUrl && <span title="PDF Attached"><FileText className="w-3.5 h-3.5 text-rose-600" /></span>}
                          {!art.photoUrl && !art.videoUrl && !art.pdfUrl && <span className="text-slate-400 text-[11px]">Text only</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          art.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {art.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">
                        {art.viewsCount || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenArticleModal(art)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-emerald-700 transition-colors"
                            title="Edit Article"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* CREATE / EDIT ARTICLE MODAL (FULL RICH TEXT CMS) */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingArticle?.id ? 'Edit News & Community Article' : 'Create News & Community Article'}
                </h3>
                <p className="text-xs text-slate-500">Author article with Rich Text Editor and upload Photo, Video, or PDF documents.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Article Headline / Title *</label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={e => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="e.g. Free Rabies Vaccination Camp & PCA Awareness"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="NEWS">Official Platform News</option>
                    <option value="COMMUNITY">Community Story / Rescues</option>
                    <option value="ANNOUNCEMENT">Public Statutory Announcement</option>
                    <option value="PET_CARE_GUIDE">Veterinary Health & Pet Care Guide</option>
                    <option value="RESCUE_STORY">PCA 1960 Adoption & Rescue Story</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={articleForm.authorName}
                    onChange={e => setArticleForm({ ...articleForm, authorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary / Excerpt</label>
                  <textarea
                    rows={2}
                    value={articleForm.summary}
                    onChange={e => setArticleForm({ ...articleForm, summary: e.target.value })}
                    placeholder="A concise summary of the article displayed on previews..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* MEDIA ATTACHMENT CARD (PHOTO, VIDEO, PDF UPLOAD FEATURES) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Article Media Attachments (Photo, Video & PDF Uploads)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* 1. Photo Upload */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      Featured Photo
                    </span>
                    {articleForm.photoUrl ? (
                      <div className="relative">
                        <img src={articleForm.photoUrl} alt="Featured" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setArticleForm({ ...articleForm, photoUrl: '' })}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id="photo-upload-input"
                          onChange={e => handleFileUpload(e, 'photoUrl')}
                          className="hidden"
                        />
                        <label
                          htmlFor="photo-upload-input"
                          className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg text-center text-xs font-semibold text-slate-600 flex flex-col items-center justify-center cursor-pointer transition-colors"
                        >
                          <ImageIcon className="w-4 h-4 text-slate-400 mb-1" />
                          <span>Upload Photo</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 2. Video Upload or Embed */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-purple-600" />
                      Video Attachment / Embed
                    </span>
                    <input
                      type="text"
                      value={articleForm.videoUrl || ''}
                      onChange={e => setArticleForm({ ...articleForm, videoUrl: e.target.value })}
                      placeholder="Video URL or MP4 link"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        id="video-upload-input"
                        onChange={e => handleFileUpload(e, 'videoUrl')}
                        className="hidden"
                      />
                      <label
                        htmlFor="video-upload-input"
                        className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-center text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Video className="w-3 h-3" />
                        <span>Upload Video File</span>
                      </label>
                    </div>
                  </div>

                  {/* 3. PDF Document Attachment */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                      PDF Document Attachment
                    </span>
                    {articleForm.pdfUrl ? (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
                        <span className="truncate max-w-[140px] font-bold">{articleForm.pdfFileName || 'PDF Document'}</span>
                        <button
                          type="button"
                          onClick={() => setArticleForm({ ...articleForm, pdfUrl: '', pdfFileName: '' })}
                          className="p-1 hover:text-rose-950"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          id="pdf-upload-input"
                          onChange={e => handleFileUpload(e, 'pdfUrl')}
                          className="hidden"
                        />
                        <label
                          htmlFor="pdf-upload-input"
                          className="w-full py-3 bg-rose-50/60 hover:bg-rose-100 border border-dashed border-rose-300 rounded-lg text-center text-xs font-semibold text-rose-800 flex flex-col items-center justify-center cursor-pointer transition-colors"
                        >
                          <FileText className="w-4 h-4 text-rose-500 mb-1" />
                          <span>Upload PDF Document</span>
                        </label>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Rich Text Editor for Content Body */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Article Body (WYSIWYG Rich Text Editor) *
                </label>
                <RichTextEditor
                  value={articleForm.content}
                  onChange={html => setArticleForm({ ...articleForm, content: html })}
                  minHeight="350px"
                  placeholder="Compose article body with headers, fonts, sizes, bullets, and highlights..."
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published-toggle"
                  checked={articleForm.published}
                  onChange={e => setArticleForm({ ...articleForm, published: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="published-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publish article live immediately to public News & Community page
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingMedia}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingArticle?.id ? 'Update Article in Database' : 'Publish Article'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

// Helper icon
const SettingsIcon = (props) => <Globe {...props} />;
