'use client';

import React, { useState } from 'react';
import {
  FileText,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  BarChart3,
  Layers,
  ShieldCheck,
  Target,
  Tag,
  Sparkles,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResumeAnalysisReport } from '@/types/resume';


import { OverallScore } from './OverallScore';
import { SectionScores } from './SectionScores';
import { Strengths } from './Strengths';
import { Weaknesses } from './Weaknesses';
import { Recommendations } from './Recommendations';
import { KeywordAnalysis } from './KeywordAnalysis';
import { SummaryComparison } from './SummaryComparison';
import { BulletImprovements } from './BulletImprovements';
import { AIInsights } from './AIInsights';


export interface AnalysisDashboardProps {
  report: ResumeAnalysisReport;
  filename: string;
  requestId: string;
  provider: string;
  onReset: () => void;
  onReAnalyze: () => void;
}

type TabType =
  | 'overview'
  | 'score'
  | 'sections'
  | 'strengths'
  | 'recommendations'
  | 'keywords'
  | 'summary'
  | 'bullets'
  | 'insights';

const NAV_ITEMS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',        label: 'Overview',         icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'score',           label: 'ATS Score',        icon: <Target className="w-4 h-4" /> },
  { id: 'sections',        label: 'Sections',         icon: <Layers className="w-4 h-4" /> },
  { id: 'strengths',       label: 'Strengths',        icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'recommendations', label: 'Improvements',     icon: <ChevronRight className="w-4 h-4" /> },
  { id: 'keywords',        label: 'Keywords',         icon: <Tag className="w-4 h-4" /> },
  { id: 'summary',         label: 'Summary',          icon: <FileText className="w-4 h-4" /> },
  { id: 'bullets',         label: 'Bullet Rewrites',  icon: <Sparkles className="w-4 h-4" /> },
  { id: 'insights',        label: 'AI Insights',      icon: <Cpu className="w-4 h-4" /> },
];

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  report,
  filename,
  requestId,
  provider,
  onReset,
  onReAnalyze,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedReport, setCopiedReport] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const scoreColor =
    report.overallScore >= 85
      ? 'text-[#059669]'
      : report.overallScore >= 70
      ? 'text-[#059669]'
      : 'text-amber-600';

  return (
    <div id="ats-analyzer-results" className="w-full animate-in fade-in duration-300">

      {/* DEV DIAGNOSTICS */}
      {report.diagnostics && (
        <div className="mb-3 px-4 py-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-[8px] text-[11px] font-mono text-[#6B7280] flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-[#059669]">DEV DEBUG:</span>
          <span>ID: {(report.diagnostics.analysisId as string) || requestId}</span>
          <span>ResumeHash: {((report.diagnostics.resumeHash as string) || '').substring(0, 10)}...</span>
          <span>Engine: {(report.diagnostics.provider as string) || provider}</span>
          <span>Scoring: {(report.diagnostics.scoringVersion as string) || 'v2.0-deterministic'}</span>
          <span>Cache: {report.diagnostics.cached ? 'HIT (Cached Result)' : 'MISS (Live Analysis)'}</span>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token mb-6 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          {/* File info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-[#1A1A1A]">{filename}</p>
                <span className="text-xs font-semibold text-[#059669] bg-[#059669]/10 border border-[#059669]/20 rounded-[8px] px-2.5 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Analyzed via {provider}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5 font-mono">ID: {requestId}</p>
            </div>
          </div>

          {/* Score badge + actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-center px-4 py-1.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded-[10px]">
              <div className={`text-2xl font-extrabold ${scoreColor}`}>{report.overallScore}</div>
              <div className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">ATS Score</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyJson}>
              {copiedReport ? (
                <><Check className="w-3.5 h-3.5 mr-1.5 text-[#059669]" /> Copied</>
              ) : (
                <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy JSON</>
              )}
            </Button>
            <Button variant="secondary" size="sm" onClick={onReAnalyze}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Re-analyze
            </Button>
            <Button variant="primary" size="sm" onClick={onReset}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> New Resume
            </Button>
          </div>
        </div>
      </div>

      {/* LAYOUT: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* SIDEBAR (desktop) */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-2 sticky top-20 self-start">
          <div className="px-3 py-2 mb-1 flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Analysis</p>
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
          </div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm transition-all text-left cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#059669]/10 text-[#059669] font-bold border-l-2 border-[#059669] ml-0 pl-[10px]'
                  : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#1A1A1A] font-medium'
              }`}
            >
              <span className={activeTab === item.id ? 'text-[#059669]' : 'text-[#6B7280]'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </aside>

        {/* MOBILE TABS */}
        <div className="lg:hidden w-full overflow-x-auto bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-1.5 flex gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold flex-shrink-0 transition-all ${
                activeTab === item.id
                  ? 'bg-[#059669] text-white'
                  : 'text-[#6B7280] hover:bg-[#F7F8FA]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {(activeTab === 'overview' || activeTab === 'score') && (
            <OverallScore
              score={report.overallScore}
              summary={report.summary}
              confidenceScore={report.confidenceScore}
            />
          )}

          {(activeTab === 'overview' || activeTab === 'sections') && (
            <SectionScores sections={report.sections || {}} />
          )}

          {(activeTab === 'overview' || activeTab === 'strengths') && (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
              <h3 className="text-base font-bold text-[#1A1A1A] mb-5">Strengths &amp; Areas to Improve</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Strengths strengths={report.strengths || []} />
                <Weaknesses weaknesses={report.weaknesses || []} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'recommendations') && (
            <Recommendations recommendations={report.recommendations || []} />
          )}

          {(activeTab === 'overview' || activeTab === 'keywords') && (
            <KeywordAnalysis missingKeywords={report.missingKeywords || []} />
          )}

          {(activeTab === 'overview' || activeTab === 'summary') && (
            <SummaryComparison
              originalSummary={report.summary}
              rewrittenSummary={report.rewrittenSummary}
            />
          )}

          {(activeTab === 'overview' || activeTab === 'bullets') && (
            <BulletImprovements bullets={report.improvedBullets} />
          )}

          {(activeTab === 'overview' || activeTab === 'insights') && (
            <AIInsights report={report} provider={provider} />
          )}
        </div>
      </div>
    </div>
  );
};
