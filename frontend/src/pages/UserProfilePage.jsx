import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, MapPin, Phone, Mail, ShieldCheck, Camera, Edit2, Save, X } from 'lucide-react';
import { BASE_URL } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export const UserProfilePage = () => {
  const { user, SystemRoles, activeRole, login, token } = useAuth();
  const { showToast } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = React.useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressLine: user?.addressLine || '',
    city: user?.city || '',
    state: user?.state || '',
    pinCode: user?.pinCode || '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('jiva_jwt_token');
        const res = await fetch(`${BASE_URL}/profile/${user.userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
             setFormData({
               fullName: data.data.fullName || '',
               phone: data.data.phone || '',
               email: data.data.email || '',
               addressLine: data.data.addressLine || '',
               city: data.data.city || '',
               state: data.data.state || '',
               pinCode: data.data.pinCode || '',
             });
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    const fetchPhoto = async () => {
      try {
        const token = sessionStorage.getItem('jiva_jwt_token');
        const res = await fetch(`${BASE_URL}/profile/${user.userId}/photo`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          setPhotoUrl(objectUrl);
          setImageError(false);
        } else {
          setImageError(true);
        }
      } catch (err) {
        setImageError(true);
      }
    };

    if (user?.userId) {
      fetchProfile();
      fetchPhoto();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/profile/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('jiva_jwt_token')}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
        // Update user context visually without requiring relogin
        login({
          ...user,
          token,
          fullName: formData.fullName,
          phone: formData.phone
        });
      } else {
        showToast('Failed to update profile. Try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('photo', file);
    try {
      const res = await fetch(`${BASE_URL}/profile/${user.userId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jiva_jwt_token')}`
        },
        body: uploadData
      });
      if (res.ok) {
        showToast('Photo uploaded successfully!', 'success');
        
        // Re-fetch the photo
        const photoRes = await fetch(`${BASE_URL}/profile/${user.userId}/photo`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('jiva_jwt_token')}`
          }
        });
        if (photoRes.ok) {
          const blob = await photoRes.blob();
          setPhotoUrl(URL.createObjectURL(blob));
          setImageError(false);
        }
      } else {
        showToast('Failed to upload photo.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading photo.', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
      <PageHeader
        badgeText="ACCOUNT SETTINGS"
        badgeIcon={ShieldCheck}
        title="User Profile & Identity"
        titleIcon={User}
        description="Manage your verified personal information, contact credentials, and ecosystem role capabilities."
        variant="emerald"
        actions={
          !isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all whitespace-nowrap"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-all"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
              >
                {loading ? <span className="animate-spin text-base leading-none">⟳</span> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Roles */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-700 opacity-20"></div>
            
            <div className="relative flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-5xl shadow-xl border-4 border-white mb-6 relative">
                {!imageError && photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span>{formData.fullName.charAt(0)}</span>
                )}
                {isEditing && (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full border-2 border-white hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-800 text-center">{formData.fullName}</h2>
              <p className="text-slate-500 font-medium flex items-center gap-1 mt-1 text-sm">
                <Mail className="w-3.5 h-3.5" /> {formData.email}
              </p>
              
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {user?.kycStatus || 'VERIFIED'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Assigned Roles</h3>
            <div className="space-y-3">
              {user?.roles?.map((role, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${role === activeRole ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'} flex items-center gap-3 transition-colors`}>
                  <div className={`w-2 h-2 rounded-full ${role === activeRole ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{SystemRoles[role]?.name || role}</p>
                    {role === activeRole && <p className="text-[10px] font-semibold text-emerald-600">Currently Active View</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm">
            <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Personal Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName} 
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none transition-all disabled:opacity-70 font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100 font-medium text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm">
            <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Address Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
                <input 
                  type="text" 
                  name="addressLine"
                  value={formData.addressLine} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your street address"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100 font-medium text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. Bangalore"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100 font-medium text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. KA"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100 font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PIN Code</label>
                  <input 
                    type="text" 
                    name="pinCode"
                    value={formData.pinCode} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 560001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-slate-100 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
