import { AlertCircle } from 'lucide-react';
import { TriggerPattern } from '../../utils/clinicalReportQueries';

interface TriggerPatternsSectionProps {
  triggers: TriggerPattern[];
}

function getSignalLevel(correlationStrength: number): {
  label: string;
  containerClass: string;
  valueClass: string;
  summary: string;
} {
  if (correlationStrength > 0.6) {
    return {
      label: 'Stronger signal',
      containerClass: 'border-[#C28F94]/40 bg-[#C28F94]/08 dark:bg-[#C28F94]/08',
      valueClass: 'text-[#8D5D62] dark:text-[#C28F94]',
      summary:
        'This item appeared with a stronger repeated short-window association in the current dataset.',
    };
  }

  if (correlationStrength > 0.4) {
    return {
      label: 'Moderate signal',
      containerClass:
        'border-amber-300/50 bg-amber-50/50 dark:border-amber-700/30 dark:bg-amber-900/08',
      valueClass: 'text-amber-600 dark:text-amber-400',
      summary:
        'This item showed a moderate repeated short-window association in the current dataset.',
    };
  }

  return {
    label: 'Weaker signal',
    containerClass: 'border-gray-200 bg-gray-50/50 dark:border-white/[0.06] dark:bg-white/[0.02]',
    valueClass: 'text-gray-600 dark:text-gray-400',
    summary:
      'This item showed a weaker association and should be treated as lower-priority context.',
  };
}

export default function TriggerPatternsSection({
  triggers,
}: TriggerPatternsSectionProps) {
  const hasData = triggers.length > 0;

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Trigger Patterns
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Logged food-related associations
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          These items are ranked by how often symptoms appeared within the modeled post-meal window.
        </p>
      </div>

      {!hasData ? (
        <p className="text-sm italic leading-relaxed text-gray-500 dark:text-gray-400">
          Not enough repeated food and symptom overlap was available to highlight trigger patterns in
          this period.
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Listed items reflect temporal overlap in the current dataset. These associations are useful
            discussion points, not proof of causation.
          </p>

          <div className="mb-5 space-y-3">
            {triggers.map((trigger, index) => {
              const signal = getSignalLevel(trigger.correlationStrength);
              const correlationPercentage = trigger.correlationStrength * 100;

              return (
                <div
                  key={`${trigger.trigger}-${index}`}
                  className={`rounded-xl border p-4 ${signal.containerClass}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        {trigger.correlationStrength > 0.6 && (
                          <AlertCircle className="h-3.5 w-3.5 text-[#8D5D62] dark:text-[#C28F94]" />
                        )}
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {trigger.trigger}
                        </h4>
                      </div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {trigger.category}
                      </p>
                    </div>

                    <div className="ml-4 flex-shrink-0 text-right">
                      <div className={`text-xl font-bold tabular-nums ${signal.valueClass}`}>
                        {correlationPercentage.toFixed(0)}%
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">association rate</p>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-3 text-xs">
                    <Stat label="Occurrences" value={String(trigger.occurrences)} />
                    <Stat
                      label="Avg symptom severity"
                      value={`${trigger.avgSymptomSeverity.toFixed(1)}/10`}
                    />
                    <Stat label="Signal" value={signal.label} valueClass={signal.valueClass} />
                  </div>

                  <div className="border-t border-gray-200/60 pt-2.5 text-xs leading-relaxed text-gray-600 dark:border-white/[0.05] dark:text-gray-400">
                    {signal.summary}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-600 dark:text-gray-300">Method:</span>{' '}
              Association rate reflects the share of logged exposures followed by symptoms within the
              modeled window. Higher values indicate stronger repeated overlap in this dataset.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="mb-0.5 text-gray-400 dark:text-gray-500">{label}</p>
      <p className={`font-semibold text-gray-800 dark:text-gray-200 ${valueClass ?? ''}`}>{value}</p>
    </div>
  );
}
