'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';

export const WebsitePreloader: React.FC = () => {
  const isMounted = useMounted();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing Resume IQ...');
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isExited, setIsExited] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setProgress(100);
      setStatusMessage('READY');
      setIsReady(true);
      timerRef.current = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => setIsExited(true), 400);
      }, 300);
      return;
    }

    // Smooth Progress Controller (Target ~1.3s total)
    const startTime = performance.now();
    const duration = 1300; // 1.3s duration

    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));

      setProgress(pct);

      if (pct < 30) {
        setStatusMessage('Initializing Resume IQ...');
      } else if (pct < 65) {
        setStatusMessage('Loading intelligence engine...');
      } else if (pct < 90) {
        setStatusMessage('Preparing workspace...');
      } else if (pct < 100) {
        setStatusMessage('System ready...');
      } else {
        setStatusMessage('READY');
        setIsReady(true);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Hold briefly at 100% READY before starting smooth exit
        timerRef.current = setTimeout(() => {
          setIsFadingOut(true);
          // Complete removal after transition completes (500ms)
          setTimeout(() => {
            setIsExited(true);
          }, 500);
        }, 320);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMounted]);

  if (!isMounted || isExited) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#020202] text-white select-none overflow-hidden transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      aria-hidden={isFadingOut}
    >
      {/* Ambient Crimson Light Fields (Background) */}
      <div
        className={`absolute w-[550px] h-[550px] bg-red-950/30 rounded-full blur-[140px] pointer-events-none transition-transform duration-700 ${
          isReady ? 'scale-125 opacity-40' : 'animate-pulse-glow opacity-30'
        }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(185,28,28,0.1),rgba(255,255,255,0))] pointer-events-none" />

      {/* Central Floating Liquid Glass Panel */}
      <div className="relative rounded-[28px] sm:rounded-[32px] bg-black/70 backdrop-blur-3xl border border-white/[0.08] p-8 sm:p-12 text-center flex flex-col items-center gap-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_50px_rgba(185,28,28,0.12)] max-w-sm sm:max-w-md w-full mx-4 overflow-hidden">
        {/* Glass Top Edge Reflection Highlight */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent pointer-events-none" />

        {/* 1. CENTER LOGO */}
        <div className="relative my-1">
          <div
            className={`h-16 w-16 rounded-2xl bg-gradient-to-tr from-red-950 via-red-900 to-rose-950 p-[1px] shadow-[0_0_30px_rgba(185,28,28,0.3)] transition-all duration-500 ${
              isReady ? 'scale-105 shadow-[0_0_45px_rgba(220,38,38,0.5)]' : 'scale-100'
            }`}
          >
            <div className="h-full w-full bg-black/90 rounded-[15px] flex items-center justify-center relative overflow-hidden">
              {/* Glass Reflection Pass */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
              <Sparkles className="h-7 w-7 text-red-400" />
            </div>
          </div>
        </div>

        {/* 2. BRAND TEXT */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Resume<span className="text-red-500">IQ</span>
          </h2>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-red-400/90 uppercase">
            AI RESUME INTELLIGENCE
          </span>
        </div>

        {/* 3. THIN PRELOADER PROGRESS LINE */}
        <div className="w-full max-w-[220px] bg-gray-950 border border-white/10 h-1.5 rounded-full overflow-hidden p-0.5 relative my-1 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-950 via-red-500 to-rose-400 rounded-full transition-all duration-150 ease-out relative shadow-[0_0_10px_rgba(220,38,38,0.6)]"
            style={{ width: `${Math.max(3, progress)}%` }}
          />
        </div>

        {/* 4. BOOT SEQUENCE STATUS TEXT */}
        <div className="h-5 flex items-center justify-center">
          <p className="text-[11px] font-mono text-gray-400 tracking-wider uppercase flex items-center gap-2">
            {!isReady && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
            <span className={isReady ? 'text-emerald-400 font-bold tracking-widest' : 'text-gray-300'}>
              {statusMessage}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
