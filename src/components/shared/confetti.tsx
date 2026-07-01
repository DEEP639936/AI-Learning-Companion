'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface ConfettiProps {
  show: boolean;
  duration?: number;
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

interface Particle {
  id: number;
  x: number;
  rotation: number;
  color: string;
  scale: number;
  shape: 'circle' | 'square' | 'triangle';
}

function generateParticles(): Particle[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    rotation: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    scale: 0.5 + Math.random() * 0.5,
    shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function Confetti({ show, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevShowRef = useRef(false);

  useEffect(() => {
    if (show && !prevShowRef.current) {
      // Use setTimeout(0) to schedule state update outside the effect sync body
      const generateTimer = setTimeout(() => {
        setParticles(generateParticles());
      }, 0);

      const clearTimer = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => {
        clearTimeout(generateTimer);
        clearTimeout(clearTimer);
      };
    }
    prevShowRef.current = show;
  }, [show, duration]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: '-10vh', rotate: 0, opacity: 1 }}
              animate={{
                y: '110vh',
                rotate: p.rotation + 720,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration / 1000, ease: 'easeOut' }}
              className="absolute"
              style={{ scale: p.scale }}
            >
              {p.shape === 'circle' && (
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              )}
              {p.shape === 'square' && (
                <div
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: p.color, transform: 'rotate(45deg)' }}
                />
              )}
              {p.shape === 'triangle' && (
                <div
                  className="size-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px]"
                  style={{ borderBottomColor: p.color }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
