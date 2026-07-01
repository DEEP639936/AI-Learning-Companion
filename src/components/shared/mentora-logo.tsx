'use client';

import { motion } from 'framer-motion';

interface MentoraLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function MentoraLogo({ size = 40, showText = false, className = '' }: MentoraLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="shrink-0 cursor-pointer"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer ring: Deep Indigo → Blue → Cyan */}
            <linearGradient id="logoGrad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b3bb5" />
              <stop offset="50%" stopColor="#4466dd" />
              <stop offset="100%" stopColor="#2299bb" />
            </linearGradient>
            {/* Nodes: Bright Indigo → Magenta */}
            <linearGradient id="logoGrad2" x1="10" y1="5" x2="30" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6b7bff" />
              <stop offset="100%" stopColor="#aa55dd" />
            </linearGradient>
            {/* Pathways: Blue → Cyan */}
            <linearGradient id="logoGrad3" x1="5" y1="10" x2="35" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5577ee" />
              <stop offset="100%" stopColor="#33aacc" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer circle ring */}
          <circle cx="20" cy="20" r="18.5" stroke="url(#logoGrad1)" strokeWidth="2" fill="none" opacity="0.9" />

          {/* Central node */}
          <circle cx="20" cy="20" r="4.5" fill="url(#logoGrad2)" filter="url(#glow)" />

          {/* Neural pathways - top */}
          <line x1="20" y1="15.5" x2="20" y2="8" stroke="url(#logoGrad3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="20" cy="7" r="2.8" fill="url(#logoGrad2)" opacity="0.9" />

          {/* Neural pathways - bottom */}
          <line x1="20" y1="24.5" x2="20" y2="32" stroke="url(#logoGrad3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="20" cy="33" r="2.8" fill="url(#logoGrad2)" opacity="0.9" />

          {/* Neural pathways - left */}
          <line x1="15.5" y1="20" x2="8" y2="20" stroke="url(#logoGrad3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="7" cy="20" r="2.8" fill="url(#logoGrad2)" opacity="0.9" />

          {/* Neural pathways - right */}
          <line x1="24.5" y1="20" x2="32" y2="20" stroke="url(#logoGrad3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="33" cy="20" r="2.8" fill="url(#logoGrad2)" opacity="0.9" />

          {/* Diagonal pathways */}
          <line x1="17.2" y1="17.2" x2="11" y2="11" stroke="url(#logoGrad3)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <circle cx="10" cy="10" r="2" fill="url(#logoGrad2)" opacity="0.7" />

          <line x1="22.8" y1="17.2" x2="29" y2="11" stroke="url(#logoGrad3)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <circle cx="30" cy="10" r="2" fill="url(#logoGrad2)" opacity="0.7" />

          <line x1="17.2" y1="22.8" x2="11" y2="29" stroke="url(#logoGrad3)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <circle cx="10" cy="30" r="2" fill="url(#logoGrad2)" opacity="0.7" />

          <line x1="22.8" y1="22.8" x2="29" y2="29" stroke="url(#logoGrad3)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <circle cx="30" cy="30" r="2" fill="url(#logoGrad2)" opacity="0.7" />

          {/* Sparkle dots */}
          <circle cx="14" cy="14" r="1.2" fill="#6b7bff" opacity="0.5" />
          <circle cx="26" cy="14" r="1.2" fill="#6b7bff" opacity="0.5" />
          <circle cx="14" cy="26" r="1.2" fill="#6b7bff" opacity="0.5" />
          <circle cx="26" cy="26" r="1.2" fill="#6b7bff" opacity="0.5" />
        </svg>
      </motion.div>
      {showText && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-bold text-xl gradient-text whitespace-nowrap"
        >
          Mentora AI
        </motion.span>
      )}
    </div>
  );
}
