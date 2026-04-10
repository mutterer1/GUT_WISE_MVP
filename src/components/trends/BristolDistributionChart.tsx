import { BristolDistribution } from '../../hooks/useTrendsData';

interface BristolDistributionChartProps {
  data: BristolDistribution[];
}

const bristolLabels: Record<number, string> = {
  1: 'Separate hard lumps',
  2: 'Lumpy and sausage-like',
  3: 'Sausage with cracks',
  4: 'Smooth, soft sausage',
  5: 'Soft blobs with clear edges',
  6: 'Mushy consistency',
  7: 'Liquid consistency',
};

const bristolColors: Record<number, string> = {
  1: '#8B4513',
  2: '#A0522D',
  3: '#CD853F',
  4: '#DEB887',
  5: '#F4A460',
  6: '#DAA520',
  7: '#FFA500',
};

export default function BristolDistributionChart({ data }: BristolDistributionChartProps) {
  const hasData = data.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No Bristol Scale data available for this period
      </div>
    );
  }

  const maxPercentage = Math.max(...data.map(d => d.percentage));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text">Bristol Stool Scale Distribution</h3>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-text dark:text-dark-text w-6">Type {item.type}</span>
                <span className="text-neutral-muted dark:text-dark-muted text-xs">{bristolLabels[item.type]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-muted dark:text-dark-muted">{item.count}</span>
                <span className="font-semibold text-neutral-text dark:text-dark-text w-12 text-right">{item.percentage}%</span>
              </div>
            </div>
            <div className="relative h-6 bg-neutral-border dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end px-2"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: bristolColors[item.type],
                }}
              >
                {item.percentage > 10 && (
                  <span className="text-xs font-medium text-white">
                    {item.percentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-brand-500/8 dark:bg-brand-500/12 rounded-lg border border-brand-500/20 dark:border-brand-500/25">
        <p className="text-xs text-brand-700 dark:text-brand-300">
          <strong>Ideal range:</strong> Types 3-4 indicate normal, healthy stools
        </p>
      </div>
    </div>
  );
}
