import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, AlertCircle } from 'lucide-react';

export const RoleSummaryCards = ({ cards = [], metrics = {}, loading = false }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span>Overview & Summary</span>
        </h2>
        <span className="text-xs text-slate-500 font-medium">Live sync with core services</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card) => {
          const Icon = card.icon || Sparkles;
          const rawValue = metrics[card.metricKey];
          const hasValue = rawValue !== undefined && rawValue !== null;
          const displayValue = hasValue ? rawValue : (loading ? '...' : '0');
          const isZero = hasValue && (rawValue === 0 || rawValue === '0');

          return (
            <Link
              key={card.id}
              to={card.link || '#'}
              className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle accent corner glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color || 'from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700'} shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="p-1.5 rounded-xl text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Metric Value & Unit Display */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                {loading ? (
                  <div className="h-7 w-20 bg-slate-200 rounded-lg animate-pulse" />
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {displayValue}
                    </span>
                    {card.unit && (
                      <span className="text-xs font-semibold text-slate-500">
                        {card.unit}
                      </span>
                    )}
                  </div>
                )}

                {isZero && card.emptyText && (
                  <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    {card.emptyText}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
