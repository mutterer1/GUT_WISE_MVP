import { HealthMarkerCorrelation } from '../../utils/clinicalReportQueries';

interface HealthMarkersSectionProps {
  correlations: HealthMarkerCorrelation[];
}

function calculateSleepSymptomCorrelation(
  correlations: HealthMarkerCorrelation[]
): number | null {
  const validData = correlations.filter(
    (item) => item.sleepQuality !== null && item.symptomSeverity !== null
  );

  if (validData.length < 3) return null;

  const avgSleep =
    validData.reduce((sum, item) => sum + (item.sleepQuality ?? 0), 0) / validData.length;
  const avgSymptom =
    validData.reduce((sum, item) => sum + (item.symptomSeverity ?? 0), 0) / validData.length;

  let numerator = 0;
  let denomSleep = 0;
  let denomSymptom = 0;

  for (const item of validData) {
    const sleepDiff = (item.sleepQuality ?? 0) - avgSleep;
    const symptomDiff = (item.symptomSeverity ?? 0) - avgSymptom;
    numerator += sleepDiff * symptomDiff;
    denomSleep += sleepDiff * sleepDiff;
    denomSymptom += symptomDiff * symptomDiff;
  }

  if (denomSleep === 0 || denomSymptom === 0) return null;
  return numerator / Math.sqrt(denomSleep * denomSymptom);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function scoreClass(value: number, mode: 'sleep' | 'stress' | 'symptom'): string {
  if (mode === 'sleep') {
    if (value >= 7) return 'bg-[#4A8FA8]/15 text-[#2C617D] dark:text-[#8EBFD8]';
    if (value >= 4) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-[#C28F94]/15 text-[#8D5D62] dark:text-[#C28F94]';
  }

  if (value >= 7) return 'bg-[#C28F94]/15 text-[#8D5D62] dark:text-[#C28F94]';
  if (value >= 4) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (mode === 'stress') return 'bg-[#4A8FA8]/15 text-[#2C617D] dark:text-[#8EBFD8]';
  return 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400';
}

export default function HealthMarkersSection({
  correlations,
}: HealthMarkersSectionProps) {
  const hasData =
    correlations.length > 0 &&
    correlations.some(
      (item) =>
        item.sleepQuality !== null ||
        item.stressLevel !== null ||
        item.symptomSeverity !== null
    );

  const sleepCorrelation = calculateSleepSymptomCorrelation(correlations);

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Contextual Health Markers
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Daily context alongside symptoms
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This table lines up sleep, stress, symptom severity, and bowel movement counts by day.
        </p>
      </div>

      {!hasData ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          No contextual health marker data was recorded during this period.
        </p>
      ) : (
        <>
          <div className="mb-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  <th className="px-2 py-2.5 text-left font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Sleep
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Stress
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Symptom
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    BMs
                  </th>
                </tr>
              </thead>
              <tbody>
                {correlations.map((item, index) => (
                  <tr
                    key={`${item.date}-${index}`}
                    className="border-b border-gray-50 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-2 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-2 py-2.5 text-center">
                      {item.sleepQuality !== null ? (
                        <span
                          className={`inline-flex h-6 w-9 items-center justify-center rounded text-xs font-semibold ${scoreClass(
                            item.sleepQuality,
                            'sleep'
                          )}`}
                        >
                          {item.sleepQuality}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
                      )}
                    </td>

                    <td className="px-2 py-2.5 text-center">
                      {item.stressLevel !== null ? (
                        <span
                          className={`inline-flex h-6 w-9 items-center justify-center rounded text-xs font-semibold ${scoreClass(
                            item.stressLevel,
                            'stress'
                          )}`}
                        >
                          {item.stressLevel}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
                      )}
                    </td>

                    <td className="px-2 py-2.5 text-center">
                      {item.symptomSeverity !== null ? (
                        <span
                          className={`inline-flex h-6 w-9 items-center justify-center rounded text-xs font-semibold ${scoreClass(
                            item.symptomSeverity,
                            'symptom'
                          )}`}
                        >
                          {item.symptomSeverity.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
                      )}
                    </td>

                    <td className="px-2 py-2.5 text-center font-semibold text-gray-700 dark:text-gray-300">
                      {item.bmCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sleepCorrelation !== null && (
            <div className="mb-4 rounded-xl border border-[#4A8FA8]/20 bg-[#4A8FA8]/08 p-4 dark:bg-[#4A8FA8]/10">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2C617D] dark:text-[#8EBFD8]">
                Sleep and symptom relationship
              </p>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Pearson correlation: <span className="font-semibold tabular-nums">{sleepCorrelation.toFixed(2)}</span>.{' '}
                {sleepCorrelation < -0.5
                  ? 'This dataset shows a stronger inverse relationship, where lower sleep scores tended to appear with higher symptom severity.'
                  : sleepCorrelation < -0.3
                    ? 'This dataset shows a moderate inverse relationship, where sleep quality may be contributing to symptom variation.'
                    : 'This dataset does not show a strong relationship between sleep quality and symptom severity in this period.'}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Sleep, stress, and symptom values use a 0-10 scale. Higher sleep means better rest.
            Higher stress and symptom values mean greater severity.
          </p>
        </>
      )}
    </div>
  );
}
