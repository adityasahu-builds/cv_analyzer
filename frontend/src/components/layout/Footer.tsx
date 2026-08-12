import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

const LogoMark = () => (
  <svg width="24" height="24" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="26" height="26" rx="8" fill="#059669"/>
    <path d="M7 6H17C18.1046 6 19 6.89543 19 8V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V8C5 6.89543 5.89543 6 7 6Z" stroke="white" strokeWidth="1.5"/>
    <path d="M9 13L11.5 15.5L16.5 9.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FOOTER_LINKS = [
  { label: 'Product',      href: '#features' },
  { label: 'Features',     href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Privacy',      href: '#' },
];

export const Footer: React.FC = () => (
  <footer className="bg-[#FFFFFF] border-t border-[#E5E7EB] py-12 text-[#6B7280]">
    <Container>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[16px] font-bold text-[#1A1A1A]" style={{ letterSpacing: '-0.01em' }}>
              Resume<span className="text-[#059669]">IQ</span>
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280] max-w-[240px] leading-relaxed">
            AI-powered resume intelligence and ATS optimization.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors font-medium"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-8 pt-6 border-t border-[#E5E7EB] flex items-center justify-between text-[12px] text-[#6B7280]">
        <p>© {new Date().getFullYear()} ResumeIQ. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <span className="font-semibold text-[#1A1A1A]">System Operational</span>
        </div>
      </div>
    </Container>
  </footer>
);
