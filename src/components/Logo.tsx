import { useTheme } from '../contexts/ThemeContext';

type LogoVariant = 'full' | 'icon' | 'wordmark';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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
};

function GutWiseIcon({ size, isDark }: { size: number; isDark: boolean }) {
  const uniqueId = isDark ? 'dark' : 'light';

  if (isDark) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`g-outer-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8D4E6" />
            <stop offset="40%" stopColor="#6BA3BD" />
            <stop offset="100%" stopColor="#4A8FA8" />
          </linearGradient>
          <linearGradient id={`g-inner-${uniqueId}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A9BB5" />
            <stop offset="100%" stopColor="#3D7A94" />
          </linearGradient>
          <linearGradient id={`gut-main-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5C4C7" />
            <stop offset="50%" stopColor="#D4A5AA" />
            <stop offset="100%" stopColor="#C28F94" />
          </linearGradient>
          <linearGradient id={`gut-accent-${uniqueId}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9B7FE6" />
            <stop offset="50%" stopColor="#8B6FD6" />
            <stop offset="100%" stopColor="#7B5FC6" />
          </linearGradient>
          <filter id={`glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M54 32C54 44.15 44.15 54 32 54C19.85 54 12 46 12 32C12 18 19.85 10 32 10"
          stroke={`url(#g-inner-${uniqueId})`}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M54 32C54 44.15 44.15 54 32 54C19.85 54 12 46 12 32C12 18 19.85 10 32 10"
          stroke={`url(#g-outer-${uniqueId})`}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M32 10C44.15 10 54 14 54 22"
          stroke={`url(#g-inner-${uniqueId})`}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M32 10C44.15 10 54 14 54 22"
          stroke={`url(#g-outer-${uniqueId})`}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        <path
          d="M18 36C22 28 27 31 32 36C37 41 42 38 46 30"
          stroke={`url(#gut-main-${uniqueId})`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M20 37C23 30 27 33 32 37C37 41 41 38 44 32"
          stroke={`url(#gut-accent-${uniqueId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${uniqueId})`}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`brand-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A8FA8" />
          <stop offset="50%" stopColor="#2C617D" />
          <stop offset="100%" stopColor="#183C52" />
        </linearGradient>
        <linearGradient id={`signal-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D9B3B7" />
          <stop offset="50%" stopColor="#C28F94" />
          <stop offset="100%" stopColor="#8D5D62" />
        </linearGradient>
        <linearGradient id={`discovery-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8A8FF" />
          <stop offset="100%" stopColor="#7C5CFF" />
        </linearGradient>
      </defs>

      <path
        d="M52 32C52 43.046 43.046 52 32 52C20.954 52 14 45 14 32C14 19 20.954 12 32 12"
        stroke={`url(#brand-gradient-${uniqueId})`}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M32 12C43.046 12 52 16 52 24"
        stroke={`url(#brand-gradient-${uniqueId})`}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      <path
        d="M20 34C24 28 28 30 32 34C36 38 40 36 44 30"
        stroke={`url(#signal-gradient-${uniqueId})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M22 35C25 30 28 32 32 35C36 38 39 36 42 32"
        stroke={`url(#discovery-gradient-${uniqueId})`}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
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
        <GutWiseIcon size={config.icon} isDark={isDark} />
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
        <GutWiseIcon size={config.icon} isDark={isDark} />
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
