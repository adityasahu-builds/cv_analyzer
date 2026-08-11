'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroParticles } from './HeroParticles';
import { useMounted } from '@/hooks/use-mounted';

export const AmbientCanvas: React.FC = () => {
  const isMounted = useMounted();

  if (!isMounted) return <div className="absolute inset-0 bg-transparent" />;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-70">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <HeroParticles />
      </Canvas>
    </div>
  );
};
