import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import { Insight } from '../utils/insightEngine';

interface InsightCardProps {
  insight: Insight;
}

type ConfidenceLevel = Insight['confidence_level'];
type InsightType = Insight['insight_type'];

const confidenceConfig: Record<
  ConfidenceLevel,
  {
    accent: string;
    pill: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  low: {
    accent: 'border-l-signal-500',
    pill: 'bg-signal-500/08 text-signal-700 dark:text-signal-300 border border-signal-500/20',
    icon: AlertCircle,
    label: 'Low confidence',
  },
  medium: {
    accent: 'border-l-brand-400',
    pill: 'bg-brand-500/08 text-brand-700 dark:text-brand-300 border border-brand-500/20',
    icon: TrendingUp,
    label: 'Medium confidence',
  },
  high: {
    accent: 'border-l-brand-500',
    pill: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/25',
    icon: Lightbulb,
    label: 'High confidence',
  },
};

function getInsightTypeLabel(type: InsightType): string {
  const labels: Record<InsightType, string> = {
    sleep_symptom: 'Sleep & Symptoms',
    stress_urgency: 'Stress Response',
    hydration_consistency: 'Hydration Pattern',
    food_symptom: 'Food & Symptoms',
    temporal_pattern: 'Timing Pattern',
  };

  return labels[type];
}

function getSuggestedNextStep(type: InsightType): string {
  const suggestions: Record<InsightType, string> = {
    sleep_symptom:
      'Try improving sleep consistency for several days and watch whether symptom severity changes.',
    stress_urgency:
      'Track stressful periods closely and compare whether urgency improves when stress is lower.',
    hydration_consistency:
      'Increase hydration earlier in the day and monitor whether stool consistency becomes more comfortable.',
    food_symptom:
      'Try reducing or spacing out this food category for a few meals and compare symptom patterns.',
    temporal_pattern:
      'Use this timing pattern to plan meals, hydration, and routines more intentionally.',
  };

  return suggestions[type];
}

function formatObservedDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

export default function InsightCard({ insight }: InsightCardProps) {
  const config = confidenceConfig[insight.confidence_level];
  const ConfidenceIcon = config.icon;

  const observedDates = insight.evidence.dates ?? [];
  const lastObserved =
    observedDates.length > 0
      ? observedDates[observedDates.length - 1]
      : insight.last_detected_at;

  return (
    <div
      className={`rounded-2xl border border-neutral-border dark:border-dark-border border-l-4 bg-neutral-surface dark:bg-dark-surface p-6 shadow-soft transition-all hover:shadow-sm ${config.accent}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-neutral-muted dark:text-dark-muted">
            <ConfidenceIcon className="h-4 w-4" />
            <span className="text-body-sm font-medium">
              {getInsightTypeLabel(insight.insight_type)}
            </span>
          </div>

          <h3 className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text leading-snug">
            {insight.summary}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${config.pill}`}
        >
          {config.label}
        </span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile
            label="Occurrences"
            value={`${insight.occurrence_count} ${
              insight.occurrence_count === 1 ? 'match' : 'matches'
            }`}
          />

          <InfoTile
            label="Last observed"
            value={formatObservedDate(lastObserved)}
            icon={<CalendarDays className="h-4 w-4 text-neutral-muted dark:text-dark-muted" />}
          />
        </div>

        <div>
          <h4 className="mb-2 text-body-sm font-semibold text-neutral-text dark:text-dark-text">Evidence</h4>

          <div className="space-y-2 text-body-sm text-neutral-text dark:text-dark-text">
            {insight.evidence.frequency && (
              <p>
                <span className="font-medium">Frequency:</span>{' '}
                {insight.evidence.frequency}
              </p>
            )}

            {insight.evidence.correlation && (
              <p>
                <span className="font-medium">Correlation:</span>{' '}
                {insight.evidence.correlation}
              </p>
            )}
          </div>

          {observedDates.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-body-sm font-medium text-neutral-text dark:text-dark-text">Observed on</p>
              <div className="flex flex-wrap gap-2">
                {observedDates.slice(0, 5).map((date, index) => (
                  <span
                    key={`${date}-${index}`}
                    className="rounded-full bg-neutral-bg dark:bg-dark-elevated px-2.5 py-1 text-xs text-neutral-text dark:text-dark-text"
                  >
                    {formatObservedDate(date)}
                  </span>
                ))}

                {observedDates.length > 5 && (
                  <span className="rounded-full bg-neutral-bg dark:bg-dark-surface px-2.5 py-1 text-xs text-neutral-muted dark:text-dark-muted">
                    +{observedDates.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-brand-500/06 dark:bg-brand-500/10 border border-brand-500/15 dark:border-brand-500/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-500" />
            <h4 className="text-body-sm font-semibold text-brand-700 dark:text-brand-300">
              Suggested next step
            </h4>
          </div>
          <p className="text-body-sm leading-relaxed text-brand-700/85 dark:text-brand-300/85">
            {getSuggestedNextStep(insight.insight_type)}
          </p>
        </div>

        <div className="border-t border-neutral-border dark:border-dark-border pt-3">
          <p className="text-body-xs text-neutral-muted dark:text-dark-muted">
            Confidence reflects how often this pattern appears in your logged data.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-neutral-bg dark:bg-dark-elevated p-3">
      <div className="mb-1 flex items-center gap-2 text-neutral-muted dark:text-dark-muted">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-body-sm font-semibold text-neutral-text dark:text-dark-text">{value}</p>
    </div>
  );
}
