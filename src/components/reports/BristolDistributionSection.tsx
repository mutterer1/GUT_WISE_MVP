import { BristolDistribution } from '../../utils/clinicalReportQueries';

interface BristolDistributionSectionProps {
  distribution: BristolDistribution[];
}

const bristolDescriptions: Record<number, { label: string; note: string }> = {
  1: { label: 'Type 1: Separate hard lumps', note: 'Constipation pattern' },
  2: { label: 'Type 2: Lumpy and sausage-like', note: 'Constipation pattern' },
  3: { label: 'Type 3: Sausage-shaped with cracks', note: 'Typical mid-range form' },
  4: { label: 'Type 4: Smooth, soft sausage', note: 'Typical mid-range form' },
  5: { label: 'Type 5: Soft blobs with clear edges', note: 'Looser than mid-range' },
  6: { label: 'Type 6: Mushy consistency', note: 'Loose stool pattern' },
  7: { label: 'Type 7: Liquid consistency', note: 'Very loose stool pattern' },
};

export default function BristolDistributionSection({
  distribution,
}: BristolDistributionSectionProps) {
  const hasData = distribution.length > 0;
  const maxPercentage = Math.max(...distribution.map((d) => d.percentage), 1);

  const normalTypes = distribution.filter((d) => d.type === 3 || d.type === 4);
  const normalPercentage = normalTypes.reduce((sum, d) => sum + d.percentage, 0);
  const isPredominantlyMidRange = normalPercentage > 60;

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-6 print:border-gray-300 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/[0.06]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Bristol Stool Scale
        </p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Observed stool form distribution
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This section summarizes the stool-form categories recorded during the selected period.
        </p>
      </div>

      {!hasData ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          No stool type data was recorded during this period.
        </p>
      ) : (
        <>
          <div className="mb-5 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((type) => {
              const data = distribution.find((d) => d.type === type);
              const percentage = data?.percentage ?? 0;
              const count = data?.count ?? 0;
              const barWidth = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;
              const isMidRange = type === 3 || type === 4;

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <div className="min-w-0">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {bristolDescriptions[type].label}
                      </span>
                      <span className="ml-2 text-gray-400 dark:text-gray-500">
                        {bristolDescriptions[type].note}
                      </span>
                    </div>
                    <span className="ml-4 flex-shrink-0 tabular-nums text-gray-500 dark:text-gray-400">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="h-5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                    <div
                      className={`h-full transition-all ${
                        isMidRange
                          ? 'bg-[#4A8FA8]'
                          : type < 3
                            ? 'bg-amber-400 dark:bg-amber-500'
                            : 'bg-[#C28F94]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-4 rounded-xl border border-[#4A8FA8]/20 bg-[#4A8FA8]/08 p-4 dark:bg-[#4A8FA8]/10">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2C617D] dark:text-[#8EBFD8]">
              Summary
            </p>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {isPredominantlyMidRange
                ? `Mid-range stool forms (Types 3-4) made up ${normalPercentage.toFixed(
                    0
                  )}% of logged entries in this period.`
                : `Mid-range stool forms (Types 3-4) made up ${normalPercentage.toFixed(
                    0
                  )}% of logged entries in this period, with more variation toward firmer or looser forms.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[#4A8FA8]" />
              <span>Mid-range (3-4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-amber-400 dark:bg-amber-500" />
              <span>Firmer (1-2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[#C28F94]" />
              <span>Looser (5-7)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
