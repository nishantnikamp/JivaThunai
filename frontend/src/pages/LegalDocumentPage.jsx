import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cmsApi } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { 
  ShieldCheck, FileText, Clock, ArrowLeft, Award, Lock 
} from 'lucide-react';

export const LegalDocumentPage = ({ policyKey: propPolicyKey }) => {
  const location = useLocation();

  // Determine policy key from props or route path
  const getPolicyKey = () => {
    if (propPolicyKey) return propPolicyKey;
    const path = location.pathname.toLowerCase();
    if (path.includes('privacy')) return 'LEGAL_PRIVACY';
    if (path.includes('cookie')) return 'LEGAL_COOKIE';
    if (path.includes('refund')) return 'LEGAL_REFUND';
    return 'LEGAL_TERMS';
  };

  const policyKey = getPolicyKey();
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadPolicy();
  }, [policyKey]);

  const loadPolicy = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getPublicSetting(policyKey);
      if (res && res.data) {
        setDocumentData(res.data);
      }
    } catch (err) {
      console.warn("Could not load policy from database, using fallback", err);
    } finally {
      setLoading(false);
    }
  };

  const getPageMeta = () => {
    switch (policyKey) {
      case 'LEGAL_PRIVACY':
        return {
          title: documentData?.title || 'Privacy Policy & Companion Health Data',
          badge: 'STATUTORY PRIVACY STANDARD',
          description: 'Zero-trust consent architecture safeguarding pet biometric data, medical confidentiality, and guardian contact credentials.'
        };
      case 'LEGAL_COOKIE':
        return {
          title: documentData?.title || 'Cookie & Local Storage Policy',
          badge: 'LOCAL STORAGE & SESSION POLICY',
          description: 'Transparent disclosure of essential cryptographic JWT session cookies and client-side application caching.'
        };
      case 'LEGAL_REFUND':
        return {
          title: documentData?.title || 'Refund, Cancellation & Appointment Policy',
          badge: 'FAIR PRACTICE & REFUND PROTOCOL',
          description: 'Standardized cancellation timelines for clinical veterinary visits, surgical reservations, and marketplace orders.'
        };
      default:
        return {
          title: documentData?.title || 'Terms and Conditions of Service',
          badge: 'PCA ACT 1960 STATUTORY UNDERTAKING',
          description: 'Legal terms governing companion animal ownership, veterinary institutional showcases, and anti-neglect mandates.'
        };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="w-full bg-white">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-6 sm:space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header - Clean, container-free title */}
        <PageHeader
          badgeIcon={ShieldCheck}
          badgeText={meta.badge}
          badgeVariant="emerald"
          title={meta.title}
          titleIcon={FileText}
          description={meta.description}
        />

        {/* Document Metadata Bar */}
        <div className="flex flex-wrap items-center gap-6 pb-4 border-b border-slate-200 text-xs sm:text-sm font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Award className="w-4 h-4 text-emerald-600" />
            Version: {documentData?.version || 'v2.4'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            Effective Date: {documentData?.effectiveDate || 'October 2026'}
          </span>
        </div>

        {/* Rich HTML Content Body - Displayed directly on Page (No enclosing box/container) */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Loading statutory legal policy from database...</p>
          </div>
        ) : (
          <div 
            className="legal-policy-content text-slate-800 leading-relaxed space-y-4 pt-2"
            dangerouslySetInnerHTML={{ __html: documentData?.content || '<p>Legal policy details are loading or being initialized.</p>' }}
          />
        )}

        {/* Anti-Cruelty Statutory Footnote */}
        <div className="border-l-4 border-emerald-600 bg-emerald-50/60 p-4 sm:p-5 text-xs text-slate-700 leading-relaxed flex items-start gap-3 mt-10 rounded-r-2xl">
          <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 text-sm">Statutory Animal Welfare Compliance Guarantee</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Jiva Thunai operates under Section 11 of the Prevention of Cruelty to Animals (PCA) Act, 1960. All medical consultations, adoptions, and care delegations logged in the platform constitute evidentiary records for animal custody compliance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
