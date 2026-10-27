import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ShieldCheck, MapPin, Home, FileText, Send } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export const KycOnboardingPage = () => {
  const { user, token } = useAuth();
  const { showToast } = useNotification();
  
  const [formData, setFormData] = useState({
    legalName: user?.name || '',
    email: user?.email || '',
    mobileNumber: '',
    verifiedCurrentAddress: '',
    latitude: '',
    longitude: '',
    aadhaarNumber: '',
    panNumber: '',
    homeType: 'APARTMENT',
    ownershipStatus: 'OWNED',
    landlordRwaPetAllowanceFlag: false,
    rwaNocDocumentPath: '',
    reasonToAdoptOrBuy: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          showToast('Location captured successfully', 'success');
        },
        (error) => {
          showToast('Failed to get location. Please allow location access.', 'error');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Quick validation for Rented
    if (formData.ownershipStatus === 'RENTED' && !formData.landlordRwaPetAllowanceFlag) {
      showToast('Landlord/RWA permission is mandatory for rented properties.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Assuming identity-service runs on 8081 or api-gateway routes it
      // Let's assume the gateway routes /api/v1/kyc to identity-service
      const res = await fetch('http://localhost:8080/api/v1/kyc/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      });

      if (res.ok) {
        showToast('KYC & Household Profile submitted successfully for verification.', 'success');
      } else {
        showToast('Submission failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Network error during KYC submission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      <PageHeader
        badgeText="PCA ACT 1960 COMPLIANCE"
        badgeIcon={ShieldCheck}
        title="KYC & Household Verification"
        titleIcon={ShieldCheck}
        description="Complete mandatory identity verification and household suitability evaluation to unlock Marketplace trading, Pet Ownership transfers, and Adoption privileges."
        variant="emerald"
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Identity Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <FileText className="text-emerald-600 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-800">1. Identity Evidence</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Legal Full Name</label>
              <input type="text" name="legalName" value={formData.legalName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="As per Govt ID" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Registered Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
              <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Aadhaar Number</label>
              <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} required maxLength="12" className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none tracking-widest" placeholder="XXXX XXXX XXXX" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">PAN Number</label>
              <input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} required maxLength="10" className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase tracking-widest" placeholder="ABCDE1234F" />
            </div>
          </div>
        </div>

        {/* Section 2: Address & GPS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <MapPin className="text-emerald-600 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-800">2. Address & Geolocation</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Verified Current Address</label>
              <textarea name="verifiedCurrentAddress" value={formData.verifiedCurrentAddress} onChange={handleInputChange} required rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-700 mb-1">Latitude</label>
                <input type="text" name="latitude" value={formData.latitude} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-400 rounded-xl text-slate-500" />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-700 mb-1">Longitude</label>
                <input type="text" name="longitude" value={formData.longitude} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-400 rounded-xl text-slate-500" />
              </div>
              <button type="button" onClick={getGeoLocation} className="w-full sm:w-auto px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors border border-blue-200">
                Detect GPS Location
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Household Evaluation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Home className="text-emerald-600 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-800">3. Household Evaluation Vitals</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Home Type</label>
              <select name="homeType" value={formData.homeType} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="APARTMENT">Apartment</option>
                <option value="INDEPENDENT_VILLA">Independent Villa</option>
                <option value="INDEPENDENT_HOUSE">Independent House</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ownership Status</label>
              <select name="ownershipStatus" value={formData.ownershipStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="OWNED">Owned</option>
                <option value="RENTED">Rented</option>
              </select>
            </div>
            
            {formData.ownershipStatus === 'RENTED' && (
              <div className="col-span-1 sm:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="landlordRwaPetAllowanceFlag" checked={formData.landlordRwaPetAllowanceFlag} onChange={handleInputChange} className="mt-1 w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-800 text-sm">Landlord/RWA Pet Allowance Flag</span>
                    <p className="text-xs text-slate-500 mt-0.5">I confirm that pets are explicitly permitted by my landlord and RWA.</p>
                  </div>
                </label>
                
                {formData.landlordRwaPetAllowanceFlag && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Upload RWA NOC Document Path</label>
                    <input type="text" name="rwaNocDocumentPath" value={formData.rwaNocDocumentPath} onChange={handleInputChange} placeholder="e.g. s3://bucket/noc-document.pdf" className="w-full px-4 py-2 bg-white border border-slate-400 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                )}
              </div>
            )}
            
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Behavioral Assessment: Reason to Adopt or Buy</label>
              <textarea name="reasonToAdoptOrBuy" value={formData.reasonToAdoptOrBuy} onChange={handleInputChange} required rows="4" placeholder="Please elaborate on your motivations for bringing a pet into your household..." className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Processing Audit...' : <><Send className="w-5 h-5" /> Submit Full KYC Profile</>}
          </button>
        </div>
        
      </form>
    </div>
  );
};
