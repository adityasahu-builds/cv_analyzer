'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  GraduationCap, 
  Code2, 
  Briefcase, 
  Users,
  AlertTriangle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HeroSection } from '@/components/sections/HeroSection';
import { UploadZone } from '@/components/sections/UploadZone';
import { FEATURE_PREVIEWS, TARGET_AUDIENCES } from '@/constants/features';
import { ResumeAnalysisReport } from '@/types/resume';

import { AnalysisLoading } from '@/components/sections/AnalysisLoading';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<'uploading' | 'parsed' | 'analyzing' | 'completed'>('uploading');
  const [analyzingFilename, setAnalyzingFilename] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    report: ResumeAnalysisReport;
    filename: string;
    requestId: string;
    provider: string;
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const pendingResultRef = React.useRef<{
    report: ResumeAnalysisReport;
    filename: string;
    requestId: string;
    provider: string;
  } | null>(null);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setIsApiFinished(false);
    setAnalysisPhase('uploading');
    setAnalyzingFilename(file.name);
    setAnalysisError(null);
    setAnalysisResult(null);
    pendingResultRef.current = null;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[Frontend] [${requestId}] Initiating analysis for '${file.name}' via API: ${API_BASE_URL}`);

    try {
      // 1. Step 1: Upload & Parse Document
      const formData = new FormData();
      formData.append('file', file);

      const parseResponse = await fetch(`${API_BASE_URL}/api/parse`, {
        method: 'POST',
        headers: {
          'x-correlation-id': requestId,
        },
        body: formData,
      });

      if (!parseResponse.ok) {
        const parseErrJson = await parseResponse.json().catch(() => ({}));
        const errMsg = parseErrJson.error?.message || parseErrJson.error || `Parsing failed with HTTP ${parseResponse.status}`;
        throw new Error(errMsg);
      }

      const parseResult = await parseResponse.json();
      if (!parseResult.success || !parseResult.data) {
        throw new Error(parseResult.error || 'Failed to parse resume document.');
      }

      setAnalysisPhase('parsed');
      console.log(`[Frontend] [${requestId}] Parse succeeded. RawText length: ${parseResult.data.rawText?.length || 0}. Initiating AI analysis...`);

      // 2. Step 2: AI Analysis
      setAnalysisPhase('analyzing');
      const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': requestId,
        },
        body: JSON.stringify(parseResult.data),
      });

      if (!analyzeResponse.ok) {
        const analyzeErrJson = await analyzeResponse.json().catch(() => ({}));
        const errMsg = analyzeErrJson.error || analyzeErrJson.message || `AI Analysis failed with HTTP ${analyzeResponse.status}`;
        throw new Error(errMsg);
      }

      const analyzeResult = await analyzeResponse.json();
      console.log("[FRONTEND] /api/analyze status:", analyzeResponse.status);
      console.log("[FRONTEND] /api/analyze response:", analyzeResult);

      if (!analyzeResult.success || !analyzeResult.data?.atsReport) {
        throw new Error(analyzeResult.error || 'AI Analysis returned an invalid response structure.');
      }

      const report: ResumeAnalysisReport = analyzeResult.data.atsReport;
      const provider = analyzeResult.data.aiStatus?.provider || 'AI Engine';

      console.log(`[Frontend] [${requestId}] Analysis succeeded with score ${report.overallScore}/100 via ${provider}`);

      // Immediately set result and turn off loading state
      setAnalysisResult({
        report,
        filename: file.name,
        requestId,
        provider,
      });
      setIsApiFinished(true);
      setAnalysisPhase('completed');
      setIsAnalyzing(false);

      setTimeout(() => {
        const el = document.getElementById('ats-analyzer-results');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[Frontend] [${requestId}] Analysis flow error:`, errorMessage);
      setAnalysisError(errorMessage);
      setIsAnalyzing(false);
      setIsApiFinished(false);
    }
  };

  const handleCompleteAnimation = () => {
    setIsAnalyzing(false);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-6 h-6 text-cyan-400" />;
      case 'Target': return <Target className="w-6 h-6 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-yellow-400" />;
      case 'BarChart3': return <BarChart3 className="w-6 h-6 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-cyan-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-purple-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'Users': return <Users className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-gray-100 overflow-hidden font-sans pt-16 pb-20">
      {/* Redesigned Premium Liquid Red Glass Hero */}
      <HeroSection />

      {/* Upload & Live Analyzer Section */}
      <section id="ats-analyzer" className="relative z-10 py-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            <UploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {/* AI Resume Analysis Loading Screen */}
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

            {/* Error Message Alert (Explicit AI Failure Display - NO Fake 0/100) */}
            {analysisError && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="p-6 border border-red-500/30 bg-red-950/40 backdrop-blur-2xl rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-500/20 text-red-400 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-red-300">AI Analysis Failed</h4>
                      <p className="text-xs text-red-200 mt-1 leading-relaxed">{analysisError}</p>
                      <p className="text-[11px] text-gray-400 mt-2">
                        Note: The server did not generate a fake 0/100 score. Please check server logs or verify your file input.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Analysis Results Display (ATS Diagnostic Dashboard) */}
            {analysisResult && (
              <div id="ats-analyzer-results" className="mt-12 animate-in fade-in slide-in-from-bottom-6 duration-300">
                <Card className="p-8 border border-cyan-500/30 bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl">
                  {/* Dashboard Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                    <div>
                      <Badge variant="cyan" className="mb-2 px-3 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Analysis Verified ({analysisResult.provider})
                      </Badge>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        ATS Diagnostic Report
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        File: {analysisResult.filename} • Request ID: {analysisResult.requestId}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl shadow-inner">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">Overall ATS Score</p>
                        <p className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">{analysisResult.report.overallScore}/100</p>
                      </div>
                      <div className="h-14 w-14 rounded-full border-4 border-cyan-400 flex items-center justify-center font-black text-base text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        {analysisResult.report.overallScore}%
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">Executive Audit Summary</h4>
                    <p className="text-sm text-gray-200 leading-relaxed font-normal bg-white/5 p-4 rounded-2xl border border-white/10">
                      {analysisResult.report.summary}
                    </p>
                  </div>

                  {/* Section Breakdown Grid */}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 font-mono">Section Scores & Evaluation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(analysisResult.report.sections || {}).map(([key, sec]) => {
                        const sectionData = sec as { name: string; score: number; feedback?: string };
                        return (
                          <div key={key} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 shadow-sm">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-200">{sectionData.name}</p>
                              <Badge variant={sectionData.score >= 85 ? 'emerald' : sectionData.score >= 70 ? 'cyan' : 'purple'}>
                                {sectionData.score}%
                              </Badge>
                            </div>
                            {sectionData.feedback && (
                              <p className="text-xs text-gray-400 leading-relaxed mt-1">{sectionData.feedback}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-white/10">
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Key Strengths
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {(analysisResult.report.strengths || []).map((str: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {(analysisResult.report.weaknesses || []).map((weak: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-purple-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations & Missing Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 font-mono">Actionable Recommendations</h4>
                      <ul className="flex flex-col gap-2">
                        {(analysisResult.report.recommendations || []).map((rec: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-cyan-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 font-mono">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {(analysisResult.report.missingKeywords || []).map((kw: string, idx: number) => (
                          <Badge key={idx} variant="purple" className="text-xs px-2.5 py-1">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Improved Bullet Points */}
                  {analysisResult.report.improvedBullets && analysisResult.report.improvedBullets.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 font-mono">
                        AI Recommended Bullet Rewrites
                      </h4>
                      <div className="flex flex-col gap-4">
                        {analysisResult.report.improvedBullets.map((bullet, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                            <div className="text-xs text-red-300/80 font-mono">
                              <span className="font-bold text-red-400">Original:</span> "{bullet.original}"
                            </div>
                            <div className="text-xs text-emerald-300 font-mono">
                              <span className="font-bold text-emerald-400">Improved:</span> "{bullet.improved}"
                            </div>
                            <div className="text-[11px] text-gray-400 italic mt-1">
                              Reason: {bullet.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rewritten Executive Summary */}
                  {analysisResult.report.rewrittenSummary && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 font-mono">
                        AI Recommended Professional Summary Rewrite
                      </h4>
                      <p className="text-xs text-gray-200 leading-relaxed italic bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20">
                        "{analysisResult.report.rewrittenSummary}"
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Feature Previews Section */}
      <section id="features" className="relative z-10 py-20 bg-gray-900/30 border-y border-white/5">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="cyan" className="mb-3">
              Comprehensive Platform
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Built for Modern Career Acceleration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURE_PREVIEWS.map((feat) => (
              <Card key={feat.id} className="p-8 border border-white/10 bg-gray-900/40 hover:border-cyan-500/40 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {getIconComponent(feat.icon)}
                  </div>
                  <Badge variant="cyan">{feat.badge}</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
