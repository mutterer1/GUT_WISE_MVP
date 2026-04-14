import { useMemo } from 'react';

interface Signal {
  label: string;
  logged: boolean;
  color: string;
  trackColor: string;
}

interface DailyProgressCircleProps {
  bmLogged: boolean;
  foodLogged: boolean;
  hydrationLogged: boolean;
  sleepLogged: boolean;
  symptomsLogged: boolean;
  size?: number;
  stroke?: number;
}

const GAP_ANGLE = 6;
const TOTAL_DEGREES = 360;

export default function DailyProgressCircle({
  bmLogged,
  foodLogged,
  hydrationLogged,
  sleepLogged,
  symptomsLogged,
  size = 120,
  stroke = 8,
}: DailyProgressCircleProps) {
  const RADIUS = (size - stroke) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const signals: Signal[] = useMemo(
    () => [
      { label: 'BM', logged: bmLogged, color: '#F59E0B', trackColor: 'rgba(245, 158, 11, 0.12)' },
      { label: 'Food', logged: foodLogged, color: '#F87171', trackColor: 'rgba(248, 113, 113, 0.12)' },
      { label: 'Hydration', logged: hydrationLogged, color: '#38BDF8', trackColor: 'rgba(56, 189, 248, 0.12)' },
      { label: 'Sleep', logged: sleepLogged, color: '#818CF8', trackColor: 'rgba(129, 140, 248, 0.12)' },
      { label: 'Symptoms', logged: symptomsLogged, color: '#C28F94', trackColor: 'rgba(194, 143, 148, 0.12)' },
    ],
    [bmLogged, foodLogged, hydrationLogged, sleepLogged, symptomsLogged]
  );

  const loggedCount = signals.filter((s) => s.logged).length;
  const totalSignals = signals.length;
  const totalGapDegrees = GAP_ANGLE * totalSignals;
  const availableDegrees = TOTAL_DEGREES - totalGapDegrees;
  const segmentDegrees = availableDegrees / totalSignals;
  const segmentLength = (segmentDegrees / 360) * CIRCUMFERENCE;

  const countFontSize = Math.round(size * 0.22);
  const labelFontSize = Math.round(size * 0.1);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        aria-label={`${loggedCount} of ${totalSignals} signals logged`}
        role="img"
      >
        {signals.map((signal, i) => {
          const startDegree = i * (segmentDegrees + GAP_ANGLE);
          const startOffset = (startDegree / 360) * CIRCUMFERENCE;

          return (
            <g key={signal.label}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={RADIUS}
                fill="none"
                stroke={signal.trackColor}
                strokeWidth={stroke}
                strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
                strokeDashoffset={-startOffset}
                strokeLinecap="round"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={RADIUS}
                fill="none"
                stroke={signal.logged ? signal.color : 'transparent'}
                strokeWidth={stroke}
                strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
                strokeDashoffset={-startOffset}
                strokeLinecap="round"
                className="progress-arc-segment"
                style={{
                  transition: 'stroke 0.6s ease-out, opacity 0.6s ease-out',
                  opacity: signal.logged ? 1 : 0,
                }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-sora font-semibold text-neutral-text dark:text-dark-text leading-none"
          style={{ fontSize: countFontSize }}
        >
          {loggedCount}
        </span>
        <span
          className="text-neutral-muted dark:text-dark-muted leading-none mt-1"
          style={{ fontSize: labelFontSize }}
        >
          of {totalSignals}
        </span>
      </div>
    </div>
  );
}
