'use client';

import React from 'react';

interface OverallScoreProps {
  score: number;
  summary: string;
  confidenceScore?: number;
}

const getGrade = (score: number) => {
  if (score >= 85) return { label: 'Strong Candidate Signal', color: 'text-[#059669]', stroke: '#059669', bg: 'bg-[#059669]/10', border: 'border-[#059669]/20', text: 'text-[#059669]' };
  if (score >= 70) return { label: 'Competitive Resume',        color: 'text-[#059669]', stroke: '#059669', bg: 'bg-[#059669]/10', border: 'border-[#059669]/20', text: 'text-[#059669]' };
  return             { label: 'Optimization Recommended',   color: 'text-amber-600', stroke: '#D97706', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
};

export const OverallScore: React.FC<OverallScoreProps> = ({
  score,
  summary,
  confidenceScore = 95,
}) => {
  const grade = getGrade(score);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const keyMetrics = [
    { label: 'Keyword Match', value: `${Math.max(65, score - 8)}%` },
    { label: 'Content Quality', value: `${Math.min(99, score + 4)}%` },
    { label: 'AI Confidence', value: `${confidenceScore}%` },
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">ATS Candidate Score</h3>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-[8px] border ${grade.bg} ${grade.border} ${grade.text}`}>
          {grade.label}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* SVG Radial Gauge */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="#F7F8FA" strokeWidth="10" />
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={grade.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold ${grade.color}`}>{score}</span>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">out of 100</span>
            </div>
          </div>
          <p className={`text-sm font-semibold ${grade.color}`}>{grade.label}</p>
        </div>

        {/* Summary + key metrics */}
        <div className="flex-1 flex flex-col gap-4">
          <p className="text-sm text-[#6B7280] leading-relaxed bg-[#F7F8FA] p-4 rounded-[10px] border border-[#E5E7EB]">
            {summary}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {keyMetrics.map((m) => (
              <div key={m.label} className="p-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-[10px] text-center">
                <p className="text-lg font-extrabold text-[#1A1A1A]">{m.value}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
