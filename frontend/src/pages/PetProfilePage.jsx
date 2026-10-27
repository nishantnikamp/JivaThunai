import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  QrCode, ShieldCheck, Printer, CheckCircle2, AlertCircle, 
  Heart, Stethoscope, Copy, FileCheck, ArrowLeft, Camera, 
  Edit3, Trash2, Globe, Lock, Unlock, X, AlertTriangle, Dog, 
  Sparkles, UserCheck, PhoneCall, ExternalLink, ChevronDown,
  Image as ImageIcon, Video, Loader2, Save, Share2, FileText,
  BadgeCheck, Activity, Check, ZoomIn, ZoomOut, RotateCw, 
  Maximize2, ChevronLeft, ChevronRight, Play, Eye, RefreshCw,
  Move, Award, Calendar, Scale, Ruler, Droplet, Info, ShieldAlert,
  Download, Layers, CheckCircle, UploadCloud, Plus, Pill
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { SecurePdfViewer } from '../components/SecurePdfViewer';
import { MediaUploader } from '../components/MediaUploader';
import { FileUploader } from '../components/FileUploader';
import { useAuth } from '../context/AuthContext';
import { petApi, medicalApi } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export const PetProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hashFromUrl = searchParams.get('hash');
  const petIdFromUrl = searchParams.get('petId');
  const { showToast } = useNotification();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [activeIdentifier, setActiveIdentifier] = useState(hashFromUrl || petIdFromUrl || '');
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [petMedicalRecord, setPetMedicalRecord] = useState(null);
  const [loadingMedical, setLoadingMedical] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'medical' | 'certificates' | 'media'

  // Interactive Lightbox State for Photos & Videos
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);

  // Edit Page State (full-page UI matching Register New Pet)
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editForm, setEditForm] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'Male',
    dob: '',
    color: '',
    weightKg: '',
    heightCm: '',
    microchipNumber: '',
    identifyingMarks: '',
    description: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodGroup: '',
    photos: [],
    videos: [],
    healthCertificate: null,
    breedCertificate: null,
    hasExistingHealthCert: false,
    hasExistingBreedCert: false,
    visibility: {
      isPublic: true,
      showPhysicalAttributes: true,
      showCertificates: true,
      showMedia: true,
      showMedicalRecords: true,
    }
  });

  // Load user's pets if authenticated
  useEffect(() => {
    let isMounted = true;
    const fetchUserPets = async () => {
      if (user?.userId) {
        try {
          const res = await petApi.getPetsByOwner(user.userId, token);
          if (!isMounted) return;
          if (res && res.data && res.data.length > 0) {
            setUserPets(res.data);
            if (!hashFromUrl && !petIdFromUrl) {
              const firstPet = res.data[0];
              const targetHash = firstPet.qrProfileMetadata?.qrCodePayloadString || firstPet.petId;
              setActiveIdentifier(targetHash);
              setSearchParams({ hash: targetHash });
            }
          } else {
            setUserPets([]);
            if (!hashFromUrl && !petIdFromUrl) {
              setLoading(false);
            }
          }
        } catch (e) {
          console.error('Failed to fetch user pets list', e);
          if (!isMounted) return;
          if (!hashFromUrl && !petIdFromUrl) {
            setLoading(false);
          }
        }
      } else {
        if (!hashFromUrl && !petIdFromUrl) {
          setLoading(false);
        }
      }
    };
    fetchUserPets();
    return () => { isMounted = false; };
  }, [user, token, hashFromUrl, petIdFromUrl, setSearchParams]);

  // Sync active identifier when search params change
  useEffect(() => {
    if (hashFromUrl) {
      setActiveIdentifier(hashFromUrl);
    } else if (petIdFromUrl) {
      setActiveIdentifier(petIdFromUrl);
    } else if (!user?.userId) {
      setLoading(false);
    }
  }, [hashFromUrl, petIdFromUrl, user]);

  // Fetch pet profile details
  const fetchProfile = async () => {
    if (!activeIdentifier) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await petApi.getPublicProfile(activeIdentifier, token, user?.userId);
      if (response && response.data) {
        setProfileData(response.data);
        populateEditForm(response.data);
      } else {
        const errorMsg = response?.message || 'Pet profile record not found or profile is private';
        setError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching pet profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeIdentifier) {
      fetchProfile();
    } else if (!user?.userId) {
      setLoading(false);
    }
  }, [activeIdentifier, user, token]);

  // Load real Pet Medical History & Clinical Records linked to this single pet
  useEffect(() => {
    if (profileData?.petId) {
      const loadMedical = async () => {
        setLoadingMedical(true);
        try {
          const res = await medicalApi.getPetMedicalRecord(profileData.petId, profileData.petName, profileData.ownerId, token);
          if (res && res.data) {
            setPetMedicalRecord(res.data);
          } else {
            setPetMedicalRecord(null);
          }
        } catch (e) {
          console.warn("Could not load linked pet medical record", e);
        } finally {
          setLoadingMedical(false);
        }
      };
      loadMedical();
    }
  }, [profileData?.petId, token]);

  const populateEditForm = (data) => {
    const vis = data.profileVisibility || {};
    const photoUrls = (data.photos || []).map(p => typeof p === 'string' ? p : p.url).filter(Boolean);
    const videoUrls = (data.videos || []).map(v => typeof v === 'string' ? v : v.url).filter(Boolean);
    
    const hasHealthCert = data.documents?.some(d => d.documentType === 'HEALTH_CERTIFICATE') || !!data.healthCertificate;
    const hasBreedCert = data.documents?.some(d => d.documentType === 'BREED_CERTIFICATE') || !!data.breedCertificate;

    setEditForm({
      name: data.petName || '',
      species: data.species || 'Dog',
      breed: data.breed || '',
      gender: data.gender ? (data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase()) : 'Male',
      dob: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
      color: data.color || '',
      weightKg: data.weightKg || '',
      heightCm: data.heightCm || '',
      microchipNumber: data.microchipNumber || '',
      identifyingMarks: data.identifyingMarks || '',
      description: data.description || '',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      bloodGroup: data.bloodGroup || '',
      photos: photoUrls,
      videos: videoUrls,
      healthCertificate: null,
      breedCertificate: null,
      hasExistingHealthCert: hasHealthCert,
      hasExistingBreedCert: hasBreedCert,
      visibility: {
        isPublic: data.isPublic !== undefined ? data.isPublic : (vis.public !== undefined ? vis.public : true),
        showPhysicalAttributes: vis.showPhysicalAttributes !== undefined ? vis.showPhysicalAttributes : true,
        showCertificates: vis.showCertificates !== undefined ? vis.showCertificates : true,
        showMedia: vis.showMedia !== undefined ? vis.showMedia : true,
        showMedicalRecords: vis.showMedicalRecords !== undefined ? vis.showMedicalRecords : true,
      }
    });
  };

  const handleCopyLink = () => {
    const hash = profileData?.qrHash || activeIdentifier;
    const url = `${window.location.origin}/pet/public/${encodeURIComponent(hash)}`;
    navigator.clipboard.writeText(url);
    showToast('Public pet profile link copied to clipboard!', 'success');
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  const handleQuickTogglePrivacy = async () => {
    if (!profileData?.petId) return;
    const newPublicState = !profileData.isPublic;
    try {
      const payload = {
        profileVisibility: {
          isPublic: newPublicState,
          public: newPublicState,
          showPhysicalAttributes: editForm.visibility.showPhysicalAttributes,
          showCertificates: editForm.visibility.showCertificates,
          showMedia: editForm.visibility.showMedia,
          showMedicalRecords: editForm.visibility.showMedicalRecords,
        }
      };
      setProfileData(prev => ({
        ...prev,
        isPublic: newPublicState,
        profileVisibility: {
          ...prev?.profileVisibility,
          isPublic: newPublicState,
        }
      }));
      setEditForm(prev => ({ 
        ...prev, 
        visibility: { ...prev.visibility, isPublic: newPublicState } 
      }));

      const res = await petApi.updatePetProfile(profileData.petId, payload, token, user?.userId);
      if (res && (res.status === 200 || res.status === 'OK' || res.data || !res.error)) {
        showToast(`Profile visibility successfully updated to ${newPublicState ? 'Public' : 'Private'}!`, 'success');
        fetchProfile();
      } else {
        showToast(res?.message || 'Failed to update visibility', 'error');
        fetchProfile();
      }
    } catch (err) {
      showToast('Error updating profile visibility', 'error');
      fetchProfile();
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!profileData?.petId) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('ownerId', user?.userId || 'default-user');

      const basicProfile = {
        name: editForm.name,
        species: editForm.species,
        breed: editForm.breed,
        gender: editForm.gender ? editForm.gender.toUpperCase() : 'MALE',
        dateOfBirth: editForm.dob ? new Date(editForm.dob).toISOString() : null,
        baseColor: editForm.color,
        weightKg: editForm.weightKg ? parseFloat(editForm.weightKg) : null,
        heightCm: editForm.heightCm ? parseFloat(editForm.heightCm) : null,
        microchipNumber: editForm.microchipNumber,
        identifyingMarks: editForm.identifyingMarks,
        description: editForm.description,
      };

      formData.append('basicProfile', JSON.stringify(basicProfile));
      formData.append('profileVisibility', JSON.stringify(editForm.visibility));

      if (editForm.emergencyContactName || editForm.emergencyContactPhone || editForm.bloodGroup) {
        const emergency = {
          name: editForm.emergencyContactName,
          phone: editForm.emergencyContactPhone,
          bloodGroup: editForm.bloodGroup,
        };
        formData.append('emergencyContact', JSON.stringify(emergency));
      }

      (editForm.photos || []).forEach(photo => formData.append('photos', photo));
      (editForm.videos || []).forEach(video => formData.append('videos', video));

      if (editForm.healthCertificate instanceof File) {
        formData.append('healthCertificate', editForm.healthCertificate);
      }
      if (editForm.breedCertificate instanceof File) {
        formData.append('breedCertificate', editForm.breedCertificate);
      }

      const res = await petApi.updatePetProfile(profileData.petId, formData, token, user?.userId);
      if (res && (res.status === 200 || res.status === 'OK' || res.data || !res.error)) {
        showToast(`Pet profile for "${editForm.name}" updated successfully!`, 'success');
        setIsEditing(false);
        await fetchProfile();
      } else {
        showToast(res?.message || 'Failed to update pet profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving pet profile updates', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async () => {
    if (!profileData?.petId) return;
    setIsSubmitting(true);
    try {
      const res = await petApi.deletePetProfile(profileData.petId, token, user?.userId);
      if (res && (res.status === 200 || res.status === 'OK' || res.message?.includes('success') || !res.error)) {
        showToast(`Pet profile for "${profileData.petName}" deleted successfully!`, 'success');
        setIsDeleteModalOpen(false);
        navigate('/my-pets');
      } else {
        showToast(res?.message || 'Failed to delete pet profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting pet profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPet = (pet) => {
    const targetHash = pet?.qrProfileMetadata?.qrCodePayloadString || pet?.petId;
    if (targetHash) {
      setActiveIdentifier(targetHash);
      setSearchParams({ hash: targetHash });
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Deduplicate user's pets by ID/qrHash/name to ensure accurate pet count
  const uniqueUserPets = React.useMemo(() => {
    if (!Array.isArray(userPets) || userPets.length === 0) return [];
    const seen = new Set();
    return userPets.filter(p => {
      const id = String(p?.petId || p?.id || p?.qrProfileMetadata?.qrCodePayloadString || p?.basicProfile?.name || '');
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [userPets]);

  const hasMultiplePets = uniqueUserPets.length > 1;

  // Multi-Pet Switching Navigation Logic (Left/Right Arrows)
  const currentPetIndex = uniqueUserPets.findIndex(
    p => String(p.petId) === String(profileData?.petId) ||
         (profileData?.qrHash && p.qrProfileMetadata?.qrCodePayloadString === profileData.qrHash)
  );
  const activePetIdx = currentPetIndex !== -1 ? currentPetIndex : 0;
  const prevPetIdx = activePetIdx > 0 ? activePetIdx - 1 : uniqueUserPets.length - 1;
  const nextPetIdx = activePetIdx < uniqueUserPets.length - 1 ? activePetIdx + 1 : 0;
  const prevPet = uniqueUserPets[prevPetIdx];
  const nextPet = uniqueUserPets[nextPetIdx];

  const handlePrevPet = () => {
    if (!hasMultiplePets) return;
    handleSelectPet(prevPet);
  };

  const handleNextPet = () => {
    if (!hasMultiplePets) return;
    handleSelectPet(nextPet);
  };

  // Unified Gallery Media (Photos + Videos)
  const galleryMedia = [
    ...(profileData?.photos || []).map((p, idx) => ({
      type: 'image',
      url: typeof p === 'string' ? p : p.url,
      title: `${profileData?.petName || 'Pet'} Photo #${idx + 1}`
    })),
    ...(profileData?.videos || []).map((v, idx) => ({
      type: 'video',
      url: typeof v === 'string' ? v : v.url,
      title: `${profileData?.petName || 'Pet'} Video #${idx + 1}`
    }))
  ];

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
    setZoomScale(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
    setZoomScale(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleNextMedia = () => {
    if (galleryMedia.length === 0) return;
    setLightboxIndex((prev) => ((prev === null ? 0 : prev) + 1) % galleryMedia.length);
    setZoomScale(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePrevMedia = () => {
    if (galleryMedia.length === 0) return;
    setLightboxIndex((prev) => ((prev === null ? 0 : prev) - 1 + galleryMedia.length) % galleryMedia.length);
    setZoomScale(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoomScale((z) => Math.min(Number((z + 0.3).toFixed(2)), 4));
  const handleZoomOut = () => setZoomScale((z) => Math.max(Number((z - 0.3).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoomScale(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleWheelZoom = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale((z) => Math.min(Number((z + 0.2).toFixed(2)), 4));
    } else {
      setZoomScale((z) => Math.max(Number((z - 0.2).toFixed(2)), 0.5));
    }
  };

  const handleMouseDown = (e) => {
    if (zoomScale > 1) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && zoomScale > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseLightbox();
      else if (e.key === 'ArrowRight') handleNextMedia();
      else if (e.key === 'ArrowLeft') handlePrevMedia();
      else if (e.key === '+' || e.key === '=') handleZoomIn();
      else if (e.key === '-' || e.key === '_') handleZoomOut();
      else if (e.key === 'r' || e.key === 'R') handleRotate();
      else if (e.key === '0') handleResetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, galleryMedia.length]);

  // Helper for Age Calculation
  const calculateAge = (dobString) => {
    if (!dobString) return 'Not Specified';
    try {
      const birth = new Date(dobString);
      const now = new Date();
      if (isNaN(birth.getTime())) return 'Recorded';

      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years === 0 && months === 0) {
        const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        return `${days} Days Old`;
      }
      if (years === 0) {
        return `${months} ${months === 1 ? 'Month' : 'Months'} Old`;
      }
      return `${years} ${years === 1 ? 'Year' : 'Years'}${months > 0 ? ` ${months}m` : ''} Old`;
    } catch {
      return 'Recorded';
    }
  };

  const handleShare = async () => {
    const hash = profileData?.qrHash || activeIdentifier;
    const shareUrl = `${window.location.origin}/pet/public/${encodeURIComponent(hash)}`;
    const shareTitle = `${profileData?.petName || 'Pet'} Digital Identity Record`;
    const shareText = `Check out ${profileData?.petName || 'this pet'}'s official public profile on Jiva Thunai.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fall through to clipboard
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Public profile link copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy link automatically.', 'error');
    }
  };

  // Check if current user is owner
  const isPetOwner = profileData?.isOwner || 
    (user?.userId && profileData?.ownerId && (profileData.ownerId === user.userId || profileData.ownerId === String(user.userId))) ||
    (userPets.some(p => String(p.petId || p.id) === String(profileData?.petId)));

  // If another user accesses this pet in the private management page, redirect them to the new Public Page if public, or block if private
  if (!loading && profileData && !isPetOwner) {
    if (profileData.isPublic) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 sm:p-10 bg-white rounded-3xl border border-emerald-100 shadow-xl text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 mx-auto bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
            <Globe className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase tracking-wider">
              Public Pet Profile Available
            </span>
            <h2 className="text-2xl font-black text-slate-900">{profileData.petName}'s Public Profile</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              This pet belongs to another registered guardian. The owner has set this profile to <strong className="text-emerald-700 font-bold">Public</strong>. You can view its verified credentials, photos, and emergency contact on the new Public Profile page.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/pet/public/${encodeURIComponent(profileData.qrHash || activeIdentifier)}`}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl shadow-md hover:scale-[1.02] transition-all text-xs flex items-center justify-center gap-2"
            >
              <span>Open Public Profile Page</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              to="/my-pets"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-xs"
            >
              Back to My Pets
            </Link>
          </div>
        </div>
      );
    } else {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 sm:p-10 bg-white rounded-3xl border border-rose-100 shadow-xl text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 mx-auto bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="px-3.5 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-full uppercase tracking-wider">
              Private Pet Profile — Access Restricted
            </span>
            <h2 className="text-2xl font-black text-slate-900">Protected Pet Profile</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              This pet profile is private and belongs to another pet owner. Under platform policy, registered pet data and health records are strictly private and only visible to the registered owner.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/my-pets"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-md hover:bg-emerald-700 transition-all text-xs"
            >
              Back to My Registered Pets
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-xs"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin flex items-center justify-center"></div>
          <Dog className="w-8 h-8 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="text-slate-800 font-black text-xl tracking-tight">Resolving Digital Pet Identity...</div>
        <p className="text-xs text-slate-500 font-medium">Verifying cryptographic hash & national registry credentials</p>
      </div>
    );
  }

  // If no pets registered and no profile loaded
  if (!profileData && userPets.length === 0 && !activeIdentifier) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-emerald-100 shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
          <Dog className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">No Pet Profiles Found</h2>
          <p className="text-sm text-slate-500">
            You don't have any registered pets associated with this profile view yet.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/register-pet')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all text-sm"
          >
            Register New Pet
          </button>
          <button
            onClick={() => navigate('/my-pets')}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
          >
            Go to My Registered Pets
          </button>
        </div>
      </div>
    );
  }

  // If error and profile cannot be resolved
  if (error && !profileData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-100 shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 mx-auto bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">No Pet Record Found</h2>
          <p className="text-sm text-rose-600 font-medium">{error}</p>
          <p className="text-xs text-slate-400">
            The requested digital pet identity could not be located in the national registry or has restricted visibility.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/my-pets"
            className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-all"
          >
            My Pets Directory
          </Link>
          <Link
            to="/register-pet"
            className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Register New Pet
          </Link>
        </div>
      </div>
    );
  }

  // Fallback if no profile data resolved
  if (!profileData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-emerald-100 shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
          <Dog className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">No Pet Records Available</h2>
          <p className="text-sm text-slate-500">
            No pet profile records are currently active for this account.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register-pet"
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all text-sm"
          >
            Register New Pet
          </Link>
          <Link
            to="/my-pets"
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
          >
            View Registered Pets
          </Link>
        </div>
      </div>
    );
  }

  // If in Edit Mode (Dedicated Full-Page Editor matching Register Pet UI)
  if (isEditing) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in">
        {/* Header Bar - Clean & Container-Free */}
        <PageHeader
          title="Update Profile & Records"
          titleIcon={Edit3}
          description={
            <span>
              Modifying official record for <span className="font-bold text-slate-800">{profileData?.petName}</span> • Changes update cryptographic QR record instantly.
            </span>
          }
          variant="emerald"
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel
              </button>
            </div>
          }
        />

        {/* Full Page Edit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm">
          <form onSubmit={handleSaveEdit} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column - Core Info */}
              <div className="w-full md:w-1/3 flex flex-col space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                    <Dog className="w-5 h-5 text-emerald-500"/> Basic Identity
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Official registered pet profile details.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Pet Name *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Species *</label>
                    <select
                      value={editForm.species}
                      onChange={(e) => setEditForm({ ...editForm, species: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Breed *</label>
                    <input
                      type="text"
                      value={editForm.breed}
                      onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Gender *</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">DOB *</label>
                      <input
                        type="date"
                        value={editForm.dob}
                        onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Physical Attributes</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Coat Color</label>
                      <input
                        type="text"
                        value={editForm.color}
                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                        placeholder="e.g. Golden / Fawn"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Microchip Number</label>
                      <input
                        type="text"
                        value={editForm.microchipNumber}
                        onChange={(e) => setEditForm({ ...editForm, microchipNumber: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold font-mono"
                        placeholder="e.g. 981020004819201"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.weightKg}
                          onChange={(e) => setEditForm({ ...editForm, weightKg: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                          placeholder="e.g. 24.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Height (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.heightCm}
                          onChange={(e) => setEditForm({ ...editForm, heightCm: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                          placeholder="e.g. 55"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-rose-500" /> Emergency & Health Record
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={editForm.emergencyContactName}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                        placeholder="Guardian / Co-owner Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Emergency Phone</label>
                      <input
                        type="text"
                        value={editForm.emergencyContactPhone}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Blood Group</label>
                      <input
                        type="text"
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                        placeholder="e.g. DEA 1.1 Positive"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Media, Certs & Privacy */}
              <div className="w-full md:w-2/3 flex flex-col space-y-6">
                
                {/* Secure Certificates (PDF) Display, Preview & Update */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600"/> Secure Certificates & Legal Records (PDF)
                    </h3>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                      Tamper-Proof S3 Storage
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Official veterinary health and breed pedigree certificates. Preview existing documents or upload replacement files below.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* 1. Official Health Certificate Card */}
                    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">Veterinary Health Certificate</h4>
                            <p className="text-[11px] text-slate-500">Vaccination, deworming & fitness proof</p>
                          </div>
                        </div>

                        {/* Existing file status & preview button */}
                        {editForm.hasExistingHealthCert && !editForm.healthCertificate && (
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>Current PDF on file</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveCertificate({ 
                                type: 'Veterinary Health Certificate', 
                                url: `http://localhost:8080/api/v1/pets/${profileData?.petId}/secure-preview/HEALTH_CERTIFICATE` 
                              })}
                              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview PDF</span>
                            </button>
                          </div>
                        )}

                        {/* Newly selected replacement file */}
                        {editForm.healthCertificate && (
                          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-teal-900 truncate">
                                <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                <span className="truncate">{editForm.healthCertificate.name}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-teal-700 whitespace-nowrap">
                                {(editForm.healthCertificate.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-teal-200/60">
                              <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1"><Check className="w-3 h-3 text-teal-600 inline mr-1" />Ready to update on save</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveCertificate({ 
                                    type: `Preview: ${editForm.healthCertificate.name}`, 
                                    url: URL.createObjectURL(editForm.healthCertificate) 
                                  })}
                                  className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm(prev => ({ ...prev, healthCertificate: null }))}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                                  title="Remove new selection"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!editForm.hasExistingHealthCert && !editForm.healthCertificate && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-medium text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>No health certificate attached yet.</span>
                          </div>
                        )}
                      </div>

                      {/* File Upload / Update Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {editForm.hasExistingHealthCert ? 'Update / Replace Health Certificate (PDF):' : 'Upload Health Certificate (PDF):'}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf"
                            id="health-cert-upload"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  showToast('File size exceeds maximum 5 MB limit', 'error');
                                  return;
                                }
                                setEditForm(prev => ({ ...prev, healthCertificate: file }));
                                showToast(`Selected "${file.name}" for Health Certificate`, 'success');
                              }
                            }}
                          />
                          <label
                            htmlFor="health-cert-upload"
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-emerald-50 border border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-emerald-700 cursor-pointer transition-all shadow-sm group"
                          >
                            <UploadCloud className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span>{editForm.hasExistingHealthCert || editForm.healthCertificate ? 'Choose New PDF to Replace' : 'Choose PDF Document (Max 5MB)'}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 2. Official Breed Certificate Card */}
                    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">Breed Pedigree Certificate</h4>
                            <p className="text-[11px] text-slate-500">Lineage & municipal pedigree proof</p>
                          </div>
                        </div>

                        {/* Existing file status & preview button */}
                        {editForm.hasExistingBreedCert && !editForm.breedCertificate && (
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>Current PDF on file</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveCertificate({ 
                                type: 'Breed Pedigree Certificate', 
                                url: `http://localhost:8080/api/v1/pets/${profileData?.petId}/secure-preview/BREED_CERTIFICATE` 
                              })}
                              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview PDF</span>
                            </button>
                          </div>
                        )}

                        {/* Newly selected replacement file */}
                        {editForm.breedCertificate && (
                          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-teal-900 truncate">
                                <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                <span className="truncate">{editForm.breedCertificate.name}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-teal-700 whitespace-nowrap">
                                {(editForm.breedCertificate.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-teal-200/60">
                              <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1"><Check className="w-3 h-3 text-teal-600 inline mr-1" />Ready to update on save</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveCertificate({ 
                                    type: `Preview: ${editForm.breedCertificate.name}`, 
                                    url: URL.createObjectURL(editForm.breedCertificate) 
                                  })}
                                  className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditForm(prev => ({ ...prev, breedCertificate: null }))}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                                  title="Remove new selection"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!editForm.hasExistingBreedCert && !editForm.breedCertificate && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-medium text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>No breed certificate attached yet.</span>
                          </div>
                        )}
                      </div>

                      {/* File Upload / Update Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {editForm.hasExistingBreedCert ? 'Update / Replace Breed Certificate (PDF):' : 'Upload Breed Certificate (PDF):'}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf"
                            id="breed-cert-upload"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  showToast('File size exceeds maximum 5 MB limit', 'error');
                                  return;
                                }
                                setEditForm(prev => ({ ...prev, breedCertificate: file }));
                                showToast(`Selected "${file.name}" for Breed Certificate`, 'success');
                              }
                            }}
                          />
                          <label
                            htmlFor="breed-cert-upload"
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-emerald-50 border border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-emerald-700 cursor-pointer transition-all shadow-sm group"
                          >
                            <UploadCloud className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span>{editForm.hasExistingBreedCert || editForm.breedCertificate ? 'Choose New PDF to Replace' : 'Choose PDF Document (Max 5MB)'}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Media & Description */}
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-500"/> Media & Description
                  </h3>
                  <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Description / Health Guidelines</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                        rows="3"
                        placeholder="Provide details about temperament, allergies, dietary needs, or unique markings..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-emerald-500" /> Photos (Max 6)
                        </label>
                        <MediaUploader 
                          type="image" 
                          maxFiles={6} 
                          initialFiles={editForm.photos}
                          onUploadComplete={(url) => setEditForm(prev => ({ ...prev, photos: [...prev.photos, url] }))} 
                          onRemove={(url) => setEditForm(prev => ({ ...prev, photos: prev.photos.filter(p => p !== url) }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-emerald-500" /> Videos (Max 2)
                        </label>
                        <MediaUploader 
                          type="video" 
                          maxFiles={2} 
                          initialFiles={editForm.videos}
                          onUploadComplete={(url) => setEditForm(prev => ({ ...prev, videos: [...prev.videos, url] }))} 
                          onRemove={(url) => setEditForm(prev => ({ ...prev, videos: prev.videos.filter(v => v !== url) }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-500"/> Profile Privacy & Sharing
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-800">Make Profile Public</span>
                        <p className="text-xs text-slate-500">Allow public visitors scanning the QR code to view this pet's profile.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editForm.visibility.isPublic} 
                          onChange={(e) => setEditForm(prev => ({
                            ...prev, 
                            visibility: { ...prev.visibility, isPublic: e.target.checked }
                          }))} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {editForm.visibility.isPublic && (
                      <div className="pl-4 space-y-2.5 border-l-2 border-emerald-300 pt-2 text-xs font-semibold text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Show Physical Attributes</span>
                          <input 
                            type="checkbox" 
                            checked={editForm.visibility.showPhysicalAttributes} 
                            onChange={(e) => setEditForm(prev => ({
                              ...prev, 
                              visibility: { ...prev.visibility, showPhysicalAttributes: e.target.checked }
                            }))} 
                            className="rounded text-emerald-600 w-4 h-4" 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Show Secure Certificates</span>
                          <input 
                            type="checkbox" 
                            checked={editForm.visibility.showCertificates} 
                            onChange={(e) => setEditForm(prev => ({
                              ...prev, 
                              visibility: { ...prev.visibility, showCertificates: e.target.checked }
                            }))} 
                            className="rounded text-emerald-600 w-4 h-4" 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Show Media Gallery</span>
                          <input 
                            type="checkbox" 
                            checked={editForm.visibility.showMedia} 
                            onChange={(e) => setEditForm(prev => ({
                              ...prev, 
                              visibility: { ...prev.visibility, showMedia: e.target.checked }
                            }))} 
                            className="rounded text-emerald-600 w-4 h-4" 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Show Medical & Vaccination Records</span>
                          <input 
                            type="checkbox" 
                            checked={editForm.visibility.showMedicalRecords} 
                            onChange={(e) => setEditForm(prev => ({
                              ...prev, 
                              visibility: { ...prev.visibility, showMedicalRecords: e.target.checked }
                            }))} 
                            className="rounded text-emerald-600 w-4 h-4" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 mt-8">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Updates...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Update Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Certificate Viewer Modal in Edit Mode */}
        {activeCertificate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{activeCertificate.type}</h3>
                    <p className="text-xs text-slate-500 font-medium">Viewing secure document preview.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setActiveCertificate(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <SecurePdfViewer url={activeCertificate.url} token={token} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const displayProfileId = (profileData?.qrHash && profileData.qrHash.startsWith('JIVA-'))
    ? profileData.qrHash
    : (profileData?.petId
        ? `JIVA-IND-2026-${String(profileData.petId).replace(/-/g, '').substring(0, 4).toUpperCase()}-${String(profileData.petId).replace(/-/g, '').substring(4, 8).toUpperCase()}`
        : 'JIVA-IND-2026-9B4C-8F12');

  return (
    <>
      <div className="w-full space-y-6 pb-24 max-w-6xl mx-auto animate-in fade-in">

        {/* Page Header - Clean & Container-Free */}
        <PageHeader
          badgeText="SOVEREIGN PET PASSPORT"
          badgeIcon={ShieldCheck}
          title="Digital QR Profile & Health Passport"
          titleIcon={QrCode}
          variant="emerald"
          description="Official sovereign pet registry identity with tamper-proof cryptographic QR verification, ownership deeds, and linked medical history."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/my-pets')}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                My Pets Directory
              </button>
              <button
                onClick={() => navigate('/register-pet')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register Pet</span>
              </button>
            </div>
          }
        />

        {/* HERO PASSPORT IDENTITY SECTION CONTAINER WITH LEFT & RIGHT SWITCHER ARROWS */}
        <div className="relative">
          
          {/* Left Arrow on Hero Section Container at Center (Only displayed if owner has more than 1 pet) */}
          {hasMultiplePets && (
            <button
              type="button"
              onClick={handlePrevPet}
              title={`Switch to ${prevPet?.basicProfile?.name || prevPet?.name || 'Previous Pet'}`}
              aria-label="Previous Pet"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-emerald-200/90 shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
              
              {/* Pet Preview Popover on hover */}
              <div className="pointer-events-none absolute left-full ml-2.5 hidden group-hover:flex items-center gap-2 bg-slate-900/95 text-white p-1.5 px-3 rounded-2xl shadow-xl backdrop-blur-md whitespace-nowrap animate-in fade-in z-40">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Previous:</span>
                <span className="text-xs font-bold text-white">{prevPet?.basicProfile?.name || prevPet?.name || 'Pet'}</span>
              </div>
            </button>
          )}

          {/* Right Arrow on Hero Section Container at Center (Only displayed if owner has more than 1 pet) */}
          {hasMultiplePets && (
            <button
              type="button"
              onClick={handleNextPet}
              title={`Switch to ${nextPet?.basicProfile?.name || nextPet?.name || 'Next Pet'}`}
              aria-label="Next Pet"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-emerald-200/90 shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              
              {/* Pet Preview Popover on hover */}
              <div className="pointer-events-none absolute right-full mr-2.5 hidden group-hover:flex items-center gap-2 bg-slate-900/95 text-white p-1.5 px-3 rounded-2xl shadow-xl backdrop-blur-md whitespace-nowrap animate-in fade-in z-40">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Next:</span>
                <span className="text-xs font-bold text-white">{nextPet?.basicProfile?.name || nextPet?.name || 'Pet'}</span>
              </div>
            </button>
          )}

          {/* HERO PASSPORT IDENTITY HEADER BANNER */}
          <div className="relative bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-emerald-100/60 text-slate-900 rounded-3xl py-2.5 sm:py-3 px-6 sm:px-8 overflow-hidden shadow-sm border border-emerald-200/70">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-teal-300/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left/Center: Avatar + Identity Details & Action Buttons Next to Image */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
              <div 
                onClick={() => galleryMedia.length > 0 && handleOpenLightbox(0)}
                className="relative group flex-shrink-0 cursor-pointer self-center" 
                title="Click to view full high-res photo"
              >
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-emerald-400 shadow-md group-hover:scale-105 transition-all">
                  <img 
                    src={profileData.primaryPhotoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80"} 
                    alt={profileData.petName} 
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ZoomIn className="w-8 h-8" />
                  </div>
                </div>
                <span 
                  className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-3 p-1.5 sm:p-2 bg-emerald-600 text-white rounded-full shadow-md border-2 border-white flex items-center justify-center transition-transform group-hover:scale-110 z-10" 
                  title="Cryptographically Verified Identity"
                >
                  <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </span>
              </div>

              <div className="space-y-1.5 flex-1">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">{profileData.petName}</h1>
                  {/* Below Pet Name: Plain Text Breed without label/box and without species prefix */}
                  <p className="text-xs sm:text-sm font-bold text-emerald-800 tracking-wide mt-1">
                    {profileData.breed || profileData.species}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium flex-wrap">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <Award className="w-3.5 h-3.5 text-emerald-600" /> Official Digital Identity Record
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                  <div className="inline-flex items-center gap-2 bg-white/90 border border-emerald-200/80 px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase font-sans">Official Profile ID:</span>
                    <span className="text-emerald-700 font-black tracking-wider">{displayProfileId}</span>
                    <button 
                      onClick={handleCopyLink} 
                      title="Copy Public Profile Link" 
                      className="text-slate-400 hover:text-emerald-600 transition-colors ml-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons Bar placed directly next to image */}
                {isPetOwner && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      onClick={handleQuickTogglePrivacy}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                        profileData.isPublic 
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border-emerald-200' 
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                      title="Toggle public/private visibility"
                    >
                      {profileData.isPublic ? <Lock className="w-3.5 h-3.5 text-slate-600" /> : <Globe className="w-3.5 h-3.5 text-amber-700" />}
                      <span>{profileData.isPublic ? 'Set Private' : 'Set Public'}</span>
                    </button>

                    {profileData.isPublic && (
                      <Link
                        to={`/pet/public/${encodeURIComponent(profileData.qrHash || activeIdentifier)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        title="View the dedicated Public Page other users will see"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Public Page ↗</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        populateEditForm(profileData);
                        setIsEditing(true);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Profile</span>
                    </button>

                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right End: Compact Perfectly-Aligned QR & Status Column */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-full sm:w-auto">
              {/* Public / Private Badge in Camel Case neatly aligned on top of QR with increased comfortable width */}
              <span className={`w-full sm:w-36 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap ${
                profileData.isPublic 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {profileData.isPublic ? <Globe className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" /> : <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />}
                <span>{profileData.isPublic ? 'Public Profile' : 'Private Profile'}</span>
              </span>

              {/* QR Image Box - Compact white frame container without reducing QR size */}
              <div className="bg-white p-1 rounded-xl border border-emerald-200/80 shadow-sm flex items-center justify-center">
                <img 
                  src={`http://localhost:8080/api/v1/pets/qr/${displayProfileId}`} 
                  alt="Cryptographic QR Profile" 
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg hover:scale-105 transition-transform"
                />
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-36 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
                title="Share Profile"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            </div>

          </div>
        </div>
      </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 border ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Identity & Biometrics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('medical')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 border ${
                activeTab === 'medical'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Medical & Vaccines</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 border ${
                activeTab === 'certificates'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Legal Certificates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 border ${
                activeTab === 'media'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photo & Video Gallery ({galleryMedia.length})</span>
            </button>
          </div>
        </div>

        {/* MAIN 2-COLUMN WEBSITE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDEBAR: Emergency Contacts & Legal Credentials */}
          <div className="space-y-6">

            {/* Emergency Handler / Guardian Card */}
            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  Emergency Caregiver Contact
                </h3>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full">
                  24/7 Hotline
                </span>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2.5">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Registered Guardian</p>
                  <p className="text-sm font-black text-slate-900">{profileData.emergencyContactName || 'Primary Registered Guardian'}</p>
                </div>

                {profileData.emergencyContactPhone ? (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Emergency Phone</p>
                    <a 
                      href={`tel:${profileData.emergencyContactPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all mt-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {profileData.emergencyContactPhone}</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No direct contact override specified.</p>
                )}
              </div>
            </div>

            {/* Official Legal Registry Credentials */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Government & Legal Registry
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Municipal License</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800">{profileData.municipalLicenseNumber || 'Registered'}</span>
                    {profileData.municipalLicenseNumber && (
                      <button onClick={() => handleCopyText(profileData.municipalLicenseNumber, 'Municipal License')} className="text-slate-400 hover:text-emerald-600">
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Legal Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {profileData.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium">Statutory Compliance</span>
                  <span className="font-bold text-slate-800">PCA Act 1960</span>
                </div>

                {profileData.registrationDate && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-medium">Registration Date</span>
                    <span className="font-bold text-slate-800">{new Date(profileData.registrationDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Passport Security Badge */}
            <div className="p-4 bg-emerald-50/60 rounded-3xl border border-emerald-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-black text-emerald-950">Cryptographically Signed</p>
                <p className="text-[11px] text-slate-500">Tamper-proof digital pet identity</p>
              </div>
            </div>

          </div>

          {/* RIGHT MAIN CONTENT AREA - STRUCTURED TABS */}
          <div className="lg:col-span-2 space-y-6">

            {/* TAB 1: OVERVIEW & BIOMETRIC PASSPORT */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Physical Specifications Grid */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Dog className="w-5 h-5 text-emerald-600" />
                        Biometric & Physical Identification
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Verified physical attributes recorded in national database</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                      Verified Records
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Gender
                      </div>
                      <p className="text-sm font-black text-slate-800 capitalize">{profileData.gender?.toLowerCase() || 'Male'}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Age & DOB
                      </div>
                      <p className="text-sm font-black text-slate-800">{calculateAge(profileData.dateOfBirth)}</p>
                      <p className="text-[10px] text-slate-400">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Recorded'}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                        <Droplet className="w-3.5 h-3.5 text-rose-500" /> Blood Group
                      </div>
                      <p className="text-sm font-black text-rose-700">{profileData.bloodGroup || 'Standard Profile'}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                        <Scale className="w-3.5 h-3.5 text-emerald-600" /> Weight
                      </div>
                      <p className="text-sm font-black text-slate-800">{profileData.weightKg ? `${profileData.weightKg} kg` : 'Recorded'}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                        <Ruler className="w-3.5 h-3.5 text-emerald-600" /> Height
                      </div>
                      <p className="text-sm font-black text-slate-800">{profileData.heightCm ? `${profileData.heightCm} cm` : 'Recorded'}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Base Coat Color
                      </div>
                      <p className="text-sm font-black text-slate-800 capitalize">{profileData.color || 'Recorded'}</p>
                    </div>

                    {/* Microchip Banner */}
                    <div className="col-span-2 sm:col-span-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-2xl border border-emerald-200/80 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">ISO 11784/11785 Microchip RFID Number</span>
                          <p className="text-sm font-mono font-black text-slate-900 mt-0.5">
                            {profileData.microchipNumber || 'CHIP-NOT-ASSIGNED'}
                          </p>
                        </div>
                      </div>
                      {profileData.microchipNumber && (
                        <button
                          onClick={() => handleCopyText(profileData.microchipNumber, 'Microchip Number')}
                          className="px-3 py-1.5 bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Chip ID</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Narrative & Special Guidelines */}
                {profileData.description && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Temperament, Guidelines & Special Instructions
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 whitespace-pre-line">
                      {profileData.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MEDICAL, VACCINATIONS & CARE */}
            {activeTab === 'medical' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Clinical Header Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 w-fit">
                      <Stethoscope className="w-3.5 h-3.5" />
                      Pet Medical History Profile
                    </span>
                    <h3 className="text-xl font-black">Official Clinical Records & Immunization Vault</h3>
                    <p className="text-xs text-emerald-100/90 max-w-xl">
                      Live clinical health history strictly linked to {profileData.petName || 'this pet'}'s Digital Passport.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/medical?petId=${profileData.petId}`)}
                    className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] shrink-0"
                  >
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>Open Full Clinical Timeline</span>
                  </button>
                </div>

                {/* Active Allergies Section */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      Allergies & Medical Warnings
                    </h3>
                    {petMedicalRecord?.allergies?.length > 0 ? (
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">
                        {petMedicalRecord.allergies.length} Active Warnings
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                        No Known Allergies
                      </span>
                    )}
                  </div>

                  {petMedicalRecord?.allergies && petMedicalRecord.allergies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {petMedicalRecord.allergies.map((alg, i) => (
                        <div key={i} className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-rose-950 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {alg.allergen}
                            </span>
                            <span className="px-2 py-0.5 bg-rose-200 text-rose-900 text-[9px] font-black rounded uppercase">
                              {alg.severity || 'SEVERE'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">{alg.reaction || 'Adverse allergic reaction'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <p className="text-xs text-slate-500 font-medium">No acute drug, food, or environmental allergies reported for this pet.</p>
                    </div>
                  )}
                </div>

                {/* Vaccination History & Schedule */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        Vaccination History & Booster Schedule
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Officially recorded veterinary booster shots and certificate proofs</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                      {(petMedicalRecord?.vaccinationSchedule?.length || 0)} Recorded
                    </span>
                  </div>

                  {petMedicalRecord?.vaccinationSchedule && petMedicalRecord.vaccinationSchedule.length > 0 ? (
                    <div className="space-y-3">
                      {petMedicalRecord.vaccinationSchedule.map((vax, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900">{vax.vaccineName}</p>
                              {vax.status === 'ADMINISTERED' && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-md">
                                  VERIFIED
                                </span>
                              )}
                              {vax.status === 'OVERDUE' && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-black rounded-md">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              Administered: <strong className="text-slate-700">{vax.administeredDate ? new Date(vax.administeredDate).toLocaleDateString() : 'Pending'}</strong> • Doctor: {vax.doctorName || 'Authorized Vet'} {vax.batchNumber ? `(Batch: ${vax.batchNumber})` : ''}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs whitespace-nowrap">
                              Next Due: {vax.nextDueDate ? new Date(vax.nextDueDate).toLocaleDateString() : 'N/A'}
                            </span>
                            {vax.certificateUrl && (
                              <button
                                onClick={() => setActiveCertificate({ type: `${vax.vaccineName} Proof`, url: vax.certificateUrl })}
                                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 shadow-xs flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Inspect Proof</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : profileData.vaccinationHistory && profileData.vaccinationHistory.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.vaccinationHistory.map((vax, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                          <div className="space-y-0.5">
                            <p className="text-sm font-black text-slate-900">{vax.name}</p>
                            <p className="text-xs text-slate-500">Administered on: <strong className="text-slate-700">{vax.date}</strong> by {vax.doctor || 'Registered Vet'}</p>
                          </div>
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                            Next Due: {vax.nextDue}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-800">Primary Core Vaccines Administered</p>
                      <p className="text-xs text-slate-500">Rabies (1 Year), DHPP Core, and Deworming records verified during national municipal registry enrollment.</p>
                    </div>
                  )}
                </div>

                {/* Clinical E-Prescriptions Archive */}
                {petMedicalRecord?.clinicalEPrescriptions && petMedicalRecord.clinicalEPrescriptions.length > 0 && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Clinical E-Prescriptions Archive
                    </h3>
                    <div className="space-y-3">
                      {petMedicalRecord.clinicalEPrescriptions.map((rx, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
                            <div>
                              <p className="font-black text-sm text-slate-900">Diagnosis: {rx.diagnosedIllness}</p>
                              <p className="text-slate-500 text-[11px]">{rx.doctorName} • {rx.clinicName}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold self-start sm:self-auto">
                              {rx.visitDate ? new Date(rx.visitDate).toLocaleDateString() : 'Signed E-Rx'}
                            </span>
                          </div>
                          {rx.medicines && rx.medicines.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              {rx.medicines.map((m, mIdx) => (
                                <span key={mIdx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                  <Pill className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{m.medicineName} ({m.dosage})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency & Vet Quick Access */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    Biometrics & Clinical Baseline
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Blood Compatibility</span>
                      <p className="text-sm font-black text-slate-800">{petMedicalRecord?.bloodGroup || profileData.bloodGroup || 'Standard Group'}</p>
                      <p className="text-xs text-slate-500">Transfusion pre-screened</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Recorded Weight</span>
                      <p className="text-sm font-black text-slate-800">
                        {petMedicalRecord?.vitalSignsHistory?.length > 0 ? `${petMedicalRecord.vitalSignsHistory[0].weightKg} kg` : (profileData.weightKg ? `${profileData.weightKg} kg` : 'Standard')}
                      </p>
                      <p className="text-xs text-slate-500">Body mass index benchmark</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">Sterilization Status</span>
                      <p className="text-sm font-black text-slate-800">
                        {profileData.isSterilized !== undefined ? (profileData.isSterilized ? 'Sterilized' : 'Intact') : (petMedicalRecord?.isSterilized ? 'Sterilized' : 'Intact')}
                      </p>
                      <p className="text-xs text-slate-500">Reproductive status verification</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LEGAL CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        Official Verified Legal Certificates
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Digitally authenticated PDF certificates stored on secure persistent storage</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Protected Preview</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Health Certificate Card */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">Veterinary Health Certificate</span>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">PDF Record</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Official veterinary inspection and certified immunization records for travel, boarding, and compliance.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveCertificate({ type: 'HEALTH_CERTIFICATE', url: `http://localhost:8080/api/v1/pets/${profileData.petId}/secure-preview/HEALTH_CERTIFICATE` })}
                        className="w-full py-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>View Health Certificate</span>
                      </button>
                    </div>

                    {/* Breed Certificate Card */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">Pedigree & Breed Certificate</span>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">PDF Record</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Lineage verification, breed standard authenticity, and municipal pedigree registry proof.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveCertificate({ type: 'BREED_CERTIFICATE', url: `http://localhost:8080/api/v1/pets/${profileData.petId}/secure-preview/BREED_CERTIFICATE` })}
                        className="w-full py-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>View Breed Certificate</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PHOTO & VIDEO GALLERY */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-600" />
                        Photo & Video Gallery
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Click on any photo or video to zoom, inspect, or play in interactive popup</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{galleryMedia.length} Media {galleryMedia.length === 1 ? 'Item' : 'Items'}</span>
                  </div>

                  {galleryMedia.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {galleryMedia.map((media, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleOpenLightbox(idx)}
                          className="group relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer bg-slate-950"
                          title="Click to view in interactive full-screen popup"
                        >
                          {media.type === 'image' ? (
                            <img 
                              src={media.url} 
                              alt={media.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                              <video 
                                src={media.url} 
                                className="w-full h-full object-cover opacity-80" 
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm text-emerald-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/30">
                              {media.type === 'image' ? (
                                <>
                                  <ZoomIn className="w-3.5 h-3.5" />
                                  <span>Zoom & Inspect</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Play Video</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Top Type Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                            {media.type === 'image' ? <ImageIcon className="w-3 h-3 text-emerald-400" /> : <Video className="w-3 h-3 text-emerald-400" />}
                            <span>{media.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200/80 text-center space-y-2">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No Gallery Photos or Videos</p>
                      <p className="text-xs text-slate-400">Owner can click "Update Profile" to upload photos and videos.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
      
      {/* Interactive Photo & Video Lightbox Popup Modal */}
      {lightboxIndex !== null && galleryMedia[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-[150] bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between select-none animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseLightbox();
          }}
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md border-b border-white/10 text-white z-20">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                {galleryMedia[lightboxIndex].type} {lightboxIndex + 1} of {galleryMedia.length}
              </div>
              <h3 className="text-sm font-bold text-slate-200 hidden sm:block">
                {profileData?.petName} • {galleryMedia[lightboxIndex].title}
              </h3>
            </div>

            {/* Interactive Zoom / Rotate Controls */}
            <div className="flex items-center gap-2">
              {galleryMedia[lightboxIndex].type === 'image' && (
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 mr-2">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 0.5}
                    className="p-2 hover:bg-white/20 rounded-xl text-slate-200 disabled:opacity-30 transition-colors"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 hover:bg-white/10 rounded-lg transition-colors"
                    title="Reset Zoom (0)"
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 4}
                    className="p-2 hover:bg-white/20 rounded-xl text-slate-200 disabled:opacity-30 transition-colors"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="w-[1px] h-4 bg-white/20 mx-1"></div>

                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-2 hover:bg-white/20 rounded-xl text-slate-200 transition-colors"
                    title="Rotate 90° (R)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-2 hover:bg-white/20 rounded-xl text-slate-200 transition-colors"
                    title="Reset Position & Zoom"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-2.5 bg-white/10 hover:bg-rose-600/80 rounded-2xl text-white transition-all border border-white/10"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area with Drag / Zoom / Pan */}
          <div 
            ref={imageContainerRef}
            onWheel={galleryMedia[lightboxIndex].type === 'image' ? handleWheelZoom : undefined}
            onMouseDown={galleryMedia[lightboxIndex].type === 'image' ? handleMouseDown : undefined}
            onMouseMove={galleryMedia[lightboxIndex].type === 'image' ? handleMouseMove : undefined}
            onMouseUp={galleryMedia[lightboxIndex].type === 'image' ? handleMouseUp : undefined}
            onMouseLeave={galleryMedia[lightboxIndex].type === 'image' ? handleMouseUp : undefined}
            className="flex-1 relative flex items-center justify-center overflow-hidden p-4 sm:p-8 cursor-default"
          >
            {/* Left Navigation Arrow */}
            {galleryMedia.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrevMedia(); }}
                className="absolute left-4 sm:left-8 z-30 p-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all border border-white/20 hover:scale-110 shadow-2xl"
                title="Previous Media (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Media Item */}
            {galleryMedia[lightboxIndex].type === 'image' ? (
              <div 
                className="transition-transform select-none"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale}) rotate(${rotation}deg)`,
                  transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                  cursor: zoomScale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in'
                }}
                onDoubleClick={handleResetZoom}
              >
                <img
                  src={galleryMedia[lightboxIndex].url}
                  alt={galleryMedia[lightboxIndex].title}
                  draggable={false}
                  className="max-h-[70vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10 pointer-events-none"
                />
              </div>
            ) : (
              <div className="max-h-[70vh] max-w-[85vw] flex items-center justify-center">
                <video
                  src={galleryMedia[lightboxIndex].url}
                  controls
                  autoPlay
                  playsInline
                  loop
                  className="max-h-[70vh] max-w-[85vw] rounded-2xl shadow-2xl border border-white/20 bg-black"
                />
              </div>
            )}

            {/* Right Navigation Arrow */}
            {galleryMedia.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleNextMedia(); }}
                className="absolute right-4 sm:right-8 z-30 p-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all border border-white/20 hover:scale-110 shadow-2xl"
                title="Next Media (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip & Shortcuts */}
          <div className="p-4 sm:p-5 bg-slate-900/80 backdrop-blur-md border-t border-white/10 z-20 flex flex-col items-center gap-3">
            {/* Thumbnail Row */}
            {galleryMedia.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-1 px-2 scrollbar-none">
                {galleryMedia.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOpenLightbox(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      idx === lightboxIndex 
                        ? 'border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/50' 
                        : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-current text-emerald-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Keyboard Shortcuts Hint */}
            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400 flex-wrap justify-center">
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">Esc</kbd> Close</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">→</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">+</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">-</kbd> Zoom</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">R</kbd> Rotate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">0</kbd> Reset</span>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {activeCertificate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-black text-slate-800">{activeCertificate.type}</h3>
                  <p className="text-xs text-slate-500 font-medium">Viewing secure document. Screenshots and downloads are disabled.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveCertificate(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <SecurePdfViewer url={activeCertificate.url} token={token} />
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">Delete Pet Profile?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete the profile for <strong className="text-slate-800 font-black">{profileData?.petName}</strong>? This will remove all registry records, cryptographic QR codes, and digital certificates.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeletePet}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
