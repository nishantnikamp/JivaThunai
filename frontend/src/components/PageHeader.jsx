import React from 'react';

/**
 * Standardized, container-free Page Header component for all pages across Jiva Thunai.
 * Uses only clean title text, leading icon, subtitle description, and optional action buttons.
 * No box or container wrapping the title.
 */
export const PageHeader = ({
  badgeIcon: BadgeIcon,
  badgeText,
  badgeVariant = 'emerald', // 'emerald' | 'teal' | 'rose' | 'amber' | 'indigo' | 'slate'
  variant,
  title,
  titleIcon: TitleIcon,
  icon: LegacyIcon,
  description,
  meta,
  actions,
  children,
  className = ''
}) => {
  // Theme color maps for the icon and optional pill badge
  const variantStyles = {
    emerald: {
      iconColor: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
    },
    teal: {
      iconColor: 'text-teal-600',
      badge: 'bg-teal-50 text-teal-700 border border-teal-200/80'
    },
    rose: {
      iconColor: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border border-rose-200/80'
    },
    amber: {
      iconColor: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border border-amber-200/80'
    },
    indigo: {
      iconColor: 'text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
    },
    slate: {
      iconColor: 'text-slate-700',
      badge: 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  };

  const chosenVariant = variant || badgeVariant || 'emerald';
  const style = variantStyles[chosenVariant] || variantStyles.emerald;
  const EffectiveTitleIcon = TitleIcon || LegacyIcon || BadgeIcon;
  const EffectiveBadgeIcon = BadgeIcon || TitleIcon || LegacyIcon;
  const effectiveActions = actions || children;

  return (
    <div className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 ${className}`}>
      
      {/* Title Text, Icon, Subtitle & Meta - Clean, sleek and container-free */}
      <div className="space-y-1.5 max-w-4xl">
        {/* Title Text with Icon directly beside it - strictly no icon box or card */}
        <div className="flex items-center gap-3 flex-wrap">
          {EffectiveTitleIcon && (
            <EffectiveTitleIcon className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 ${style.iconColor}`} />
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
        </div>

        {/* Subtitle / Description Text */}
        {description && (
          <div className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {description}
          </div>
        )}

        {/* Optional Context Meta */}
        {meta && (
          <div className="text-xs text-slate-500 font-medium pt-0.5 flex items-center gap-1.5 flex-wrap">
            {meta}
          </div>
        )}
      </div>

      {/* Right Action Buttons */}
      {effectiveActions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0 md:self-center">
          {effectiveActions}
        </div>
      )}

    </div>
  );
};
