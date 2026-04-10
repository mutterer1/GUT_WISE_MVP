import { StressUrgencyCorrelation } from '../../hooks/useTrendsData';

interface StressUrgencyChartProps {
  data: StressUrgencyCorrelation[];
}

export default function StressUrgencyChart({ data }: StressUrgencyChartProps) {
  const hasData = data.some(d => d.avgStressLevel !== null || d.avgUrgency !== null);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No stress or urgency data available for this period
      </div>
    );
  }

  const maxValue = 10;
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text">Stress Level vs Bowel Urgency</h3>

      <div className="relative" style={{ height: `${chartHeight + 40}px` }}>
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

          {data.map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <g key={index}>
                {item.avgStressLevel !== null && (
                  <>
                    <line
                      x1={`${x}%`}
                      y1={chartHeight}
                      x2={`${x}%`}
                      y2={chartHeight - (item.avgStressLevel / maxValue) * chartHeight}
                      stroke="#8B5CF6"
                      strokeWidth="8"
                      opacity="0.6"
                      className="hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <title>{`${date}: Stress ${item.avgStressLevel.toFixed(1)}/10`}</title>
                    </line>
                  </>
                )}
                {item.avgUrgency !== null && (
                  <circle
                    cx={`${x}%`}
                    cy={chartHeight - (item.avgUrgency / maxValue) * chartHeight}
                    r="5"
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="hover:r-7 transition-all cursor-pointer"
                  >
                    <title>{`${date}: Urgency ${item.avgUrgency.toFixed(1)}/10 (${item.urgencyEpisodes} high urgency episodes)`}</title>
                  </circle>
                )}

                {item.urgencyEpisodes > 0 && (
                  <text
                    x={`${x}%`}
                    y={chartHeight + 15}
                    fontSize="10"
                    fill="#DC2626"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {item.urgencyEpisodes}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-neutral-muted dark:text-dark-muted">
          Red numbers indicate high urgency episodes (≥7/10)
        </div>
      </div>

      <div className="flex gap-6 pt-2 border-t border-neutral-border dark:border-dark-border text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded opacity-60" />
          <span className="text-neutral-muted dark:text-dark-muted">Stress Level (bars)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white" />
          <span className="text-neutral-muted dark:text-dark-muted">Urgency Level (dots)</span>
        </div>
      </div>

      <div className="p-3 bg-brand-500/8 dark:bg-brand-500/12 rounded-lg border border-brand-500/20 dark:border-brand-500/25">
        <p className="text-xs text-brand-700 dark:text-brand-300">
          <strong>Insight:</strong> Higher stress levels often correlate with increased bowel urgency and frequency
        </p>
      </div>
    </div>
  );
}
