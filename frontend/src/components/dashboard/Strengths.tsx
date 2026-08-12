import React from 'react';
import { Check } from 'lucide-react';

interface StrengthsProps {
  strengths: string[];
}

export const Strengths: React.FC<StrengthsProps> = ({ strengths }) => {
  if (!strengths || strengths.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-bold text-[#059669] mb-3 uppercase tracking-wider flex items-center gap-1.5">
        <Check className="w-4 h-4 text-[#059669]" /> Strengths
      </p>
      <ul className="space-y-2.5">
        {strengths.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 bg-[#F7F8FA] p-3 rounded-[10px] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] shrink-0 mt-2" />
            <span className="text-sm text-[#1A1A1A] leading-relaxed">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
