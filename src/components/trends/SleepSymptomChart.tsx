import { SleepSymptomCorrelation } from '../../hooks/useTrendsData';

interface SleepSymptomChartProps {
  data: SleepSymptomCorrelation[];
}

export default function SleepSymptomChart({ data }: SleepSymptomChartProps) {
  const hasData = data.some(d => d.sleepHours !== null || d.avgSymptomSeverity !== null);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No sleep or symptom data available for this period
      </div>
    );
  }

  const dates = data.filter(d => d.sleepHours !== null || d.avgSymptomSeverity !== null);
  const chartHeight = 240;
  const maxValue = 10;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Sleep Quality vs Symptom Severity</h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          {Array.from({ length: 6 }).map((_, i) => {
            const y = (chartHeight / 5) * i;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text x="-5" y={y + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">
                  {10 - i * 2}
                </text>
              </g>
            );
          })}

          {dates.length > 1 && (
            <>
              <polyline
                points={dates
                  .map((item, index) => {
                    if (item.sleepHours === null) return null;
                    const x = (index / (dates.length - 1)) * 100;
                    const y = chartHeight - (Math.min(item.sleepHours, 10) / maxValue) * chartHeight;
                    return `${x}%,${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <polyline
                points={dates
                  .map((item, index) => {
                    if (item.avgSymptomSeverity === null) return null;
                    const x = (index / (dates.length - 1)) * 100;
                    const y = chartHeight - (item.avgSymptomSeverity / maxValue) * chartHeight;
                    return `${x}%,${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
              />
            </>
          )}

          {dates.map((item, index) => {
            const x = (index / Math.max(dates.length - 1, 1)) * 100;
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <g key={index}>
                {item.sleepHours !== null && (
                  <circle
                    cx={`${x}%`}
                    cy={chartHeight - (Math.min(item.sleepHours, 10) / maxValue) * chartHeight}
                    r="4"
                    fill="#3B82F6"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${date}: ${item.sleepHours.toFixed(1)} hours sleep (Quality: ${item.sleepQuality || 'N/A'})`}</title>
                  </circle>
                )}
                {item.avgSymptomSeverity !== null && (
                  <circle
                    cx={`${x}%`}
                    cy={chartHeight - (item.avgSymptomSeverity / maxValue) * chartHeight}
                    r="4"
                    fill="#EF4444"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${date}: Avg symptom severity ${item.avgSymptomSeverity.toFixed(1)}/10`}</title>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex gap-6 pt-2 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600 rounded" />
          <span className="text-gray-700">Sleep Hours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-red-500 rounded border-t-2 border-dashed border-red-500" />
          <span className="text-gray-700">Symptom Severity</span>
        </div>
      </div>

      <div className="p-3 bg-amber-50 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Note:</strong> Better sleep quality (higher hours) typically correlates with lower symptom severity
        </p>
      </div>
    </div>
  );
}
