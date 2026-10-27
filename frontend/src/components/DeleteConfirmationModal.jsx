import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Item?", 
  itemName = "", 
  message = "This action cannot be undone and will permanently remove this item from the system.",
  confirmText = "Yes, Delete",
  isLoading = false,
  badgeText = ""
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-rose-100 overflow-hidden animate-in zoom-in-95">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 text-rose-600 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          
          {badgeText && (
            <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-[11px] font-black uppercase tracking-wider rounded-full border border-rose-200/60">
              {badgeText}
            </div>
          )}

          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1.5">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Are you sure you want to delete {itemName && <span className="font-bold text-slate-800">"{itemName}"</span>}? {message}
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 py-3 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className="flex-1 py-3 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLoading ? 'Deleting...' : confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

