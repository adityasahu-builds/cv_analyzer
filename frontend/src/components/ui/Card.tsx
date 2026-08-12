import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  glass,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token transition-all duration-300 relative overflow-hidden',
        hoverEffect && 'hover:border-[#059669]/40 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
