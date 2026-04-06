import { useState } from 'react';
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
        <linearGradient id="g-outer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8D4E6" />
          <stop offset="50%" stopColor="#5A9BB5" />
          <stop offset="100%" stopColor="#2C617D" />
        </linearGradient>
        <linearGradient id="g-inner-grad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A8FA8" />
          <stop offset="100%" stopColor="#183C52" />
        </linearGradient>
        <linearGradient id="gut-rose-grad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#E5C4C7" />
          <stop offset="50%" stopColor="#D4A5AA" />
          <stop offset="100%" stopColor="#C28F94" />
        </linearGradient>
        <linearGradient id="gut-purple-grad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#B8A8FF" />
          <stop offset="50%" stopColor="#9B7FE6" />
          <stop offset="100%" stopColor="#7C5CFF" />
        </linearGradient>
        <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#shadow)">
        <path
          d="M82 50C82 67.673 67.673 82 50 82C32.327 82 18 72 18 50C18 28 32.327 18 50 18"
          stroke="url(#g-inner-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M82 50C82 67.673 67.673 82 50 82C32.327 82 18 72 18 50C18 28 32.327 18 50 18"
          stroke="url(#g-outer-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M50 18C67.673 18 82 24 82 36"
          stroke="url(#g-inner-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M50 18C67.673 18 82 24 82 36"
          stroke="url(#g-outer-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      </g>

      <path
        d="M28 56C35 42 42 48 50 56C58 64 65 58 72 44"
        stroke="url(#gut-rose-grad)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M32 57C37 46 43 50 50 57C57 64 63 58 68 48"
        stroke="url(#gut-purple-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow-effect)"
      />
    </svg>
  );
}

function GutWiseIcon({ size }: { size: number }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return <GutWiseSvgIcon size={size} />;
  }

  return (
    <img
      src="/gutwise-logo.png"
      alt="GutWise"
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={() => setImgError(true)}
    />
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
