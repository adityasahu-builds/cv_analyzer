'use client';

import React from 'react';

interface RecommendationsProps {
  recommendations: string[];
}

const getPriority = (rec: string, index: number) => {
  const text = rec.toLowerCase();
  if (text.includes('bullet') || text.includes('impact') || text.includes('metric') || index === 0) {
    return { label: 'High Priority', accent: 'border-l-red-500', labelClass: 'text-red-700 bg-red-50 border-red-200', boost: '+8 pts' };
  }
  if (text.includes('keyword') || text.includes('skill') || index === 1) {
    return { label: 'Medium Priority', accent: 'border-l-amber-500', labelClass: 'text-amber-700 bg-amber-50 border-amber-200', boost: '+4 pts' };
  }
  return { label: 'Low Priority', accent: 'border-l-[#059669]', labelClass: 'text-[#059669] bg-[#059669]/10 border-[#059669]/20', boost: '+2 pts' };
};

export const Recommendations: React.FC<RecommendationsProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">Actionable Recommendations</h3>
        </div>
        <span className="text-xs text-[#6B7280]">{recommendations.length} action items</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const tier = getPriority(rec, idx);
          return (
            <div
              key={idx}
              className={`pl-4 border-l-2 ${tier.accent} py-3 pr-4 bg-[#F7F8FA] rounded-r-[10px] border-y border-r border-[#E5E7EB] flex items-start justify-between gap-4`}
            >
              <div className="flex flex-col gap-1.5 flex-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border w-fit ${tier.labelClass}`}>
                  {tier.label}
                </span>
                <p className="text-sm text-[#1A1A1A] leading-relaxed">{rec}</p>
              </div>
              <span className="flex-shrink-0 text-xs font-bold text-[#059669] bg-[#059669]/10 border border-[#059669]/20 px-2.5 py-1 rounded-[6px] whitespace-nowrap">
                {tier.boost}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
