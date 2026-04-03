import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function SuccessToast({
  message,
  visible,
  onDismiss,
  duration = 4000,
}: SuccessToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setExiting(false);
      return;
    }

    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  if (!visible && !exiting) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full`}
      role="status"
      aria-live="polite"
      style={{
        animation: exiting
          ? 'toastSlideOut 0.3s ease-in forwards'
          : 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div
            className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
            style={{ animation: 'toastCheckPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both' }}
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-gray-900 leading-snug">{message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{
              animation: `toastProgressShrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
