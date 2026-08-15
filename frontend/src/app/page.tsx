'use client';

import React, { useState } from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { HeroSection } from '@/components/sections/HeroSection';
import { UploadZone } from '@/components/sections/UploadZone';
import { AnalysisLoading } from '@/components/sections/AnalysisLoading';
import { AnalysisDashboard } from '@/components/dashboard/AnalysisDashboard';
import { ResumeAnalysisReport } from '@/types/resume';



const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

// ─── FEATURES GRID ITEMS ───────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="2.5" width="15" height="15" rx="3.5" stroke="#059669" strokeWidth="1.75" fill="none"/>
        <path d="M5.5 12.5L8.5 9L11.5 11.5L14.5 7" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'ATS Intelligence',
    title: 'Understand how automated systems read your resume',
    desc: 'Simulate parsing across Greenhouse, Lever, Workday and major ATS solutions to identify formatting errors and parsing blocks.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="6" stroke="#059669" strokeWidth="1.75" fill="none"/>
        <path d="M13.5 13.5L17.5 17.5" stroke="#059669" strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Keyword Intelligence',
    title: 'Match skills required by your target job roles',
    desc: 'Surface high-priority technical skills and domain keywords from real job descriptions to maximize ATS keyword density.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4.5 14L8 10.5L11 13L15.5 6.5" stroke="#059669" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2.5" y="2.5" width="15" height="15" rx="3.5" stroke="#059669" strokeWidth="1.75" fill="none"/>
      </svg>
    ),
    label: 'Actionable Bullet Rewrites',
    title: 'Transform weak descriptions into high-impact metrics',
    desc: 'Get AI-recommended bullet point rewrites backed by action verbs, quantified numbers, and industry-standard clarity.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload Resume',
    desc: 'Drag & drop your resume in PDF or DOCX format. Processing is fast and secure.',
  },
  {
    step: '02',
    title: 'AI Audit Engine',
    desc: 'ResumeIQ evaluates structure, content quality, keyword coverage, and recruiter impact.',
  },
  {
    step: '03',
    title: 'Optimize & Apply',
    desc: 'Apply targeted recommendations and export an optimized resume ready for application.',
  },
];

const TRUST_ITEMS = [
  'PDF & DOCX Supported',
  'Secure In-Memory Processing',
  'Zero Data Storage',
  'Instant AI Analysis Pipeline',
];

// ─── HOME PAGE COMPONENT ──────────────────────────────────────────────────────

