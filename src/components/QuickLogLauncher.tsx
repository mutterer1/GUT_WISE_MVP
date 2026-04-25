import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  Clock3,
  Droplet,
  Pill,
  Plus,
  Utensils,
  Waves,
  X,
} from 'lucide-react';

type FoodMealPreset = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface QuickLogItem {
  href: string;
  label: string;
  description: string;
  icon: typeof Waves;
  accentClassName: string;
  path: string;
}

function getSuggestedMeal(): { value: FoodMealPreset; label: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return { value: 'breakfast', label: 'Breakfast' };
  }

  if (hour >= 11 && hour < 16) {
    return { value: 'lunch', label: 'Lunch' };
  }

  if (hour >= 16 && hour < 22) {
    return { value: 'dinner', label: 'Dinner' };
  }

  return { value: 'snack', label: 'Snack' };
}

export default function QuickLogLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const suggestedMeal = getSuggestedMeal();

  const quickLogItems: QuickLogItem[] = [
    {
      href: '/bm-log',
      path: '/bm-log',
      label: 'Bowel movement',
      description: 'Capture stool timing, Bristol scale, and urgency while it is still fresh.',
      icon: Waves,
      accentClassName: 'text-[var(--color-accent-primary)]',
    },
    {
      href: '/symptoms-log',
      path: '/symptoms-log',
      label: 'Symptoms',
      description: 'Log a flare quickly before intensity, duration, or triggers blur together.',
      icon: AlertCircle,
      accentClassName: 'text-[var(--color-caution)]',
    },
    {
      href: `/food-log?meal=${suggestedMeal.value}`,
      path: '/food-log',
      label: 'Food intake',
      description: `${suggestedMeal.label} is preselected so you can start the meal entry immediately.`,
      icon: Utensils,
      accentClassName: 'text-[var(--color-success)]',
    },
    {
      href: '/hydration-log',
      path: '/hydration-log',
      label: 'Hydration',
      description: 'Add water or other fluids without leaving the current flow for long.',
      icon: Droplet,
      accentClassName: 'text-[var(--color-accent-secondary)]',
    },
    {
      href: '/medication-log',
      path: '/medication-log',
      label: 'Medication',
      description: 'Record dose timing while route, regimen, and reason are still accurate.',
      icon: Pill,
      accentClassName: 'text-[var(--color-danger)]',
    },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close quick log launcher"
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className="fixed inset-x-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:left-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {isOpen && (
          <div
            id="quick-log-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-log-title"
            className="surface-panel w-full max-w-[22rem] rounded-[28px] border-white/10 p-4 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Fast Logging</p>
                <h2 id="quick-log-title" className="mt-1 text-[1.35rem] leading-tight">
                  Start a log from anywhere
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Jump straight into the most common flows without routing through the full logging
                  hub first.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-[var(--color-text-tertiary)] transition-smooth hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
                aria-label="Close quick log launcher"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {quickLogItems.map((item) => {
                const Icon = item.icon;
                const isCurrentPage = location.pathname === item.path;

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="surface-panel-soft surface-interactive flex items-start gap-3 rounded-[22px] p-3.5"
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={[
                        'mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04]',
                        item.accentClassName,
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {item.label}
                        </span>
                        {isCurrentPage ? (
                          <span className="badge badge-neutral shrink-0">Current</span>
                        ) : item.path === '/food-log' ? (
                          <span className="badge badge-brand shrink-0">{suggestedMeal.label}</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-[20px] border border-white/8 bg-black/15 px-3 py-2.5 text-xs text-[var(--color-text-tertiary)]">
              <Clock3 className="h-3.5 w-3.5 flex-shrink-0" />
              Use this launcher for speed. Shared drafts, recents, and repeat actions come in later
              fast-logging passes.
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? 'Close quick log launcher' : 'Open quick log launcher'}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="quick-log-panel"
          className="btn-primary interactive-press h-14 min-h-0 rounded-full px-4 shadow-[0_20px_40px_rgba(26,38,54,0.34)] sm:px-5"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          <span className="hidden text-sm sm:inline">{isOpen ? 'Close Quick Log' : 'Quick Log'}</span>
        </button>
      </div>
    </>
  );
}