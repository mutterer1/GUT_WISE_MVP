import { AlertCircle } from 'lucide-react';
import { TriggerPattern } from '../../utils/clinicalReportQueries';

interface TriggerPatternsSectionProps {
  triggers: TriggerPattern[];
}

export default function TriggerPatternsSection({ triggers }: TriggerPatternsSectionProps) {
  const hasData = triggers.length > 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Trigger Pattern Analysis
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">
          Insufficient data to identify statistically significant trigger patterns. Continued logging recommended
          for pattern recognition analysis.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              The following dietary items demonstrate statistically significant correlation with symptom occurrence
              (correlation strength &gt;0.3). Listed in descending order of correlation strength.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {triggers.map((trigger, idx) => {
              const correlationPercentage = trigger.correlationStrength * 100;
              const isHighRisk = trigger.correlationStrength > 0.6;
              const isMediumRisk = trigger.correlationStrength > 0.4;

              return (
                <div
                  key={idx}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    isHighRisk ? 'border-red-600 bg-red-50' :
                    isMediumRisk ? 'border-orange-500 bg-orange-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isHighRisk && <AlertCircle className="h-5 w-5 text-red-600" />}
                        <h3 className="text-lg font-semibold text-gray-900">{trigger.trigger}</h3>
                      </div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">
                        {trigger.category} trigger
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isHighRisk ? 'text-red-700' :
                        isMediumRisk ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>
                        {correlationPercentage.toFixed(0)}%
                      </div>
                      <p className="text-xs text-gray-600">correlation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Occurrences</p>
                      <p className="font-semibold text-gray-900">{trigger.occurrences}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Avg Symptom Severity</p>
                      <p className="font-semibold text-gray-900">
                        {trigger.avgSymptomSeverity.toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Risk Level</p>
                      <p className={`font-semibold ${
                        isHighRisk ? 'text-red-700' :
                        isMediumRisk ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>
                        {isHighRisk ? 'High' : isMediumRisk ? 'Medium' : 'Low'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">Clinical Recommendation:</span>
                      {isHighRisk ? (
                        <> Strong temporal association between consumption and symptom manifestation.
                        Recommend strict elimination and formal challenge testing under medical supervision
                        to establish causality.</>
                      ) : isMediumRisk ? (
                        <> Moderate correlation suggests potential trigger. Consider elimination trial for
                        2-4 weeks with symptom monitoring to assess clinical response.</>
                      ) : (
                        <> Weak-to-moderate association observed. May warrant dietary modification if other
                        interventions fail to provide adequate symptom control.</>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Methodology Note</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              Trigger analysis evaluates temporal correlation between dietary intake and symptom occurrence within
              an 8-hour post-consumption window. Correlation strength represents the proportion of exposures followed
              by symptomatic events. Values &gt;0.6 indicate high likelihood of causative relationship. Analysis requires
              minimum 3 exposures for statistical validity.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
