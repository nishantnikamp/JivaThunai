import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, ChevronDown, CheckCircle2, AlertCircle, Sparkles, 
  ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';

export const RoleHomeHeader = ({
  config,
  user,
  dynamicGreeting,
  contextualMessage,
  branches = [],
  selectedBranch,
  onSelectBranch,
  onRefresh,
  loading = false,
  availableRoles = [],
  activeRole,
  onSwitchRole
}) => {
  const navigate = useNavigate();
  const IconComponent = config.icon || Sparkles;
  const PrimaryActionIcon = config.primaryAction?.icon || ArrowRight;
  const SecondaryActionIcon = config.secondaryAction?.icon || ArrowRight;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 md:p-10 shadow-xl border border-emerald-800/40">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Top Meta Bar: Role Badge + Multi-Branch / Organization Selector + Refresh Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-700/30 pb-4">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${config.badgeClass || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {config.badgeText}
            </span>

            {/* Multi-Branch Selector for Hospital Owner & Hospital Admin */}
            {config.hasBranchSelector && branches && branches.length > 0 && (
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/40 rounded-2xl px-3 py-1 text-xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Branch:</span>
                <select
                  value={selectedBranch?.id || (branches[0] ? branches[0].id : '')}
                  onChange={(e) => {
                    const found = branches.find(b => b.id === e.target.value);
                    if (found && onSelectBranch) onSelectBranch(found);
                  }}
                  className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id || b.name} value={b.id || b.name} className="bg-slate-900 text-white">
                      {b.name || 'Main Hospital Branch'} {b.isMainBranch ? '(HQ)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Actions: Refresh & Role switch indicator */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                title="Refresh Live Data"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Live</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Headline & Welcome Text */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{config.headline}</span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
              {dynamicGreeting ? (
                <span>
                  Welcome, <strong className="text-emerald-300 font-semibold">{user?.fullName || 'Valued Member'}</strong>! {dynamicGreeting}
                </span>
              ) : (
                config.description
              )}
            </p>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {config.primaryAction && (
              <Link
                to={config.primaryAction.link}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102 active:scale-98"
              >
                <PrimaryActionIcon className="w-4 h-4 text-slate-950" />
                <span>{config.primaryAction.label}</span>
              </Link>
            )}

            {config.secondaryAction && (
              <Link
                to={config.secondaryAction.link}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all hover:scale-102 active:scale-98"
              >
                <SecondaryActionIcon className="w-4 h-4 text-emerald-300" />
                <span>{config.secondaryAction.label}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic Contextual Alert Banner (e.g. Care Tasks Due, No Appointments, New User Guidance) */}
        {contextualMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-white">Status Update: </span>
              {contextualMessage}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
