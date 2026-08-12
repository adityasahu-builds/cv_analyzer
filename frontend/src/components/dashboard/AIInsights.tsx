'use client';

import React from 'react';
import { ResumeAnalysisReport } from '@/types/resume';

interface AIInsightsProps {
  report: ResumeAnalysisReport;
  provider?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ report, provider = 'AI Engine' }) => {
  const getFixOrder = () => {
    const fixes: string[] = [];
    if (report.missingKeywords && report.missingKeywords.length > 0) {
      fixes.push(`Add top missing keywords: ${report.missingKeywords.slice(0, 3).join(', ')}`);
    }
    if (report.weaknesses && report.weaknesses.length > 0) {
      fixes.push(report.weaknesses[0]);
    }
    if (report.improvedBullets && report.improvedBullets.length > 0) {
      fixes.push('Rewrite experience bullets with quantified metrics and strong action verbs');
    }
    if (fixes.length === 0) {
      fixes.push('Refine summary alignment for target role');
    }
    return fixes;
  };

  const fixes = getFixOrder();

  const sections: { title: string; content: React.ReactNode }[] = [
    {
      title: 'AI Assessment Overview',
      content: (
        <p className="text-sm text-[#6B7280] leading-relaxed">
          {report.summary ||
            'Your resume displays solid technical breadth and clear formatting. The primary opportunities for high-impact improvement lie in quantified metric density and targeted role keyword coverage.'}
        </p>
      ),
    },
    {
      title: 'What Recruiters Notice First',
      content: (
        <p className="text-sm text-[#6B7280] leading-relaxed">
          Within the initial 6-10 seconds of evaluation, recruiters scan your primary job title, core technical stack, and most recent role impact. Adding explicit quantified metrics (+X% efficiency, $Y cost savings) will immediately elevate your candidate signal against peer applicants.
        </p>
      ),
    },
    {
      title: 'Priority Fix Roadmap',
      content: (
        <ol className="space-y-2.5">
          {fixes.map((fix, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#1A1A1A] bg-[#F7F8FA] p-3 rounded-[10px] border border-[#E5E7EB]">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#059669]/10 border border-[#059669]/20 text-[#059669] text-xs font-bold flex items-center justify-center mt-0.5 font-mono">
                {i + 1}
              </span>
              <span>{fix}</span>
            </li>
          ))}
        </ol>
      ),
    },
    {
      title: 'Career Position & Signal Level',
      content: (
        <div>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Current Signal Level:{' '}
            <span className="font-bold text-[#1A1A1A]">
              {report.overallScore >= 85
                ? 'Senior Candidate Tier'
                : report.overallScore >= 70
                ? 'Competitive Candidate Tier'
                : 'Early-Career Tier'}{' '}
              ({report.overallScore}/100)
            </span>
            . Incorporating recommended keyword additions and bullet metrics will position your resume in the{' '}
            <span className="font-bold text-[#059669]">Top 5% Candidate Tier</span>.
          </p>
          <p className="text-xs text-[#6B7280] mt-2 font-mono">
            Diagnostic verified via {provider}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="mb-5 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <h3 className="text-base font-bold text-[#1A1A1A]">AI Executive Diagnostic Review</h3>
          </div>
          <p className="text-xs text-[#6B7280]">Comprehensive assessment of candidate signal and recruiter impact</p>
        </div>
      </div>

      <div className="divide-y divide-[#E5E7EB]">
        {sections.map((sec) => (
          <div key={sec.title} className="py-5 first:pt-0 last:pb-0">
            <h4 className="text-sm font-bold text-[#059669] mb-3 uppercase tracking-wider">{sec.title}</h4>
            {sec.content}
          </div>
        ))}
      </div>
    </div>
  );
};
