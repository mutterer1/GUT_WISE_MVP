import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SymptomTrend } from '../../utils/clinicalReportQueries';

interface SymptomProgressionSectionProps {
  trends: SymptomTrend[];
}

type SymptomDirection = 'improving' | 'worsening' | 'stable';

function getSymptomSummary(symptomTrends: SymptomTrend[]) {
  const ordered = [...symptomTrends].sort((a, b) => a.date.localeCompare(b.date));
  const first = ordered[0]?.avgSeverity ?? 0;
  const last = ordered[ordered.length - 1]?.avgSeverity ?? 0;
  const avg = ordered.reduce((sum, item) => sum + item.avgSeverity, 0) / ordered.length;
  const change = last - first;

  let direction: SymptomDirection = 'stable';
  if (change < -0.5) direction = 'improving';
  if (change > 0.5) direction = 'worsening';

  return {
    ordered,
    first,
    last,
    avg,
    change,
    direction,
  };
}

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getSeverityColor(value: number): string {
  if (value >= 7) return 'bg-[#C28F94]';
  if (value >= 4) return 'bg-amber-400 dark:bg-amber-500';
  return 'bg-[#4A8FA8]/70';
}

function getDirectionBadge(direction: SymptomDirection): {
  label: string;
  className: string;
  icon: JSX.Element;
} {
  if (direction === 'improving') {
    return {
      label: 'Improving',
      className: 'bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8]',
      icon: <TrendingDown className="h-3.5 w-3.5" />,
    };
  }

  if (direction === 'worsening') {
    return {
      label: 'Worsening',
      className: 'bg-[#C28F94]/10 text-[#8D5D62] dark:text-[#C28F94]',
      icon: <TrendingUp className="h-3.5 w-3.5" />,
    };
  }

  return {
    label: 'Stable',
    className: 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400',
    icon: <Minus className="h-3.5 w-3.5" />,
  };
}

export default function SymptomProgressionSection({
  trends,
}: SymptomProgressionSectionProps) {
  const symptomTypes = Array.from(new Set(trends.map((trend) => trend.symptomType)));
  const hasData = trends.length > 0;

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Symptom Progression
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Observed symptom severity over time
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This section summarizes how recorded symptom severity changed across the selected period.
        </p>
      </div>

      {!hasData ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          No symptom data was recorded during this period.
        </p>
      ) : (
        <>
          <div className="mb-5 space-y-4">
            {symptomTypes.map((symptomType) => {
              const symptomTrends = trends.filter((trend) => trend.symptomType === symptomType);
              const summary = getSymptomSummary(symptomTrends);
              const badge = getDirectionBadge(summary.direction);
              const maxSeverity = Math.max(...summary.ordered.map((item) => item.avgSeverity), 1);

              return (
                <div
                  key={symptomType}
                  className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.06]"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {symptomType}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Average:{' '}
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {summary.avg.toFixed(1)}/10
                          </span>
                        </span>
                        <span>
                          Logged points:{' '}
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {summary.ordered.length}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1.5">
                    {summary.ordered.map((item, index) => {
                      const barWidth =
                        maxSeverity > 0 ? (item.avgSeverity / maxSeverity) * 100 : 0;

                      return (
                        <div key={`${item.date}-${index}`} className="flex items-center gap-2">
                          <span className="w-20 flex-shrink-0 tabular-nums text-xs text-gray-400 dark:text-gray-500">
                            {formatShortDate(item.date)}
                          </span>
                          <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                            <div
                              className={`h-full transition-all ${getSeverityColor(item.avgSeverity)}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-medium tabular-nums text-gray-600 dark:text-gray-400">
                            {item.avgSeverity.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {summary.direction !== 'stable' && (
                    <div
                      className={`rounded-lg p-3 text-xs leading-relaxed ${
                        summary.direction === 'improving'
                          ? 'bg-[#4A8FA8]/08 text-gray-700 dark:bg-[#4A8FA8]/10 dark:text-gray-300'
                          : 'bg-[#C28F94]/08 text-gray-700 dark:bg-[#C28F94]/10 dark:text-gray-300'
                      }`}
                    >
                      {summary.direction === 'improving'
                        ? `Average severity decreased by ${Math.abs(summary.change).toFixed(
                            1
                          )} points over the logged period (${summary.first.toFixed(
                            1
                          )} to ${summary.last.toFixed(1)}).`
                        : `Average severity increased by ${Math.abs(summary.change).toFixed(
                            1
                          )} points over the logged period (${summary.first.toFixed(
                            1
                          )} to ${summary.last.toFixed(1)}).`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-5 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-white/[0.06] dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[#C28F94]" />
              <span>Severe (7-10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-amber-400 dark:bg-amber-500" />
              <span>Moderate (4-6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[#4A8FA8]/70" />
              <span>Mild (1-3)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
