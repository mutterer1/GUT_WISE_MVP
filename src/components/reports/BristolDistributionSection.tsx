import { BristolDistribution } from '../../utils/clinicalReportQueries';

interface BristolDistributionSectionProps {
  distribution: BristolDistribution[];
}

const bristolDescriptions: { [key: number]: { label: string; clinical: string } } = {
  1: { label: 'Type 1: Separate hard lumps', clinical: 'Severe constipation' },
  2: { label: 'Type 2: Lumpy and sausage-like', clinical: 'Mild constipation' },
  3: { label: 'Type 3: Sausage-shaped with cracks', clinical: 'Normal (optimal)' },
  4: { label: 'Type 4: Smooth, soft sausage', clinical: 'Normal (optimal)' },
  5: { label: 'Type 5: Soft blobs with clear edges', clinical: 'Lacking fiber' },
  6: { label: 'Type 6: Mushy consistency', clinical: 'Mild diarrhea' },
  7: { label: 'Type 7: Liquid consistency', clinical: 'Severe diarrhea' },
};

export default function BristolDistributionSection({ distribution }: BristolDistributionSectionProps) {
  const maxPercentage = Math.max(...distribution.map(d => d.percentage), 1);
  const hasData = distribution.length > 0;

  const normalTypes = distribution.filter(d => d.type === 3 || d.type === 4);
  const normalPercentage = normalTypes.reduce((sum, d) => sum + d.percentage, 0);
  const isPredominallyNormal = normalPercentage > 60;

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 mb-5 print:border-gray-300">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        Bristol Stool Scale Distribution
      </p>

      {!hasData ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No stool type data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {[1, 2, 3, 4, 5, 6, 7].map(type => {
              const data = distribution.find(d => d.type === type);
              const percentage = data?.percentage || 0;
              const count = data?.count || 0;
              const barWidth = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;
              const isNormal = type === 3 || type === 4;

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {bristolDescriptions[type].label}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        {bristolDescriptions[type].clinical}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 tabular-nums ml-4 flex-shrink-0">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isNormal
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

          <div className="bg-[#4A8FA8]/8 dark:bg-[#4A8FA8]/10 border border-[#4A8FA8]/20 rounded-xl p-4 mb-4">
            <h3 className="text-xs font-semibold text-[#2C617D] dark:text-[#8EBFD8] uppercase tracking-wide mb-1.5">Observation</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {isPredominallyNormal ? (
                <>
                  Stool consistency is predominantly within normal parameters (Types 3–4: {normalPercentage.toFixed(0)}%).
                  Distribution suggests adequate hydration and fiber intake with normal colonic transit.
                </>
              ) : (
                <>
                  Normal consistency (Types 3–4) accounts for {normalPercentage.toFixed(0)}% of logged entries.
                  A distribution pattern leaning toward firmer or looser stools may reflect dietary, hydration, or motility factors worth discussing with a clinician.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#4A8FA8] rounded"></div>
              <span>Normal (3–4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-400 dark:bg-amber-500 rounded"></div>
              <span>Constipation (1–2)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#C28F94] rounded"></div>
              <span>Loose (5–7)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
