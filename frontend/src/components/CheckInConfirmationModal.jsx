import React, { useState } from 'react';
import { 
  CheckCircle2, X, Dog, User, Phone, Calendar, Clock, 
  Stethoscope, Building2, AlertCircle, ShieldCheck, Activity 
} from 'lucide-react';

export const CheckInConfirmationModal = ({
  isOpen,
  booking,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [triageNotes, setTriageNotes] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [tempCelsius, setTempCelsius] = useState('');

  if (!isOpen || !booking) return null;

  const appDate = new Date(booking.appointmentDateTime);
  const formattedDate = appDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleConfirm = () => {
    onConfirm(booking.bookingId, {
      triageNotes,
      initialVitals: {
        weightKg: weightKg ? parseFloat(weightKg) : null,
        temperature: tempCelsius ? parseFloat(tempCelsius) : null
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-emerald-100 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                Confirm Patient Check-In
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Move patient to active clinical queue (IN PROGRESS)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Patient & Owner Summary Card */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Dog className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    {booking.petName || 'Registered Pet Patient'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Guardian: <strong>{booking.ownerName || 'Pet Parent'}</strong></span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200">
                Arrived On-Site
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/80 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-semibold">{booking.ownerPhone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-semibold">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Clinical Allocation Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Attending Doctor
              </span>
              <p className="font-black text-slate-800 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{booking.doctorName || 'Assigned Vet Doctor'}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Slot Schedule
              </span>
              <p className="font-black text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{formattedTime} (30 mins)</span>
              </p>
            </div>
          </div>

          {/* Hospital / Facility */}
          {booking.hospitalName && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Facility Center:
              </span>
              <span className="font-bold text-slate-800">{booking.hospitalName}</span>
            </div>
          )}

          {/* Stated Symptoms */}
          {booking.symptoms && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
              <span className="font-black text-amber-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Chief Symptoms & Complaints:
              </span>
              <p className="text-amber-800 font-medium pl-4">{booking.symptoms}</p>
            </div>
          )}

          {/* Optional Receptionist / Nurse Triage Intake */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Optional Arrival Triage Remarks
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Weight (kg e.g. 14.5)"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Temp (°C e.g. 38.5)"
                value={tempCelsius}
                onChange={(e) => setTempCelsius(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <textarea
              rows="2"
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              placeholder="E.g. Pet calm, walking normally, waiting in reception Area B..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Processing Check-In...' : 'Confirm Patient Check-In'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckInConfirmationModal;
