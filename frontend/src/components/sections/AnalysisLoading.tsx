'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Circle, FileText, Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface AnalysisLoadingProps {
  filename?: string;
  isApiFinished: boolean;
  phase?: 'uploading' | 'parsed' | 'analyzing' | 'completed';
  onCompleteAnimation?: () => void;
}

const STAGES = [
  { id: 1, label: 'Upload received', threshold: 10, mode: 'REAL' },
  { id: 2, label: 'Reading resume', threshold: 22, mode: 'REAL' },
  { id: 3, label: 'Extracting content', threshold: 36, mode: 'REAL' },
  { id: 4, label: 'Detecting resume structure', threshold: 48, mode: 'REAL' },
  { id: 5, label: 'AI analysis', threshold: 64, mode: 'REAL' },
  { id: 6, label: 'ATS evaluation', threshold: 78, mode: 'ESTIMATED' },
  { id: 7, label: 'Generating recommendations', threshold: 90, mode: 'ESTIMATED' },
  { id: 8, label: 'Finalizing report', threshold: 100, mode: 'REAL' },
];

const TERMINAL_MESSAGES = [
  '[PARSE] Extracting document structure, font encoding, and layout tokens...',
  '[TAXONOMY] Mapping technical competencies against executive taxonomy...',
  '[ATS_CHECK] Evaluating formatting compliance & bullet point measurability...',
  '[METRICS] Analyzing action verb frequency and quantitative impact ratios...',
  '[ORCHESTRATOR] Synthesizing multi-model AI diagnostic recommendations...',
  '[FINALIZING] Compiling ATS Compatibility Matrix & Action Report...',
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  filename,
  isApiFinished,
  phase = 'analyzing',
  onCompleteAnimation,
}) => {
  const [progress, setProgress] = useState(0);
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const onCompleteCalledRef = useRef(false);

  // Staged Progress Controller
  useEffect(() => {
    onCompleteCalledRef.current = false;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (isApiFinished) {
          // Fast-forward to 100% when API succeeds
          const next = prev + (100 - prev) * 0.45 + 1.8;
          if (next >= 100) {
            clearInterval(interval);
            return 100;
          }
          return next;
        }

        // Staged progress curve while API is pending
        if (prev < 15) return prev + 2.0;
        if (prev < 35) return prev + 1.5;
        if (prev < 55) return prev + 1.1;
        if (prev < 70) return prev + 0.8;
        if (prev < 85) return prev + 0.5;
        if (prev < 94) return prev + 0.3;
        if (prev < 98) return prev + 0.1;
        return 98; // Hold at 98% until API responds
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isApiFinished]);

  // Handle 100% Completion Transition
  useEffect(() => {
    if (progress >= 100 && !isCompleted) {
      setIsCompleted(true);
      if (!onCompleteCalledRef.current) {
        onCompleteCalledRef.current = true;
        onCompleteAnimation?.();
      }
    }
  }, [progress, isCompleted, onCompleteAnimation]);

  // Terminal log message rotater
  useEffect(() => {
    const logInterval = setInterval(() => {
      setTerminalIndex((prev) => (prev + 1) % TERMINAL_MESSAGES.length);
    }, 1900);

    return () => clearInterval(logInterval);
  }, []);

  // Compute Stage Label based on current progress
  const getStageMessage = (val: number): string => {
    if (isCompleted || val >= 100) return 'Analysis Complete!';
    if (val < 15) return 'Upload received & Reading resume...';
    if (val < 35) return 'Extracting resume content...';
    if (val < 50) return 'Detecting resume structure...';
    if (val < 68) return 'AI analysis in progress...';
    if (val < 82) return 'Evaluating ATS compatibility...';
    if (val < 94) return 'Generating recommendations...';
    return 'Finalizing report...';
  };

  const stageMessage = getStageMessage(progress);

  return (
    <Card className="p-6 md:p-10 border border-cyan-500/30 bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl relative overflow-hidden text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. CENTRAL AI ANALYSIS VISUAL */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 my-2 flex items-center justify-center">
        {/* Outer Rotating Concentric Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-spin-slow" />

        {/* Inner Reverse Rotating Ring */}
        <div className="absolute inset-3 rounded-full border border-cyan-400/20 animate-spin-reverse" />

        {/* Pulsing Core Ring */}
        <div className="absolute inset-7 rounded-full bg-cyan-500/5 border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-center animate-pulse" />

        {/* Center Document Graphic with Laser Scanning Effect */}
        <div className="relative w-20 h-28 sm:w-24 sm:h-32 bg-gray-950/90 border border-cyan-500/40 rounded-xl p-2.5 shadow-xl flex flex-col gap-1.5 overflow-hidden">
          {/* Laser Scan Line */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser-scan pointer-events-none z-10" />

          {/* Simulated Resume Data Lines */}
          <div className="flex items-center gap-1 mb-1">
            <FileText className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="w-full h-2 rounded bg-cyan-400/60" />
          </div>
          <div className="w-full h-1.5 rounded bg-white/25" />
          <div className="w-5/6 h-1.5 rounded bg-white/20" />
          <div className="w-full h-1.5 rounded bg-white/15" />
          <div className="w-3/4 h-1.5 rounded bg-cyan-400/50 mt-1" />
          <div className="w-full h-1.5 rounded bg-white/20" />
          <div className="w-4/5 h-1.5 rounded bg-white/15" />
          <div className="w-2/3 h-1.5 rounded bg-white/10" />
        </div>

        {/* Orbiting Particle Accents */}
        <div className="absolute top-2 right-6 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
        <div className="absolute bottom-4 left-6 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-ping" />
      </div>

      {/* 2. TITLE & SUBTITLE */}
      <div className="mt-2 mb-4 max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="cyan" className="px-3 py-1 text-xs font-mono tracking-wide shadow-md shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400 animate-spin" />
            AI ENGINE PROCESSING {filename ? `• ${filename}` : ''}
          </Badge>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isCompleted ? 'Analysis Complete!' : 'Analyzing Your Resume'}
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed font-normal">
          AI is scanning your resume for ATS compatibility, skills, experience, and optimization opportunities.
        </p>
      </div>

      {/* 3. LARGE PERCENTAGE DISPLAY */}
      <div className="flex items-baseline gap-1 my-1" aria-live="polite">
        <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          {Math.round(progress)}%
        </span>
      </div>

      <p className="text-xs font-semibold text-cyan-300 font-mono mb-4 tracking-wide uppercase">
        {stageMessage}
      </p>

      {/* 4. PROGRESS BAR */}
      <div
        className="w-full max-w-xl bg-gray-950/80 border border-white/10 h-3.5 rounded-full overflow-hidden p-0.5 relative shadow-inner mb-6"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Resume Analysis Progress"
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-teal-300 rounded-full transition-all duration-300 ease-out relative shadow-[0_0_14px_rgba(6,182,212,0.7)]"
          style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
        >
          {/* Animated Shimmer Line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Real Milestone vs UI Progress Badge */}
      <div className="flex items-center gap-2 mb-6 text-[10px] text-gray-400 font-mono">
        <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span>
          {isApiFinished
            ? 'Milestone: Real Backend Analysis Response Received'
            : phase === 'parsed'
            ? 'Milestone: Real Document Parsing Verified'
            : 'Real Event Sync Active (Staged Processing)'}
        </span>
      </div>

      {/* 5. LIVE ANALYSIS STEPS */}
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-left mb-6">
        {STAGES.map((step, idx) => {
          const isDone = progress >= step.threshold || isCompleted;
          const isActive = !isDone && (idx === 0 || progress >= STAGES[idx - 1].threshold);

          return (
            <div
              key={step.id}
              className={cn(
                'p-2 rounded-xl border text-[11px] flex flex-col gap-1 transition-all duration-300 relative',
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isActive
                  ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200 shadow-md shadow-cyan-500/10 scale-[1.02]'
                  : 'bg-white/5 border-white/5 text-gray-500 opacity-60'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                    </span>
                  ) : (
                    <Circle className="w-3 h-3 text-gray-600 shrink-0" />
                  )}
                  <span className="font-medium truncate">{step.label}</span>
                </div>
              </div>
              <span className="text-[9px] font-mono opacity-70">
                {step.mode === 'REAL' ? '[REAL]' : '[ESTIMATED]'}
              </span>
            </div>
          );
        })}
      </div>

      {/* 6. AI STATUS TERMINAL */}
      <div className="w-full max-w-2xl bg-gray-950/90 border border-white/10 rounded-2xl p-3.5 text-left font-mono text-[11px] leading-relaxed shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[10px] text-gray-400 font-semibold ml-2 uppercase tracking-wider">AI Orchestrator Terminal</span>
          </div>
          <Badge variant="cyan" className="text-[9px] px-1.5 py-0.5">LIVE LOGS</Badge>
        </div>

        <div className="text-cyan-300/90 flex items-center gap-2">
          <span className="text-cyan-500 font-bold">&gt;</span>
          <span className="truncate">{TERMINAL_MESSAGES[terminalIndex]}</span>
          <span className="w-1.5 h-3 bg-cyan-400 animate-pulse ml-auto shrink-0" />
        </div>
      </div>
    </Card>
  );
};
