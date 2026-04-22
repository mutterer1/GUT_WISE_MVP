import { HydrationCorrelation } from '../../hooks/useTrendsData';

interface HydrationCorrelationChartProps {
  data: HydrationCorrelation[];
}

export default function HydrationCorrelationChart({ data }: HydrationCorrelationChartProps) {
  const hasData = data.some(
    (d) =>
      d.totalHydration > 0 ||
      d.effectiveHydration > 0 ||
      d.totalFluids > 0 ||
      d.avgBristolScale !== null
  );

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No water, fluid, or stool data available for this period
      </div>
    );
  }

  const maxHydration = Math.max(...data.map((d) => d.totalHydration), 1);
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text">
        Water Goal vs Stool Consistency
      </h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const hydrationHeight = (item.totalHydration / maxHydration) * (chartHeight - 60);
            const bristolScale = item.avgBristolScale;
            const date = new Date(item.date);
            const dateLabel = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            let bristolColor = '#D1D5DB';
            if (bristolScale) {
              if (bristolScale <= 2) bristolColor = '#8B4513';
              else if (bristolScale <= 4) bristolColor = '#10B981';
              else if (bristolScale <= 5) bristolColor = '#F59E0B';
              else bristolColor = '#EF4444';
            }

            return (
              <div key={index} className="group relative flex flex-1 flex-col items-center">
                <div className="flex w-full flex-col items-center gap-1">
                  {bristolScale !== null && (
                    <div
                      className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: bristolColor }}
                      title={`Bristol Scale: ${bristolScale.toFixed(1)}`}
                    />
                  )}
                  <div
                    className="w-full cursor-pointer rounded-t bg-blue-400 transition-all hover:bg-blue-500"
                    style={{ height: `${Math.max(hydrationHeight, 3)}px` }}
                    title={`${dateLabel}: ${item.totalHydration}ml water-goal credit`}
                  />
                </div>

                <div className="absolute -top-20 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <div>{dateLabel}</div>
                  <div>{item.totalHydration}ml water goal</div>
                  <div>{item.effectiveHydration}ml effective hydration</div>
                  <div>{item.totalFluids}ml total fluids</div>
                  {item.caffeineMg > 0 && <div>{item.caffeineMg}mg caffeine</div>}
                  {bristolScale !== null && <div>Bristol: {bristolScale.toFixed(1)}</div>}
                </div>

                <div className="mt-2 text-center text-xs text-neutral-muted dark:text-dark-muted">
                  {index % Math.ceil(data.length / 7) === 0 ? dateLabel : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-neutral-border pt-2 text-xs dark:border-dark-border">
        <div>
          <div className="mb-2 font-semibold text-neutral-text dark:text-dark-text">Water Scale</div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-400" />
            <span className="text-neutral-muted dark:text-dark-muted">
              Daily water-goal credit (ml)
            </span>
          </div>
        </div>

        <div>
          <div className="mb-2 font-semibold text-neutral-text dark:text-dark-text">
            Bristol Scale
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: '#8B4513' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Hard (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Normal (3-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Soft (5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-neutral-muted dark:text-dark-muted">Liquid (6-7)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
