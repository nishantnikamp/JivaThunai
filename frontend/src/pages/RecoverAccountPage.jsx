import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { authApi } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import sideImage from '../assets/kitten.jpeg';
import { HeroMarqueePanel } from '../components/HeroMarqueePanel';

export const RecoverAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  
  const [cooldown, setCooldown] = useState(() => {
    const savedExpiry = localStorage.getItem('otp_cooldown_expiry');
    if (savedExpiry) {
      const remaining = Math.floor((parseInt(savedExpiry, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 55;
  });

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            localStorage.removeItem('otp_cooldown_expiry');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isOtpVerified) {
      if (!email || !otp) {
        setError('Please enter email and OTP.');
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await authApi.validateOtp(email, otp);
        if (response && response.success) {
          showToast('OTP Verified! Enter your new password.', 'success');
          setIsOtpVerified(true);
        } else {
          setError(response?.message || 'Invalid or expired OTP.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!newPassword) {
        setError('Please enter your new password.');
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await authApi.resetPassword({ email, otpCode: otp, newPassword });
        if (response && response.success) {
          showToast('Password reset successful! You can now login.', 'success');
          navigate('/login');
        } else {
          setError(response?.message || 'Failed to reset password.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const response = await authApi.resendOtp({ email });
      if (response && response.success) {
        showToast('A new OTP has been sent.', 'info');
        setCooldown(55);
        localStorage.setItem('otp_cooldown_expiry', (Date.now() + 55000).toString());
      } else {
        setError(response?.message || 'Too many requests. Account may be locked for 30 mins.');
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideAuthBtn={true} showHomeBtn={true} />
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side - Animated Marquee */}
        <HeroMarqueePanel />

        {/* Right Side - Recovery Box */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-slate-50 relative overflow-x-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-100 relative z-10">
          
          <div className="bg-emerald-50 text-emerald-950 p-6 flex items-center justify-center gap-4 text-left border-b border-emerald-100">
            <img src="/jivathunailogo.png" alt="Jiva Thunai Logo" className="h-20 w-auto drop-shadow-sm" />
            <div>
              <h2 className="text-xl font-black text-emerald-900">Recover Account</h2>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">Enter the OTP sent to your email to reset password.</p>
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
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly={!!initialEmail}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
                />
              </div>

              {!isOtpVerified && (
                <div className="space-y-1.5 animate-in fade-in duration-300">
                  <label className="block text-xs font-bold text-slate-700">Enter OTP</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none tracking-widest focus:ring-2 focus:ring-emerald-500 text-slate-800"
                      required
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {isOtpVerified && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-xs font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className={`flex items-center text-xs pt-1 pb-2 ${!isOtpVerified ? 'justify-between' : 'justify-end'}`}>
                {!isOtpVerified && (
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || isResending}
                    className={`font-extrabold flex items-center gap-1.5 ${cooldown > 0 || isResending ? 'text-slate-500' : 'text-emerald-700 hover:underline'}`}
                  >
                    {isResending ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                    ) : cooldown > 0 ? (
                      `Resend OTP in ${cooldown}s`
                    ) : (
                      'Resend OTP now'
                    )}
                  </button>
                )}
                <Link to="/login" className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-bold hover:bg-slate-100 transition-colors">
                  Cancel
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : !isOtpVerified ? (
                  'Verify OTP'
                ) : (
                  'Reset Password & Login'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
