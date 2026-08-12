'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMounted } from '@/hooks/use-mounted';

export const WebsitePreloader: React.FC = () => {
  const isMounted = useMounted();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isExited, setIsExited] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setProgress(100);
      setIsReady(true);
      timerRef.current = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => setIsExited(true), 300);
      }, 200);
      return;
    }

    const startTime = performance.now();
    const duration = 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        setIsReady(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timerRef.current = setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => setIsExited(true), 400);
        }, 200);
      }
    }, 25);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMounted]);

  if (!isMounted || isExited) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F8FA] text-[#1A1A1A] select-none transition-opacity duration-300 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={isFadingOut}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Brand logo mark */}
        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="26" height="26" rx="8" fill="#059669"/>
            <path d="M7 6H17C18.1046 6 19 6.89543 19 8V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V8C5 6.89543 5.89543 6 7 6Z" stroke="white" strokeWidth="1.5"/>
            <path d="M9 13L11.5 15.5L16.5 9.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Resume<span className="text-[#059669]">IQ</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-44 h-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#059669] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>

        {/* Status */}
        <p className={`text-xs font-mono transition-colors duration-200 ${isReady ? 'text-[#059669]' : 'text-[#6B7280]'}`}>
          {isReady ? 'READY' : 'LOADING INTELLIGENCE ENGINE...'}
        </p>
      </div>
    </div>
  );
};
