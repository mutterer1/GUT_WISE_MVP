import { HealthMarkerCorrelation } from '../../utils/clinicalReportQueries';

interface HealthMarkersSectionProps {
  correlations: HealthMarkerCorrelation[];
}

export default function HealthMarkersSection({ correlations }: HealthMarkersSectionProps) {
  const hasData = correlations.length > 0 && correlations.some(c =>
    c.sleepQuality !== null || c.stressLevel !== null || c.symptomSeverity !== null
  );

  const calculateCorrelation = () => {
    const validData = correlations.filter(c =>
      c.sleepQuality !== null && c.symptomSeverity !== null
    );

    if (validData.length < 3) return null;

    const avgSleep = validData.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / validData.length;
    const avgSymptom = validData.reduce((sum, d) => sum + (d.symptomSeverity || 0), 0) / validData.length;

    let numerator = 0;
    let denomSleep = 0;
    let denomSymptom = 0;

    validData.forEach(d => {
      const sleepDiff = (d.sleepQuality || 0) - avgSleep;
      const symptomDiff = (d.symptomSeverity || 0) - avgSymptom;
      numerator += sleepDiff * symptomDiff;
      denomSleep += sleepDiff * sleepDiff;
      denomSymptom += symptomDiff * symptomDiff;
    });

    if (denomSleep === 0 || denomSymptom === 0) return null;

    const correlation = numerator / Math.sqrt(denomSleep * denomSymptom);
    return correlation;
  };

  const sleepCorrelation = calculateCorrelation();

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        Contextual Health Markers
      </p>

      {!hasData ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No contextual health marker data recorded during this period.</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  <th className="text-left py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="text-center py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sleep</th>
                  <th className="text-center py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stress</th>
                  <th className="text-center py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Symptom</th>
                  <th className="text-center py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">BMs</th>
                </tr>
              </thead>
              <tbody>
                {correlations.map((corr, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300 font-medium">
                      {new Date(corr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-center py-2.5 px-2">
                      {corr.sleepQuality !== null ? (
                        <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-semibold ${
                          corr.sleepQuality >= 7
                            ? 'bg-[#4A8FA8]/15 text-[#2C617D] dark:text-[#8EBFD8]'
                            : corr.sleepQuality >= 4
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-[#C28F94]/15 text-[#8D5D62] dark:text-[#C28F94]'
                        }`}>
                          {corr.sleepQuality}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="text-center py-2.5 px-2">
                      {corr.stressLevel !== null ? (
                        <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-semibold ${
                          corr.stressLevel >= 7
                            ? 'bg-[#C28F94]/15 text-[#8D5D62] dark:text-[#C28F94]'
                            : corr.stressLevel >= 4
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-[#4A8FA8]/15 text-[#2C617D] dark:text-[#8EBFD8]'
                        }`}>
                          {corr.stressLevel}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="text-center py-2.5 px-2">
                      {corr.symptomSeverity !== null ? (
                        <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-semibold ${
                          corr.symptomSeverity >= 7
                            ? 'bg-[#C28F94]/15 text-[#8D5D62] dark:text-[#C28F94]'
                            : corr.symptomSeverity >= 4
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400'
                        }`}>
                          {corr.symptomSeverity.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="text-center py-2.5 px-2 font-semibold text-gray-700 dark:text-gray-300">
                      {corr.bmCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sleepCorrelation !== null && (
            <div className="bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 border border-[#4A8FA8]/20 rounded-xl p-4 mb-4">
              <h3 className="text-xs font-semibold text-[#2C617D] dark:text-[#8EBFD8] uppercase tracking-wide mb-1.5">
                Sleep–Symptom Correlation
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Pearson r = <span className="font-semibold tabular-nums">{sleepCorrelation.toFixed(2)}</span>.{' '}
                {sleepCorrelation < -0.5 ? (
                  <>Strong negative relationship observed — poorer sleep is associated with higher symptom severity in this dataset.</>
                ) : sleepCorrelation < -0.3 ? (
                  <>Moderate negative relationship observed — sleep quality may contribute to symptom variability.</>
                ) : (
                  <>Sleep quality does not show a strong relationship with symptom severity during this period.</>
                )}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500">
            All values on a 0–10 scale. Higher sleep = better rest. Higher stress/symptom = greater severity.
          </p>
        </>
      )}
    </div>
  );
}
