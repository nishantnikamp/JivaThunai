import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * LandscapeModal - Consistent, wide landscape popup screen for complex workflows.
 * Provides a responsive landscape aspect ratio, frosted backdrop, sticky header,
 * scrollable multi-column content area, and clean sticky footer.
 */
export const LandscapeModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  badge,
  headerActions,
  maxWidth = 'max-w-5xl', // 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl'
  colorTheme = 'emerald', // 'emerald' | 'rose' | 'blue' | 'amber' | 'purple' | 'slate'
  children,
  footer,
  closeOnBackdropClick = true,
  className = '',
  bodyClassName = '',
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Theme palettes for icon badge & accents
  const themeStyles = {
    emerald: {
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      headerBorder: 'border-emerald-100/70',
      modalBorder: 'border-emerald-100',
    },
    rose: {
      iconBg: 'bg-rose-50 border-rose-200 text-rose-700',
      headerBorder: 'border-rose-100/70',
      modalBorder: 'border-rose-100',
    },
    blue: {
      iconBg: 'bg-blue-50 border-blue-200 text-blue-700',
      headerBorder: 'border-blue-100/70',
      modalBorder: 'border-blue-100',
    },
    amber: {
      iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
      headerBorder: 'border-amber-100/70',
      modalBorder: 'border-amber-100',
    },
    purple: {
      iconBg: 'bg-purple-50 border-purple-200 text-purple-700',
      headerBorder: 'border-purple-100/70',
      modalBorder: 'border-purple-100',
    },
    slate: {
      iconBg: 'bg-slate-100 border-slate-200 text-slate-700',
      headerBorder: 'border-slate-200',
      modalBorder: 'border-slate-200',
    },
  };

  const theme = themeStyles[colorTheme] || themeStyles.emerald;

  // Resolve maxWidth class
  const resolvedMaxWidth = maxWidth.startsWith('max-w-')
    ? maxWidth
    : `max-w-${maxWidth}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeOnBackdropClick ? (e) => {
        if (e.target === e.currentTarget) onClose?.();
      } : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-3xl w-full ${resolvedMaxWidth} max-h-[92vh] flex flex-col shadow-2xl border ${theme.modalBorder} ring-1 ring-black/5 overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Landscape Modal Header */}
        <div
          className={`px-5 py-4 sm:px-7 sm:py-4.5 border-b ${theme.headerBorder} bg-white/95 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {Icon && (
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center shrink-0 ${theme.iconBg} shadow-xs`}
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {title}
                </h3>
                {badge && (
                  <div className="shrink-0">
                    {typeof badge === 'string' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                        {badge}
                      </span>
                    ) : (
                      badge
                    )}
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Landscape Modal Scrollable Body */}
        <div
          className={`flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 ${bodyClassName}`}
        >
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="px-5 py-3.5 sm:px-7 sm:py-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 z-20 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandscapeModal;
