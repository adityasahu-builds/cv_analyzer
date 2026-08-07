import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'glass';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  className,
  ...props
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    glass: 'bg-white/5 text-gray-200 border-white/10 backdrop-blur-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
