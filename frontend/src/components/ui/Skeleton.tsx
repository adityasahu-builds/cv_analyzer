import React from 'react';
import { cn } from '@/utils/cn';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-gray-800/60', className)}
      {...props}
    />
  );
};
