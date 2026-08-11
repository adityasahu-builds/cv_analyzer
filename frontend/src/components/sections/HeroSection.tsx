'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const HeroSection: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setMousePos({ x, y });
    });
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative z-10 pt-10 pb-16 md:pt-18 md:pb-24 overflow-hidden"
    >
      {/* 1. LIQUID RED AMBIENT LIGHT FIELDS (BACKGROUND) */}
      {/* Top Left Static Deep Crimson Glow */}
      <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-red-950/25 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />

      {/* Mouse Follow Liquid Glow Field */}
      <div
        className="absolute w-[650px] h-[400px] bg-gradient-to-r from-red-900/20 via-rose-950/15 to-crimson-900/10 rounded-full blur-[150px] pointer-events-none -z-10 transition-transform duration-700 ease-out"
        style={{
          transform: isHovered
            ? `translate(${mousePos.x - 325}px, ${mousePos.y - 200}px)`
            : 'translate(20%, -10%)',
          opacity: isHovered ? 0.85 : 0.4,
        }}
      />

      {/* Bottom Right Deep Accent Glow */}
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-rose-950/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Radial Grid Subtle Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(185,28,28,0.08),rgba(255,255,255,0))] pointer-events-none z-0" />

      <Container className="relative z-10">
        {/* 2. FLOATING LIQUID GLASS PANEL CARD */}
        <div className="max-w-4xl mx-auto relative rounded-[32px] sm:rounded-[36px] bg-black/60 backdrop-blur-3xl border border-white/[0.08] p-8 sm:p-14 md:p-16 text-center flex flex-col items-center gap-7 sm:gap-9 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_50px_rgba(185,28,28,0.06)] overflow-hidden">
          {/* Glass Top Edge Reflection Highlight */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent pointer-events-none" />

          {/* 1. TOP BADGE */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(185,28,28,0.15)]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span>AI RESUME INTELLIGENCE</span>
          </div>

          {/* 2. MAIN HEADLINE */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06] font-sans max-w-3xl">
            Your Resume.{' '}
            <br className="hidden sm:inline" />
            Built to{' '}
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-500 bg-clip-text text-transparent inline-block font-black">
              Get Noticed.
            </span>
          </h1>

          {/* 3. SUBHEADING */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-2xl font-normal leading-relaxed">
            Upload your resume. Get an ATS score, uncover hidden gaps, and turn weak sections into stronger ones — in seconds.
          </p>

          {/* 4. PRIMARY & SECONDARY CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-1 w-full sm:w-auto">
            {/* Primary CTA */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('ats-analyzer');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative group overflow-hidden w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border border-red-500/40 rounded-2xl shadow-[0_0_25px_rgba(185,28,28,0.25)] hover:shadow-[0_0_40px_rgba(185,28,28,0.45)] hover:border-red-400/80 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Animated Light Sweep Overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              <span className="flex items-center justify-center gap-2">
                Analyze My Resume <ArrowRight className="w-4 h-4 text-red-300 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            {/* Secondary CTA */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-4 text-base font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl backdrop-blur-md transition-all duration-300 hover:text-white"
            >
              See How It Works
            </Button>
          </div>

          {/* 5. SECONDARY TRUST MICROCOPY */}
          <p className="text-xs sm:text-sm font-mono text-gray-400/80 tracking-wide -mt-2">
            ATS analysis • AI insights • Actionable improvements
          </p>
        </div>
      </Container>
    </section>
  );
};
