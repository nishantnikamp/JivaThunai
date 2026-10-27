import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog, ShieldCheck, Camera, Image as ImageIcon, Video, Lock, ArrowLeft } from 'lucide-react';
import { MediaUploader } from '../components/MediaUploader';
import { FileUploader } from '../components/FileUploader';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';

export const RegisterPetPage = () => {
  const { showToast, showAlert } = useNotification();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'Male',
    dob: '',
    color: '',
    microchipNumber: '',
    weightKg: '',
    heightCm: '',
    description: '',
    photos: [],
    videos: [],
    healthCertificate: null,
    breedCertificate: null,
    visibility: {
      isPublic: false,
      showPhysicalAttributes: true,
      showCertificates: false,
      showMedia: true,
      showMedicalRecords: false
    }
  });

  const handleAddPetSubmit = (e) => {
    e.preventDefault();
    if (!petForm.name || !petForm.breed || !petForm.species || !petForm.gender || !petForm.dob || !petForm.healthCertificate) {
      showAlert('Missing Fields', 'Please fill in all required (*) fields including Health Certificate.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('ownerId', user?.userId || 'default-user');
    
    const basicProfile = {
      name: petForm.name,
      species: petForm.species,
      breed: petForm.breed,
      gender: petForm.gender.toUpperCase(),
      dateOfBirth: petForm.dob,
      baseColor: petForm.color,
      microchipNumber: petForm.microchipNumber,
      weightKg: petForm.weightKg ? parseFloat(petForm.weightKg) : null,
      heightCm: petForm.heightCm ? parseFloat(petForm.heightCm) : null,
      description: petForm.description
    };
    
    formData.append('basicProfile', JSON.stringify(basicProfile));
    formData.append('profileVisibility', JSON.stringify(petForm.visibility));
    
    petForm.photos.forEach(photo => formData.append('photos', photo));
    petForm.videos.forEach(video => formData.append('videos', video));
    
    if (petForm.healthCertificate) {
      formData.append('healthCertificate', petForm.healthCertificate);
    }
    if (petForm.breedCertificate) {
      formData.append('breedCertificate', petForm.breedCertificate);
    }

    try {
      fetch('http://localhost:8080/api/v1/pets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      }).then(res => {
         if (res.ok) {
            res.json().then(data => {
                showToast(`Pet "${petForm.name}" successfully registered!`, 'success');
                navigate('/dashboard');
            });
         } else {
            showToast(`Registration failed, using offline mode for demo`, 'warning');
            navigate('/dashboard');
         }
      }).catch(() => {
          showToast(`Network error, using offline mode for demo`, 'warning');
          navigate('/dashboard');
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <PageHeader
        badgeText="NATIONAL PET REGISTRY"
        badgeIcon={ShieldCheck}
        title="Register Pet & Digital Profile"
        titleIcon={Dog}
        description="Fill out the biometric and legal details below to officially register your pet in the Jiva Thunai sovereign ecosystem."
        variant="emerald"
        actions={
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition-all whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" /> Back
          </button>
        }
      />

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100">
        <form onSubmit={handleAddPetSubmit} className="flex flex-col">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Column - Details */}
            <div className="w-full md:w-1/3 space-y-6 md:border-r border-slate-100 md:pr-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Pet Name *</label>
                <input
                  type="text"
                  value={petForm.name}
                  onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  placeholder="e.g. Max"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Species *</label>
                <select
                  value={petForm.species}
                  onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  required
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
                  value={petForm.breed}
                  onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                  placeholder="e.g. Labrador"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Gender *</label>
                  <select
                    value={petForm.gender}
                    onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">DOB *</label>
                  <input
                    type="date"
                    value={petForm.dob}
                    onChange={(e) => setPetForm({ ...petForm, dob: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Physical Attributes</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Coat Color</label>
                    <input
                      type="text"
                      value={petForm.color}
                      onChange={(e) => setPetForm({ ...petForm, color: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Microchip Number</label>
                    <input
                      type="text"
                      value={petForm.microchipNumber}
                      onChange={(e) => setPetForm({ ...petForm, microchipNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={petForm.weightKg}
                        onChange={(e) => setPetForm({ ...petForm, weightKg: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={petForm.heightCm}
                        onChange={(e) => setPetForm({ ...petForm, heightCm: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Media, Certs & Privacy */}
            <div className="w-full md:w-2/3 flex flex-col space-y-6">
              
              {/* Certificates */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500"/> Secure Certificates</h3>
                <p className="text-sm text-slate-500 mb-4">Upload PDF certificates. These will be stored securely and only accessible to authorized viewers.</p>
                <div className="grid grid-cols-1 gap-6">
                  <FileUploader 
                    label="Health Certificate (PDF) * (Max 1)" 
                    accept=".pdf" 
                    maxMB={5}
                    onFileSelected={(file) => setPetForm({ ...petForm, healthCertificate: file })} 
                  />
                  <FileUploader 
                    label="Breed Certificate (PDF) (Max 1)" 
                    accept=".pdf" 
                    maxMB={5}
                    onFileSelected={(file) => setPetForm({ ...petForm, breedCertificate: file })} 
                  />
                </div>
              </div>

              {/* Media & Description */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2"><Camera className="w-5 h-5 text-emerald-500"/> Media & Description</h3>
                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Description / Health Guidelines</label>
                    <textarea
                      value={petForm.description}
                      onChange={(e) => setPetForm({ ...petForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-emerald-500" /> Photos (Max 6)</label>
                      <MediaUploader 
                        type="image" maxFiles={6} initialFiles={petForm.photos}
                        onUploadComplete={(url) => setPetForm(prev => ({ ...prev, photos: [...prev.photos, url] }))} 
                        onRemove={(url) => setPetForm(prev => ({ ...prev, photos: prev.photos.filter(p => p !== url) }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Video className="w-4 h-4 text-emerald-500" /> Videos (Max 2)</label>
                      <MediaUploader 
                        type="video" maxFiles={2} initialFiles={petForm.videos}
                        onUploadComplete={(url) => setPetForm(prev => ({ ...prev, videos: [...prev.videos, url] }))} 
                        onRemove={(url) => setPetForm(prev => ({ ...prev, videos: prev.videos.filter(v => v !== url) }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2"><Lock className="w-5 h-5 text-emerald-500"/> Profile Privacy & Sharing</h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-800">Make Profile Public</span>
                      <p className="text-xs text-slate-500">When enabled, other users can view your pet's public profile on the public page.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={petForm.visibility.isPublic} onChange={(e) => setPetForm({...petForm, visibility: {...petForm.visibility, isPublic: e.target.checked}})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  {petForm.visibility.isPublic && (
                    <div className="pl-4 space-y-2 border-l-2 border-emerald-200 mt-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Show Physical Attributes</span>
                        <input type="checkbox" checked={petForm.visibility.showPhysicalAttributes} onChange={(e) => setPetForm({...petForm, visibility: {...petForm.visibility, showPhysicalAttributes: e.target.checked}})} className="rounded text-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Show Secure Certificates</span>
                        <input type="checkbox" checked={petForm.visibility.showCertificates} onChange={(e) => setPetForm({...petForm, visibility: {...petForm.visibility, showCertificates: e.target.checked}})} className="rounded text-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Show Media Gallery</span>
                        <input type="checkbox" checked={petForm.visibility.showMedia} onChange={(e) => setPetForm({...petForm, visibility: {...petForm.visibility, showMedia: e.target.checked}})} className="rounded text-emerald-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Save & Cryptographically Sign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
