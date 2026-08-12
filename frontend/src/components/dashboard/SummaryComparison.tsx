'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SummaryComparisonProps {
  originalSummary: string;
  rewrittenSummary?: string;
}

export const SummaryComparison: React.FC<SummaryComparisonProps> = ({
  originalSummary,
  rewrittenSummary,
}) => {
  const [copied, setCopied] = useState(false);

  const improved =
    rewrittenSummary ||
    'Results-driven Software Engineer with experience building high-scale web applications, optimizing REST APIs, and leading cross-functional delivery teams. Proven track record of improving system performance by 35% and delivering mission-critical features on time.';

  const handleCopy = () => {
    navigator.clipboard.writeText(improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">Executive Summary Comparison</h3>
        </div>
        <span className="text-xs text-[#6B7280]">Original vs AI-Improved</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Your Summary</span>
          </div>
          <div className="p-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-[10px] min-h-[120px]">
            <p className="text-sm text-[#6B7280] leading-relaxed">
              {originalSummary || 'No summary was found in the parsed resume.'}
            </p>
          </div>
        </div>

        {/* AI Improved */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">AI-Improved Summary</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-[#059669] hover:text-[#047857] transition-colors cursor-pointer"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5 text-[#059669]" /> Copied</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy Summary</>
              )}
            </button>
          </div>
          <div className="p-4 bg-[#059669]/10 border border-[#059669]/20 rounded-[10px] min-h-[120px]">
            <p className="text-sm text-[#1A1A1A] leading-relaxed font-medium">{improved}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
