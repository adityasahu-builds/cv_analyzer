'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { MAIN_NAV_ITEMS } from '@/constants/navigation';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Container } from '@/components/ui/Container';
import { cn } from '@/utils/cn';

// Clean marketing logo mark: Document + Emerald Checkmark
const LogoMark = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="26" height="26" rx="8" fill="#059669"/>
    <path d="M7 6H17C18.1046 6 19 6.89543 19 8V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V8C5 6.89543 5.89543 6 7 6Z" stroke="white" strokeWidth="1.5"/>
    <path d="M9 13L11.5 15.5L16.5 9.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 8;

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] transition-all duration-200',
        isScrolled
          ? 'border-b border-[#E5E7EB] shadow-sm'
          : 'border-b border-[#E5E7EB]'
      )}
    >
      <Container>
        <div className="flex items-center justify-between h-[64px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <LogoMark />
            <span className="text-[16px] font-bold text-[#1A1A1A] tracking-tight">
              Resume<span className="text-[#059669]">IQ</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {MAIN_NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3.5 py-2 text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors duration-150 rounded-[8px] hover:bg-[#F7F8FA] font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollTo('ats-analyzer')}
              className="px-4 py-2 text-[14px] font-semibold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#047857] rounded-[10px] transition-colors duration-150 shadow-sm cursor-pointer"
            >
              Analyze Resume
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#6B7280] hover:text-[#1A1A1A] rounded-[8px] hover:bg-[#F7F8FA] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E5E7EB] space-y-1 bg-[#FFFFFF]">
            {MAIN_NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-[14px] text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F7F8FA] rounded-[8px] font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 pb-1">
              <button
                onClick={() => scrollTo('ats-analyzer')}
                className="w-full py-2.5 px-4 text-[14px] font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-[10px] transition-colors text-center cursor-pointer"
              >
                Analyze Resume
              </button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};
