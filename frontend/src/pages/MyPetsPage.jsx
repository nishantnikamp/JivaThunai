import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { petApi } from '../services/api';
import { Dog, Plus, MapPin, Calendar, Heart, ShieldCheck, FileCheck, Stethoscope, Globe, Lock, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export const MyPetsPage = () => {
  const { user, token } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const response = await petApi.getPetsByOwner(user.userId, token);
        if (response && response.data) {
          setPets(response.data);
        } else {
          setPets([]);
        }
      } catch (err) {
        setError('Failed to fetch registered pets.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.userId) {
      fetchPets();
    }
  }, [user, token]);

  const handleOpenProfile = (pet) => {
    const hash = pet?.qrProfileMetadata?.qrCodePayloadString || pet?.qrCodeHash;
    if (hash && hash !== 'N/A') {
      navigate(`/Profile?hash=${encodeURIComponent(hash)}`);
    } else if (pet?.petId || pet?.id) {
      navigate(`/Profile?petId=${pet.petId || pet.id}`);
    } else {
      navigate('/Profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-600 font-bold">
        <Dog className="w-8 h-8 animate-bounce mr-3" /> Loading your registered pets...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <PageHeader
        badgeIcon={ShieldCheck}
        badgeText="Verified Ownership"
        badgeVariant="emerald"
        title="My Registered Pets"
        titleIcon={Dog}
        description="Manage your pet's digital identity, municipal licenses, medical records, and cryptographic profiles all in one place."
        actions={
          <button 
            onClick={() => navigate('/register-pet')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Pet</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl border border-rose-200 font-bold text-center">
          {error}
        </div>
      )}

      {/* Pet Grid */}
      {pets.length === 0 && !error ? (
        <div className="bg-slate-50/50 rounded-3xl p-12 border-2 border-dashed border-emerald-200 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 text-emerald-300">
            <Dog className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No Pets Registered Yet</h3>
          <p className="text-sm text-slate-500 max-w-md">
            You haven't registered any pets on the platform. Register your pet today to generate their digital profile and maintain their secure medical history.
          </p>
          <button 
            onClick={() => navigate('/register-pet')}
            className="mt-4 px-6 py-2.5 bg-white border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Register My First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div 
              key={pet.petId} 
              onClick={() => handleOpenProfile(pet)}
              className="bg-white rounded-3xl overflow-hidden border border-emerald-100 shadow-md hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 cursor-pointer group flex flex-col hover:-translate-y-1"
            >
              {/* Pet Card Image Header */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img 
                  src={(pet.mediaGallery?.photos?.find(p => p.isPrimary)?.url) || (pet.mediaGallery?.photos?.[0]?.url) || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"} 
                  alt={pet.basicProfile?.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-black drop-shadow-md">{pet.basicProfile?.name}</h3>
                  <p className="text-sm font-medium text-emerald-200 drop-shadow-sm capitalize">
                    {pet.basicProfile?.breed || pet.basicProfile?.species || 'Unknown Breed'}
                  </p>
                </div>
                {/* Privacy Badge on Top Left */}
                <div className="absolute top-3 left-3 z-10">
                  {pet.profileVisibility?.isPublic ? (
                    <span className="px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1 border border-emerald-400/40">
                      <Globe className="w-3 h-3 text-emerald-200" /> Public
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-md text-slate-200 text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1 border border-slate-700">
                      <Lock className="w-3 h-3 text-amber-400" /> Private
                    </span>
                  )}
                </div>

                {/* Microchip Badge */}
                {pet.basicProfile?.microchipNumber && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Microchipped
                  </div>
                )}
              </div>

              {/* Pet Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Species</p>
                    <p className="text-xs font-bold text-slate-800 capitalize">{pet.basicProfile?.species || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gender</p>
                    <p className="text-xs font-bold text-slate-800 capitalize">{pet.basicProfile?.gender?.toLowerCase() || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Age</p>
                    <p className="text-xs font-bold text-slate-800">
                      {pet.basicProfile?.dateOfBirth ? (
                        new Date().getFullYear() - new Date(pet.basicProfile.dateOfBirth).getFullYear() + " yrs"
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Weight</p>
                    <p className="text-xs font-bold text-slate-800">{pet.basicProfile?.weightKg ? pet.basicProfile.weightKg + ' kg' : 'N/A'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <FileCheck className="w-4 h-4 text-emerald-600" /> 
                    <span>Manage</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {pet.profileVisibility?.isPublic && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const hash = pet?.qrProfileMetadata?.qrCodePayloadString || pet?.petId;
                          window.open(`/pet/public/${encodeURIComponent(hash)}`, '_blank');
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                        title="View the public profile page others see"
                      >
                        <Globe className="w-3 h-3 text-emerald-600" />
                        <span>Public Page ↗</span>
                      </button>
                    )}
                    <span className="text-slate-400 group-hover:text-emerald-600 transition-colors">&rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
