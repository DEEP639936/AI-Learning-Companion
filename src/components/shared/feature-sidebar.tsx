'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type FeaturePage } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MentoraLogo } from '@/components/shared/mentora-logo';
import { PricingModal } from '@/components/shared/pricing-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MessageSquare,
  FileText,
  HelpCircle,
  GitBranch,
  Code2,
  Link,
  Layers,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Crown,
  Sparkles,
} from 'lucide-react';

const FEATURES: { id: FeaturePage; label: string; icon: React.ElementType; accent: string }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, accent: 'text-primary' },
  { id: 'summarize', label: 'Summarize', icon: FileText, accent: 'text-summarize-violet' },
  { id: 'mcq', label: 'MCQ Quiz', icon: HelpCircle, accent: 'text-mcq-amber' },
  { id: 'mindmap', label: 'Mind Map', icon: GitBranch, accent: 'text-mindmap-emerald' },
  { id: 'code-explainer', label: 'Code Explainer', icon: Code2, accent: 'text-code-teal' },
  { id: 'url-fetch', label: 'URL Fetch', icon: Link, accent: 'text-url-cyan' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, accent: 'text-flashcard-rose' },
  { id: 'study-planner', label: 'Study Planner', icon: CalendarDays, accent: 'text-primary' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: 'text-primary' },
];

export function FeatureSidebar() {
  const { activeFeature, setActiveFeature, sidebarCollapsed, toggleSidebar } = useAppStore();
  const [pricingOpen, setPricingOpen] = useState(false);

  const activeIndex = FEATURES.findIndex((f) => f.id === activeFeature);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-full glass-strong border-r border-border/50 transition-all duration-300 ease-in-out relative',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo area */}
        <div className="flex items-center gap-2.5 p-4 border-b border-border/50 min-h-[60px]">
          <MentoraLogo size={24} />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg whitespace-nowrap overflow-hidden gradient-text"
              >
                Mentora
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Feature items */}
        <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto relative">
          {/* Animated active indicator bar */}
          <motion.div
            layout
            className="absolute left-0 w-[3px] bg-primary rounded-r-full"
            initial={false}
            animate={{
              top: activeIndex * 40 + 8,
              height: 32,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          />

          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;

            const button = (
              <Button
                key={feature.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 transition-all duration-200 relative',
                  sidebarCollapsed && 'justify-center px-0',
                  isActive && 'bg-primary/10 text-primary font-medium',
                  !isActive && 'hover:bg-accent/50'
                )}
                onClick={() => setActiveFeature(feature.id)}
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Icon
                    className={cn(
                      'size-5 shrink-0 transition-colors duration-200',
                      isActive ? feature.accent : 'text-muted-foreground'
                    )}
                  />
                </motion.div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {feature.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={feature.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">{feature.label}</TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        {/* Upgrade to Pro CTA */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 pb-2"
            >
              <button
                className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/10 to-summarize-violet/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 group cursor-pointer text-left"
                onClick={() => setPricingOpen(true)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Upgrade to Pro</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Unlock unlimited features & priority support
                </p>
                <div className="flex items-center text-[10px] font-medium text-primary mt-1.5 group-hover:gap-1.5 transition-all">
                  <Sparkles className="size-3" />
                  <span>Start free trial</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center hover:bg-accent/50 transition-colors"
            onClick={toggleSidebar}
          >
            <motion.div
              initial={false}
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="size-4" />
            </motion.div>
          </Button>
        </div>

        <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
      </aside>
    </TooltipProvider>
  );
}
