import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'dark' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, asChild, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-[10px] cursor-pointer select-none';

    const variants = {
      primary:
        'bg-[#059669] hover:bg-[#047857] active:bg-[#047857] text-white font-semibold shadow-sm',
      accent:
        'bg-[#059669] hover:bg-[#047857] text-white font-semibold shadow-sm',
      secondary:
        'bg-[#FFFFFF] hover:bg-[#F7F8FA] active:bg-[#E5E7EB] text-[#1A1A1A] border border-[#E5E7EB] shadow-sm',
      dark:
        'bg-[#1A1A1A] hover:bg-[#047857] text-white shadow-sm',
      glass:
        'bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E5E7EB] text-[#1A1A1A]',
      outline:
        'bg-transparent border border-[#E5E7EB] hover:border-[#059669] text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F7F8FA]',
      ghost:
        'bg-transparent text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F7F8FA]',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
