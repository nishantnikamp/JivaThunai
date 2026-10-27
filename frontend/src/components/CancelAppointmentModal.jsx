import React, { useState } from 'react';
import { 
  AlertTriangle, X, Dog, Stethoscope, Calendar, Clock, 
  Building2, MessageSquare 
} from 'lucide-react';

export const CancelAppointmentModal = ({
  isOpen,
  booking,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !booking) return null;

  const appDate = new Date(booking.appointmentDateTime);
  const formattedDate = appDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const PRESET_REASONS = [
    'Patient Rescheduled',
    'Emergency Resolved',
    'Doctor Unavailable',
    'Duplicate Slot Reserved',
    'Client Request'
  ];

  const handleConfirm = () => {
    onConfirm(booking.bookingId, {
      cancellationReason: reason || 'Cancelled by User/Clinic'
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-rose-100 animate-in zoom-in-95 flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Cancel Vet Appointment?
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                This will release the reserved clinical time slot
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
        <div className="p-6 space-y-4">
          
          {/* Appointment Summary Box */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <Dog className="w-4 h-4 text-rose-800" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 truncate">
                  {booking.petName || 'Pet Patient'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Owner: {booking.ownerName || 'Pet Parent'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200/60 grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate font-semibold">{booking.doctorName || 'Vet Surgeon'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate font-semibold">{formattedDate} • {formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Quick Reasons
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map(pr => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setReason(pr)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    reason === pr
                      ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Reason for Cancellation
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for audit log..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Keep Appointment
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-1.5 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{loading ? 'Cancelling...' : 'Confirm Cancellation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CancelAppointmentModal;
