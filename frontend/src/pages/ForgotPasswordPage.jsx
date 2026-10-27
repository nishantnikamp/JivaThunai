import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Mail, ArrowRight, Loader2, AlertTriangle, X } from 'lucide-react';
import { authApi } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import sideImage from '../assets/kitten.jpeg';
import { HeroMarqueePanel } from '../components/HeroMarqueePanel';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(() => {
    const savedExpiry = localStorage.getItem('otp_cooldown_expiry');
    if (savedExpiry) {
      const remaining = Math.floor((parseInt(savedExpiry, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { showToast } = useNotification();
  const navigate = useNavigate();

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your registered email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword(email);
      if (response && response.success) {
        showToast('OTP has been sent to your email.', 'success');
        setOtpSent(true);
        setCooldown(55); // Enforce 55 second cooldown
        localStorage.setItem('otp_cooldown_expiry', (Date.now() + 55000).toString());
        // Redirect to recover account passing the email
        setTimeout(() => {
          navigate('/recover-account', { state: { email } });
        }, 1500);
      } else {
        setError(response?.message || 'Failed to send OTP. You might be rate limited.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to send OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideAuthBtn={true} showBackToLoginBtn={true} />
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side - Animated Marquee */}
        <HeroMarqueePanel />

        {/* Right Side - Forgot Password Box */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-slate-50 relative overflow-x-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-100 relative z-10">
          
          <div className="bg-emerald-50 text-emerald-950 p-6 flex items-center justify-center gap-4 text-left border-b border-emerald-100">
            <img src="/jivathunailogo.png" alt="Jiva Thunai Logo" className="h-20 w-auto drop-shadow-sm" />
            <div>
              <h2 className="text-xl font-black text-emerald-900">Forgot Password</h2>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">We will send a 6-digit OTP to your email</p>
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
            <form onSubmit={handleSendOtp} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={otpSent}
                  />
                </div>
              </div>

              <div className="flex justify-center text-xs">
                <Link to="/login" className="text-slate-500 hover:text-emerald-700 hover:underline">
                  Back to Sign In
                </Link>
              </div>

              <button
                type="submit"
                disabled={otpSent || cooldown > 0 || isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Sending... <Loader2 className="w-4 h-4 animate-spin" /></>
                ) : cooldown > 0 ? (
                  <>Wait {cooldown}s to resend</>
                ) : (
                  <>Send OTP <ArrowRight className="w-4 h-4" /></>
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
