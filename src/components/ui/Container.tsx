import React from 'react';
import { cn } from '@/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  clean?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  clean = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
        clean && 'px-0 sm:px-0 lg:px-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
