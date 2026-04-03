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
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Contextual Health Markers
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No contextual health marker data recorded during this period.</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Date</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Sleep Quality</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Stress Level</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Symptom Severity</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">BM Count</th>
                </tr>
              </thead>
              <tbody>
                {correlations.map((corr, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900">
                      {new Date(corr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-center py-3 px-2">
                      {corr.sleepQuality !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded ${
                          corr.sleepQuality >= 7 ? 'bg-green-100 text-green-800' :
                          corr.sleepQuality >= 4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        } font-semibold`}>
                          {corr.sleepQuality}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      {corr.stressLevel !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded ${
                          corr.stressLevel >= 7 ? 'bg-red-100 text-red-800' :
                          corr.stressLevel >= 4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        } font-semibold`}>
                          {corr.stressLevel}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      {corr.symptomSeverity !== null ? (
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded ${
                          corr.symptomSeverity >= 7 ? 'bg-red-100 text-red-800' :
                          corr.symptomSeverity >= 4 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        } font-semibold`}>
                          {corr.symptomSeverity.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2 font-semibold text-gray-900">
                      {corr.bmCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sleepCorrelation !== null && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Sleep-Symptom Correlation Analysis</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Pearson correlation coefficient: <span className="font-bold">{sleepCorrelation.toFixed(3)}</span>.
                {sleepCorrelation < -0.5 ? (
                  <> Strong negative correlation detected between sleep quality and symptom severity. Poor sleep hygiene
                  appears to be a significant contributing factor to symptom exacerbation. Sleep optimization should be
                  prioritized in treatment plan.</>
                ) : sleepCorrelation < -0.3 ? (
                  <> Moderate negative correlation observed between sleep quality and symptom severity. Sleep disturbances
                  may contribute to symptom presentation. Consider addressing sleep hygiene as part of comprehensive management.</>
                ) : (
                  <> Weak or no significant correlation between sleep quality and symptom severity. Sleep does not appear
                  to be a primary driver of symptom variability in this patient.</>
                )}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Note:</span> All values on 0-10 scale unless otherwise specified.
              Higher sleep quality indicates better rest. Higher stress/symptom values indicate increased severity.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
