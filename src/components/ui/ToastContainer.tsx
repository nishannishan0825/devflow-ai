import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />,
          error: <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />,
          warning: <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />,
          info: <Info size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />,
        };

        const borderMap = {
          success: 'border-emerald-500/30 bg-dark-800/95 shadow-emerald-950/30',
          error: 'border-red-500/30 bg-dark-800/95 shadow-red-950/30',
          warning: 'border-amber-500/30 bg-dark-800/95 shadow-amber-950/30',
          info: 'border-cyan-500/30 bg-dark-800/95 shadow-cyan-950/30',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderMap[toast.type]} shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-500 hover:text-white transition-colors p-0.5 rounded-lg -mr-1"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
