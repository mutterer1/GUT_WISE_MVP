import { Pill, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { MedicationCorrelation } from '../../utils/clinicalReportQueries';

interface MedicationCorrelationSectionProps {
  correlations: MedicationCorrelation[];
}

export default function MedicationCorrelationSection({ correlations }: MedicationCorrelationSectionProps) {
  const hasData = correlations.length > 0;

  const getMedicationResponse = (before: number | null, after: number | null) => {
    if (before === null || after === null) return { type: 'unknown', change: 0 };

    const change = after - before;
    if (change < -1) return { type: 'positive', change };
    if (change > 1) return { type: 'negative', change };
    return { type: 'neutral', change };
  };

  const medicationGroups = correlations.reduce((acc, corr) => {
    if (!acc[corr.medicationName]) {
      acc[corr.medicationName] = [];
    }
    acc[corr.medicationName].push(corr);
    return acc;
  }, {} as { [key: string]: MedicationCorrelation[] });

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        Medication Correlation
      </p>

      {!hasData ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No medication data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-5">
            {Object.entries(medicationGroups).map(([medicationName, meds]) => {
              const responses = meds.map(m => getMedicationResponse(m.symptomSeverityBefore, m.symptomSeverityAfter));
              const positiveResponses = responses.filter(r => r.type === 'positive').length;
              const negativeResponses = responses.filter(r => r.type === 'negative').length;
              const avgChange = responses
                .filter(r => r.type !== 'unknown')
                .reduce((sum, r) => sum + r.change, 0) / Math.max(1, responses.filter(r => r.type !== 'unknown').length);

              return (
                <div key={medicationName} className="border border-gray-100 dark:border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#4A8FA8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="h-4 w-4 text-[#4A8FA8]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{medicationName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {meds.length} administration{meds.length !== 1 ? 's' : ''} recorded
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        positiveResponses > negativeResponses
                          ? 'bg-[#4A8FA8]/10 text-[#2C617D] dark:text-[#8EBFD8]'
                          : negativeResponses > positiveResponses
                          ? 'bg-[#C28F94]/10 text-[#8D5D62] dark:text-[#C28F94]'
                          : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400'
                      }`}>
                        {positiveResponses > negativeResponses ? 'Benefit observed' :
                         negativeResponses > positiveResponses ? 'Limited benefit' :
                         'Variable response'}
                      </div>
                      {avgChange !== 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Avg change: {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {meds.map((med, idx) => {
                      const response = getMedicationResponse(med.symptomSeverityBefore, med.symptomSeverityAfter);

                      return (
                        <div key={idx} className="bg-gray-50 dark:bg-white/[0.03] rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                {new Date(med.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{med.timeTaken}</span>
                              <span className="text-xs bg-gray-200 dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                {med.dosage}
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
                                  <span className="text-xs text-gray-500 dark:text-gray-400">No change</span>
                                </>
                              )}
                              {response.type === 'unknown' && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">Insufficient data</span>
                              )}
                            </div>
                          </div>

                          {med.symptomSeverityBefore !== null && med.symptomSeverityAfter !== null && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                              <span>Pre-dose: <span className="font-medium text-gray-700 dark:text-gray-300">{med.symptomSeverityBefore.toFixed(1)}</span></span>
                              <span>→</span>
                              <span>Post-dose (4h): <span className="font-medium text-gray-700 dark:text-gray-300">{med.symptomSeverityAfter.toFixed(1)}</span></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`text-xs p-3 rounded-lg ${
                    positiveResponses > negativeResponses
                      ? 'bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 text-gray-700 dark:text-gray-300'
                      : negativeResponses > positiveResponses
                      ? 'bg-[#C28F94]/8 dark:bg-[#C28F94]/10 text-gray-700 dark:text-gray-300'
                      : 'bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400'
                  }`}>
                    {positiveResponses > negativeResponses ? (
                      <>
                        Symptom reduction observed in {positiveResponses} of {meds.length} administrations. Current regimen appears to be having an effect.
                      </>
                    ) : negativeResponses > positiveResponses ? (
                      <>
                        Limited symptom benefit observed in {negativeResponses}/{meds.length} administrations. Consider discussing dose, timing, or alternatives with your clinician.
                      </>
                    ) : (
                      <>
                        Mixed response pattern. Dose optimization or timing adjustments may be worth exploring.
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-600 dark:text-gray-300">Methodology:</span>{' '}
              Pre-dose severity represents average symptoms in the 2 hours prior to administration. Post-dose represents the 4 hours following. A change of ≥1 point is considered clinically meaningful for GI medications.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
