import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'glass' | 'flat';
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
    elevated: 'bg-neutral-surface border border-neutral-border rounded-2xl shadow-soft dark:bg-dark-surface dark:border-dark-border dark:shadow-dark-soft',
    glass: 'bg-neutral-surface/80 backdrop-blur-soft border border-neutral-border/20 rounded-2xl shadow-glass dark:bg-dark-elevated/80 dark:border-dark-border dark:shadow-dark-glass',
    flat: 'bg-neutral-surface border border-neutral-border rounded-2xl dark:bg-dark-surface dark:border-dark-border',
  };

  return (
    <div className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
