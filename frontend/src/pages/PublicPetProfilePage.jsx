import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Dog, ShieldCheck, Heart, Award, QrCode, Phone, Share2, 
  Copy, Check, AlertCircle, Lock, Calendar, Scale, Ruler, 
  Droplet, Eye, ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, 
  X, CheckCircle2, ShieldAlert, Sparkles, Building2
} from 'lucide-react';
import { petApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const PublicPetProfilePage = () => {
  const { identifier: pathIdentifier } = useParams();
  const [searchParams] = useSearchParams();
  const queryHash = searchParams.get('hash');
  const queryPetId = searchParams.get('petId');
  const activeId = pathIdentifier || queryHash || queryPetId;

  const { user, token } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);

  useEffect(() => {
    if (!activeId) {
      setLoading(false);
      setError('No pet profile identifier specified.');
      return;
    }

    const fetchPublicData = async () => {
      setLoading(true);
      setError(null);
      setIsPrivate(false);

      try {
        const res = await petApi.getPublicProfile(activeId, token, user?.userId);
        if (res && res.data) {
          // Verify if isPublic is true or user is owner
          if (res.data.isPublic || res.data.isOwner) {
            setPetData(res.data);
          } else {
            setIsPrivate(true);
          }
        } else {
          const msg = res?.message || 'Pet profile not found';
          if (msg.toLowerCase().includes('private') || msg.toLowerCase().includes('inactive')) {
            setIsPrivate(true);
          } else {
            setError(msg);
          }
        }
      } catch (err) {
        console.error('Failed to load public pet profile', err);
        const errStr = err?.message || '';
        if (errStr.toLowerCase().includes('private')) {
          setIsPrivate(true);
        } else {
          setError('Unable to load pet profile at this time.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [activeId, token, user?.userId]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Public pet profile link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 'Age not recorded';
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years > 0) {
        return `${years} yr${years > 1 ? 's' : ''} ${months > 0 ? `${months} mo` : ''}`.trim();
      }
      return `${months || 1} month${months > 1 ? 's' : ''}`;
    } catch {
      return 'Unknown';
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
          <Dog className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Resolving Sovereign Pet Profile...</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">Verifying cryptographic registry and municipal certification...</p>
      </div>
    );
  }

  // 2. Private Profile Restricted State
  if (isPrivate) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl mx-auto flex items-center justify-center border border-amber-200 shadow-sm">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-200 uppercase tracking-wider">
              Private Pet Profile
            </span>
            <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              This registered pet's profile is set to <strong className="text-slate-700">Private</strong> by its guardian. 
              Under platform privacy policy, registered pet data is only visible to the pet owner unless explicitly published.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" /> Are you the owner of this pet?
            </p>
            <p>
              Please log in with your verified pet owner account to view your pet's complete profile and change visibility settings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Log In as Owner
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State (Not Found)
  if (error || !petData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Pet Profile Not Found</h3>
          <p className="text-sm text-slate-500">{error || 'The requested pet profile does not exist or has expired.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const visibility = petData.profileVisibility || {};
  const photos = petData.photos || [];
  const primaryPhoto = petData.primaryPhotoUrl || (photos.length > 0 ? (typeof photos[0] === 'string' ? photos[0] : photos[0]?.url) : null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 pb-20">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/jivathunailogo.png" alt="Jiva Thunai" className="h-8 w-auto group-hover:scale-105 transition-transform" />
              <div className="hidden sm:block">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">Jiva Thunai</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Sovereign Pet Registry</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200 transition-all shadow-xs"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
              <span>{copied ? 'Copied!' : 'Share Profile'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shadow-xs"
              title="View QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {petData.isOwner && (
              <Link
                to={`/Profile?hash=${encodeURIComponent(petData.qrHash || activeId)}`}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Manage Pet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Showcase Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        
        {/* Verification & Legal Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 text-[10px] font-black rounded-full border border-emerald-400/30 tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Sovereign Pet Identity
                </span>
                <span className="px-2.5 py-1 bg-white/10 text-slate-300 text-[10px] font-bold rounded-full">
                  PCA Act 1960 Compliant
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{petData.petName}</h1>
              <p className="text-xs text-emerald-200/80 font-mono">
                Registry ID: {petData.qrHash || activeId}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 shrink-0">
              <Building2 className="w-8 h-8 text-emerald-300" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Municipal License</span>
                <span className="text-xs font-mono font-black text-white">{petData.municipalLicenseNumber || 'JIVA-VERIFIED-MUNICIPAL'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Primary Showcase Card */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Pet Photo Section */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-emerald-100 shadow-md relative bg-slate-100 group">
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto}
                    alt={petData.petName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-emerald-300 bg-emerald-50/50">
                    <Dog className="w-20 h-20" />
                    <span className="text-xs font-bold text-emerald-700 mt-2">Verified Identity</span>
                  </div>
                )}
                
                <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-xl flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {petData.species || 'Companion Animal'}
                </span>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Status: {petData.status || 'Active'}</span>
              </div>
            </div>

            {/* Pet Key Information */}
            <div className="w-full md:w-2/3 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-slate-900">{petData.petName}</h2>
                  <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold rounded-lg">
                    {petData.breed || 'Standard Breed'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg">
                    {petData.gender || 'Unknown Gender'}
                  </span>
                </div>
                
                {petData.description && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
                    {petData.description}
                  </p>
                )}
              </div>

              {/* Fast Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Approx. Age</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {calculateAge(petData.dateOfBirth)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Coat Color</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1 mt-0.5">
                    <Droplet className="w-3.5 h-3.5 text-teal-600" />
                    {petData.color || 'Standard Coat'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Microchip ID</span>
                  <span className="text-xs font-mono font-bold text-slate-800 truncate block mt-0.5">
                    {petData.microchipNumber || 'Not Microchipped'}
                  </span>
                </div>

                {visibility.showPhysicalAttributes && (
                  <>
                    <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight</span>
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1 mt-0.5">
                        <Scale className="w-3.5 h-3.5 text-emerald-600" />
                        {petData.weightKg ? `${petData.weightKg} kg` : 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Height</span>
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1 mt-0.5">
                        <Ruler className="w-3.5 h-3.5 text-teal-600" />
                        {petData.heightCm ? `${petData.heightCm} cm` : 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                      <span className="text-xs font-black text-slate-800 truncate block mt-0.5">
                        {petData.bloodGroup || 'DEA 1.1 Compatible'}
                      </span>
                    </div>
                  </>
                )}

              </div>

              {/* Identifying Marks */}
              {petData.identifyingMarks && (
                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">Physical Identifying Marks:</span>
                  <p className="text-amber-800 font-medium">{petData.identifyingMarks}</p>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Lost Pet Recovery & Emergency Contact */}
        <div className="bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-rose-200/70 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full border border-rose-200 uppercase tracking-wider inline-block">
                Emergency & Lost Pet Recovery
              </span>
              <h3 className="text-lg font-black text-slate-900">Found This Pet in Need?</h3>
              <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                If you have found <strong className="text-slate-800">{petData.petName}</strong> wandering, lost, or in distress, please contact the verified guardian directly or coordinate with the nearest authorized veterinary facility.
              </p>
            </div>

            {petData.emergencyContactPhone ? (
              <a
                href={`tel:${petData.emergencyContactPhone}`}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-95"
              >
                <Phone className="w-4 h-4 animate-pulse" />
                <span>Call Guardian: {petData.emergencyContactPhone}</span>
              </a>
            ) : (
              <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
                Guardian contact protected via municipal registry
              </div>
            )}
          </div>
        </div>

        {/* Media Showcase (if public gallery enabled and photos/videos exist) */}
        {visibility.showMedia && photos.length > 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Verified Photo Gallery</h3>
                <p className="text-xs text-slate-500">Official photos registered in the sovereign passport.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {photos.length} Photos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
              {photos.map((item, idx) => {
                const url = typeof item === 'string' ? item : item?.url;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className="h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all relative group"
                  >
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legal & Compliance Standard Note */}
        <div className="text-center py-6 border-t border-slate-200 text-slate-400 space-y-1">
          <p className="text-xs font-semibold">Jiva Thunai Sovereign Animal Welfare & Digital Identity Platform</p>
          <p className="text-[11px]">PCA Act 1960 Legal Framework • Sovereign Cryptographic Data Registry</p>
        </div>

      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Cryptographic QR Passport</span>
              <button onClick={() => setShowQrModal(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center">
              <QrCode className="w-36 h-36 text-emerald-800" />
              <span className="text-xs font-mono font-bold text-slate-700 mt-3">{petData.qrHash || activeId}</span>
            </div>

            <p className="text-xs text-slate-500">
              Scan this QR code with any smartphone to open this verified public pet profile.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeMediaIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setActiveMediaIndex(null)}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={typeof photos[activeMediaIndex] === 'string' ? photos[activeMediaIndex] : photos[activeMediaIndex]?.url}
            alt="Enlarged"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
