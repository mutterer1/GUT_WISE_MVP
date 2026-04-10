import { AlertCircle } from 'lucide-react';
import { TriggerPattern } from '../../utils/clinicalReportQueries';

interface TriggerPatternsSectionProps {
  triggers: TriggerPattern[];
}

export default function TriggerPatternsSection({ triggers }: TriggerPatternsSectionProps) {
  const hasData = triggers.length > 0;

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        Trigger Pattern Analysis
      </p>

      {!hasData ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Insufficient data to identify statistically significant trigger patterns. Continued logging will improve detection accuracy.
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Dietary items showing temporal correlation with symptom occurrence (within 8 hours of consumption, minimum 3 exposures). Listed by correlation strength.
          </p>

          <div className="space-y-3 mb-5">
            {triggers.map((trigger, idx) => {
              const correlationPercentage = trigger.correlationStrength * 100;
              const isHighRisk = trigger.correlationStrength > 0.6;
              const isMediumRisk = trigger.correlationStrength > 0.4;

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-4 ${
                    isHighRisk
                      ? 'border-[#C28F94]/40 bg-[#C28F94]/8 dark:bg-[#C28F94]/8'
                      : isMediumRisk
                      ? 'border-amber-300/50 dark:border-amber-700/30 bg-amber-50/50 dark:bg-amber-900/8'
                      : 'border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        {isHighRisk && <AlertCircle className="h-3.5 w-3.5 text-[#8D5D62] dark:text-[#C28F94]" />}
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{trigger.trigger}</h3>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                        {trigger.category}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className={`text-xl font-bold tabular-nums ${
                        isHighRisk ? 'text-[#8D5D62] dark:text-[#C28F94]' :
                        isMediumRisk ? 'text-amber-600 dark:text-amber-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {correlationPercentage.toFixed(0)}%
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">correlation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 mb-0.5">Occurrences</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{trigger.occurrences}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 mb-0.5">Avg Severity</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {trigger.avgSymptomSeverity.toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-gray-500 mb-0.5">Signal</p>
                      <p className={`font-semibold ${
                        isHighRisk ? 'text-[#8D5D62] dark:text-[#C28F94]' :
                        isMediumRisk ? 'text-amber-600 dark:text-amber-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {isHighRisk ? 'Strong' : isMediumRisk ? 'Moderate' : 'Weak'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-200/60 dark:border-white/[0.05] pt-2.5">
                    {isHighRisk ? (
                      <>Strong temporal association observed. Consider discussing an elimination trial with your clinician to assess causality.</>
                    ) : isMediumRisk ? (
                      <>Moderate association. A 2–4 week dietary modification may be informative.</>
                    ) : (
                      <>Weak association observed. May be worth noting if other triggers have been addressed.</>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-600 dark:text-gray-300">Methodology:</span>{' '}
              Correlation strength represents the proportion of exposures followed by symptomatic events within 8 hours. Values above 0.6 indicate a strong observed association. Correlation does not establish causation.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
