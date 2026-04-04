import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'glass';
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'elevated'
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    elevated: 'bg-neutral-surface border border-neutral-border rounded-2xl shadow-soft',
    glass: 'bg-neutral-surface/80 backdrop-blur-soft border border-neutral-border/20 rounded-2xl shadow-glass',
  };

  return (
    <div className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
