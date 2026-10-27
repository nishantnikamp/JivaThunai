import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X, ShieldAlert } from 'lucide-react';

/**
 * UI Screen Confirmation Modal for Alerts and Warnings
 * Mandated for high-impact actions: emergency triage escalation,
 * surgeon/theatre state changes, care task cancellation, delegation revocation,
 * and allergen clashes.
 */
export const AlertConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation Required",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "warning", // 'warning' | 'danger' | 'info' | 'success'
  isSubmitting = false,
  highlightDetails = null,
  requireCheckbox = false,
  checkboxLabel = "I understand and confirm this operational change"
}) => {
  const [isChecked, setIsChecked] = React.useState(!requireCheckbox);

  React.useEffect(() => {
    setIsChecked(!requireCheckbox);
  }, [isOpen, requireCheckbox]);

  if (!isOpen) return null;

  const variantStyles = {
    warning: {
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
      headerBg: 'bg-amber-50/50'
    },
    danger: {
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      btnBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
      headerBg: 'bg-rose-50/50'
    },
    info: {
      border: 'border-blue-200',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
      btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
      headerBg: 'bg-blue-50/50'
    },
    success: {
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
      headerBg: 'bg-emerald-50/50'
    }
  }[variant] || {
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
    headerBg: 'bg-amber-50/50'
  };

  const IconComponent = variantStyles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border ${variantStyles.border} animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b border-slate-100 ${variantStyles.headerBg} flex items-start justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${variantStyles.badgeBg} flex items-center justify-center shrink-0`}>
              <IconComponent className={`w-6 h-6 ${variantStyles.iconColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">{title}</h3>
              <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${variantStyles.badgeBg} ${variantStyles.badgeText} mt-1`}>
                {variant.toUpperCase()} CONFIRMATION
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {message}
          </p>

          {/* Highlight Details Box if provided */}
          {highlightDetails && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2 font-medium">
              {typeof highlightDetails === 'string' ? (
                <p>{highlightDetails}</p>
              ) : (
                highlightDetails
              )}
            </div>
          )}

          {/* Optional Explicit Checkbox */}
          {requireCheckbox && (
            <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-bold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span>{checkboxLabel}</span>
            </label>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || (requireCheckbox && !isChecked)}
            className={`px-6 py-2.5 rounded-xl text-white text-xs font-black transition-all shadow-md flex items-center gap-2 ${variantStyles.btnBg} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
