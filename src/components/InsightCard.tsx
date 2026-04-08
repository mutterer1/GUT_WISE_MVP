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
    accent: 'border-l-yellow-400',
    pill: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    icon: AlertCircle,
    label: 'Low confidence',
  },
  medium: {
    accent: 'border-l-blue-400',
    pill: 'bg-blue-50 text-blue-800 border border-blue-200',
    icon: TrendingUp,
    label: 'Medium confidence',
  },
  high: {
    accent: 'border-l-green-400',
    pill: 'bg-green-50 text-green-800 border border-green-200',
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
      className={`rounded-2xl border border-gray-200 dark:border-white/[0.08] border-l-4 bg-white dark:bg-white/[0.04] p-6 shadow-sm transition-all hover:shadow-md ${config.accent}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <ConfidenceIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getInsightTypeLabel(insight.insight_type)}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug">
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
            icon={<CalendarDays className="h-4 w-4 text-gray-500" />}
          />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Evidence</h4>

          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {insight.evidence.frequency && (
              <p>
                <span className="font-medium text-gray-900 dark:text-white">Frequency:</span>{' '}
                {insight.evidence.frequency}
              </p>
            )}

            {insight.evidence.correlation && (
              <p>
                <span className="font-medium text-gray-900 dark:text-white">Correlation:</span>{' '}
                {insight.evidence.correlation}
              </p>
            )}
          </div>

          {observedDates.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Observed on</p>
              <div className="flex flex-wrap gap-2">
                {observedDates.slice(0, 5).map((date, index) => (
                  <span
                    key={`${date}-${index}`}
                    className="rounded-full bg-gray-100 dark:bg-white/[0.08] px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300"
                  >
                    {formatObservedDate(date)}
                  </span>
                ))}

                {observedDates.length > 5 && (
                  <span className="rounded-full bg-gray-50 dark:bg-white/[0.04] px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{observedDates.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            <h4 className="text-sm font-semibold text-teal-900 dark:text-teal-200">
              Suggested next step
            </h4>
          </div>
          <p className="text-sm leading-relaxed text-teal-800 dark:text-teal-300">
            {getSuggestedNextStep(insight.insight_type)}
          </p>
        </div>

        <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-500">
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
    <div className="rounded-xl bg-gray-50 dark:bg-white/[0.04] p-3">
      <div className="mb-1 flex items-center gap-2 text-gray-500 dark:text-gray-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
