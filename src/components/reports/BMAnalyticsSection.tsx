import { BMAnalytics } from '../../utils/clinicalReportQueries';

interface BMAnalyticsSectionProps {
  analytics: BMAnalytics;
}

export default function BMAnalyticsSection({ analytics }: BMAnalyticsSectionProps) {
  const { totalCount, averagePerDay, averagePerWeek, confidenceInterval } = analytics;

  const isWithinNormalRange = averagePerDay >= 1 && averagePerDay <= 3;

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        Bowel Movement Analytics
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">Per Day</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{averagePerDay.toFixed(1)}</p>
          {!isWithinNormalRange && (
            <p className="text-xs text-[#8D5D62] dark:text-[#C28F94] font-medium mt-1">Outside 1–3/day range</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">Per Week</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{averagePerWeek.toFixed(1)}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">95% CI</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {confidenceInterval.lower.toFixed(1)}–{confidenceInterval.upper.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">per day</p>
        </div>
      </div>

      <div className="bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 border border-[#4A8FA8]/20 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-[#2C617D] dark:text-[#8EBFD8] uppercase tracking-wide mb-1.5">Observation</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {isWithinNormalRange ? (
            <>
              Frequency is within the normal range of 1–3 movements per day. Statistical analysis indicates consistent elimination patterns.
            </>
          ) : averagePerDay < 1 ? (
            <>
              Frequency is below the expected range. This pattern may warrant discussion with a clinician — possible contributing factors include dietary fiber, fluid intake, or medication effects.
            </>
          ) : (
            <>
              Frequency is above the expected range. Clinical correlation is recommended to assess contributing factors such as diet, stress, or underlying GI conditions.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
