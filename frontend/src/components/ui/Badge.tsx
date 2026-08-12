import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'emerald' | 'accent' | 'amber' | 'rose' | 'slate' | 'glass' | 'indigo' | 'cyan' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    default: 'bg-[#F7F8FA] text-[#6B7280] border-[#E5E7EB]',
    accent:  'bg-[#059669]/10 text-[#059669] border-[#059669]/30 font-semibold',
    emerald: 'bg-[#059669]/10 text-[#059669] border-[#059669]/30 font-semibold',
    amber:   'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    rose:    'bg-red-50 text-red-600 border-red-200 font-semibold',
    slate:   'bg-[#F7F8FA] text-[#6B7280] border-[#E5E7EB]',
    indigo:  'bg-[#059669]/10 text-[#059669] border-[#059669]/30 font-semibold',
    cyan:    'bg-[#059669]/10 text-[#059669] border-[#059669]/30 font-semibold',
    purple:  'bg-[#059669]/10 text-[#059669] border-[#059669]/30 font-semibold',
    glass:   'bg-[#FFFFFF] text-[#1A1A1A] border-[#E5E7EB]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-[8px] border tracking-normal',
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
