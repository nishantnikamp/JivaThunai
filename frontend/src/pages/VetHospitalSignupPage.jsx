import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroMarqueePanel } from '../components/HeroMarqueePanel';
import { authApi, vetOrgApi } from '../services/api';
import { 
  Building, MapPin, Globe, Phone, Mail, FileText, 
  CheckCircle, Hash, Link as LinkIcon, Lock, Eye, 
  EyeOff, UploadCloud, ShieldCheck, Clock, Navigation, Compass
} from 'lucide-react';

const VetHospitalSignupPage = () => {
  const navigate = useNavigate();
  
  // 1: Form, 2: OTP, 3: Password, 4: Pending Verification
  const [step, setStep] = useState(1); 
  
  const [formData, setFormData] = useState({
    registeredBusinessName: '',
    gstin: '',
    corporatePan: '',
    clinicalEstablishmentActRegNumber: '',
    emergencySupport247: false,
    primaryContactMobile: '',
    billingEmailAddress: '',
    streetAddress: '',
    city: '',
    district: '',
    stateName: '',
    country: 'India',
    pinCode: '',
    latitude: '',
    longitude: '',
    googleMapLink: '',
    directionsAndLandmarks: '',
    password: '',
    confirmPassword: ''
  });
  
  const [documents, setDocuments] = useState({
    gstCertificate: null,
    clinicRegistration: null
  });

  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, docType) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: e.target.files[0]
    }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!documents.gstCertificate || !documents.clinicRegistration) {
      alert("Please upload all required verification documents.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Sending OTP to:', formData.billingEmailAddress);
      const response = await authApi.sendRegistrationOtp({ 
        fullName: formData.registeredBusinessName || 'Vet Hospital', 
        email: formData.billingEmailAddress, 
        phone: formData.primaryContactMobile 
      });
      
      if (response && response.success) {
        setStep(2);
      } else {
        alert(response?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not send OTP. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length < 4) {
      alert("Please enter a valid OTP.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await authApi.verifyRegistrationOtp({ email: formData.billingEmailAddress, otpCode: otp });
      if (response && response.success) {
        setStep(3);
      } else {
        alert(response?.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not verify OTP. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
      },
      (err) => {
        alert("Could not access device GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await authApi.completeRegistration({
        fullName: formData.registeredBusinessName || 'Vet Hospital',
        email: formData.billingEmailAddress,
        phone: formData.primaryContactMobile,
        password: formData.password,
        addressLine: formData.streetAddress,
        city: formData.city,
        district: formData.district,
        state: formData.stateName,
        pinCode: formData.pinCode,
        country: formData.country,
        aadharNumber: '222233334444', // Mock UIDAI Aadhaar simulator format
        requestedRoles: ['VETERINARY_ADMIN']
      });
      
      if (response && response.success) {
        const { userId, token } = response.data;

        // Register Organization & Main Branch in backend
        try {
          await vetOrgApi.registerOrganization({
            registeredBusinessName: formData.registeredBusinessName,
            gstin: formData.gstin,
            corporatePan: formData.corporatePan,
            clinicalEstablishmentActRegNumber: formData.clinicalEstablishmentActRegNumber,
            emergencySupport247: formData.emergencySupport247,
            primaryContactMobile: formData.primaryContactMobile,
            billingEmailAddress: formData.billingEmailAddress,
            password: formData.password,
            streetAddress: formData.streetAddress,
            city: formData.city,
            district: formData.district,
            stateName: formData.stateName,
            country: formData.country || 'India',
            pinCode: formData.pinCode,
            googleMapLink: formData.googleMapLink,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            directionsAndLandmarks: formData.directionsAndLandmarks,
            inHousePharmacy: true,
            icu: true,
            xRayUnit: true,
            pathologyLab: true,
            bloodBank: false,
            otherAmenities: ['Emergency Ward', 'Sterile OT']
          }, token);
        } catch (orgErr) {
          console.warn("Organization background registration sync:", orgErr);
        }

        // Upload documents
        const uploadData = new FormData();
        if (documents.clinicRegistration) uploadData.append('clinicalLicense', documents.clinicRegistration);
        if (documents.gstCertificate) uploadData.append('gstRegistration', documents.gstCertificate);
        
        await fetch(`http://localhost:8080/api/v1/profile/${userId}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });
        
        setStep(4);
      } else {
        alert(response?.message || 'Failed to complete registration.');
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideAuthBtn={true} showHomeBtn={true} />
      
      <div className="flex-1 flex overflow-hidden">
        <HeroMarqueePanel />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 bg-slate-50 relative overflow-y-auto overflow-x-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-white rounded-3xl max-w-md lg:max-w-xl w-full overflow-hidden shadow-2xl border border-emerald-100 relative z-10 my-auto">
            
            {/* Header */}
            <div className="bg-emerald-50 text-emerald-950 p-6 flex flex-col items-center justify-center text-center border-b border-emerald-100">
              <h2 className="text-xl font-black text-emerald-900">
                {step === 1 && "Hospital Organization Signup"}
                {step === 2 && "Verify Email Address"}
                {step === 3 && "Set Password"}
                {step === 4 && "Application Under Review"}
              </h2>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                {step === 1 && "Complete corporate KYC & facility details."}
                {step === 2 && `An OTP has been sent to ${formData.billingEmailAddress || 'your email'}.`}
                {step === 3 && "Create a secure password for your account."}
                {step === 4 && "Your organization is currently pending manual verification."}
              </p>
            </div>

            <div className={`p-6 sm:p-8 ${step === 1 ? 'max-h-[70vh] overflow-y-auto custom-scrollbar' : ''}`}>
              
              {/* STEP 1: Main Form */}
              {step === 1 && (
                <form className="space-y-4" onSubmit={handleStep1Submit}>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Registered Business Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input name="registeredBusinessName" type="text" required
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                             value={formData.registeredBusinessName} onChange={handleChange} placeholder="Hospital Name" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">GSTIN</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="gstin" type="text" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.gstin} onChange={handleChange} placeholder="GST Number" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Corporate PAN</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="corporatePan" type="text" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.corporatePan} onChange={handleChange} placeholder="PAN Number" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Clinical Establishment Act Reg. Number</label>
                    <div className="relative">
                      <CheckCircle className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input name="clinicalEstablishmentActRegNumber" type="text" required
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                             value={formData.clinicalEstablishmentActRegNumber} onChange={handleChange} placeholder="Registration Number" />
                    </div>
                  </div>

                  {/* DOCUMENT UPLOADS */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">Upload GST Certificate</label>
                      <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud className="w-5 h-5 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-700 text-center">
                            {documents.gstCertificate ? documents.gstCertificate.name : "Click to upload PDF/JPG"}
                          </span>
                        </div>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'gstCertificate')} />
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">Upload Clinic Registration</label>
                      <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud className="w-5 h-5 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-700 text-center">
                            {documents.clinicRegistration ? documents.clinicRegistration.name : "Click to upload PDF/JPG"}
                          </span>
                        </div>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'clinicRegistration')} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Primary Contact Mobile</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="primaryContactMobile" type="tel" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.primaryContactMobile} onChange={handleChange} placeholder="Mobile Number" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Billing Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="billingEmailAddress" type="email" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.billingEmailAddress} onChange={handleChange} placeholder="Email Address" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Street Address</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                      <textarea name="streetAddress" rows={2} required
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                             value={formData.streetAddress} onChange={handleChange} placeholder="Street Address"></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">City</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="city" type="text" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.city} onChange={handleChange} placeholder="City" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">District</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="district" type="text" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.district} onChange={handleChange} placeholder="District" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">State</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="stateName" type="text" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.stateName} onChange={handleChange} placeholder="State" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Country</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="country" type="text" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.country} onChange={handleChange} placeholder="Country" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">PIN Code</label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="pinCode" type="text" required
                               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.pinCode} onChange={handleChange} placeholder="PIN" />
                      </div>
                    </div>
                  </div>

                  {/* MAP PIN GPS COORDINATES */}
                  <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Map Pin GPS Coordinates</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Auto-Detect My GPS</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">Latitude</label>
                        <input
                          name="latitude"
                          type="text"
                          value={formData.latitude}
                          onChange={handleChange}
                          placeholder="e.g. 17.448293"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600">Longitude</label>
                        <input
                          name="longitude"
                          type="text"
                          value={formData.longitude}
                          onChange={handleChange}
                          placeholder="e.g. 78.391485"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Google Maps Direct Link</label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input name="googleMapLink" type="url" placeholder="https://maps.google.com/..."
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                             value={formData.googleMapLink} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Landmarks & Navigation Directions</label>
                    <textarea
                      name="directionsAndLandmarks"
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.directionsAndLandmarks}
                      onChange={handleChange}
                      placeholder="e.g. Opposite Central Park Gate 2, Next to City Pet Pharmacy"
                    />
                  </div>

                  <div className="flex items-center pt-2">
                    <input name="emergencySupport247" type="checkbox"
                           className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                           checked={formData.emergencySupport247} onChange={handleChange} />
                    <label className="ml-2 block text-xs font-semibold text-slate-700">
                      Offers 24/7 Emergency Support
                    </label>
                  </div>

                  <button type="submit" disabled={isSubmitting}
                          className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-70">
                    {isSubmitting ? "Sending..." : "Verify Email"}
                  </button>
                </form>
              )}

              {/* STEP 2: OTP Verification */}
              {step === 2 && (
                <form className="space-y-6 py-6" onSubmit={handleOtpSubmit}>
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Billing Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        readOnly
                        className="w-full pl-11 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm font-semibold text-emerald-900 cursor-default focus:outline-none"
                        value={formData.billingEmailAddress} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-700 text-center">Enter 6-Digit Verification Code</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      required
                      className="w-full text-center tracking-[1em] text-2xl py-4 bg-white border-2 border-emerald-200 rounded-xl font-black text-emerald-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-sm"
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                      placeholder="------" 
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg disabled:opacity-70">
                      {isSubmitting ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors">
                      Back to Edit Form
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Password Setup */}
              {step === 3 && (
                <form className="space-y-6 py-6" onSubmit={handlePasswordSubmit}>
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <Lock className="w-10 h-10" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Account Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="password" type={showPassword ? "text" : "password"} required
                               className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.password} onChange={handleChange} placeholder="Create Password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input name="confirmPassword" type={showPassword ? "text" : "password"} required
                               className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                               value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg">
                      Submit for Verification
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Pending Verification Blocked UI */}
              {step === 4 && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                  <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <Clock className="w-12 h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-800">Verification Pending</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Your hospital registration and uploaded documents have been submitted to the system administrative team. 
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full max-w-sm">
                    <p className="text-xs text-amber-800 font-semibold">
                      System access is strictly restricted until verification is fully completed by our compliance team. You will receive an email upon approval.
                    </p>
                  </div>

                  <button 
                    onClick={() => navigate('/')} 
                    className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Return to Home
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetHospitalSignupPage;
