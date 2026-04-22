import { CheckCircle, Coffee, Droplet, GlassWater } from 'lucide-react';
import Card from '../Card';

interface HydrationWidgetProps {
  totalFluidsMl: number;
  effectiveHydrationMl: number;
  waterGoalMl: number;
  targetMl: number;
  entries: number;
  caffeinatedEntries: number;
  alcoholEntries: number;
  loading: boolean;
}

function formatLiters(value: number): string {
  return (value / 1000).toFixed(1);
}

export default function HydrationWidget({
  totalFluidsMl,
  effectiveHydrationMl,
  waterGoalMl,
  targetMl,
  entries,
  caffeinatedEntries,
  alcoholEntries,
  loading,
}: HydrationWidgetProps) {
  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse">
          <div className="mb-4 flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-neutral-border dark:bg-dark-border"></div>
              <div className="h-9 w-24 rounded bg-neutral-border dark:bg-dark-border"></div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-neutral-border dark:bg-dark-border"></div>
          </div>
          <div className="mb-3 h-3 rounded-full bg-neutral-border dark:bg-dark-border"></div>
          <div className="mb-3 h-4 w-3/4 rounded bg-neutral-border dark:bg-dark-border"></div>
          <div className="mb-3 h-20 rounded-xl bg-neutral-border dark:bg-dark-border"></div>
          <div className="h-10 rounded-xl bg-neutral-border dark:bg-dark-border"></div>
        </div>
      </Card>
    );
  }

  const percentage = targetMl > 0 ? Math.min((waterGoalMl / targetMl) * 100, 100) : 0;
  const remainingMl = Math.max(targetMl - waterGoalMl, 0);
  const cupsRemaining = Math.ceil(remainingMl / 250);
  const isComplete = waterGoalMl >= targetMl;

  const getStatusMessage = () => {
    if (percentage >= 100) return 'Water goal achieved';
    if (percentage >= 75) return 'Almost there';
    if (percentage >= 50) return 'Good progress';
    if (percentage >= 25) return 'Building momentum';
    return 'Water goal not started';
  };

  return (
    <Card
      variant="elevated"
      className="transition-all duration-200 hover:-translate-y-px hover:shadow-md dark:hover:shadow-dark-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-muted dark:text-dark-muted">
            Water Goal
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-display-md font-sora font-semibold text-neutral-text dark:text-dark-text">
              {formatLiters(waterGoalMl)}
            </p>
            <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
              / {formatLiters(targetMl)}L
            </p>
          </div>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            isComplete
              ? 'bg-brand-500/10 dark:bg-brand-500/15'
              : 'bg-brand-300/10 dark:bg-brand-300/15'
          }`}
        >
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-brand-500" />
          ) : (
            <GlassWater className="h-5 w-5 text-brand-300" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-border dark:bg-dark-border">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-brand-500' : 'bg-gradient-to-r from-brand-300 to-brand-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-body-sm font-semibold text-brand-500">{Math.round(percentage)}%</span>
          <span className="text-xs text-neutral-muted dark:text-dark-muted">{getStatusMessage()}</span>
        </div>

        {!isComplete ? (
          <div className="rounded-xl border border-brand-500/10 bg-brand-500/5 px-3 py-2.5 dark:border-brand-500/15 dark:bg-brand-500/08">
            <div className="flex items-center gap-2">
              <Droplet className="h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
              <p className="text-body-sm text-neutral-text dark:text-dark-text">
                {remainingMl}ml remaining · about {cupsRemaining} {cupsRemaining === 1 ? 'cup' : 'cups'}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-brand-500/10 bg-brand-500/5 px-3 py-2.5 dark:border-brand-500/15 dark:bg-brand-500/08">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
              <p className="text-body-sm text-neutral-text dark:text-dark-text">
                Water goal achieved
                {waterGoalMl > targetMl && (
                  <span className="text-neutral-muted dark:text-dark-muted"> · +{waterGoalMl - targetMl}ml</span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-border bg-neutral-bg px-3 py-3 dark:border-dark-border dark:bg-dark-bg">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-muted dark:text-dark-muted">
              Total Fluids
            </p>
            <p className="mt-1 text-body-md font-semibold text-neutral-text dark:text-dark-text">
              {formatLiters(totalFluidsMl)}L
            </p>
            <p className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
              Everything logged today
            </p>
          </div>

          <div className="rounded-xl border border-neutral-border bg-neutral-bg px-3 py-3 dark:border-dark-border dark:bg-dark-bg">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-muted dark:text-dark-muted">
              Effective Hydration
            </p>
            <p className="mt-1 text-body-md font-semibold text-neutral-text dark:text-dark-text">
              {formatLiters(effectiveHydrationMl)}L
            </p>
            <p className="mt-1 text-xs text-neutral-muted dark:text-dark-muted">
              Fluids counted in hydration modeling
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="rounded-full border border-neutral-border px-2.5 py-1 text-xs text-neutral-muted dark:border-dark-border dark:text-dark-muted">
            {entries} {entries === 1 ? 'log' : 'logs'}
          </span>

          {caffeinatedEntries > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/8 px-2.5 py-1 text-xs text-amber-600 dark:text-amber-300">
              <Coffee className="h-3 w-3" />
              {caffeinatedEntries} caffeinated
            </span>
          )}

          {alcoholEntries > 0 && (
            <span className="rounded-full border border-signal-500/20 bg-signal-500/8 px-2.5 py-1 text-xs text-signal-700 dark:text-signal-300">
              {alcoholEntries} alcohol
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
