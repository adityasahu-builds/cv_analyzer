import React from 'react';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center relative overflow-hidden bg-radial-dark">
      <Container className="flex flex-col items-center text-center">
        {/* Animated Loader Pulse */}
        <div className="relative mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-indigo-600 p-[1px] animate-pulse">
            <div className="w-full h-full bg-gray-950 rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-ping pointer-events-none" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2 font-sans">
          Initializing ResumeIQ System Engine...
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mb-10 font-mono">
          Loading core modules, 3D particle canvas, and ATS diagnostic schemas.
        </p>

        {/* Skeleton Grid Fallback */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </Container>
    </div>
  );
}
