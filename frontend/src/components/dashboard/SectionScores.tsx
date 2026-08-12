'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SectionScore } from '@/types/resume';

interface SectionScoresProps {
  sections: Record<string, SectionScore>;
}

const getScoreStyle = (score: number) => {
  if (score >= 85) return { bar: 'bg-[#059669]', label: 'Strong', labelClass: 'text-[#059669] bg-[#059669]/10 border-[#059669]/20' };
  if (score >= 70) return { bar: 'bg-[#059669]', label: 'Good', labelClass: 'text-[#059669] bg-[#059669]/10 border-[#059669]/20' };
  return              { bar: 'bg-amber-500', label: 'Needs work', labelClass: 'text-amber-700 bg-amber-50 border-amber-200' };
};

export const SectionScores: React.FC<SectionScoresProps> = ({ sections }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">Section Audit Breakdown</h3>
        </div>
        <span className="text-xs text-[#6B7280]">{Object.keys(sections).length} sections audited</span>
      </div>

      <div className="divide-y divide-[#E5E7EB]">
        {Object.entries(sections).map(([key, sec]) => {
          const style = getScoreStyle(sec.score);
          const isExpanded = expanded === key;
          const hasFeedback = sec.feedback || (sec.strengths && sec.strengths.length > 0) || (sec.improvements && sec.improvements.length > 0);

          return (
            <div key={key}>
              <div
                className={`flex items-center gap-4 py-3.5 ${hasFeedback ? 'cursor-pointer hover:bg-[#F7F8FA] -mx-2 px-2 rounded-[10px] transition-colors' : ''}`}
                onClick={() => hasFeedback && setExpanded(isExpanded ? null : key)}
              >
                {/* Name */}
                <span className="text-sm font-bold text-[#1A1A1A] w-36 flex-shrink-0">
                  {sec.name || key}
                </span>

                {/* Bar */}
                <div className="flex-1 h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden border border-[#E5E7EB]">
                  <div
                    className={`h-full ${style.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.max(4, sec.score)}%` }}
                  />
                </div>

                {/* Score */}
                <span className="text-sm font-bold text-[#1A1A1A] w-8 text-right flex-shrink-0 font-mono">
                  {sec.score}
                </span>

                {/* Label */}
                <span className={`hidden sm:inline text-xs font-semibold px-2.5 py-0.5 rounded-[6px] border w-24 text-center ${style.labelClass}`}>
                  {style.label}
                </span>

                {/* Expand */}
                {hasFeedback && (
                  <button className="flex-shrink-0 text-[#6B7280] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="pb-4 px-2 animate-in fade-in duration-150">
                  {sec.feedback && (
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-3 bg-[#F7F8FA] p-3 rounded-[10px] border border-[#E5E7EB]">
                      {sec.feedback}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sec.strengths && sec.strengths.length > 0 && (
                      <div className="p-3.5 bg-[#059669]/10 border border-[#059669]/20 rounded-[10px]">
                        <p className="text-xs font-bold text-[#059669] mb-2">Strengths</p>
                        <ul className="space-y-1.5">
                          {sec.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-[#1A1A1A] flex items-start gap-2">
                              <span className="text-[#059669] mt-0.5">✓</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {sec.improvements && sec.improvements.length > 0 && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[10px]">
                        <p className="text-xs font-bold text-amber-700 mb-2">To Improve</p>
                        <ul className="space-y-1.5">
                          {sec.improvements.map((s, i) => (
                            <li key={i} className="text-xs text-[#1A1A1A] flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">→</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
