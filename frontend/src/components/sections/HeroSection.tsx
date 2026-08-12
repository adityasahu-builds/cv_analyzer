'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

// ─── MARKETING PRODUCT DASHBOARD PREVIEW COMPONENT ─────────────────────────────

const SECTION_SCORES = [
  { label: 'ATS Compatibility',  score: 87, color: '#059669' },
  { label: 'Content Quality',    score: 91, color: '#059669' },
  { label: 'Keyword Coverage',   score: 84, color: '#059669' },
  { label: 'Impact Density',     score: 78, color: '#D97706' },
];

const IMPROVEMENTS = [
  'Add role-specific keywords to skills section',
  'Quantify experience impact with measurable metrics',
  'Strengthen executive summary alignment',
];

const DETECTED_KW  = ['React', 'TypeScript', 'Node.js', 'REST APIs'];
const MISSING_KW   = ['AWS', 'Docker', 'CI/CD'];

function ScoreBar({ score, color }: { score: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="flex-1 h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden border border-[#E5E7EB]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}

// Semicircular gauge with Emerald accent
function ScoreGauge({ score }: { score: number }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const radius = 38;
  const cx = 50;
  const cy = 50;
  const totalArc = Math.PI;
  const strokeLen = radius * totalArc;
  const dashOffset = strokeLen - (animScore / 100) * strokeLen;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-14">
        <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#059669"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${strokeLen}`}
            strokeDashoffset={`${dashOffset}`}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-0.5">
          <span className="text-2xl font-extrabold leading-none text-[#1A1A1A]">
            {score}
          </span>
        </div>
      </div>
      <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mt-1">
        ATS Score
      </span>
    </div>
  );
}

function ProductPreview() {
  const [showBadge, setShowBadge] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowBadge(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative p-2 rounded-[16px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-token">
      {/* Container */}
      <div className="bg-[#FFFFFF] rounded-[14px] overflow-hidden border border-[#E5E7EB]">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#E5E7EB] bg-[#F7F8FA]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-semibold text-[#059669] uppercase tracking-wider block mb-1">
                Resume Analysis Report
              </span>
              <p className="text-[16px] font-bold text-[#1A1A1A]">Candidate_Resume.pdf</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">Verified via AI Engine</p>
            </div>
            <div className="flex flex-col items-center">
              <ScoreGauge score={87} />
              <span className="mt-1 text-[12px] font-bold text-[#059669] bg-[#059669]/10 border border-[#059669]/20 px-2.5 py-0.5 rounded-[8px]">
                Strong Signal
              </span>
            </div>
          </div>
        </div>

        {/* Section Audit */}
        <div className="px-5 py-3.5 border-b border-[#E5E7EB]">
          <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2.5">
            Category Audit Breakdown
          </p>
          <div className="space-y-2">
            {SECTION_SCORES.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-[14px] text-[#6B7280] w-36 flex-shrink-0">{s.label}</span>
                <ScoreBar score={s.score} color={s.color} />
                <span className="text-[14px] font-bold text-[#1A1A1A] w-6 text-right flex-shrink-0 font-mono">
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Improvements */}
        <div className="px-5 py-3.5 border-b border-[#E5E7EB]">
          <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Top Priority Improvements
          </p>
          <div className="space-y-1.5">
            {IMPROVEMENTS.map((imp, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[12px] font-bold text-[#059669] mt-0.5 flex-shrink-0 w-4 font-mono">
                  0{i + 1}
                </span>
                <span className="text-[14px] text-[#1A1A1A] leading-snug">{imp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="px-5 py-3.5 bg-[#F7F8FA]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                Detected
              </p>
              <div className="flex flex-wrap gap-1">
                {DETECTED_KW.map((kw) => (
                  <span
                    key={kw}
                    className="text-[12px] px-2 py-0.5 bg-[#059669]/10 text-[#059669] font-semibold rounded-[8px] border border-[#059669]/20"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                Missing
              </p>
              <div className="flex flex-wrap gap-1">
                {MISSING_KW.map((kw) => (
                  <span
                    key={kw}
                    className="text-[12px] px-2 py-0.5 bg-red-50 text-red-700 font-semibold rounded-[8px] border border-red-200"
                  >
                    ⚠ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <div
        className="absolute -bottom-3 -left-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-3.5 py-2 flex items-center gap-2.5 shadow-token transition-all duration-300"
        style={{ opacity: showBadge ? 1 : 0, transform: showBadge ? 'translateY(0)' : 'translateY(6px)' }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#059669] shrink-0" />
        <div>
          <p className="text-[14px] font-bold text-[#1A1A1A] leading-none">Keyword Coverage +12%</p>
          <p className="text-[12px] text-[#6B7280] leading-none mt-1">3 improvements recommended</p>
        </div>
      </div>
    </div>
  );
}

// ─── HERO SECTION ────────────────────────────────────────────────────────────

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative bg-[#F7F8FA] py-16 md:py-24 border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── LEFT: Marketing Copy ── */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 max-w-2xl">

            {/* Badge Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#059669]/10 border border-[#059669]/20 rounded-[8px]">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <span className="text-[12px] font-bold text-[#059669] uppercase tracking-wider">
                AI RESUME ANALYZER &amp; ATS OPTIMIZER
              </span>
            </div>

            {/* Headline — text-3xl (44px) Token */}
            <h1 className="text-hero font-extrabold text-[#1A1A1A]">
              Analyze your resume for ATS compatibility and <span className="text-[#059669]">recruiter impact.</span>
            </h1>

            {/* Subtitle — text-lg (18px) Token */}
            <p className="text-subheading text-[#6B7280] leading-relaxed max-w-xl">
              Upload your resume to get instant ATS scores, keyword matching, formatting audits, and actionable bullet improvements to accelerate your job search.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={() => scrollTo('ats-analyzer')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#059669] hover:bg-[#047857] active:bg-[#047857] text-white text-[16px] font-semibold rounded-[10px] transition-colors duration-150 shadow-sm group cursor-pointer"
              >
                Analyze your resume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#1A1A1A] text-[16px] font-medium rounded-[10px] transition-colors duration-150 cursor-pointer shadow-sm"
              >
                See how it works
              </button>
            </div>

            {/* Trust Microcopy */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-medium text-[#6B7280] pt-2">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#059669]" /> PDF &amp; DOCX supported
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#059669]" /> Private analysis
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#059669]" /> Results in seconds
              </span>
            </div>
          </div>

          {/* ── RIGHT: Product Visual Preview ── */}
          <div className="lg:col-span-5 w-full max-w-lg mx-auto">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
};
