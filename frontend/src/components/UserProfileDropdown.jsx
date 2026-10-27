import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Mail, 
  ChevronRight,
  Package,
  Dog 
} from 'lucide-react';

/**
 * UserProfileDropdown Component
 * Displays user profile trigger badge and opens a small popup menu
 * featuring "My Profile" navigation and "Sign-out" functionality.
 */
export const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, activeRole, logout, SystemRoles } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleNavigateToProfile = () => {
    setIsOpen(false);
    navigate('/user-profile');
  };

  const handleNavigateToPetProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleNavigateToOrders = () => {
    setIsOpen(false);
    navigate('/orders');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    showToast('Signed out successfully.', 'info');
    navigate('/');
  };

  const roleName = SystemRoles[activeRole]?.name || activeRole;
  const roleBadgeColor = SystemRoles[activeRole]?.badgeColor || 'bg-emerald-100 text-emerald-800';
  const initial = user.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Profile Section Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 sm:gap-2.5 md:gap-3 p-1 sm:p-1.5 md:px-3 md:py-2 rounded-xl border-0 transition-all cursor-pointer outline-none min-w-0 md:min-w-[180px] lg:min-w-[210px] ${
          isOpen 
            ? 'bg-emerald-50/80 shadow-xs' 
            : 'hover:bg-slate-50/80'
        }`}
      >
        {/* User Avatar Circle */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xs sm:text-sm md:text-base shadow-sm ring-2 ring-white shrink-0">
          {initial}
        </div>

        <div className="hidden md:flex flex-col text-left flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 leading-tight">
            <span className="truncate max-w-[140px] sm:max-w-[160px]">{user.fullName || 'User'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="mt-0.5">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-sm truncate inline-block max-w-[145px]">
              {roleName}
            </span>
          </div>
        </div>

        <ChevronDown 
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 shrink-0 ml-0.5 sm:ml-1 md:ml-auto ${
            isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
          }`} 
        />
      </button>

      {/* Small Popup Dropdown Screen */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Profile Header Card */}
          <div className="px-4 py-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-base shadow-sm ring-2 ring-white shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user.fullName || 'User Account'}
                  </p>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                {user.email ? (
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {user.phone || 'Verified Account'}
                  </p>
                )}
                <div className="mt-1.5">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-xs ${roleBadgeColor}`}>
                    {roleName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-2 space-y-1">
            {/* My Profile Button */}
            <button
              type="button"
              onClick={handleNavigateToProfile}
              className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-950 transition-colors group text-left cursor-pointer"
              role="menuitem"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-900">My Profile</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-emerald-700/80 font-medium">View & manage profile details</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Pet Profile Button */}
            <button
              type="button"
              onClick={handleNavigateToPetProfile}
              className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-950 transition-colors group text-left cursor-pointer"
              role="menuitem"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition-colors">
                  <Dog className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-900">Pet Profile</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-emerald-700/80 font-medium">Digital passport & QR pet identity</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* My Orders & Receipts Button */}
            <button
              type="button"
              onClick={handleNavigateToOrders}
              className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-950 transition-colors group text-left cursor-pointer"
              role="menuitem"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 transition-colors">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-900">My Orders & Receipts</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-emerald-700/80 font-medium">View order history, receipts & invoices</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-1"></div>

          {/* Sign-out Button */}
          <div className="p-2 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors group text-left cursor-pointer"
              role="menuitem"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slate-100 group-hover:bg-rose-100 text-slate-500 group-hover:text-rose-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">Sign-out</div>
                  <div className="text-[11px] text-slate-400 group-hover:text-rose-500/80 font-medium">Securely exit current session</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
