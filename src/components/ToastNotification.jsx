import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ 
  toast, 
  onClose 
}) {
  if (!toast || !toast.message) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-5 right-5 z-[100] max-w-md w-full animate-slide-down font-sans px-4">
      <div className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between space-x-3 backdrop-blur-xl transition-all ${
        isSuccess 
          ? "bg-slate-900/90 text-white border-emerald-500/40 ring-2 ring-emerald-500/20"
          : isError
          ? "bg-rose-900/90 text-white border-rose-500/40 ring-2 ring-rose-500/20"
          : "bg-slate-900/90 text-white border-blue-500/40"
      }`}>
        <div className="flex items-center space-x-3 min-w-0">
          {isSuccess ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : isError ? (
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
          )}

          <div>
            <h4 className="font-extrabold text-xs text-white">
              {toast.title || (isSuccess ? "Success" : isError ? "Error" : "Notification")}
            </h4>
            <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
              {toast.message}
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
