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
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Bristol Stool Scale Distribution
      </h2>

      {!hasData ? (
        <p className="text-gray-600 italic">No stool type data recorded during this period.</p>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map(type => {
              const data = distribution.find(d => d.type === type);
              const percentage = data?.percentage || 0;
              const count = data?.count || 0;
              const barWidth = maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0;
              const isNormal = type === 3 || type === 4;

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {bristolDescriptions[type].label}
                    </span>
                    <span className="text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isNormal
                          ? 'bg-green-500'
                          : type < 3
                          ? 'bg-amber-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    {bristolDescriptions[type].clinical}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-600 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Clinical Assessment</h3>
            <p className="text-sm text-gray-800 leading-relaxed">
              {isPredominallyNormal ? (
                <>
                  Stool consistency predominantly within normal parameters (Types 3-4: {normalPercentage.toFixed(1)}%).
                  Bristol Scale distribution suggests adequate hydration, fiber intake, and normal colonic transit time.
                  Continue current management regimen.
                </>
              ) : (
                <>
                  Stool consistency demonstrates deviation from optimal Bristol Types 3-4 ({normalPercentage.toFixed(1)}% normal).
                  Consider comprehensive evaluation of dietary fiber intake, fluid balance, medication effects, and
                  underlying gastrointestinal motility disorders. Therapeutic intervention may be warranted.
                </>
              )}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">Normal (Types 3-4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-gray-700">Constipation (Types 1-2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-700">Diarrhea (Types 5-7)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
