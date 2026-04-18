import { BMAnalytics } from '../../utils/clinicalReportQueries';

interface BMAnalyticsSectionProps {
  analytics: BMAnalytics;
}

function formatRange(lower: number, upper: number): string {
  return `${lower.toFixed(1)}-${upper.toFixed(1)}`;
}

export default function BMAnalyticsSection({ analytics }: BMAnalyticsSectionProps) {
  const { totalCount, averagePerDay, averagePerWeek, confidenceInterval } = analytics;
  const isWithinReferenceRange = averagePerDay >= 1 && averagePerDay <= 3;

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Bowel Movement Frequency
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Observed frequency during the selected period
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          These values summarize the bowel movement logs recorded in this report window.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Total logs"
          value={String(totalCount)}
          note="Patient-reported entries"
        />
        <MetricCard
          label="Average per day"
          value={averagePerDay.toFixed(1)}
          note={isWithinReferenceRange ? 'Within 1-3/day reference range' : 'Outside 1-3/day reference range'}
          emphasize={!isWithinReferenceRange}
        />
        <MetricCard
          label="Average per week"
          value={averagePerWeek.toFixed(1)}
          note="Observed average"
        />
        <MetricCard
          label="95% interval"
          value={formatRange(confidenceInterval.lower, confidenceInterval.upper)}
          note="Average per day"
        />
      </div>

      <div className="rounded-xl border border-[#4A8FA8]/20 bg-[#4A8FA8]/08 p-4 dark:bg-[#4A8FA8]/10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2C617D] dark:text-[#8EBFD8]">
          Summary
        </p>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {isWithinReferenceRange
            ? 'Logged frequency falls within the common reference range of 1 to 3 bowel movements per day.'
            : averagePerDay < 1
              ? 'Logged frequency is below the common reference range of 1 to 3 bowel movements per day.'
              : 'Logged frequency is above the common reference range of 1 to 3 bowel movements per day.'}
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  emphasize = false,
}: {
  label: string;
  value: string;
  note: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p
        className={`mt-1 text-xs ${
          emphasize
            ? 'font-medium text-[#8D5D62] dark:text-[#C28F94]'
            : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {note}
      </p>
    </div>
  );
}
