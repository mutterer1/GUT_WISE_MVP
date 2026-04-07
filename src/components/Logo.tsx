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
  xs: { icon: 20, text: 'text-sm', gap: 'gap-1.5' },
  sm: { icon: 24, text: 'text-lg', gap: 'gap-2' },
  md: { icon: 32, text: 'text-xl', gap: 'gap-2' },
  lg: { icon: 40, text: 'text-2xl', gap: 'gap-3' },
  xl: { icon: 48, text: 'text-3xl', gap: 'gap-3' },
  '2xl': { icon: 64, text: 'text-4xl', gap: 'gap-4' },
};

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
        <linearGradient id="gw-g-outer" gradientUnits="userSpaceOnUse" x1="15" y1="15" x2="85" y2="85">
          <stop offset="0%" stopColor="#183C52" />
          <stop offset="100%" stopColor="#0C2030" />
        </linearGradient>
        <linearGradient id="gw-g-mid" gradientUnits="userSpaceOnUse" x1="10" y1="10" x2="90" y2="90">
          <stop offset="0%" stopColor="#2C617D" />
          <stop offset="45%" stopColor="#3A7A96" />
          <stop offset="100%" stopColor="#1E4A62" />
        </linearGradient>
        <linearGradient id="gw-g-face" gradientUnits="userSpaceOnUse" x1="15" y1="15" x2="85" y2="85">
          <stop offset="0%" stopColor="#7AC8DC" />
          <stop offset="25%" stopColor="#56ADD0" />
          <stop offset="60%" stopColor="#4A8FA8" />
          <stop offset="100%" stopColor="#2E6A84" />
        </linearGradient>
        <linearGradient id="gw-g-shine" gradientUnits="userSpaceOnUse" x1="20" y1="15" x2="48" y2="58">
          <stop offset="0%" stopColor="#A8DCE8" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#70BDD0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4A8FA8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gw-gut-shadow" gradientUnits="userSpaceOnUse" x1="25" y1="55" x2="80" y2="55">
          <stop offset="0%" stopColor="#7A3E48" />
          <stop offset="50%" stopColor="#9A5060" />
          <stop offset="100%" stopColor="#8A4855" />
        </linearGradient>
        <linearGradient id="gw-gut-main" gradientUnits="userSpaceOnUse" x1="25" y1="44" x2="80" y2="64">
          <stop offset="0%" stopColor="#B87078" />
          <stop offset="40%" stopColor="#C28F94" />
          <stop offset="100%" stopColor="#D4A8AC" />
        </linearGradient>
        <linearGradient id="gw-gut-shine" gradientUnits="userSpaceOnUse" x1="25" y1="46" x2="80" y2="58">
          <stop offset="0%" stopColor="#EAC8CC" />
          <stop offset="60%" stopColor="#D8B0B5" />
          <stop offset="100%" stopColor="#C8A0A5" />
        </linearGradient>
        <linearGradient id="gw-spine" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#9B85E8" />
          <stop offset="50%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#9B85E8" />
        </linearGradient>
        <filter id="gw-drop" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0A1820" floodOpacity="0.45" />
        </filter>
        <filter id="gw-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#gw-drop)">
        <path
          d="M 77 28 A 35 35 0 1 0 82 52 L 67 52"
          stroke="url(#gw-g-outer)"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 77 28 A 35 35 0 1 0 82 52 L 67 52"
          stroke="url(#gw-g-mid)"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 77 28 A 35 35 0 1 0 82 52 L 67 52"
          stroke="url(#gw-g-face)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <path
        d="M 77 28 A 35 35 0 0 0 18 50"
        stroke="url(#gw-g-shine)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      <path
        d="M 27 54 C 32 40 43 40 50 50 C 55 57 60 62 66 57 C 71 53 75 46 77 43"
        stroke="url(#gw-gut-shadow)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 27 54 C 32 40 43 40 50 50 C 55 57 60 62 66 57 C 71 53 75 46 77 43"
        stroke="url(#gw-gut-main)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 28 52 C 33 38 44 38 51 48 C 56 55 61 60 67 55 C 72 51 76 44 78 41"
        stroke="url(#gw-gut-shine)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      <path
        d="M 31 63 C 38 52 47 54 53 62 C 57 68 63 72 70 66"
        stroke="url(#gw-gut-shadow)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <path
        d="M 31 63 C 38 52 47 54 53 62 C 57 68 63 72 70 66"
        stroke="url(#gw-gut-main)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      <path
        d="M 29 53 C 34 39 45 39 52 49 C 57 56 62 61 68 56 C 73 52 77 45 79 42"
        stroke="url(#gw-spine)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        filter="url(#gw-glow)"
        opacity="0.8"
      />
    </svg>
  );
}

function GutWiseIcon({ size }: { size: number }) {
  return <GutWiseSvgIcon size={size} />;
}

function GutWiseWordmark({ size, isDark }: { size: LogoSize; isDark: boolean }) {
  const textClass = sizeConfig[size].text;

  return (
    <span className={`font-sora font-semibold ${textClass} tracking-tight`}>
      <span className={isDark ? 'text-white' : 'text-neutral-text'}>
        Gut
      </span>
      <span className="text-discovery-500">
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

  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <GutWiseIcon size={config.icon} />
        {showHoverGlow && (
          <div className="absolute inset-0 bg-discovery-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
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
    <div className={`relative inline-flex items-center ${config.gap} ${className}`}>
      <div className="relative">
        <GutWiseIcon size={config.icon} />
        {showHoverGlow && (
          <div className="absolute inset-0 bg-discovery-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
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
