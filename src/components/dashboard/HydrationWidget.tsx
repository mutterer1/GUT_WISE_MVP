import { Droplet, CheckCircle } from 'lucide-react';
import Card from '../Card';

interface HydrationWidgetProps {
  totalMl: number;
  targetMl: number;
  entries: number;
  loading: boolean;
}

export default function HydrationWidget({
  totalMl,
  targetMl,
  entries,
  loading,
}: HydrationWidgetProps) {
  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="h-3 bg-neutral-border dark:bg-dark-border rounded w-28"></div>
              <div className="h-9 bg-neutral-border dark:bg-dark-border rounded w-20"></div>
            </div>
            <div className="w-11 h-11 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
          </div>
          <div className="h-3 bg-neutral-border dark:bg-dark-border rounded-full mb-3"></div>
          <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-3/4 mb-3"></div>
          <div className="h-14 bg-neutral-border dark:bg-dark-border rounded-xl mb-3"></div>
          <div className="h-10 bg-neutral-border dark:bg-dark-border rounded-xl"></div>
        </div>
      </Card>
    );
  }

  const percentage = Math.min((totalMl / targetMl) * 100, 100);
  const remainingMl = Math.max(targetMl - totalMl, 0);
  const cupsRemaining = Math.ceil(remainingMl / 250);
  const isComplete = totalMl >= targetMl;

  const getStatusMessage = () => {
    if (percentage >= 100) return 'Goal achieved';
    if (percentage >= 75) return 'Almost there';
    if (percentage >= 50) return 'Good progress';
    if (percentage >= 25) return 'Keep going';
    return 'Stay hydrated';
  };

  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-neutral-muted dark:text-dark-muted mb-1.5 uppercase tracking-wide">
            Hydration Today
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">
              {(totalMl / 1000).toFixed(1)}
            </p>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">/ {targetMl / 1000}L</p>
          </div>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            isComplete ? 'bg-brand-500/10 dark:bg-brand-500/15' : 'bg-brand-300/10 dark:bg-brand-300/15'
          }`}
        >
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-brand-500" />
          ) : (
            <Droplet className="h-5 w-5 text-brand-300" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-neutral-border dark:bg-dark-border rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-brand-500' : 'bg-gradient-to-r from-brand-300 to-brand-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-body-sm font-semibold text-brand-500">
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-neutral-muted dark:text-dark-muted">
            {getStatusMessage()}
          </span>
        </div>

        {!isComplete ? (
          <div className="bg-brand-500/5 dark:bg-brand-500/08 px-3 py-2.5 rounded-xl border border-brand-500/10 dark:border-brand-500/15">
            <div className="flex items-center gap-2">
              <Droplet className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
              <p className="text-body-sm text-neutral-text dark:text-dark-text">
                {remainingMl}ml remaining · ~{cupsRemaining} {cupsRemaining === 1 ? 'cup' : 'cups'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-brand-500/5 dark:bg-brand-500/08 px-3 py-2.5 rounded-xl border border-brand-500/10 dark:border-brand-500/15">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
              <p className="text-body-sm text-neutral-text dark:text-dark-text">
                Daily goal achieved
                {totalMl > targetMl && (
                  <span className="text-neutral-muted dark:text-dark-muted"> · +{totalMl - targetMl}ml</span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-border dark:border-dark-border">
          <span className="text-xs text-neutral-muted dark:text-dark-muted">
            {entries} {entries === 1 ? 'log' : 'logs'}
          </span>
          {entries > 0 && (
            <>
              <span className="text-neutral-border dark:text-dark-border">·</span>
              <span className="text-xs text-neutral-muted dark:text-dark-muted">
                avg {Math.round(totalMl / entries)}ml each
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
