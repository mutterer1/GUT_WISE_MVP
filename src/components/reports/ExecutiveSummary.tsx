import { AlertTriangle } from 'lucide-react';
import { ClinicalAlert } from '../../utils/clinicalReportQueries';

interface ExecutiveSummaryProps {
  dateRange: string;
  totalBMs: number;
  avgPerDay: number;
  avgPerWeek: number;
  criticalAlerts: ClinicalAlert[];
  primaryConcerns: string[];
}

export default function ExecutiveSummary({
  dateRange,
  totalBMs,
  avgPerDay,
  avgPerWeek,
  criticalAlerts,
  primaryConcerns,
}: ExecutiveSummaryProps) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6 print:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-200">
        Executive Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Report Period</p>
          <p className="text-lg font-semibold text-gray-900">{dateRange}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Bowel Movements</p>
          <p className="text-lg font-semibold text-gray-900">{totalBMs}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Daily Average</p>
          <p className="text-lg font-semibold text-gray-900">
            {avgPerDay.toFixed(2)} per day / {avgPerWeek.toFixed(2)} per week
          </p>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Clinical Alerts ({criticalAlerts.length})
              </h3>
              <ul className="space-y-2">
                {criticalAlerts.map((alert, idx) => (
                  <li key={idx} className="text-sm text-red-800">
                    <span className="font-semibold uppercase tracking-wide text-xs bg-red-200 px-2 py-1 rounded mr-2">
                      {alert.severity}
                    </span>
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {primaryConcerns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Clinical Observations</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            {primaryConcerns.map((concern, idx) => (
              <li key={idx} className="leading-relaxed">{concern}</li>
            ))}
          </ul>
        </div>
      )}

      {primaryConcerns.length === 0 && criticalAlerts.length === 0 && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4">
          <p className="text-green-800 font-medium">
            No critical concerns identified during the reporting period. Patient data within expected parameters.
          </p>
        </div>
      )}
    </div>
  );
}
