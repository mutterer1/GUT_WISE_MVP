import { SymptomTrend } from '../../hooks/useTrendsData';

interface SymptomIntensityChartProps {
  data: SymptomTrend[];
}

const symptomColors: Record<string, string> = {
  bloating: '#3B82F6',
  cramping: '#EF4444',
  nausea: '#10B981',
  fatigue: '#F59E0B',
  headache: '#8B5CF6',
  diarrhea: '#EC4899',
  constipation: '#6366F1',
  default: '#6B7280',
};

export default function SymptomIntensityChart({ data }: SymptomIntensityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No symptom data available for this period
      </div>
    );
  }

  const symptomTypes = Array.from(new Set(data.map(d => d.symptomType)));
  const dates = Array.from(new Set(data.map(d => d.date))).sort();

  const symptomDataMap = new Map<string, Map<string, number>>();
  data.forEach(item => {
    if (!symptomDataMap.has(item.symptomType)) {
      symptomDataMap.set(item.symptomType, new Map());
    }
    symptomDataMap.get(item.symptomType)!.set(item.date, item.avgSeverity);
  });

  const maxSeverity = 10;
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-text dark:text-dark-text">Symptom Intensity Over Time</h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          <defs>
            {symptomTypes.map(symptom => (
              <linearGradient key={symptom} id={`gradient-${symptom}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={symptomColors[symptom] || symptomColors.default} stopOpacity="0.3" />
                <stop offset="100%" stopColor={symptomColors[symptom] || symptomColors.default} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

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

          {symptomTypes.map((symptom, symptomIndex) => {
            const symptomData = symptomDataMap.get(symptom)!;
            const points = dates.map((date, index) => {
              const severity = symptomData.get(date) || 0;
              const x = (index / (dates.length - 1)) * 100;
              const y = chartHeight - (severity / maxSeverity) * chartHeight;
              return `${x}%,${y}`;
            }).join(' ');

            const areaPoints = dates.map((date, index) => {
              const severity = symptomData.get(date) || 0;
              const x = (index / (dates.length - 1)) * 100;
              const y = chartHeight - (severity / maxSeverity) * chartHeight;
              return [x, y];
            });

            const areaPath = `
              M 0%,${chartHeight}
              ${areaPoints.map(([x, y]) => `L ${x}%,${y}`).join(' ')}
              L 100%,${chartHeight}
              Z
            `;

            return (
              <g key={symptom}>
                <path
                  d={areaPath}
                  fill={`url(#gradient-${symptom})`}
                  opacity="0.5"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke={symptomColors[symptom] || symptomColors.default}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {dates.map((date, index) => {
                  const severity = symptomData.get(date);
                  if (!severity) return null;
                  const x = (index / (dates.length - 1)) * 100;
                  const y = chartHeight - (severity / maxSeverity) * chartHeight;
                  return (
                    <circle
                      key={`${symptom}-${index}`}
                      cx={`${x}%`}
                      cy={y}
                      r="3"
                      fill={symptomColors[symptom] || symptomColors.default}
                      className="hover:r-5 transition-all cursor-pointer"
                    >
                      <title>{`${symptom} - ${new Date(date).toLocaleDateString()}: ${severity.toFixed(1)}/10`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 pt-2 border-t border-neutral-border dark:border-dark-border">
        {symptomTypes.map(symptom => (
          <div key={symptom} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: symptomColors[symptom] || symptomColors.default }}
            />
            <span className="text-sm text-neutral-muted dark:text-dark-muted capitalize">{symptom}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
