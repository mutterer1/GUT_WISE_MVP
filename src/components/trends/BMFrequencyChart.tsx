import { BMFrequencyData } from '../../hooks/useTrendsData';

interface BMFrequencyChartProps {
  data: BMFrequencyData[];
}

export default function BMFrequencyChart({ data }: BMFrequencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No bowel movement data available for this period
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const avgFrequency = (data.reduce((sum, d) => sum + d.count, 0) / data.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text">Daily Frequency Trend</h3>
        <div className="text-sm text-neutral-muted dark:text-dark-muted">
          Avg: <span className="font-semibold text-brand-500 dark:text-brand-300">{avgFrequency}</span> per day
        </div>
      </div>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const heightPercent = (item.count / maxCount) * 100;
            const date = new Date(item.date);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                    style={{ height: `${Math.max(heightPercent, 3)}px` }}
                    title={`${dateLabel}: ${item.count} BM${item.count !== 1 ? 's' : ''}`}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.count} BM{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="mt-2 text-xs text-neutral-muted dark:text-dark-muted rotate-0 text-center">
                  {index % Math.ceil(data.length / 7) === 0 ? dateLabel : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-muted dark:text-dark-muted pt-2 border-t border-neutral-border dark:border-dark-border">
        <span>0 BMs</span>
        <span>{maxCount} BMs</span>
      </div>
    </div>
  );
}
