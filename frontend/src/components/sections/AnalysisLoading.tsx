'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export interface AnalysisLoadingProps {
  filename?: string;
  isApiFinished: boolean;
  phase?: 'uploading' | 'parsed' | 'analyzing' | 'completed';
  onCompleteAnimation?: () => void;
}

const STAGES = [
  { id: 1, label: 'Resume uploaded', threshold: 10 },
  { id: 2, label: 'Parsing document', threshold: 20 },
  { id: 3, label: 'Evaluating experience', threshold: 38 },
  { id: 4, label: 'Checking ATS compatibility', threshold: 55 },
  { id: 5, label: 'Analyzing keywords', threshold: 70 },
  { id: 6, label: 'Evaluating impact', threshold: 85 },
  { id: 7, label: 'Generating recommendations', threshold: 100 },
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  filename,
  isApiFinished,
  phase = 'analyzing',
  onCompleteAnimation,
}) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const onCompleteCalledRef = useRef(false);

  // Progress controller
  useEffect(() => {
    onCompleteCalledRef.current = false;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (isApiFinished) {
          const next = prev + (100 - prev) * 0.45 + 2.0;
          if (next >= 100) {
            clearInterval(interval);
            return 100;
          }
          return next;
        }

        if (prev < 20) return prev + 2.2;
        if (prev < 40) return prev + 1.6;
        if (prev < 60) return prev + 1.2;
        if (prev < 78) return prev + 0.8;
        if (prev < 90) return prev + 0.4;
        if (prev < 97) return prev + 0.15;
        return 97;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isApiFinished]);

  // Handle completion
  useEffect(() => {
    if (progress >= 100 && !isCompleted) {
      setIsCompleted(true);
      if (!onCompleteCalledRef.current) {
        onCompleteCalledRef.current = true;
        onCompleteAnimation?.();
      }
    }
  }, [progress, isCompleted, onCompleteAnimation]);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-8 md:p-12 mx-auto max-w-2xl animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-full bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-5 h-5 text-[#059669] animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          {isCompleted ? 'Analysis complete' : 'Analyzing your resume'}
        </h2>
        <p className="text-sm text-[#6B7280] mt-2 max-w-xs mx-auto">
          {filename ? (
            <span className="font-semibold text-[#1A1A1A]">{filename}</span>
          ) : (
            'Your resume is being reviewed across structure, content, keywords and impact.'
          )}
        </p>
      </div>

      {/* Stages checklist */}
      <div className="space-y-3 mb-8">
        {STAGES.map((stage, idx) => {
          const isDone = progress >= stage.threshold || isCompleted;
          const isActive = !isDone && (idx === 0 || progress >= STAGES[idx - 1].threshold);

          return (
            <div key={stage.id} className="flex items-center gap-3 bg-[#F7F8FA] p-3 rounded-[10px] border border-[#E5E7EB]">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#059669]" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-[#059669] animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-[#E5E7EB]" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                isDone ? 'text-[#1A1A1A]' : isActive ? 'text-[#059669] font-semibold' : 'text-[#6B7280]'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-[#059669] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-[#6B7280] font-mono text-center mt-3">
        {isCompleted ? '100% Complete' : `${Math.round(progress)}% complete`}
      </p>
    </div>
  );
};
