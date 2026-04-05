import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg';

  const variantStyles = {
    primary: 'bg-brand-500 hover:bg-brand-700 text-white focus-visible:ring-brand-500 dark:hover:bg-brand-300',
    secondary: 'bg-brand-700 hover:bg-brand-900 text-white focus-visible:ring-brand-500 dark:bg-brand-700 dark:hover:bg-brand-500',
    outline: 'border-2 border-neutral-border hover:border-neutral-text text-neutral-text hover:bg-neutral-bg focus-visible:ring-brand-500 dark:border-dark-border dark:text-dark-text dark:hover:border-dark-muted dark:hover:bg-dark-surface',
    ghost: 'text-brand-500 hover:bg-brand-100 focus-visible:ring-brand-500 dark:text-brand-300 dark:hover:bg-brand-900/20',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-body-sm',
    md: 'px-4 py-2.5 text-body-md',
    lg: 'px-6 py-3 text-body-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
