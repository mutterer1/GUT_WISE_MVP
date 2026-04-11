import { useEffect, useRef, useCallback } from 'react';
import { X, Brain, Layers, TrendingUp, ShieldCheck } from 'lucide-react';

interface GutIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  showHintDismiss?: boolean;
  onDismissHint?: () => void;
}

const SIGNAL_ITEMS = [
  { label: 'Bowel movements & Bristol scale' },
  { label: 'Food, meals & caffeine intake' },
  { label: 'Hydration levels' },
  { label: 'Sleep quality & duration' },
  { label: 'Stress & mood signals' },
  { label: 'Symptoms & severity' },
  { label: 'Medication & adherence' },
  { label: 'Exercise & movement' },
  { label: 'Optional medical context' },
];

export default function GutIntelligenceModal({ isOpen, onClose, showHintDismiss, onDismissHint }: GutIntelligenceModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement;
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose, getFocusableElements]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gut-intelligence-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={modalRef}
        className={`relative w-full max-w-lg flex flex-col transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{
          maxHeight: 'min(90vh, 680px)',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(124, 92, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 0 0 1px rgba(124, 92, 255, 0.08), 0 32px 64px rgba(0, 0, 0, 0.5), 0 0 80px rgba(124, 92, 255, 0.08)',
        }}
      >
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none flex-shrink-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(124, 92, 255, 0.12) 0%, transparent 60%)',
          }}
        />

        <div className="relative flex-shrink-0 flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
              style={{
                background: 'rgba(124, 92, 255, 0.15)',
                border: '1px solid rgba(124, 92, 255, 0.25)',
              }}
            >
              <Brain className="w-4 h-4 text-discovery-500" />
            </div>
            <div>
              <h2
                id="gut-intelligence-modal-title"
                className="font-sora font-semibold text-white text-base leading-tight"
              >
                How GutWise Intelligence Works
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Pattern detection, not diagnosis</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-discovery-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="relative flex-1 overflow-y-auto px-6 pb-6"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(124, 92, 255, 0.2) transparent',
          }}
        >
          <div className="space-y-3 mb-5">
            <p className="text-sm leading-relaxed text-slate-300">
              GutWise combines signals from your bowel movements, food, hydration, sleep, stress, symptoms, medication, exercise, and optional medical context to detect structured patterns across your health history.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              Rather than analyzing isolated events, the intelligence layer ranks meaningful correlations over time and surfaces observational insights presented as clinician-friendly summaries.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              This is pattern detection, not diagnosis — the system identifies recurring relationships in your personal data and presents them with appropriate confidence and context.
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              You can expect personalized, evidence-bounded guidance that reflects your unique body, delivered in a calm and understandable way.
            </p>
          </div>

          <div
            className="rounded-2xl p-4 mb-5"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-brand-300" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Signals analyzed</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
              {SIGNAL_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-discovery-500/60 flex-shrink-0" />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Insights emerge from patterns over days and weeks — the more consistently you log, the more meaningful the intelligence becomes.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                All pattern detection runs against your data only. Nothing is shared or used for model training.
              </p>
            </div>
          </div>

          {showHintDismiss && onDismissHint && (
            <div className="mt-5 pt-4 border-t border-white/5 flex justify-center">
              <button
                onClick={onDismissHint}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-discovery-500 rounded px-1"
              >
                Hide this hint next time
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
