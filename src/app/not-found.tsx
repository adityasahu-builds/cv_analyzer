import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Compass, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center relative bg-radial-dark">
      <Container className="flex justify-center">
        <Card className="max-w-lg w-full text-center p-10 flex flex-col items-center gap-6 border-cyan-500/20">
          <div className="relative">
            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500 font-mono tracking-tighter">
              404
            </span>
            <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Route Vector Not Found
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              The target page module or candidate dataset you requested does not exist or has been relocated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
            <Button variant="primary" asChild className="w-full sm:w-auto">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </Button>
            <Button variant="glass" asChild className="w-full sm:w-auto">
              <Link href="#features" className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Explore Platform</span>
              </Link>
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
