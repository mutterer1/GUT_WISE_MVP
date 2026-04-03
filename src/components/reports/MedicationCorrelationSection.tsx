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
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Medication Correlation Timeline
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No medication data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-6">
            {Object.entries(medicationGroups).map(([medicationName, meds]) => {
              const responses = meds.map(m => getMedicationResponse(m.symptomSeverityBefore, m.symptomSeverityAfter));
              const positiveResponses = responses.filter(r => r.type === 'positive').length;
              const negativeResponses = responses.filter(r => r.type === 'negative').length;
              const avgChange = responses
                .filter(r => r.type !== 'unknown')
                .reduce((sum, r) => sum + r.change, 0) / Math.max(1, responses.filter(r => r.type !== 'unknown').length);

              return (
                <div key={medicationName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{medicationName}</h3>
                        <p className="text-sm text-gray-600">
                          {meds.length} administration{meds.length !== 1 ? 's' : ''} recorded
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        positiveResponses > negativeResponses ? 'bg-green-100 text-green-800' :
                        negativeResponses > positiveResponses ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {positiveResponses > negativeResponses ? 'Therapeutic Benefit' :
                         negativeResponses > positiveResponses ? 'Limited Efficacy' :
                         'Variable Response'}
                      </div>
                      {avgChange !== 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Avg change: {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {meds.map((med, idx) => {
                      const response = getMedicationResponse(med.symptomSeverityBefore, med.symptomSeverityAfter);

                      return (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(med.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-sm text-gray-600">{med.timeTaken}</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {med.dosage}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {response.type === 'positive' && (
                                <>
                                  <TrendingDown className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-700">
                                    {Math.abs(response.change).toFixed(1)} improvement
                                  </span>
                                </>
                              )}
                              {response.type === 'negative' && (
                                <>
                                  <TrendingUp className="h-4 w-4 text-red-600" />
                                  <span className="text-sm font-semibold text-red-700">
                                    +{Math.abs(response.change).toFixed(1)} worsening
                                  </span>
                                </>
                              )}
                              {response.type === 'neutral' && (
                                <>
                                  <Minus className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-700">No change</span>
                                </>
                              )}
                              {response.type === 'unknown' && (
                                <span className="text-sm text-gray-500 italic">Insufficient data</span>
                              )}
                            </div>
                          </div>

                          {med.symptomSeverityBefore !== null && med.symptomSeverityAfter !== null && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>Pre-dose: <span className="font-semibold text-gray-900">{med.symptomSeverityBefore.toFixed(1)}</span></span>
                              <span>→</span>
                              <span>Post-dose (4h): <span className="font-semibold text-gray-900">{med.symptomSeverityAfter.toFixed(1)}</span></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`text-sm p-3 rounded border-l-4 ${
                    positiveResponses > negativeResponses
                      ? 'bg-green-50 border-green-600 text-green-900'
                      : negativeResponses > positiveResponses
                      ? 'bg-red-50 border-red-600 text-red-900'
                      : 'bg-gray-50 border-gray-600 text-gray-900'
                  }`}>
                    <span className="font-semibold">Clinical Assessment: </span>
                    {positiveResponses > negativeResponses ? (
                      <>
                        Medication demonstrates consistent therapeutic efficacy with symptom reduction in majority
                        of administrations ({positiveResponses}/{meds.length}). Current regimen appears appropriate.
                      </>
                    ) : negativeResponses > positiveResponses ? (
                      <>
                        Limited therapeutic benefit observed with potential symptom exacerbation noted in
                        {negativeResponses}/{meds.length} administrations. Consider dose adjustment, timing modification,
                        or alternative pharmacologic intervention.
                      </>
                    ) : (
                      <>
                        Variable response pattern suggests inconsistent efficacy. May indicate need for dose optimization,
                        evaluation of medication timing relative to meals, or assessment of drug-drug interactions.
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Temporal Analysis Methodology</h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Pre-dose severity represents average symptom intensity 2 hours prior to medication administration.
              Post-dose severity represents average symptom intensity 4 hours following administration. This temporal
              window captures peak pharmacologic effect for most GI medications. Improvement ≥1 point considered
              clinically significant.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
