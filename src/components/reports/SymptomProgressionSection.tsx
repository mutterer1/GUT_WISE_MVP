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
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        Symptom Progression
      </p>

      {!hasData ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No symptom data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-4 mb-5">
            {symptomTypes.map(symptomType => {
              const data = getSymptomData(symptomType);
              const symptomTrends = trends.filter(t => t.symptomType === symptomType);
              const maxSeverity = Math.max(...symptomTrends.map(t => t.avgSeverity));

              return (
                <div key={symptomType} className="border border-gray-100 dark:border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{symptomType}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Avg: <span className="font-medium text-gray-700 dark:text-gray-300">{data.avg.toFixed(1)}/10</span></span>
                        <span>Occurrences: <span className="font-medium text-gray-700 dark:text-gray-300">{symptomTrends.length}</span></span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                      data.trend === 'improving'
                        ? 'bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8]'
                        : data.trend === 'worsening'
                        ? 'bg-[#C28F94]/10 text-[#8D5D62] dark:text-[#C28F94]'
                        : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400'
                    }`}>
                      {data.trend === 'improving' && <TrendingDown className="h-3.5 w-3.5" />}
                      {data.trend === 'worsening' && <TrendingUp className="h-3.5 w-3.5" />}
                      {data.trend === 'stable' && <Minus className="h-3.5 w-3.5" />}
                      <span className="capitalize">{data.trend}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {symptomTrends.map((trend, idx) => {
                      const barWidth = maxSeverity > 0 ? (trend.avgSeverity / maxSeverity) * 100 : 0;
                      const severityColor =
                        trend.avgSeverity >= 7 ? 'bg-[#C28F94]' :
                        trend.avgSeverity >= 4 ? 'bg-amber-400 dark:bg-amber-500' :
                        'bg-[#4A8FA8]/60';

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500 w-20 flex-shrink-0 tabular-nums">
                            {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 h-4 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${severityColor} transition-all`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-10 text-right tabular-nums">
                            {trend.avgSeverity.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {data.trend !== 'stable' && (
                    <div className={`text-xs p-3 rounded-lg ${
                      data.trend === 'improving'
                        ? 'bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 text-gray-700 dark:text-gray-300'
                        : 'bg-[#C28F94]/8 dark:bg-[#C28F94]/10 text-gray-700 dark:text-gray-300'
                    }`}>
                      {data.trend === 'improving' ? (
                        <>
                          Severity decreased by {Math.abs(data.change).toFixed(1)} points over the period ({data.first.toFixed(1)} → {data.last.toFixed(1)}).
                        </>
                      ) : (
                        <>
                          Severity increased by {Math.abs(data.change).toFixed(1)} points over the period ({data.first.toFixed(1)} → {data.last.toFixed(1)}). Consider discussing this trend with your clinician.
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#C28F94] rounded"></div>
              <span>Severe (7–10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-400 dark:bg-amber-500 rounded"></div>
              <span>Moderate (4–6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#4A8FA8]/60 rounded"></div>
              <span>Mild (1–3)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
