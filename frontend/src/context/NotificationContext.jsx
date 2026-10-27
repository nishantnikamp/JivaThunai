import React, { createContext, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, ShieldAlert } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalAlert, setModalAlert] = useState(null); // { type: 'warning'|'success'|'error', title, message, onConfirm }

  const showToast = React.useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showAlert = React.useCallback((title, message, type = 'warning', onConfirm = null) => {
    setModalAlert({ title, message, type, onConfirm });
  }, []);

  const closeAlert = React.useCallback(() => {
    setModalAlert(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, showAlert, closeAlert }}>
      {children}

      {/* Floating Toaster Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'error' ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* UI Custom Modal Alert Popup Screen (Replacing Browser alert) */}
      {modalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 transform transition-all scale-100">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  modalAlert.type === 'error'
                    ? 'bg-rose-100 text-rose-600'
                    : modalAlert.type === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {modalAlert.type === 'error' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : modalAlert.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{modalAlert.title}</h3>
                <p className="text-xs text-slate-500">Jiva Thunai Compliance & System Alert</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {modalAlert.message}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  if (modalAlert.onConfirm) modalAlert.onConfirm();
                  closeAlert();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                Understand & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
