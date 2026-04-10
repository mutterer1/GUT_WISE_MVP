import { AlertTriangle, CheckCircle } from 'lucide-react';
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
  const hasFindings = criticalAlerts.length > 0 || primaryConcerns.length > 0;
  const totalFlagged = criticalAlerts.length + primaryConcerns.length;
  const avgInRange = avgPerDay >= 1 && avgPerDay <= 3;

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <div className="mb-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <p className="text-xs font-semibold text-[#4A8FA8] uppercase tracking-widest mb-2">Summary</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug">{dateRange}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{dayCount}-day coverage period</p>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 border ${
            !hasFindings
              ? 'bg-[#4A8FA8]/10 border-[#4A8FA8]/20 text-[#2C617D] dark:text-[#8EBFD8]'
              : criticalAlerts.length > 0
              ? 'bg-[#C28F94]/10 border-[#C28F94]/30 text-[#8D5D62] dark:text-[#C28F94]'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/30 text-amber-700 dark:text-amber-400'
          }`}>
            {!hasFindings ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>No concerns</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{totalFlagged} item{totalFlagged !== 1 ? 's' : ''} flagged</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBMs}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">bowel movements</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Daily Average</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgPerDay.toFixed(1)}</p>
          <p className={`text-xs mt-0.5 font-medium ${avgInRange ? 'text-[#4A8FA8]' : 'text-[#8D5D62] dark:text-[#C28F94]'}`}>
            {avgInRange ? 'Within' : 'Outside'} 1–3/day range
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Weekly Average</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgPerWeek.toFixed(1)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">per week</p>
        </div>
      </div>

      {!hasFindings && (
        <div className="flex items-start gap-3 bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 border border-[#4A8FA8]/20 rounded-xl p-4">
          <CheckCircle className="h-5 w-5 text-[#4A8FA8] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            No flagged patterns during this period. Observed metrics are within expected ranges.
          </p>
        </div>
      )}

      {criticalAlerts.length > 0 && (
        <div className="mb-4 bg-[#C28F94]/10 dark:bg-[#C28F94]/10 border border-[#C28F94]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#8D5D62] dark:text-[#C28F94] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#8D5D62] dark:text-[#C28F94] mb-2">
                {criticalAlerts.length} alert{criticalAlerts.length !== 1 ? 's' : ''} flagged — review below
              </h3>
              <ul className="space-y-1.5">
                {criticalAlerts.map((alert, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wide text-[#8D5D62] dark:text-[#C28F94] bg-[#C28F94]/20 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
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

      {primaryConcerns.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
            Key Observations
          </h3>
          <ol className="space-y-2.5">
            {primaryConcerns.map((concern, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8] text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span>{concern}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
