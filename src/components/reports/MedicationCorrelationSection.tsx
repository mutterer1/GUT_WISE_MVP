import { Pill, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { MedicationCorrelation } from '../../utils/clinicalReportQueries';

interface MedicationCorrelationSectionProps {
  correlations: MedicationCorrelation[];
}

type ResponseType = 'positive' | 'negative' | 'neutral' | 'unknown';

function getMedicationResponse(
  before: number | null,
  after: number | null
): { type: ResponseType; change: number } {
  if (before === null || after === null) return { type: 'unknown', change: 0 };

  const change = after - before;
  if (change < -1) return { type: 'positive', change };
  if (change > 1) return { type: 'negative', change };
  return { type: 'neutral', change };
}

function groupByMedication(correlations: MedicationCorrelation[]) {
  return correlations.reduce(
    (acc, correlation) => {
      if (!acc[correlation.medicationName]) {
        acc[correlation.medicationName] = [];
      }
      acc[correlation.medicationName].push(correlation);
      return acc;
    },
    {} as Record<string, MedicationCorrelation[]>
  );
}

export default function MedicationCorrelationSection({
  correlations,
}: MedicationCorrelationSectionProps) {
  const hasData = correlations.length > 0;
  const medicationGroups = groupByMedication(correlations);

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Medication Timing
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Logged symptom changes around medication entries
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This section compares symptom severity before and after logged medication events where
          surrounding symptom data was available.
        </p>
      </div>

      {!hasData ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          No medication data was recorded during this period.
        </p>
      ) : (
        <>
          <div className="space-y-5">
            {Object.entries(medicationGroups).map(([medicationName, items]) => {
              const responses = items.map((item) =>
                getMedicationResponse(item.symptomSeverityBefore, item.symptomSeverityAfter)
              );
              const knownResponses = responses.filter((response) => response.type !== 'unknown');
              const positiveResponses = responses.filter((response) => response.type === 'positive').length;
              const negativeResponses = responses.filter((response) => response.type === 'negative').length;

              const avgChange =
                knownResponses.reduce((sum, response) => sum + response.change, 0) /
                Math.max(1, knownResponses.length);

              const summaryTone =
                positiveResponses > negativeResponses
                  ? {
                      label: 'Lower symptoms observed more often',
                      pillClass: 'bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8]',
                      panelClass: 'bg-[#4A8FA8]/08 text-gray-700 dark:bg-[#4A8FA8]/10 dark:text-gray-300',
                    }
                  : negativeResponses > positiveResponses
                    ? {
                        label: 'Higher symptoms observed more often',
                        pillClass: 'bg-[#C28F94]/10 text-[#8D5D62] dark:text-[#C28F94]',
                        panelClass: 'bg-[#C28F94]/08 text-gray-700 dark:bg-[#C28F94]/10 dark:text-gray-300',
                      }
                    : {
                        label: 'Mixed pattern',
                        pillClass: 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400',
                        panelClass: 'bg-gray-50 text-gray-600 dark:bg-white/[0.03] dark:text-gray-400',
                      };

              return (
                <div
                  key={medicationName}
                  className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.06]"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#4A8FA8]/10">
                        <Pill className="h-4 w-4 text-[#4A8FA8]" />
                      </div>
                      <div>
                        <h4 className="mb-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                          {medicationName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {items.length} administration{items.length !== 1 ? 's' : ''} recorded
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0 text-right">
                      <div className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${summaryTone.pillClass}`}>
                        {summaryTone.label}
                      </div>
                      {knownResponses.length > 0 && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          Avg change: {avgChange > 0 ? '+' : ''}
                          {avgChange.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    {items.map((item, index) => {
                      const response = getMedicationResponse(
                        item.symptomSeverityBefore,
                        item.symptomSeverityAfter
                      );

                      return (
                        <div
                          key={`${item.date}-${item.timeTaken}-${index}`}
                          className="rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]"
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                {new Date(item.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.timeTaken}
                              </span>
                              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-white/[0.08] dark:text-gray-400">
                                {item.dosage}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {response.type === 'positive' && (
                                <>
                                  <TrendingDown className="h-3.5 w-3.5 text-[#4A8FA8]" />
                                  <span className="text-xs font-semibold text-[#2C617D] dark:text-[#8EBFD8]">
                                    -{Math.abs(response.change).toFixed(1)}
                                  </span>
                                </>
                              )}

                              {response.type === 'negative' && (
                                <>
                                  <TrendingUp className="h-3.5 w-3.5 text-[#8D5D62] dark:text-[#C28F94]" />
                                  <span className="text-xs font-semibold text-[#8D5D62] dark:text-[#C28F94]">
                                    +{Math.abs(response.change).toFixed(1)}
                                  </span>
                                </>
                              )}

                              {response.type === 'neutral' && (
                                <>
                                  <Minus className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    No material change
                                  </span>
                                </>
                              )}

                              {response.type === 'unknown' && (
                                <span className="text-xs italic text-gray-400 dark:text-gray-500">
                                  Not enough nearby symptom data
                                </span>
                              )}
                            </div>
                          </div>

                          {item.symptomSeverityBefore !== null && item.symptomSeverityAfter !== null && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                              <span>
                                Pre-dose:{' '}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {item.symptomSeverityBefore.toFixed(1)}
                                </span>
                              </span>
                              <span>-&gt;</span>
                              <span>
                                Post-dose:{' '}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {item.symptomSeverityAfter.toFixed(1)}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`rounded-lg p-3 text-xs leading-relaxed ${summaryTone.panelClass}`}>
                    {positiveResponses > negativeResponses
                      ? `Lower post-dose symptom scores were seen more often in this set (${positiveResponses} of ${items.length} logged administrations).`
                      : negativeResponses > positiveResponses
                        ? `Higher post-dose symptom scores were seen more often in this set (${negativeResponses} of ${items.length} logged administrations).`
                        : 'This medication showed a mixed or limited pattern in the current dataset.'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-600 dark:text-gray-300">Method:</span>{' '}
              Pre-dose severity reflects nearby symptom logs before a medication entry. Post-dose
              severity reflects nearby symptom logs after that entry. These comparisons are useful for
              review, but they do not establish treatment effect.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
