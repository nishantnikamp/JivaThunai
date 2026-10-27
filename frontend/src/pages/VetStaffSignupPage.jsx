import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroMarqueePanel } from '../components/HeroMarqueePanel';
import { User, Mail, Shield, CreditCard, FileText, Activity, Lock, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiCall } from '../services/api';

const VetStaffSignupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotification();
  
  const tokenFromUrl = searchParams.get('inviteToken');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Verify Email and Invite Code
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState(tokenFromUrl || '');
  
  // Verified Invite Data
  const [inviteData, setInviteData] = useState(null);

  // Step 2: Aadhaar KYC
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Step 3: Additional Registration Details
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [personalPan, setPersonalPan] = useState('');
  const [vciRegistrationNumber, setVciRegistrationNumber] = useState('');

  const handleVerifyInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Direct API call without token
      const res = await fetch('http://localhost:8080/api/v1/invitations/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: inviteCode })
      });
      const data = await res.json();
      
      if (res.ok) {
        setInviteData(data.data);
        showToast('Invite verified successfully!', 'success');
        setStep(2);
      } else {
        showToast(data.message || 'Invalid invite code or email', 'error');
      }
    } catch (err) {
      showToast('Network error while verifying invite', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAadhaar = (e) => {
    e.preventDefault();
    if (aadhaarNumber.length < 12) {
      showToast('Please enter a valid 12-digit Aadhaar number', 'error');
      return;
    }
    setLoading(true);
    // Simulate Aadhaar verification
    setTimeout(() => {
      setLoading(false);
      showToast('Aadhaar verified successfully!', 'success');
      setStep(3);
    }, 1500);
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        token: inviteCode,
        email: email,
        password: password,
        aadhaarNumber: aadhaarNumber,
        personalPan: personalPan,
        vciRegistrationNumber: vciRegistrationNumber
      };

      const res = await fetch('http://localhost:8080/api/v1/invitations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Registration successful! Welcome aboard.', 'success');
        login(data.data); // log the user in using AuthResponse
        navigate('/dashboard');
      } else {
        showToast(data.message || 'Failed to complete registration', 'error');
      }
    } catch (err) {
      showToast('Network error while completing registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initialRole = searchParams.get('role');

  const getRoleDisplayName = (role) => {
    if (!role) return 'Hospital Staff';
    if (role.includes('DOCTOR') || role === 'ROLE_VET_DOCTOR' || role === 'VETERINARY_DOCTOR') return 'Veterinary Doctor';
    if (role.includes('ASSISTANT') || role === 'ROLE_ASSISTANT_VET' || role === 'ASSISTANT_VET_DOCTOR') return 'Assistant Vet';
    if (role.includes('STAFF') || role === 'VET_STAFF') return 'Veterinary Staff';
    return 'Hospital Staff';
  };

  const currentDisplayRole = step === 3 && inviteData ? inviteData.targetRole : initialRole;
  const isVciRequired = inviteData?.targetRole === 'VETERINARY_DOCTOR' || inviteData?.targetRole === 'ASSISTANT_VET_DOCTOR';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideAuthBtn={true} showHomeBtn={true} />
      
      <div className="flex-1 flex overflow-hidden">
        <HeroMarqueePanel />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 bg-slate-50 relative overflow-y-auto overflow-x-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-100 relative z-10 my-auto">
            
            <div className="bg-emerald-50 text-emerald-950 p-6 flex flex-col items-center justify-center text-center border-b border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full">
                  Step {step} of 3
                </span>
              </div>
              <h2 className="text-xl font-black text-emerald-900 mt-2">
                Join as {getRoleDisplayName(currentDisplayRole)}
              </h2>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                {step === 1 && "Enter your details and the invite code from your hospital."}
                {step === 2 && "Almost there! Please verify your identity using Aadhaar."}
                {step === 3 && "Complete your profile to access the portal."}
              </p>
            </div>

            <div className="p-6 sm:p-8">
              {/* STEP 1 */}
              {step === 1 && (
                <form className="space-y-4 animate-in fade-in duration-300" onSubmit={handleVerifyInvite}>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="email" required
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                             value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Hospital Invite Code</label>
                    <div className="relative">
                      <Shield className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" required
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                             value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. JVT-XXXX-XXXX" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                          className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Verify Invite
                  </button>
                </form>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <form className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={handleVerifyAadhaar}>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Aadhaar Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" required maxLength="12"
                             className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest"
                             value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, ''))} placeholder="Enter your 12-digit Aadhaar" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                          className="w-full py-3 mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Verify Aadhaar & Register
                  </button>
                </form>
              )}

              {/* STEP 3 */}
              {step === 3 && inviteData && (
                <form className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={handleCompleteRegistration}>
                  
                  {/* Read Only Details */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" disabled
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed"
                             value={inviteData.fullName} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="email" disabled
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed"
                             value={inviteData.email} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Role</label>
                    <div className="relative">
                      <Shield className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" disabled
                             className="w-full pl-10 pr-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700 cursor-not-allowed"
                             value={getRoleDisplayName(inviteData.targetRole)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type={showPassword ? 'text' : 'password'} required minLength="6"
                             className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                             value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">PAN Number</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input type="text" required
                             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase"
                             value={personalPan} onChange={e => setPersonalPan(e.target.value)} placeholder="e.g. ABCDE1234F" />
                    </div>
                  </div>

                  {isVciRequired && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">VCI Registration Number</label>
                        <div className="relative">
                          <Activity className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input type="text" required
                                 className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase"
                                 value={vciRegistrationNumber} onChange={e => setVciRegistrationNumber(e.target.value)} placeholder="e.g. VCI/12345/2026" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Upload VCI Certificate</label>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                               className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                      </div>
                    </>
                  )}

                  <button type="submit" disabled={loading}
                          className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Complete Registration
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetStaffSignupPage;
