import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'emerald' | 'purple';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-9 gap-2',
      lg: 'text-base px-5 py-2.5 h-11 gap-2.5 font-semibold',
      icon: 'h-9 w-9 p-0',
    };

    const variantClasses = {
      primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm border border-zinc-800',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 border border-zinc-200',
      outline: 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-300 shadow-xs',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-rose-700',
      ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
      emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-emerald-700',
      purple: 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm border border-purple-700',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseClasses, sizeClasses[size], variantClasses[variant], className))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
