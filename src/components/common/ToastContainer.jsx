import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-brand-500 shrink-0" />;
        let borderColor = 'border-brand-500/30';
        let bgStyle = 'bg-white/95 dark:bg-slate-900/95';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          borderColor = 'border-emerald-500/30';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderColor = 'border-rose-500/30';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          borderColor = 'border-amber-500/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-soft-lg border ${borderColor} ${bgStyle} backdrop-blur-md animate-fade-in transition-all`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">
                  {toast.title}
                </h4>
              )}
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
