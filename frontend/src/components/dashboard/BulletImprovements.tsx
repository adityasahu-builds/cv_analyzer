'use client';

import React, { useState } from 'react';
import { Copy, Check, ArrowDown } from 'lucide-react';

interface ImprovedBullet {
  original: string;
  improved: string;
  reason: string;
}

interface BulletImprovementsProps {
  bullets?: ImprovedBullet[];
}

export const BulletImprovements: React.FC<BulletImprovementsProps> = ({ bullets = [] }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!bullets || bullets.length === 0) return null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">AI Bullet Point Rewrites</h3>
        </div>
        <span className="text-xs text-[#6B7280]">{bullets.length} rewrites available</span>
      </div>

      <div className="space-y-5">
        {bullets.map((item, idx) => (
          <div key={idx} className="border border-[#E5E7EB] rounded-[10px] overflow-hidden bg-[#F7F8FA]">
            {/* Original */}
            <div className="px-4 py-3 bg-[#F7F8FA] border-b border-[#E5E7EB]">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Current Bullet</p>
              <p className="text-sm text-[#6B7280] leading-relaxed italic">&quot;{item.original}&quot;</p>
            </div>

            {/* Transition Arrow */}
            <div className="flex items-center justify-center py-1.5 bg-[#FFFFFF] border-b border-[#E5E7EB]">
              <ArrowDown className="w-4 h-4 text-[#059669]" />
            </div>

            {/* Improved */}
            <div className="px-4 py-3.5 bg-[#059669]/10">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs font-bold text-[#059669] uppercase tracking-wider">AI Improved Bullet</p>
                <button
                  onClick={() => handleCopy(item.improved, idx)}
                  className="flex items-center gap-1 text-xs text-[#059669] hover:text-[#047857] transition-colors flex-shrink-0 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <><Check className="w-3.5 h-3.5 text-[#059669]" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Bullet</>
                  )}
                </button>
              </div>
              <p className="text-sm text-[#1A1A1A] leading-relaxed font-semibold">&quot;{item.improved}&quot;</p>
            </div>

            {/* Reason */}
            <div className="px-4 py-2.5 bg-[#F7F8FA] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-[#6B7280]">
                <span className="font-semibold text-[#1A1A1A]">Reason: </span>
                {item.reason}
              </p>
              <div className="flex gap-1.5">
                <span className="text-[10px] px-2 py-0.5 bg-[#059669]/10 border border-[#059669]/20 text-[#059669] rounded font-semibold">Action Verb</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#059669]/10 border border-[#059669]/20 text-[#059669] rounded font-semibold">Quantified</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#F7F8FA] border border-[#E5E7EB] text-[#6B7280] rounded font-semibold">Clarity</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
