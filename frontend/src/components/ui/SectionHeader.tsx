import React from 'react';
import { Badge } from './Badge';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  centered = true,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 max-w-3xl mb-12',
        centered ? 'mx-auto text-center items-center' : 'items-start',
        className
      )}
    >
      {badge && <Badge variant="cyan">{badge}</Badge>}
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-sans">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-gray-400 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
