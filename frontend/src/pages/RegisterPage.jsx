import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, X, Loader2, MapPin, Building, Hash, Globe, CreditCard } from 'lucide-react';
import { authApi } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import sideImage from '../assets/kitten.jpeg';
import { HeroMarqueePanel } from '../components/HeroMarqueePanel';

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  
  // Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Step 2
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 3
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  
  // Step 4
  const [aadharNumber, setAadharNumber] = useState('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleNextStep1 = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !phone) {
      setError('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authApi.sendRegistrationOtp({ fullName, email, phone });
      if (response && response.success) {
        showToast('OTP sent to your email!', 'success');
        setStep(2);
      } else {
        setError(response?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Could not send OTP. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter OTP.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authApi.verifyRegistrationOtp({ email, otpCode: otp });
      if (response && response.success) {
        showToast('Email verified successfully!', 'success');
        setIsOtpVerified(true);
      } else {
        setError(response?.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError('Could not verify OTP. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Please set a password.');
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = async (e) => {
    e.preventDefault();
    setError('');
    if (!addressLine1 || !city || !district || !stateName || !pincode || !country) {
      setError('Please complete all address fields.');
      return;
    }
    setStep(4);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!aadharNumber) {
      setError('Please enter your Aadhaar Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.completeRegistration({
        fullName,
        email,
        phone,
        password,
        addressLine: addressLine1,
        city,
        district,
        state: stateName,
        pinCode: pincode,
        country,
        aadharNumber
      });
      
      if (response && response.success) {
        showToast('Registration & Aadhaar Verification successful!', 'success');
        setIsAadhaarVerified(true);
        setTimeout(() => {
          navigate('/login'); 
        }, 5000);
      } else {
        setError(response?.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Could not complete registration. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideAuthBtn={true} showHomeBtn={true} />
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side - Animated Marquee */}
        <HeroMarqueePanel />

        {/* Right Side - Registration Box */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 bg-slate-50 relative overflow-y-auto overflow-x-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-100 animate-fade-in relative z-10 my-auto">
          
          <div className="bg-emerald-50 text-emerald-950 p-6 flex flex-col items-center justify-center text-center border-b border-emerald-100 relative">
            <img src="/jivathunailogo.png" alt="Jiva Thunai Logo" className="h-16 w-auto drop-shadow-sm mb-2" />
            <h2 className="text-xl font-black text-emerald-900">Create Account</h2>
            <p className="text-xs text-emerald-700 mt-1 font-medium">Step {step} of 4</p>
            
            {/* Progress indicators */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${s <= step ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between text-xs font-semibold mb-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
                <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700 focus:outline-none">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your Full Name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your Mobile Number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your Email"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                  ) : (
                    'Send OTP & Continue'
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={isOtpVerified ? handleSetPassword : handleVerifyOtp} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {!isOtpVerified ? (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-700">OTP</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter your OTP"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your Password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {isOtpVerified ? 'Saving...' : 'Validating...'}</>
                  ) : (
                    isOtpVerified ? 'Save Password & Continue' : 'Verify OTP'
                  )}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleNextStep3} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Address Line 1 (House/Flat No., Street)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                    <textarea
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Enter your Address Line 1"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">City</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter your City"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">District</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Enter your District"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">State</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Enter your State"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">PIN Code</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Enter your PIN Code"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Country</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter your Country"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex justify-center items-center gap-2"
                >
                  Save & Continue
                </button>
              </form>
            )}

            {step === 4 && (
              <div className="animate-fade-in">
                {!isAadhaarVerified ? (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-800 font-medium">
                        Almost there! Please verify your identity using Aadhaar to complete registration. This helps us maintain a trusted community.
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Aadhaar Number</label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={aadharNumber}
                          onChange={(e) => setAadharNumber(e.target.value)}
                          placeholder="Enter your Aadhaar Number"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider"
                          maxLength={12}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Verifying & Registering...</>
                      ) : (
                        'Verify Aadhaar & Register'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900 mb-2">Aadhaar Verified!</h3>
                    <p className="text-xs text-slate-600 mb-6 max-w-[250px]">
                      Your identity has been successfully verified and your account is now created.
                      <br/><br/>
                      Auto-redirecting to login in 5 seconds...
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                    >
                      Go to Login Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col justify-center items-center gap-3 pt-6 mt-4 border-t border-slate-100">
                <Link to="/login" className="text-emerald-700 text-xs font-bold hover:underline">
                  Already have an account? Sign In
                </Link>
                <Link to="/vet/signup" className="text-teal-700 text-xs font-bold hover:underline">
                  Are you a Vet Hospital or Staff? Register Here
                </Link>
              </div>
            )}
            
            {step > 1 && (
               <div className="flex justify-center items-center text-xs pt-4">
                 <button 
                   type="button" 
                   onClick={() => setStep(step - 1)}
                   className="text-slate-500 font-bold hover:text-slate-700 transition-colors"
                 >
                   &larr; Back to previous step
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
