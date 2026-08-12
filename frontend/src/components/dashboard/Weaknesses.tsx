import React from 'react';
import { ArrowRight } from 'lucide-react';

interface WeaknessesProps {
  weaknesses: string[];
}

export const Weaknesses: React.FC<WeaknessesProps> = ({ weaknesses }) => {
  if (!weaknesses || weaknesses.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-bold text-amber-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <ArrowRight className="w-4 h-4 text-amber-600" /> Areas to Improve
      </p>
      <ul className="space-y-2.5">
        {weaknesses.map((w, i) => (
          <li key={i} className="flex items-start gap-2.5 bg-[#F7F8FA] p-3 rounded-[10px] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
            <span className="text-sm text-[#1A1A1A] leading-relaxed">{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
