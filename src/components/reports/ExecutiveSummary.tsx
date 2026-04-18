import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { ClinicalAlert } from '../../utils/clinicalReportQueries';

interface ExecutiveSummaryProps {
  dateRange: string;
  dayCount: number;
  totalBMs: number;
  avgPerDay: number;
  avgPerWeek: number;
  criticalAlerts: ClinicalAlert[];
  primaryConcerns: string[];
}

export default function ExecutiveSummary({
  dateRange,
  dayCount,
  totalBMs,
  avgPerDay,
  avgPerWeek,
  criticalAlerts,
  primaryConcerns,
}: ExecutiveSummaryProps) {
  const hasFlags = criticalAlerts.length > 0 || primaryConcerns.length > 0;
  const totalFlagged = criticalAlerts.length + primaryConcerns.length;

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.06]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#4A8FA8]">
          Report Overview
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold leading-snug text-gray-900 dark:text-white">
              {dateRange}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {dayCount}-day tracked period
            </p>
          </div>
          <div
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              !hasFlags
                ? 'border-[#4A8FA8]/20 bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8]'
                : criticalAlerts.length > 0
                  ? 'border-[#C28F94]/30 bg-[#C28F94]/10 text-[#8D5D62] dark:text-[#C28F94]'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/30 dark:bg-amber-900/20 dark:text-amber-400'
            }`}
          >
            {!hasFlags ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>No major review flags</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{totalFlagged} item{totalFlagged !== 1 ? 's' : ''} to review</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total Stool Logs
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBMs}</p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">patient-reported entries</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Average Per Day
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgPerDay.toFixed(1)}</p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">bowel movements per day</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Average Per Week
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgPerWeek.toFixed(1)}</p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">bowel movements per week</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-[#4A8FA8]/18 bg-[#4A8FA8]/06 p-4 dark:bg-[#4A8FA8]/10">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4A8FA8]" />
          <div>
            <p className="text-sm font-semibold text-[#2C617D] dark:text-[#8EBFD8]">
              Observed data first
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              This section summarizes what was logged during the selected period. Pattern summaries
              below are intended to support discussion with a clinician, not to provide a diagnosis.
            </p>
          </div>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="mb-5 rounded-xl border border-[#C28F94]/30 bg-[#C28F94]/10 p-4 dark:bg-[#C28F94]/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#8D5D62] dark:text-[#C28F94]" />
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-semibold text-[#8D5D62] dark:text-[#C28F94]">
                Review flags
              </h3>
              <ul className="space-y-1.5">
                {criticalAlerts.map((alert, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-0.5 inline-block flex-shrink-0 rounded bg-[#C28F94]/20 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#8D5D62] dark:text-[#C28F94]">
                      {alert.severity}
                    </span>
                    <span>{alert.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {primaryConcerns.length > 0 ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Repeated Patterns Worth Discussing
          </h3>
          <ol className="space-y-2.5">
            {primaryConcerns.map((concern, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#4A8FA8]/10 text-xs font-bold text-[#2C617D] dark:text-[#8EBFD8]">
                  {idx + 1}
                </span>
                <span>{concern}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl bg-[#4A8FA8]/08 p-4 dark:bg-[#4A8FA8]/10">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4A8FA8]" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            No major repeated patterns were highlighted in this summary period. Continue logging for
            stronger comparisons over time.
          </p>
        </div>
      )}
    </div>
  );
}
