'use client';

import React, { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';

interface KeywordAnalysisProps {
  missingKeywords: string[];
  detectedKeywords?: string[];
}

export const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({
  missingKeywords = [],
  detectedKeywords = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKw, setCopiedKw] = useState<string | null>(null);

  const total = missingKeywords.length + detectedKeywords.length;
  const coveragePct = total > 0 ? Math.round((detectedKeywords.length / total) * 100) : 100;

  const filteredMissing = missingKeywords.filter(kw =>
    kw.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDetected = detectedKeywords.filter(kw =>
    kw.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">Keyword Coverage &amp; Gaps</h3>
        </div>
        <span className="text-sm font-bold text-[#1A1A1A] font-mono">
          {detectedKeywords.length}
          <span className="text-[#6B7280] font-normal"> / {total}</span>
        </span>
      </div>

      {/* Coverage Bar */}
      <div className="mb-5 bg-[#F7F8FA] p-4 rounded-[10px] border border-[#E5E7EB]">
        <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-2">
          <span>Match Density Coverage</span>
          <span className="font-bold text-[#059669]">{coveragePct}%</span>
        </div>
        <div className="w-full h-2 bg-[#FFFFFF] rounded-full overflow-hidden flex border border-[#E5E7EB]">
          <div
            className="h-full bg-[#059669] transition-all duration-700"
            style={{ width: `${coveragePct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[#6B7280] mt-2">
          <span className="flex items-center gap-1.5 text-[#059669] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#059669]" /> {detectedKeywords.length} Present
          </span>
          <span className="flex items-center gap-1.5 text-red-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500" /> {missingKeywords.length} Missing
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-[10px] pl-10 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-[#6B7280] focus:outline-none focus:border-[#059669]"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Present */}
        <div className="p-4 bg-[#F7F8FA] rounded-[10px] border border-[#E5E7EB]">
          <p className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-3">
            Present in Your Resume
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredDetected.length > 0 ? filteredDetected.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#059669]/10 border border-[#059669]/20 text-[#059669] text-xs font-semibold rounded-[6px]"
              >
                ✓ {kw}
              </span>
            )) : (
              <span className="text-xs text-[#6B7280]">
                {detectedKeywords.length === 0 ? 'No specific technical keywords detected.' : 'No matches'}
              </span>
            )}
          </div>
        </div>

        {/* Missing */}
        <div className="p-4 bg-[#F7F8FA] rounded-[10px] border border-[#E5E7EB]">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3">
            Missing Role Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredMissing.length > 0 ? filteredMissing.map((kw, i) => (
              <button
                key={i}
                onClick={() => handleCopy(kw)}
                title="Click to copy"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-[6px] hover:bg-red-100 transition-colors cursor-pointer"
              >
                <span>{kw}</span>
                {copiedKw === kw
                  ? <Check className="w-3 h-3 text-[#059669]" />
                  : <Copy className="w-3 h-3 text-red-500" />
                }
              </button>
            )) : (
              <span className="text-xs text-[#6B7280]">
                {missingKeywords.length === 0 ? 'No missing keywords — great coverage!' : 'No matches'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
