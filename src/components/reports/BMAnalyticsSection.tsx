import { BMAnalytics } from '../../utils/clinicalReportQueries';

interface BMAnalyticsSectionProps {
  analytics: BMAnalytics;
}

export default function BMAnalyticsSection({ analytics }: BMAnalyticsSectionProps) {
  const { totalCount, averagePerDay, averagePerWeek, confidenceInterval } = analytics;

  const isWithinNormalRange = averagePerDay >= 1 && averagePerDay <= 3;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Bowel Movement Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Count</p>
          <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average per Day</p>
          <p className="text-3xl font-bold text-gray-900">{averagePerDay.toFixed(2)}</p>
          {!isWithinNormalRange && (
            <p className="text-xs text-red-600 font-medium mt-1">Outside normal range (1-3/day)</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average per Week</p>
          <p className="text-3xl font-bold text-gray-900">{averagePerWeek.toFixed(1)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">95% Confidence Interval</p>
          <p className="text-xl font-bold text-gray-900">
            {confidenceInterval.lower.toFixed(2)} - {confidenceInterval.upper.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-1">per day</p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Clinical Interpretation</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          {isWithinNormalRange ? (
            <>
              Bowel movement frequency is within the normal physiological range of 1-3 movements per day.
              Statistical analysis demonstrates consistent elimination patterns with 95% confidence.
            </>
          ) : averagePerDay < 1 ? (
            <>
              Reduced bowel movement frequency below expected range. Consider evaluation for constipation,
              reduced GI motility, or structural abnormalities. Differential includes medication effects,
              dietary factors, or underlying metabolic disorders.
            </>
          ) : (
            <>
              Elevated bowel movement frequency exceeding normal parameters. Clinical correlation recommended
              to assess for infectious gastroenteritis, inflammatory bowel disease, malabsorption syndromes,
              or hypermotility disorders.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
