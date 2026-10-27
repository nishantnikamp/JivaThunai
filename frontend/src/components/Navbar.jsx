import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { usePageNavigation } from '../context/NavigationContext';
import { ShoppingBag, Home, ArrowLeft, Menu, X, ChevronRight } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { UserProfileDropdown } from './UserProfileDropdown';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { ROLE_TO_SLUG } from '../config/roleHomepagesConfig';

export const Navbar = ({ 
  onOpenAuth, 
  onGoHome, 
  hideAuthBtn = false, 
  showHomeBtn = false, 
  showBackToLoginBtn = false,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false
}) => {
  const { user, activeRole, switchRole, logout, SystemRoles } = useAuth();
  const { showToast } = useNotification();
  const { cartItems } = useCart();
  const { pageSections, activeSectionId, scrollToSection, setActiveSectionId } = usePageNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isPublicMobileMenuOpen, setIsPublicMobileMenuOpen] = useState(false);

  // Close public mobile menu on route change
  useEffect(() => {
    setIsPublicMobileMenuOpen(false);
  }, [location.pathname]);

  // Set up IntersectionObserver to update active section indicator
  useEffect(() => {
    if (!pageSections || pageSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1
      }
    );

    pageSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pageSections, setActiveSectionId]);

  const handleRoleSwitch = (roleKey) => {
    switchRole(roleKey);
    const targetSlug = ROLE_TO_SLUG[roleKey] || 'pet-owner';
    navigate(`/dashboard/${targetSlug}`);
    showToast(`Switched active workspace view to: ${SystemRoles[roleKey]?.name || roleKey}`, 'info');
  };

  const handleSectionClick = (sectionId) => {
    setIsPublicMobileMenuOpen(false);
    scrollToSection(sectionId);
  };

  // If user is SUPER_ADMIN, let them switch to any role for testing. Otherwise, only show their assigned roles.
  const hasSuperAdmin = user?.roles?.includes('SUPER_ADMIN');
  const availableRoles = hasSuperAdmin 
    ? Object.keys(SystemRoles) 
    : (user?.roles || ['PET_OWNER']);

  const roleOptions = availableRoles.map(roleKey => ({
    value: roleKey,
    label: SystemRoles[roleKey]?.name || roleKey
  }));

  const hasPageSections = pageSections && pageSections.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        {/* Left Side: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Authenticated user mobile sidebar trigger */}
          {user && onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="p-2 -ml-1 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl lg:hidden transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileSidebarOpen ? (
                <X className="w-5 h-5 text-emerald-700" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Unauthenticated guest mobile menu trigger */}
          {!user && (
            <button
              type="button"
              onClick={() => setIsPublicMobileMenuOpen(prev => !prev)}
              className="p-2 -ml-1 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl lg:hidden transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle section navigation"
            >
              {isPublicMobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-700" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}

          <Link 
            to="/"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <img 
              src="/jivathunailogo.png" 
              alt="Jiva Thunai Logo" 
              className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-xs shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center shrink-0">
              <span className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-emerald-800 leading-tight whitespace-nowrap">
                Jiva Thunai
              </span>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block whitespace-nowrap">
                Pet Care Ecosystem
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Single Unified Section Navigation Bar (Unauthenticated Public Pages Only) */}
        {!user && (
          <nav 
            aria-label="Section Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 max-w-2xl xl:max-w-3xl overflow-x-auto scrollbar-none py-1 mx-2"
          >
            {hasPageSections ? (
              pageSections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSectionClick(sec.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {sec.label}
                  </button>
                );
              })
            ) : (
              <>
                <Link to="/#home" className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors">Home</Link>
                <Link to="/#services" className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors">Services</Link>
                <Link to="/#how-it-works" className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors">How It Works</Link>
                <Link to="/about" className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors">About</Link>
                <Link to="/contact" className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors">Contact</Link>
              </>
            )}
          </nav>
        )}

        {/* Right Side: Account Actions, Role Switcher, or Sign In */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Searchable Role Selector (Desktop >= md) */}
              <div className="w-44 lg:w-56 hidden md:block shrink-0">
                <SearchableSelect
                  options={roleOptions}
                  value={activeRole}
                  onChange={handleRoleSwitch}
                  placeholder="Select Workspace Role"
                />
              </div>

              {/* Cart Icon */}
              <Link 
                to="/cart" 
                className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm leading-none min-w-[16px] h-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* User Profile Section with Popup Dropdown */}
              <div className="pl-2 border-l border-slate-200 shrink-0">
                <UserProfileDropdown />
              </div>
            </div>
          ) : showBackToLoginBtn ? (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-2xl transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          ) : showHomeBtn ? (
            <Link
              to="/"
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-2xl transition-all shrink-0"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          ) : !hideAuthBtn ? (
            <Link
              to="/login"
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
            >
              Sign In / Register
            </Link>
          ) : null}
        </div>
      </div>

      {/* Mobile Slide-Down Menu for Unauthenticated Visitors */}
      {!user && isPublicMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Page Sections
          </div>
          <div className="flex flex-col gap-1">
            {hasPageSections ? (
              pageSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectionClick(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeSectionId === sec.id
                      ? 'bg-emerald-50 text-emerald-800 font-black'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{sec.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))
            ) : (
              <>
                <Link to="/#home" onClick={() => setIsPublicMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">Home</Link>
                <Link to="/#services" onClick={() => setIsPublicMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">Services</Link>
                <Link to="/#how-it-works" onClick={() => setIsPublicMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">How It Works</Link>
                <Link to="/about" onClick={() => setIsPublicMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">About Us</Link>
                <Link to="/contact" onClick={() => setIsPublicMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">Contact & Support</Link>
              </>
            )}
          </div>
          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/login"
              onClick={() => setIsPublicMobileMenuOpen(false)}
              className="w-full block text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
