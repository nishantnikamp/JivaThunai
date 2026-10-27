import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const RoleRecommendations = ({ recommendations = [] }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Recommended Next Steps & Services</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tailored features and essential tools aligned with your role responsibilities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((item, index) => {
          const Icon = item.icon || Sparkles;

          return (
            <Link
              key={index}
              to={item.link}
              className="group flex items-start gap-4 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all duration-200"
            >
              <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-700 transition-colors shrink-0">
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h4>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
