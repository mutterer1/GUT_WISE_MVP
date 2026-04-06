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
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-1/2"></div>
          <div className="h-12 bg-neutral-border dark:bg-dark-border rounded"></div>
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
          <p className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted mb-1">Hydration Today</p>
          <div className="flex items-baseline gap-2">
            <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">
              {(totalMl / 1000).toFixed(1)}
            </p>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">/ {targetMl / 1000}L</p>
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isComplete ? 'bg-brand-500/10 dark:bg-brand-500/20' : 'bg-brand-300/10 dark:bg-brand-300/20'
          }`}
        >
          {isComplete ? (
            <CheckCircle className="h-6 w-6 text-brand-500" />
          ) : (
            <Droplet className="h-6 w-6 text-brand-300" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-neutral-border dark:bg-dark-border rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              isComplete
                ? 'bg-brand-500'
                : 'bg-gradient-to-r from-brand-300 to-brand-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-body-sm font-semibold text-brand-500">
            {Math.round(percentage)}% Complete
          </span>
          <span className="text-body-sm font-medium text-neutral-muted dark:text-dark-muted">
            {getStatusMessage()}
          </span>
        </div>

        {!isComplete ? (
          <div className="bg-brand-500/5 dark:bg-brand-500/10 p-3 rounded-xl border border-brand-500/10 dark:border-brand-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Droplet className="h-4 w-4 text-brand-500" />
              <p className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                {remainingMl}ml to go
              </p>
            </div>
            <p className="text-xs text-neutral-muted dark:text-dark-muted">
              About {cupsRemaining} more {cupsRemaining === 1 ? 'cup' : 'cups'} of water
            </p>
          </div>
        ) : (
          <div className="bg-brand-500/5 dark:bg-brand-500/10 p-3 rounded-xl border border-brand-500/10 dark:border-brand-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-brand-500" />
              <p className="text-body-sm font-medium text-neutral-text dark:text-dark-text">
                Daily goal achieved
              </p>
            </div>
            {totalMl > targetMl && (
              <p className="text-xs text-neutral-muted dark:text-dark-muted mt-1">
                Exceeded by {totalMl - targetMl}ml
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-neutral-border dark:border-dark-border">
          <div className="text-center flex-1">
            <p className="text-xs text-neutral-muted dark:text-dark-muted">Logged</p>
            <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text">{entries}</p>
          </div>
          <div className="w-px h-8 bg-neutral-border dark:bg-dark-border"></div>
          <div className="text-center flex-1">
            <p className="text-xs text-neutral-muted dark:text-dark-muted">Average</p>
            <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text">
              {entries > 0 ? Math.round(totalMl / entries) : 0}ml
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
