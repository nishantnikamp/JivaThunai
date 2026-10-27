import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsApi } from '../services/api';
import { 
  Building2, Phone, Mail, MapPin, ShieldCheck, Heart, 
  ExternalLink, ChevronRight, Share2, Globe, Clock, Award
} from 'lucide-react';

// Official Brand SVG Icons
const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YouTubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterXIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [socialData, setSocialData] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await cmsApi.getPublicSettings();
      if (res && res.data) {
        if (res.data.FOOTER_MANAGEMENT) setFooterData(res.data.FOOTER_MANAGEMENT);
        if (res.data.COMPANY_INFO) setCompanyData(res.data.COMPANY_INFO);
        if (res.data.CONTACT_SUPPORT) setContactData(res.data.CONTACT_SUPPORT);
        if (res.data.SOCIAL_MEDIA) setSocialData(res.data.SOCIAL_MEDIA);
      }
    } catch (err) {
      console.warn("Could not fetch public CMS footer settings", err);
    }
  };

  const getWhatsAppUrl = (val) => {
    if (!val) return 'https://wa.me/919999988888';
    if (val.startsWith('http://') || val.startsWith('https://')) return val;
    const cleanDigits = val.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanDigits || '919999988888'}`;
  };

  const handleLinkClick = (url, e) => {
    if (url && url.includes('#')) {
      const parts = url.split('#');
      const pathPart = parts[0] || '/';
      const hashPart = parts[1];
      if (window.location.pathname === pathPart || (pathPart === '/' && window.location.pathname === '')) {
        const el = document.getElementById(hashPart);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
          try {
            window.history.pushState(null, null, `#${hashPart}`);
          } catch (err) {}
          return;
        }
      }
    }
    // Instantly scroll window to top for page links
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Fallback defaults if database is initializing
  const columns = footerData?.columns || [
    {
      title: 'Explore',
      links: [
        { label: 'Home', url: '/' },
        { label: 'Services', url: '/#services' },
        { label: 'How It Works', url: '/#how-it-works' },
        { label: 'Why Jiva Thunai', url: '/#why-jiva-thunai' },
        { label: 'About Us', url: '/about' }
      ]
    },
    {
      title: 'Services',
      links: [
        { label: 'Veterinary Hospitals', url: '/hospitals' },
        { label: 'Pet Care Services', url: '/pet-services' },
        { label: 'Pet Products & Shop', url: '/shop' },
        { label: 'Adoption and Rescue', url: '/adoption' },
        { label: 'Lost and Found Pets', url: '/lost-found' },
        { label: 'Pet Care Knowledge', url: '/learn' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', url: '/contact' },
        { label: 'Help Center', url: '/contact#faq' },
        { label: 'Report an Issue', url: '/contact#support' },
        { label: '24/7 Emergency Locator', url: '/emergency-cases' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms and Conditions', url: '/terms' },
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Cookie Policy', url: '/cookie-policy' },
        { label: 'Refund Policy', url: '/refund-policy' }
      ]
    }
  ];

  const copyrightText = footerData?.copyrightText || '© 2026 Jiva Thunai Animal Welfare Platform. All Rights Reserved.';
  const legalDisclaimer = footerData?.legalDisclaimer || 'Prevention of Cruelty to Animals (PCA) Act 1960 & AWBI Pet Shop / Dog Breeding Rules 2018 Statutory Standard.';
  const bottomTagline = footerData?.bottomTagline || 'One platform. Every pet. Every stage of care.';

  const companyName = companyData?.companyName || 'Jiva Thunai Animal Welfare Technologies Private Limited';
  const registeredAddress = companyData?.registeredAddress || 'Tower 4, Guindy Industrial Estate, Chennai, Tamil Nadu 600032, India';
  const corporatePhone = contactData?.tollFreePhone || '+91 44 2841 9000';
  const supportEmail = contactData?.supportEmail || 'support@jivathunai.org';
  const cin = companyData?.cin || 'U85200TN2026PTC198421';
  const gstin = companyData?.gstin || '33AAACJ9842A1ZP';

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-teal-50/80 to-emerald-100/60 text-slate-700 pt-10 sm:pt-12 pb-10 border-t border-emerald-200/70 text-xs shadow-xs">
      {/* Subtle Ambient Light Green Glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-teal-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* Top Row: Brand Profile, Corporate Info & Contact Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 sm:pb-12 border-b border-emerald-200/80">
          
          {/* Brand Presentation */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/jivathunailogo.png" alt="Jiva Thunai Logo" className="h-10 w-auto object-contain shrink-0" />
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  Jiva Thunai
                </span>
                <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
                  The Complete Connected Pet Care Ecosystem
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed font-normal max-w-md">
              Connecting pet parents, verified veterinary hospitals, clinicians, and authorized caregivers under Indian statutory standards. Designed for compassionate, evidence-based care.
            </p>

            {/* Corporate Registration Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
              <span className="bg-white/90 border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs font-medium">
                CIN: <strong className="text-slate-900 font-mono">{cin}</strong>
              </span>
              <span className="bg-white/90 border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs font-medium">
                GSTIN: <strong className="text-slate-900 font-mono">{gstin}</strong>
              </span>
            </div>
          </div>

          {/* Quick Contact & Physical Address */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/85 backdrop-blur-sm p-6 rounded-3xl border border-emerald-200/90 shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Registered Corporate Office
              </span>
              <p className="text-xs text-slate-900 font-bold leading-relaxed">
                {companyName}
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {registeredAddress}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Helpdesk & Legal Enquiries
              </span>
              <p className="text-xs text-slate-700 font-medium flex items-center gap-2">
                <span>Helpline:</span>
                <strong className="text-slate-900 font-mono">{corporatePhone}</strong>
              </p>
              <p className="text-xs text-slate-700 font-medium flex items-center gap-2">
                <span>Email:</span>
                <a href={`mailto:${supportEmail}`} className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">
                  {supportEmail}
                </a>
              </p>
              <p className="text-[11px] text-rose-700 font-bold flex items-center gap-1 pt-1">
                <span>24/7 Trauma Emergency:</span>
                <span className="font-mono bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">1800-VET-911</span>
              </p>
            </div>
          </div>

        </div>

        {/* Middle Row: 4 Dynamic Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {col.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {(col.links || []).map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      to={link.url}
                      onClick={(e) => handleLinkClick(link.url, e)}
                      className="text-slate-600 hover:text-emerald-800 font-medium transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="w-3 h-3 text-emerald-500 group-hover:text-emerald-700 transition-colors" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media Links & Bottom Bar */}
        <div className="pt-8 border-t border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-bold text-slate-800">
              {copyrightText}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {legalDisclaimer}
            </p>
          </div>

          {/* Social Profiles: Facebook, Instagram, YouTube, LinkedIn, Twitter/X, WhatsApp */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {/* 1. Facebook */}
            <a
              href={socialData?.facebook || "https://facebook.com/jivathunai"}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook URL"
              title="Facebook"
              className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-emerald-200/90 text-slate-600 hover:text-[#1877F2] hover:border-blue-300 shadow-2xs transition-all hover:scale-105"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>

            {/* 2. Instagram */}
            <a
              href={socialData?.instagram || "https://instagram.com/jivathunai"}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram URL"
              title="Instagram"
              className="p-2.5 rounded-xl bg-white hover:bg-pink-50 border border-emerald-200/90 text-slate-600 hover:text-[#E4405F] hover:border-pink-300 shadow-2xs transition-all hover:scale-105"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            {/* 3. YouTube */}
            <a
              href={socialData?.youtube || "https://youtube.com/@jivathunai"}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube Channel URL"
              title="YouTube Channel"
              className="p-2.5 rounded-xl bg-white hover:bg-red-50 border border-emerald-200/90 text-slate-600 hover:text-[#FF0000] hover:border-red-300 shadow-2xs transition-all hover:scale-105"
            >
              <YouTubeIcon className="w-4 h-4" />
            </a>

            {/* 4. LinkedIn */}
            <a
              href={socialData?.linkedin || "https://linkedin.com/company/jivathunai"}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Profile"
              title="LinkedIn Profile"
              className="p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-emerald-200/90 text-slate-600 hover:text-[#0A66C2] hover:border-sky-300 shadow-2xs transition-all hover:scale-105"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>

            {/* 5. Twitter / X */}
            <a
              href={socialData?.twitter || "https://twitter.com/jivathunai"}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X Profile"
              title="Twitter / X Profile"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-emerald-200/90 text-slate-600 hover:text-black hover:border-slate-400 shadow-2xs transition-all hover:scale-105"
            >
              <TwitterXIcon className="w-4 h-4" />
            </a>

            {/* 6. WhatsApp */}
            <a
              href={getWhatsAppUrl(socialData?.whatsappSupport || socialData?.whatsapp || "+919999988888")}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp Official Channel / Support"
              title="WhatsApp Official Channel / Support"
              className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200/90 text-slate-600 hover:text-[#25D366] hover:border-emerald-400 shadow-2xs transition-all hover:scale-105"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>

            <div className="h-4 w-px bg-emerald-200 mx-1 hidden sm:block" />

            <Link to="/terms" onClick={(e) => handleLinkClick('/terms', e)} className="text-slate-700 hover:text-emerald-800 text-[11px] font-bold underline ml-1">
              Statutory Terms
            </Link>
            <Link to="/privacy" onClick={(e) => handleLinkClick('/privacy', e)} className="text-slate-700 hover:text-emerald-800 text-[11px] font-bold underline ml-1">
              Privacy
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
};
