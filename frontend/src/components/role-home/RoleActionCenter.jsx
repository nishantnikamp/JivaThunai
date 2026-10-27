import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Clock, Calendar, CheckSquare, Bell, ArrowRight, 
  ShieldCheck, FileText, Activity, ChevronRight 
} from 'lucide-react';

export const RoleActionCenter = ({ actions = [], liveItems = [], loading = false }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>Action Center & Priority Alerts</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pending approvals, upcoming tasks, booking requests, and compliance alerts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((act, index) => {
          const typeIcons = {
            APPOINTMENT: Calendar,
            CARE_TASK: Clock,
            DELEGATION: ShieldCheck,
            VERIFICATION: FileText,
            STAFF: CheckSquare,
            OPERATIONS: Activity,
            QUEUE: Clock,
            RX: FileText,
            FOLLOWUP: Calendar,
            ORDERS: Clock,
            INVENTORY: AlertTriangle,
            KYC: FileText,
            APPLICATIONS: CheckSquare,
            FOSTER: ShieldCheck,
            EMERGENCY: AlertTriangle,
            SCHEDULE: Calendar,
            BOOKINGS: Clock,
            SETTINGS: Activity,
            TASKS: CheckSquare,
            GUIDELINES: FileText,
            RESCUE: AlertTriangle,
            VACCINATION: Activity,
            COMPLIANCE: ShieldCheck,
            USERS: CheckSquare,
            CMS: Activity
          };

          const Icon = typeIcons[act.type] || Bell;

          return (
            <div
              key={act.id || index}
              className="flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-400 shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                    Priority
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={act.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 group"
                >
                  <span>{act.actionLabel || 'Take Action'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
