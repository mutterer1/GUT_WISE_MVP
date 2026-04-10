import { HydrationCorrelation } from '../../hooks/useTrendsData';

interface HydrationCorrelationChartProps {
  data: HydrationCorrelation[];
}

export default function HydrationCorrelationChart({ data }: HydrationCorrelationChartProps) {
  const hasData = data.some(d => d.totalHydration > 0 || d.avgBristolScale !== null);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hydration or stool data available for this period
      </div>
    );
  }

  const maxHydration = Math.max(...data.map(d => d.totalHydration), 1);
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text">Hydration vs Stool Consistency</h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const hydrationHeight = (item.totalHydration / maxHydration) * (chartHeight - 60);
            const bristolScale = item.avgBristolScale;
            const date = new Date(item.date);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            let bristolColor = '#D1D5DB';
            if (bristolScale) {
              if (bristolScale <= 2) bristolColor = '#8B4513';
              else if (bristolScale <= 4) bristolColor = '#10B981';
              else if (bristolScale <= 5) bristolColor = '#F59E0B';
              else bristolColor = '#EF4444';
            }

            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div className="w-full flex flex-col items-center gap-1">
                  {bristolScale !== null && (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: bristolColor }}
                      title={`Bristol Scale: ${bristolScale.toFixed(1)}`}
                    />
                  )}
                  <div
                    className="w-full bg-blue-400 rounded-t transition-all hover:bg-blue-500 cursor-pointer"
                    style={{ height: `${Math.max(hydrationHeight, 3)}px` }}
                    title={`${dateLabel}: ${item.totalHydration}ml`}
                  />
                </div>
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  <div>{dateLabel}</div>
                  <div>{item.totalHydration}ml water</div>
                  {bristolScale !== null && <div>Bristol: {bristolScale.toFixed(1)}</div>}
                </div>
                <div className="mt-2 text-xs text-neutral-muted dark:text-dark-muted text-center">
                  {index % Math.ceil(data.length / 7) === 0 ? dateLabel : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-border dark:border-dark-border text-xs">
        <div>
          <div className="font-semibold text-neutral-text dark:text-dark-text mb-2">Hydration Scale</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded" />
            <span className="text-neutral-muted dark:text-dark-muted">Daily water intake (ml)</span>
          </div>
        </div>
        <div>
          <div className="font-semibold text-neutral-text dark:text-dark-text mb-2">Bristol Scale</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#8B4513' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Hard (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Normal (3-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Soft (5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Liquid (6-7)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
