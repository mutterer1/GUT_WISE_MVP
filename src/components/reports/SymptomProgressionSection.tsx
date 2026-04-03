import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SymptomTrend } from '../../utils/clinicalReportQueries';

interface SymptomProgressionSectionProps {
  trends: SymptomTrend[];
}

export default function SymptomProgressionSection({ trends }: SymptomProgressionSectionProps) {
  const symptomTypes = Array.from(new Set(trends.map(t => t.symptomType)));

  const getSymptomData = (symptomType: string) => {
    const symptomTrends = trends.filter(t => t.symptomType === symptomType).sort((a, b) => a.date.localeCompare(b.date));
    if (symptomTrends.length < 2) return { trend: 'stable', change: 0, first: 0, last: 0, avg: 0 };

    const first = symptomTrends[0].avgSeverity;
    const last = symptomTrends[symptomTrends.length - 1].avgSeverity;
    const avg = symptomTrends.reduce((sum, t) => sum + t.avgSeverity, 0) / symptomTrends.length;
    const change = last - first;

    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (change < -0.5) trend = 'improving';
    else if (change > 0.5) trend = 'worsening';

    return { trend, change, first, last, avg };
  };

  const hasData = trends.length > 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Symptom Progression Analysis
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No symptom data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {symptomTypes.map(symptomType => {
              const data = getSymptomData(symptomType);
              const symptomTrends = trends.filter(t => t.symptomType === symptomType);
              const maxSeverity = Math.max(...symptomTrends.map(t => t.avgSeverity));

              return (
                <div key={symptomType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{symptomType}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Average Severity: <span className="font-semibold text-gray-900">{data.avg.toFixed(1)}/10</span>
                        </span>
                        <span className="text-gray-600">
                          Occurrences: <span className="font-semibold text-gray-900">{symptomTrends.length}</span>
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      data.trend === 'improving' ? 'bg-green-100 text-green-800' :
                      data.trend === 'worsening' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {data.trend === 'improving' && <TrendingDown className="h-5 w-5" />}
                      {data.trend === 'worsening' && <TrendingUp className="h-5 w-5" />}
                      {data.trend === 'stable' && <Minus className="h-5 w-5" />}
                      <span className="font-semibold capitalize">{data.trend}</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {symptomTrends.map((trend, idx) => {
                      const barHeight = maxSeverity > 0 ? (trend.avgSeverity / maxSeverity) * 100 : 0;
                      const severityColor = trend.avgSeverity >= 7 ? 'bg-red-500' :
                                          trend.avgSeverity >= 4 ? 'bg-orange-500' :
                                          'bg-yellow-500';

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-24 flex-shrink-0">
                            {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${severityColor} transition-all`}
                              style={{ width: `${barHeight}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 w-12 text-right">
                            {trend.avgSeverity.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {data.trend !== 'stable' && (
                    <div className={`text-sm p-3 rounded ${
                      data.trend === 'improving' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {data.trend === 'improving' ? (
                        <>
                          <span className="font-semibold">Positive Response:</span> Symptom severity decreased by {Math.abs(data.change).toFixed(1)} points
                          from {data.first.toFixed(1)} to {data.last.toFixed(1)}. Current therapeutic approach demonstrating efficacy.
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">Clinical Deterioration:</span> Symptom severity increased by {Math.abs(data.change).toFixed(1)} points
                          from {data.first.toFixed(1)} to {data.last.toFixed(1)}. Consider escalation of treatment or alternative therapeutic strategy.
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-6 text-xs border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-700">Severe (7-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-gray-700">Moderate (4-6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-700">Mild (1-3)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
