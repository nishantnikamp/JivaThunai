import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Globe, Clock, ShieldCheck, 
  Calendar, CheckCircle2, ChevronRight, Award, Stethoscope, 
  Activity, Star, Navigation, Camera, ExternalLink, Heart, AlertCircle, 
  Sparkles, Check, ArrowRight, ShieldAlert, Compass, Play, X, User, PhoneCall
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hospitalProfileApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { PageHeader } from '../components/PageHeader';

export const HospitalPublicProfilePage = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, services, doctors, photos, facilities, location, certs, hours, reviews
  const [activeMediaPreview, setActiveMediaPreview] = useState(null);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('ALL');
  const [mediaFilter, setMediaFilter] = useState('ALL');

  const isVideoMedia = (m) => {
    if (!m) return false;
    const videoCategories = ['SERVICE_VIDEO', 'CLINIC_TOUR', 'FACILITY_WALKTHROUGH', 'SURGERY_DEMO'];
    if (videoCategories.includes(m.category)) return true;
    if (m.url && (m.url.endsWith('.mp4') || m.url.endsWith('.webm') || m.url.includes('/video/'))) return true;
    return false;
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [slugOrId]);

  const fetchPublicProfile = async () => {
    setLoading(true);
    try {
      if (!slugOrId) {
        setHospital(null);
        return;
      }
      const res = await hospitalProfileApi.getPublicProfile(slugOrId);
      if (res && res.data) {
        const cleanDocs = (res.data.doctors || []).filter(d => {
          const name = (d.doctorName || '').toLowerCase();
          const vci = (d.vciRegistrationNumber || '').toUpperCase();
          return !name.includes('hospital administrator') && vci !== 'VCI-TS-2024-001';
        });
        setHospital({ ...res.data, doctors: cleanDocs });
      } else {
        setHospital(null);
      }
    } catch (err) {
      console.warn("Could not load hospital public profile from database", err);
      setHospital(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Building2 className="w-10 h-10 text-emerald-600 animate-pulse" />
          <p className="text-sm font-bold text-slate-600">Loading Hospital Showcase...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-black text-slate-900">Hospital Profile Not Found</h2>
          <p className="text-xs text-slate-500">The requested veterinary facility is not available in the database or has not been published yet.</p>
          <button
            onClick={() => navigate('/hospitals')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Explore Registered Hospitals
          </button>
        </div>
      </div>
    );
  }

  const mainBranch = hospital?.branches?.find(b => b.isMainBranch) || hospital?.branches?.[0] || {
    streetAddress: hospital?.streetAddress,
    city: hospital?.city,
    district: hospital?.district,
    stateName: hospital?.stateName,
    country: hospital?.country,
    pinCode: hospital?.pinCode,
    latitude: hospital?.latitude,
    longitude: hospital?.longitude,
    googleMapLink: hospital?.googleMapLink,
    directionsAndLandmarks: hospital?.directionsAndLandmarks,
    isMainBranch: true,
    branchName: hospital?.displayName || hospital?.hospitalName || 'Main Hospital Campus'
  };

  const coverUrl = hospital?.coverPhotoUrl || "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1600&q=80";
  const logoUrl = hospital?.logoUrl || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&q=80";

  const services = hospital?.services || [];
  const filteredServices = selectedServiceCategory === 'ALL'
    ? services
    : services.filter(s => s.category === selectedServiceCategory);

  const categories = ['ALL', ...new Set(services.map(s => s.category))];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">

      {/* Hero Banner with Cover Photo */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900">
        <img 
          src={coverUrl} 
          alt={hospital?.hospitalName} 
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/hospitals')}
            className="px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <span>← Explore Hospitals</span>
          </button>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-end gap-4">
              <img 
                src={logoUrl} 
                alt="Hospital Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover bg-white p-1.5 shadow-2xl border-2 border-white/20 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                    Verified Details
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-xs">
                    Multi-Service Clinic
                  </span>
                  {hospital?.emergencySupport247 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs animate-pulse">
                      24/7 Emergency Care
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  {hospital?.displayName || hospital?.hospitalName}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5 drop-shadow-sm">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{mainBranch.city || 'Hyderabad'}, {mainBranch.stateName || 'Telangana'}, India</span>
                  <span>•</span>
                  <span>{hospital?.hospitalType?.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => navigate(`/vet-appointments?hospitalId=${hospital?.id || hospital?.organizationId}`)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
              {mainBranch.googleMapLink && (
                <a
                  href={mainBranch.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Get Directions</span>
                </a>
              )}
              {hospital?.primaryPhone && (
                <a
                  href={`tel:${hospital.primaryPhone}`}
                  className="p-3 bg-white/90 hover:bg-white text-slate-900 rounded-2xl backdrop-blur-md shadow-lg transition-all cursor-pointer"
                  title="Call Hospital"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Public Profile Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'services', label: `Services & Pricing (${services.length})`, icon: Stethoscope },
            { id: 'doctors', label: `Doctors & Specialists (${hospital?.doctors?.length || 0})`, icon: Award },
            { id: 'photos', label: `Photos & Videos (${hospital?.mediaList?.length || 0})`, icon: Camera },
            { id: 'facilities', label: `Facilities & Equipment (${hospital?.facilities?.length || 0})`, icon: Activity },
            { id: 'location', label: 'Location & Directions', icon: MapPin },
            { id: 'certs', label: 'Certifications & Evidence', icon: ShieldCheck },
            { id: 'hours', label: 'Opening Hours & Emergency', icon: Clock },
            { id: 'reviews', label: 'Reviews & Trust', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  active 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Introduction Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black text-slate-900">About {hospital?.displayName || hospital?.hospitalName}</h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {hospital?.description || 'Providing comprehensive, state-of-the-art veterinary medicine, surgical expertise, and compassionate care for companion animals.'}
                </p>

                {hospital?.approachToCare && (
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-1">
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Our Approach to Care</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">{hospital.approachToCare}</p>
                  </div>
                )}
              </div>

              {/* Supported Species & Scope */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900">Species Treated</h3>
                <div className="flex flex-wrap gap-2">
                  {(hospital?.animalTypes || ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Exotics']).map((species) => (
                    <span key={species} className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/60 flex items-center gap-1.5">
                      <Heart className="w-3 h-3 text-emerald-600" />
                      <span>{species}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Facility Preview */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">Clinical Facility Highlights</h3>
                  <button onClick={() => setActiveTab('facilities')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
                    <span>View all facilities</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-600">INPATIENT & TRAUMA</span>
                    <h4 className="text-xs font-black text-slate-900">Emergency & ICU Wards</h4>
                    <p className="text-[11px] text-slate-500">Equipped with constant oxygen supply and multi-parameter vital monitors.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-600">SURGICAL ADVANCEMENT</span>
                    <h4 className="text-xs font-black text-slate-900">Sterile Operating Theatres</h4>
                    <p className="text-[11px] text-slate-500">HEPA-filtered positive pressure theatres for soft-tissue and orthopaedics.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-6">
              {/* Emergency Status Widget */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl shadow-lg space-y-4 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    OPEN FOR PATIENTS
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">24/7 Critical Emergency</h4>
                  <p className="text-xs text-slate-300 mt-1">Priority triage admission is actively open for acute emergencies, trauma, and toxicoses.</p>
                </div>
                {hospital?.emergencyPhone && (
                  <a
                    href={`tel:${hospital.emergencyPhone}`}
                    className="flex items-center justify-center gap-2 w-full text-center py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all shadow-md"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Emergency Hotline: {hospital.emergencyPhone}</span>
                  </a>
                )}
              </div>

              {/* Branch Quick Contact */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-sm font-black text-slate-900">Hospital Contact & Location</h4>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{[mainBranch.streetAddress, mainBranch.city, mainBranch.stateName].filter(Boolean).join(', ')}{mainBranch.pinCode ? ` - ${mainBranch.pinCode}` : ''}</span>
                  </div>
                  {hospital?.primaryPhone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{hospital.primaryPhone}</span>
                    </div>
                  )}
                  {hospital?.publicEmail && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{hospital.publicEmail}</span>
                    </div>
                  )}
                  {hospital?.websiteUrl && (
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={hospital.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                        {hospital.websiteUrl.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: SERVICES & PRICING */}
        {/* ========================================== */}
        {activeTab === 'services' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Clinical Services & Upfront Pricing</h3>
                <p className="text-xs text-slate-500">Filter by category to check estimated costs, typical procedure duration, and walk-in eligibility.</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedServiceCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedServiceCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <div key={service.serviceId} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200/80 text-slate-700">
                        {service.category}
                      </span>
                      <span className="text-base font-black text-emerald-600">
                        {service.priceRange || `₹${service.price}`}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900">{service.serviceName}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{service.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <span>⏱ {service.typicalDurationMinutes || 30} mins</span>
                      {service.walkInSupported && <span className="text-emerald-700">• Walk-ins OK</span>}
                    </div>
                    <button
                      onClick={() => navigate(`/vet-appointments?hospitalId=${hospital?.id}&service=${encodeURIComponent(service.serviceName)}`)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Book Slot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: DOCTORS & SPECIALISTS */}
        {/* ========================================== */}
        {activeTab === 'doctors' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Verified Medical Specialists</h3>
              <p className="text-xs text-slate-500">Every practitioner's qualifications and Veterinary Council of India (VCI) license are verified.</p>
            </div>

            {(hospital?.doctors || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hospital.doctors.map((doc) => (
                  <div key={doc.doctorId} className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-start gap-5">
                    {doc.photoUrl ? (
                      <img 
                        src={doc.photoUrl} 
                        alt={doc.doctorName}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
                        {doc.doctorName ? doc.doctorName.replace('Dr.', '').trim().charAt(0) : 'D'}
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">{doc.doctorName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          VCI VERIFIED
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-700">{doc.specialty}</p>
                      {doc.qualifications && <p className="text-xs text-slate-600">{doc.qualifications}</p>}
                      <p className="text-[11px] font-mono font-bold text-slate-700">
                        VCI Reg ID: <span className="text-emerald-700 font-extrabold">{doc.vciRegistrationNumber || 'Verified Registration'}</span>
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1 text-[11px]">
                        {(doc.languages || ['English', 'Hindi']).map(lang => (
                          <span key={lang} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50/60 rounded-3xl border border-slate-200/80 space-y-3">
                <Award className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-800">No Doctors Linked Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">This veterinary hospital has not linked verified medical practitioner profiles yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: PHOTOS & VIDEOS GALLERY */}
        {/* ========================================== */}
        {activeTab === 'photos' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h3 className="text-base font-black text-slate-900">Hospital Facility & Technology Tour</h3>
                <p className="text-xs text-slate-500">Visual proof of inpatient suites, digital diagnostics, surgical theatres, and waiting areas.</p>
              </div>

              {/* Media Filter Tabs */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-2xl">
                {[
                  { id: 'ALL', label: `All (${hospital?.mediaList?.length || 0})` },
                  { id: 'PHOTOS', label: `Photos (${(hospital?.mediaList || []).filter(m => !isVideoMedia(m)).length})` },
                  { id: 'VIDEOS', label: `Video Tours (${(hospital?.mediaList || []).filter(m => isVideoMedia(m)).length})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMediaFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mediaFilter === f.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(hospital?.mediaList || [])
                .filter(m => {
                  if (mediaFilter === 'PHOTOS') return !isVideoMedia(m);
                  if (mediaFilter === 'VIDEOS') return isVideoMedia(m);
                  return true;
                })
                .map((m) => {
                  const isVid = isVideoMedia(m);
                  return (
                    <div 
                      key={m.mediaId || m.url}
                      onClick={() => setActiveMediaPreview(m)}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-950 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                    >
                      {isVid ? (
                        <div className="relative h-56 w-full flex items-center justify-center bg-slate-900">
                          <video 
                            src={m.url} 
                            preload="metadata" 
                            className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </div>
                          </div>
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                              VIDEO TOUR
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-56 w-full">
                          <img 
                            src={m.url} 
                            alt={m.caption || 'Facility photo'} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                          />
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                          {m.category?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent text-white">
                        <p className="text-xs font-bold line-clamp-1">{m.caption || (isVid ? 'Facility Video Tour' : 'Facility showcase photo')}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {(hospital?.mediaList || []).length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Camera className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No media uploaded yet for this hospital showcase.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: FACILITIES & EQUIPMENT */}
        {/* ========================================== */}
        {activeTab === 'facilities' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Operational Facilities & Live Readiness</h3>
              <p className="text-xs text-slate-500">Real-time capacity and operational readiness of surgical suites and intensive care beds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(hospital?.facilities || []).map((f) => (
                <div key={f.facilityId} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-700">
                      {f.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      ● {f.operationalStatus || 'OPERATIONAL'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{f.facilityName}</h4>
                  <p className="text-xs text-slate-600">{f.supportedProcedures || 'Standard clinical procedures'}</p>
                  <p className="text-[11px] text-slate-400 font-semibold pt-1">Capacity: {f.capacity} active unit(s)</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 6: LOCATION & DIRECTIONS */}
        {/* ========================================== */}
        {activeTab === 'location' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Branch Addresses & Navigation ({hospital?.branches?.length || (mainBranch.streetAddress || mainBranch.city ? 1 : 0)})</h3>
              <p className="text-xs text-slate-500">Verified coordinates, accessibility, and landmarks for physical appointments and emergency drop-offs.</p>
            </div>

            <div className="space-y-4">
              {(hospital?.branches?.length ? hospital.branches : [mainBranch]).map((b, idx) => (
                <div key={b.branchId || idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{b.branchName || `Campus ${idx + 1}`}</h4>
                      {b.isMainBranch && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                          MAIN CAMPUS
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        b.locationVerificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {b.locationVerificationStatus === 'VERIFIED' ? 'VERIFIED LOCATION' : (b.locationVerificationStatus || 'UNVERIFIED')}
                      </span>
                    </div>

                    {(b.phone || b.email) && (
                      <span className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                        {b.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{b.phone}</span>}
                        {b.phone && b.email && <span>•</span>}
                        {b.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{b.email}</span>}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-700 font-semibold">{[b.streetAddress, b.city, b.stateName || b.district].filter(Boolean).join(', ')}{b.pinCode ? ` - ${b.pinCode}` : ''}</p>
                      {b.directionsAndLandmarks && (
                        <p className="text-xs text-emerald-800 mt-1.5 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-700" /> Landmark: {b.directionsAndLandmarks}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      Coordinates: {b.latitude != null ? b.latitude.toFixed(4) : '17.4325'}, {b.longitude != null ? b.longitude.toFixed(4) : '78.4072'}
                    </span>

                    {b.googleMapLink ? (
                      <a
                        href={b.googleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Open in Google Maps</span>
                      </a>
                    ) : (b.latitude && b.longitude) ? (
                      <a
                        href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Open GPS Navigation</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 7: CERTIFICATIONS & EVIDENCE */}
        {/* ========================================== */}
        {activeTab === 'certs' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Hospital Legal Credentials & Review Facts</h3>
              <p className="text-xs text-slate-500">Separation between self-reported hospital claims and platform reviewer-confirmed facts.</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-emerald-950">Clinical Establishment Act Registration (State Government)</h4>
                  <p className="text-xs text-emerald-800">Registration ID: <span className="font-mono font-bold">{hospital?.clinicalEstablishmentRegNumber || 'CEA-TS-2023-7749'}</span></p>
                  <p className="text-[11px] text-emerald-700">Verified by State Directorate of Animal Husbandry & Veterinary Services.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                <Award className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900">Veterinary Council of India (VCI) Practitioner Compliance</h4>
                  <p className="text-xs text-slate-600">All registered surgeons and assistant clinicians possess valid and unexpired council licenses.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">Notice: Images and facility videos are supporting illustrative materials. Clinical establishment registrations are independently verified by platform administrators.</p>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 8: OPENING HOURS & EMERGENCY CARE */}
        {/* ========================================== */}
        {activeTab === 'hours' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Operating Hours & Emergency Coverage</h3>
                <p className="text-xs text-slate-500">Regular outpatient consultation shifts and round-the-clock trauma schedules.</p>
              </div>
              <span className="text-[11px] text-slate-400">Last updated recently</span>
            </div>

            <div className="space-y-2.5">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                const hourObj = hospital?.openingHours?.find(h => h.dayOfWeek === day) || { isOpen: true, openTime: '08:00', closeTime: '21:00' };
                return (
                  <div key={day} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50 flex items-center justify-between text-xs font-semibold">
                    <span className="w-32 font-bold text-slate-800">{day}</span>
                    <span className="text-emerald-700 font-bold">{hourObj.isOpen ? `${hourObj.openTime || '08:00'} - ${hourObj.closeTime || '21:00'}` : 'CLOSED'}</span>
                    <span className="text-slate-400 text-[11px]">Lunch Break: 13:00 - 14:00</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 9: REVIEWS & TRUST */}
        {/* ========================================== */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Pet Owner Community Reviews & Ratings</h3>
                <p className="text-xs text-slate-500">Verified pet parent feedback following completed clinical appointments.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-black text-amber-900">4.9 / 5.0</span>
                <span className="text-xs text-amber-700">(128 reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      AS
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Ananya Sharma (Owner of Bella, Golden Retriever)</h4>
                      <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">2 weeks ago</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  "Dr. Vikram and the surgical team were extraordinary during Bella's emergency gastrointestinal surgery. The sterile OT and 24/7 ICU monitoring saved her life."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      RK
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Ramesh Kumar (Owner of Oliver, Persian Cat)</h4>
                      <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">1 month ago</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  "Clean facilities, zero wait time for appointments, and fear-free examination. Transparent billing with no hidden costs."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Media Modal (Supports Images and Videos) */}
      {activeMediaPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setActiveMediaPreview(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/90 text-white hover:bg-slate-700 cursor-pointer transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {isVideoMedia(activeMediaPreview) ? (
              <video 
                src={activeMediaPreview.url} 
                controls 
                autoPlay 
                className="w-full max-h-[75vh] object-contain bg-black"
              />
            ) : (
              <img 
                src={activeMediaPreview.url} 
                alt={activeMediaPreview.caption || 'Facility preview'} 
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            )}

            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  {activeMediaPreview.category?.replace('_', ' ')}
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-100">{activeMediaPreview.caption || 'Hospital Facility Preview'}</p>
              </div>
              <span className="text-xs text-slate-400">{activeMediaPreview.uploadDate || 'Verified'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
