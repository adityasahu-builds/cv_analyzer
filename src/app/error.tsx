'use client';

import React, { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly if needed in future telemetry
  }, [error]);

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center relative bg-radial-dark">
      <Container className="flex justify-center">
        <Card className="max-w-lg w-full text-center p-8 flex flex-col items-center gap-6 border-red-500/30">
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
              System Exception Detected
            </h2>
            <p className="text-sm text-gray-400 font-mono leading-relaxed">
              {error.message || 'An unexpected client execution error occurred within the ResumeIQ runtime environment.'}
            </p>
            {error.digest && (
              <span className="inline-block text-[11px] font-mono text-gray-500 bg-gray-900 px-2.5 py-1 rounded-md border border-gray-800">
                Digest ID: {error.digest}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full justify-center pt-2">
            <Button variant="primary" onClick={() => reset()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Retry Operation</span>
            </Button>
            <Button variant="glass" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </Link>
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
