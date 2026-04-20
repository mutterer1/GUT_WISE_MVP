import { useTheme } from '../contexts/ThemeContext';

type LogoVariant = 'full' | 'icon' | 'wordmark';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showHoverGlow?: boolean;
}

const sizeConfig = {
  xs: { icon: 20, text: 'text-[14px]', gap: 'gap-1.5' },
  sm: { icon: 24, text: 'text-[18px]', gap: 'gap-2' },
  md: { icon: 32, text: 'text-[24px]', gap: 'gap-2.5' },
  lg: { icon: 40, text: 'text-[30px]', gap: 'gap-3' },
  xl: { icon: 48, text: 'text-[38px]', gap: 'gap-3.5' },
  '2xl': { icon: 64, text: 'text-[48px]', gap: 'gap-4' },
} as const;

function GutWiseSvgIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gw-orbit-outer" x1="14" y1="14" x2="84" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBE3EE" />
          <stop offset="52%" stopColor="#6E9DBB" />
          <stop offset="100%" stopColor="#2A4358" />
        </linearGradient>

        <linearGradient id="gw-orbit-inner" x1="20" y1="16" x2="82" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F4FBFF" />
          <stop offset="28%" stopColor="#90BBD3" />
          <stop offset="100%" stopColor="#4D6D84" />
        </linearGradient>

        <linearGradient id="gw-core-main" x1="24" y1="39" x2="79" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D6ADB4" />
          <stop offset="48%" stopColor="#B37D89" />
          <stop offset="100%" stopColor="#7E5663" />
        </linearGradient>

        <linearGradient id="gw-core-highlight" x1="26" y1="42" x2="73" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2D9DE" />
          <stop offset="55%" stopColor="#DDBAC1" />
          <stop offset="100%" stopColor="#C1939C" />
        </linearGradient>

        <linearGradient id="gw-accent" x1="30" y1="50" x2="79" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C6BAFF" />
          <stop offset="50%" stopColor="#8F73FA" />
          <stop offset="100%" stopColor="#6B57D9" />
        </linearGradient>

        <filter id="gw-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#020610" floodOpacity="0.35" />
        </filter>

        <filter id="gw-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#gw-shadow)">
        <path
          d="M77 28A35 35 0 1 0 82 52H67"
          stroke="url(#gw-orbit-outer)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M77 28A35 35 0 1 0 82 52H67"
          stroke="url(#gw-orbit-inner)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          d="M27 54C32 40 43 40 50 50C55 57 60 62 66 57C71 53 75 46 77 43"
          stroke="url(#gw-core-main)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M28 52C33 39 44 39 51 48C56 55 61 60 67 55C72 51 76 44 78 41"
          stroke="url(#gw-core-highlight)"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        <path
          d="M31 63C38 52 47 54 53 62C57 68 63 72 70 66"
          stroke="url(#gw-core-main)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.65"
        />

        <path
          d="M29 53C34 39 45 39 52 49C57 56 62 61 68 56C73 52 77 45 79 42"
          stroke="url(#gw-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#gw-soft-glow)"
          opacity="0.82"
        />
      </g>
    </svg>
  );
}

function GutWiseIcon({ size }: { size: number }) {
  return <GutWiseSvgIcon size={size} />;
}

function GutWiseWordmark({
  size,
  isDark,
}: {
  size: LogoSize;
  isDark: boolean;
}) {
  const textClass = sizeConfig[size].text;

  return (
    <span
      className={`font-[var(--gw-font-display)] font-semibold leading-none tracking-[-0.04em] ${textClass}`}
    >
      <span className={isDark ? 'text-[var(--gw-dark-text)]' : 'text-[var(--gw-neutral-0)]'}>
        Gut
      </span>
      <span className="bg-[var(--gw-gradient-intelligence)] bg-clip-text text-transparent">
        Wise
      </span>
    </span>
  );
}

export default function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  showHoverGlow = false,
}: LogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const config = sizeConfig[size];
  const glowClass = showHoverGlow
    ? 'transition-smooth group-hover:opacity-100 opacity-0'
    : 'hidden';

  if (variant === 'icon') {
    return (
      <div className={`group relative inline-flex items-center justify-center ${className}`}>
        <GutWiseIcon size={config.icon} />
        <div
          className={`pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(143,128,246,0.26)_0%,rgba(143,128,246,0.08)_42%,transparent_72%)] blur-xl ${glowClass}`}
        />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={className}>
        <GutWiseWordmark size={size} isDark={isDark} />
      </div>
    );
  }

  return (
    <div className={`group relative inline-flex items-center ${config.gap} ${className}`}>
      <div className="relative flex-shrink-0">
        <GutWiseIcon size={config.icon} />
        <div
          className={`pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(143,128,246,0.24)_0%,rgba(79,132,163,0.10)_48%,transparent_75%)] blur-xl ${glowClass}`}
        />
      </div>
      <GutWiseWordmark size={size} isDark={isDark} />
    </div>
  );
}

export function LogoFull(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="full" />;
}

export function LogoIcon(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="icon" />;
}

export function LogoWordmark(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="wordmark" />;
}
