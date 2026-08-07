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
  hoverEffect = true,
  glass = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300 relative overflow-hidden',
        glass ? 'glass-card' : 'bg-gray-950 border border-gray-800',
        hoverEffect && 'glass-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