export default function Home() {
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [isApiFinished, setIsApiFinished]     = useState(false);
  const [analysisPhase, setAnalysisPhase]     = useState<'uploading' | 'parsed' | 'analyzing' | 'completed'>('uploading');
  const [analyzingFilename, setAnalyzingFilename] = useState<string>('');
  const [currentFile, setCurrentFile]         = useState<File | null>(null);
  const [analysisResult, setAnalysisResult]   = useState<{
    report: ResumeAnalysisReport;
    filename: string;
    requestId: string;
    provider: string;
  } | null>(null);
  const [analysisError, setAnalysisError]     = useState<string | null>(null);


  const pendingResultRef = React.useRef<{
    report: ResumeAnalysisReport;
    filename: string;
    requestId: string;
    provider: string;
  } | null>(null);

  const handleAnalyze = async (file: File) => {
    setCurrentFile(file);
    setIsAnalyzing(true);
    setIsApiFinished(false);
    setAnalysisPhase('uploading');
    setAnalyzingFilename(file.name);
    setAnalysisError(null);
    setAnalysisResult(null);
    pendingResultRef.current = null;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const parseResponse = await fetch(`${API_BASE_URL}/api/parse`, {
        method: 'POST',
        headers: { 'x-correlation-id': requestId },
        body: formData,
      });

      if (!parseResponse.ok) {
        const err = await parseResponse.json().catch(() => ({}));
        throw new Error(err.error?.message || err.error || `Parse failed (HTTP ${parseResponse.status})`);
      }

      const parseResult = await parseResponse.json();
      if (!parseResult.success || !parseResult.data) {
        throw new Error(parseResult.error || 'Failed to parse resume document.');
      }

      setAnalysisPhase('parsed');

      setAnalysisPhase('analyzing');


      const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-correlation-id': requestId },
        body: JSON.stringify(parseResult.data),
      });

      if (!analyzeResponse.ok) {
        const err = await analyzeResponse.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Analysis failed (HTTP ${analyzeResponse.status})`);
      }

      const analyzeResult = await analyzeResponse.json();
      if (!analyzeResult.success || !analyzeResult.data?.atsReport) {
        throw new Error(analyzeResult.error || 'Analysis returned an invalid response.');
      }

      const report: ResumeAnalysisReport = analyzeResult.data.atsReport;
      const provider = analyzeResult.data.aiStatus?.provider || 'AI Engine';

      setAnalysisResult({ report, filename: file.name, requestId, provider });
      setIsApiFinished(true);
      setAnalysisPhase('completed');
      setIsAnalyzing(false);

      setTimeout(() => {
        document.getElementById('ats-analyzer-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAnalysisError(msg);
      setIsAnalyzing(false);
      setIsApiFinished(false);
    }
  };

  const handleCompleteAnimation = () => setIsAnalyzing(false);

  const handleReset = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setIsApiFinished(false);
    setCurrentFile(null);
    document.getElementById('ats-analyzer')?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleReAnalyze = () => { if (currentFile) handleAnalyze(currentFile); };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A1A1A] pt-[64px]">

      {/* ─── HERO ─── */}
      <HeroSection />

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="py-20 bg-[#FFFFFF] border-b border-[#E5E7EB]">
        <Container>
          <div className="max-w-2xl mb-14">
            <span className="text-[12px] font-bold text-[#059669] uppercase tracking-wider block mb-2">
              MARKETING FEATURES
            </span>
            <h2 className="text-heading-xl font-bold text-[#1A1A1A] mb-3">
              Everything your resume needs to pass automated screeners.
            </h2>
            <p className="text-body text-[#6B7280]">
              ResumeIQ provides deep ATS diagnostic scores, keyword coverage analysis, and actionable bullet rewrites to help you land more interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="bg-[#FFFFFF] p-6 rounded-[14px] border border-[#E5E7EB] shadow-token flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <span className="text-[12px] font-bold text-[#059669] uppercase tracking-wider block mb-1">
                    {f.label}
                  </span>
                  <h3 className="text-subheading font-bold text-[#1A1A1A] mb-2 leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-label text-[#6B7280] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── ANALYZER SECTION ─── */}
      <section id="ats-analyzer" className="py-20 bg-[#F7F8FA] border-b border-[#E5E7EB]">
        <Container>
          <div className="text-center mb-12">
            <span className="text-[12px] font-bold text-[#059669] uppercase tracking-wider block mb-2">
              RESUME AUDIT PIPELINE
            </span>
            <h2 className="text-heading-xl font-bold text-[#1A1A1A] mb-3">
              Analyze your resume
            </h2>
            <p className="text-body text-[#6B7280] max-w-md mx-auto">
              Upload your resume in PDF or DOCX format to receive instant ATS compatibility scores and diagnostic reports.
            </p>
          </div>

          {/* Upload Zone */}
          <UploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          {/* Loading */}
          {isAnalyzing && (
            <div className="mt-8">
              <AnalysisLoading
                filename={analyzingFilename}
                isApiFinished={isApiFinished}
                phase={analysisPhase}
                onCompleteAnimation={handleCompleteAnimation}
              />
            </div>
          )}

          {/* Error */}
          {analysisError && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[10px] text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">
                    {analysisError.toLowerCase().includes('resume') || analysisError.toLowerCase().includes('cv') || analysisError.toLowerCase().includes('notes')
                      ? 'Invalid Document Uploaded'
                      : 'Analysis Failed'}
                  </p>
                  <p className="text-amber-800 mt-0.5 leading-relaxed">{analysisError}</p>
                  <p className="text-caption text-[#6B7280] mt-2">
                    {analysisError.toLowerCase().includes('resume') || analysisError.toLowerCase().includes('notes')
                      ? 'Please upload a valid Resume or CV document (PDF / DOCX) containing your experience, education, and skills.'
                      : 'Please check your document and try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {analysisResult && (
            <div className="mt-10">
              <AnalysisDashboard
                report={analysisResult.report}
                filename={analysisResult.filename}
                requestId={analysisResult.requestId}
                provider={analysisResult.provider}
                onReset={handleReset}
                onReAnalyze={handleReAnalyze}
              />
            </div>
          )}
        </Container>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 bg-[#FFFFFF] border-b border-[#E5E7EB]">
        <Container>
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold text-[#059669] uppercase tracking-wider block mb-2">
              SIMPLE WORKFLOW
            </span>
            <h2 className="text-heading-xl font-bold text-[#1A1A1A]">
              Three steps to an optimized resume
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="bg-[#FFFFFF] p-8 rounded-[14px] border border-[#E5E7EB] shadow-token flex flex-col items-start gap-4"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl font-bold text-[#059669] font-mono">
                    {item.step}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                </div>
                <div>
                  <h3 className="text-subheading font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                  <p className="text-label text-[#6B7280] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── TRUST & SECURITY ─── */}
      <section className="py-16 bg-[#F7F8FA]">
        <Container>
          <div className="max-w-4xl mx-auto p-8 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-token flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-lg">
              <span className="text-[12px] font-bold text-[#059669] uppercase tracking-wider block mb-1">
                PRIVACY &amp; SECURITY GUARANTEE
              </span>
              <h3 className="text-heading-lg font-bold text-[#1A1A1A] mb-2">
                Your resume is personal. Your audit is private.
              </h3>
              <p className="text-label text-[#6B7280] leading-relaxed">
                ResumeIQ processes your file securely in memory and generates instant results. Resume content is never stored or shared.
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 text-label text-[#1A1A1A] font-medium">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2.5 bg-[#F7F8FA] px-3.5 py-2 rounded-[8px] border border-[#E5E7EB]">
                  <Check className="w-4 h-4 text-[#059669]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── CONVERSION CTA ─── */}
      <section className="py-20 bg-[#FFFFFF] border-t border-[#E5E7EB]">
        <Container>
          <div className="text-center max-w-xl mx-auto flex flex-col items-center gap-5">
            <h2 className="text-heading-xl font-bold text-[#1A1A1A]">
              Ready to optimize your resume for target job roles?
            </h2>
            <p className="text-body text-[#6B7280]">
              Get your instant ATS score, keyword audit, and bullet recommendations in seconds.
            </p>
            <button
              onClick={() => document.getElementById('ats-analyzer')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white text-body font-semibold rounded-[10px] transition-colors duration-150 shadow-sm cursor-pointer group"
            >
              Analyze your resume
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </Container>
      </section>
    </div>
  );
}
