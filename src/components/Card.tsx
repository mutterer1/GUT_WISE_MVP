import { ReactNode } from 'react';

type GlowIntensity = 'subtle' | 'medium' | 'bright';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'glass' | 'flat' | 'discovery';
  glowIntensity?: GlowIntensity;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'elevated',
  glowIntensity = 'subtle'
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const getDiscoveryGlow = (intensity: GlowIntensity) => {
    switch (intensity) {
      case 'bright':
        return 'shadow-glow-bright dark:shadow-glow-bright dark:animate-glow-pulse border-discovery-500/30 dark:border-discovery-500/20';
      case 'medium':
        return 'shadow-glow-medium dark:shadow-glow-medium border-discovery-300/20 dark:border-discovery-500/15';
      case 'subtle':
      default:
        return 'shadow-glow-subtle dark:shadow-glow-subtle border-neutral-border dark:border-dark-border';
    }
  };

  const variantStyles = {
    elevated: 'bg-neutral-surface border border-neutral-border rounded-2xl shadow-soft dark:bg-dark-surface dark:border-dark-border dark:shadow-dark-soft',
    glass: 'bg-neutral-surface/80 backdrop-blur-soft border border-neutral-border/20 rounded-2xl shadow-glass dark:bg-dark-elevated/60 dark:border-dark-border dark:shadow-dark-glass',
    flat: 'bg-neutral-surface border border-neutral-border rounded-2xl dark:bg-dark-surface dark:border-dark-border',
    discovery: `bg-neutral-surface rounded-2xl dark:bg-dark-surface ${getDiscoveryGlow(glowIntensity)}`,
  };

  return (
    <div className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
