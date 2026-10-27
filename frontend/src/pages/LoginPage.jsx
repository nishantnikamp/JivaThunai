import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, X, Loader2 } from 'lucide-react';
import { authApi } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroMarqueePanel } from '../components/HeroMarqueePanel';
import { ROLE_TO_SLUG } from '../config/roleHomepagesConfig';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your email/phone and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.login(identifier, password);
      if (response && response.data) {
        login(response.data);
        showToast(`Welcome back!`, 'success');
        const userRoles = response.data.roles || (response.data.role ? [response.data.role] : ['PET_OWNER']);
        const primaryRole = userRoles[0] || 'PET_OWNER';
        const targetSlug = ROLE_TO_SLUG[primaryRole] || 'pet-owner';
        navigate(`/dashboard/${targetSlug}`);
      } else {
        setError(response?.message || 'Incorrect username or password.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Incorrect username or password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideAuthBtn={true} showHomeBtn={true} />
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side - Image Background */}
        {/* Left Side - Animated Marquee */}
        <HeroMarqueePanel />

        {/* Right Side - Login Box */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-slate-50 relative overflow-x-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-100 animate-fade-in relative z-10">
          
          <div className="bg-emerald-50 text-emerald-950 p-6 flex items-center justify-center gap-4 text-left border-b border-emerald-100">
            <img src="/jivathunailogo.png" alt="Jiva Thunai Logo" className="h-20 w-auto drop-shadow-sm" />
            <div>
              <h2 className="text-xl font-black text-emerald-900">Welcome Back</h2>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">Sign in to your Jiva Thunai account</p>
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
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email or Mobile Number</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your Email or Mobile Number"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              <div className="flex justify-between items-center text-xs pt-1 pb-2">
                <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                  Create an account
                </Link>
                <Link to="/forgot-password" className="text-emerald-700 font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing In...</>
                ) : (
                  'Sign In'
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
