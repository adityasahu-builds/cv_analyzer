'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { MAIN_NAV_ITEMS } from '@/constants/navigation';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 20;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-gray-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      )}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="h-full w-full bg-gray-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                Resume<span className="text-cyan-400">IQ</span>
              </span>
              <span className="text-[10px] tracking-wider text-gray-400 uppercase font-mono">
                AI Architecture
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/5 flex items-center gap-1.5"
              >
                {item.label}
                {item.badge && (
                  <Badge variant="cyan" className="py-0 px-1.5 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="#ats-analyzer" className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>ATS Check</span>
              </Link>
            </Button>
            <Button variant="primary" size="sm">
              <span className="flex items-center gap-1.5">
                Launch App <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 rounded-2xl glass-card p-5 flex flex-col gap-4 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-1">
              {MAIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-base font-medium text-gray-200 hover:text-white hover:bg-white/5 rounded-xl flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  {item.badge && <Badge variant="cyan">{item.badge}</Badge>}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Button variant="glass" className="w-full justify-center">
                Sign In
              </Button>
              <Button variant="primary" className="w-full justify-center">
                Launch App <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};
