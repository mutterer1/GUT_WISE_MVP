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
        <linearGradient id="gw-outer-top" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#9ECFE4" />
          <stop offset="40%" stopColor="#5A9BB5" />
          <stop offset="100%" stopColor="#2C617D" />
        </linearGradient>
        <linearGradient id="gw-outer-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A8FA8" />
          <stop offset="100%" stopColor="#183C52" />
        </linearGradient>
        <linearGradient id="gw-gut-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B87880" />
          <stop offset="40%" stopColor="#C28F94" />
          <stop offset="100%" stopColor="#D4A5AA" />
        </linearGradient>
        <linearGradient id="gw-gut-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C4C8" />
          <stop offset="100%" stopColor="#D4A5AA" />
        </linearGradient>
        <linearGradient id="gw-purple-accent" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#9B85E8" />
          <stop offset="50%" stopColor="#8070D0" />
          <stop offset="100%" stopColor="#9B85E8" />
        </linearGradient>
        <filter id="gw-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#183C52" floodOpacity="0.25" />
        </filter>
        <filter id="gw-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#gw-shadow)">
        <path
          d="M82 50C82 67.673 67.673 82 50 82C32.327 82 18 67.673 18 50C18 32.327 32.327 18 50 18"
          stroke="url(#gw-outer-side)"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M82 50C82 67.673 67.673 82 50 82C32.327 82 18 67.673 18 50C18 32.327 32.327 18 50 18"
          stroke="url(#gw-outer-top)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M50 18C67.673 18 82 26 82 40"
          stroke="url(#gw-outer-side)"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M50 18C67.673 18 82 26 82 40"
          stroke="url(#gw-outer-top)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <path
        d="M26 58C30 44 38 42 46 52C50 57 54 62 60 57C65 53 68 47 72 44"
        stroke="url(#gw-gut-fill)"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M26 56C30 43 38 41 46 51C50 56 54 61 60 56C65 52 68 46 72 43"
        stroke="url(#gw-gut-highlight)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      <path
        d="M30 57C34 46 40 44 47 53C51 58 55 62 61 57C66 53 69 47 73 44"
        stroke="url(#gw-purple-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#gw-glow)"
        opacity="0.85"
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
