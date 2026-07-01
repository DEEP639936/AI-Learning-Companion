'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAppStore, type FeaturePage } from '@/store/app-store';
import { FeatureSidebar } from '@/components/shared/feature-sidebar';
import { AuthModal } from '@/components/shared/auth-modal';
import { MentoraLogo } from '@/components/shared/mentora-logo';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { ChatFeature } from '@/components/features/chat';
import { SummarizeFeature } from '@/components/features/summarize';
import { MCQFeature } from '@/components/features/mcq';
import { MindMapFeature } from '@/components/features/mindmap';
import { CodeExplainerFeature } from '@/components/features/code-explainer';
import { URLFetchFeature } from '@/components/features/url-fetch';
import { FlashcardsFeature } from '@/components/features/flashcards';
import { StudyPlannerFeature } from '@/components/features/study-planner';
import { DashboardFeature } from '@/components/features/dashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Sun,
  Moon,
  MessageSquare,
  FileText,
  HelpCircle,
  GitBranch,
  Code2,
  Link,
  Layers,
  LayoutDashboard,
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  Languages,
  Zap,
  Check,
  X,
  Star,
  Quote,
  Users,
  MessageCircle,
  Cpu,
  Globe,
  ChevronRight,
  Mail,
  Heart,
  Twitter,
  Github,
  Youtube,
  Crown,
  Rocket,
  GraduationCap,
  Lightbulb,
  Target,
  ArrowUpRight,
  Shield,
  Headphones,
  CalendarDays,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

/* ─────────── Data ─────────── */

const FEATURE_CARDS = [
  {
    id: 'chat' as FeaturePage,
    icon: MessageSquare,
    title: 'AI Chat',
    description: 'Chat with your AI tutor in 4 modes: Default, ELI5, Socratic, and Exam Prep.',
    accent: 'bg-primary/10 text-primary border-primary/20',
    iconColor: 'text-primary',
    previewEmoji: '💬',
  },
  {
    id: 'summarize' as FeaturePage,
    icon: FileText,
    title: 'Summarize',
    description: 'Paste text, upload files, or use URLs to get concise summaries with key takeaways.',
    accent: 'bg-summarize-violet/10 text-summarize-violet border-summarize-violet/20',
    iconColor: 'text-summarize-violet',
    previewEmoji: '📄',
  },
  {
    id: 'mcq' as FeaturePage,
    icon: HelpCircle,
    title: 'MCQ Quiz',
    description: 'Generate quizzes on any topic with adjustable difficulty and instant feedback.',
    accent: 'bg-mcq-amber/10 text-mcq-amber border-mcq-amber/20',
    iconColor: 'text-mcq-amber',
    previewEmoji: '❓',
  },
  {
    id: 'mindmap' as FeaturePage,
    icon: GitBranch,
    title: 'Mind Maps',
    description: 'Visualize concepts as interactive, collapsible mind maps with color-coded nodes.',
    accent: 'bg-mindmap-emerald/10 text-mindmap-emerald border-mindmap-emerald/20',
    iconColor: 'text-mindmap-emerald',
    previewEmoji: '🧠',
  },
  {
    id: 'code-explainer' as FeaturePage,
    icon: Code2,
    title: 'Code Explainer',
    description: 'Generate or explain code with line-by-line breakdowns and real-world analogies.',
    accent: 'bg-code-teal/10 text-code-teal border-code-teal/20',
    iconColor: 'text-code-teal',
    previewEmoji: '💻',
  },
  {
    id: 'url-fetch' as FeaturePage,
    icon: Link,
    title: 'URL Fetch',
    description: 'Fetch content from any URL and analyze it — summarize, quiz, or create flashcards.',
    accent: 'bg-url-cyan/10 text-url-cyan border-url-cyan/20',
    iconColor: 'text-url-cyan',
    previewEmoji: '🔗',
  },
  {
    id: 'flashcards' as FeaturePage,
    icon: Layers,
    title: 'Flashcards',
    description: 'Create decks with spaced repetition. Flip, rate, and master concepts efficiently.',
    accent: 'bg-flashcard-rose/10 text-flashcard-rose border-flashcard-rose/20',
    iconColor: 'text-flashcard-rose',
    previewEmoji: '🃏',
  },
  {
    id: 'study-planner' as FeaturePage,
    icon: CalendarDays,
    title: 'Study Planner',
    description: 'AI-powered study schedules with daily plans, weekly breakdowns, and revision reminders.',
    accent: 'bg-primary/10 text-primary border-primary/20',
    iconColor: 'text-primary',
    previewEmoji: '📅',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Medical Student',
    avatar: 'SC',
    quote: 'Mentora AI transformed how I study for exams. The Socratic mode actually makes me think deeper instead of just memorizing.',
    rating: 5,
  },
  {
    name: 'James Rodriguez',
    role: 'CS Major',
    avatar: 'JR',
    quote: 'The code explainer is incredible. It breaks down complex algorithms with real-world analogies that finally make sense.',
    rating: 5,
  },
  {
    name: 'Aisha Patel',
    role: 'Law Student',
    avatar: 'AP',
    quote: 'I use the summarize feature daily. It condenses 50-page cases into digestible key points. Absolute game changer.',
    rating: 5,
  },
  {
    name: 'Marcus Kim',
    role: 'Engineering Student',
    avatar: 'MK',
    quote: 'The mind map feature helps me visualize complex systems. My study sessions are 3x more productive now.',
    rating: 4,
  },
  {
    name: 'Emma Thompson',
    role: 'Biology Major',
    avatar: 'ET',
    quote: 'Flashcards with spaced repetition are exactly what I needed. My retention rate has gone through the roof!',
    rating: 5,
  },
  {
    name: 'Liam O\'Brien',
    role: 'Physics Student',
    avatar: 'LO',
    quote: 'The MCQ quizzes adapt to my weak areas. It\'s like having a personal tutor who knows exactly what I need to work on.',
    rating: 5,
  },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Students', icon: Users },
  { value: 1000000, suffix: '+', label: 'Questions Answered', icon: MessageCircle },
  { value: 98, suffix: '%', label: 'Satisfaction', icon: Heart },
  { value: 7, suffix: '', label: 'Languages', icon: Globe },
];

const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started with AI-powered studying.',
    badge: null,
    features: [
      { name: '50 AI messages/day', included: true },
      { name: 'Basic summarization', included: true },
      { name: '5 MCQ quizzes/day', included: true },
      { name: '3 flashcard decks', included: true },
      { name: '1 mind map/day', included: true },
      { name: '1 study plan/week', included: true },
      { name: 'Standard response speed', included: true },
      { name: 'Advanced summarization', included: false },
      { name: 'Code explainer with analogies', included: false },
      { name: 'Export to PDF', included: false },
      { name: 'Progress analytics', included: false },
      { name: 'Voice-to-text input', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Get Started',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: 9.99,
    yearlyPrice: 7.99,
    description: 'For serious students who want unlimited AI assistance.',
    badge: 'Most Popular',
    features: [
      { name: 'Unlimited AI messages', included: true },
      { name: 'Advanced summarization (all depths)', included: true },
      { name: 'Unlimited MCQ quizzes', included: true },
      { name: 'Unlimited flashcard decks', included: true },
      { name: 'Unlimited mind maps', included: true },
      { name: 'Unlimited study plans', included: true },
      { name: 'Priority response speed', included: true },
      { name: 'Code explainer with analogies', included: true },
      { name: 'Export to PDF', included: true },
      { name: 'Progress analytics', included: true },
      { name: 'Voice-to-text input', included: false },
      { name: 'Collaborative study rooms', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Start Pro Trial',
    ctaVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'Premium',
    price: 19.99,
    yearlyPrice: 15.99,
    description: 'The ultimate study companion with all features unlocked.',
    badge: null,
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Voice-to-text input', included: true },
      { name: 'Collaborative study rooms', included: true },
      { name: 'Custom AI tutor personality', included: true },
      { name: 'API access', included: true },
      { name: 'Priority support', included: true },
      { name: 'Early access to new features', included: true },
      { name: 'Unlimited exports', included: true },
      { name: 'Advanced analytics dashboard', included: true },
      { name: 'Custom study plans', included: true },
      { name: 'Whiteboard mode', included: true },
      { name: 'Team collaboration tools', included: true },
    ],
    cta: 'Go Premium',
    ctaVariant: 'outline' as const,
    popular: false,
  },
];

/* ─────────── Animated Counter ─────────── */

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const stepTime = duration / steps;
          let current = 0;
          const increment = value / steps;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
}

/* ─────────── Typewriter ─────────── */

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

/* ─────────── Theme Toggle ─────────── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 relative">
        <Sun className="size-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0, scale: theme === 'dark' ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="absolute"
      >
        <Sun className="size-4" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : -180, scale: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="absolute"
      >
        <Moon className="size-4" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

/* ─────────── Floating Orbs ─────────── */

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] left-[10%] w-72 h-72 bg-primary/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-summarize-violet/15 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ y: [0, -12, 0], x: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[50%] left-[50%] w-64 h-64 bg-mindmap-emerald/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-[30%] right-[30%] w-48 h-48 bg-mcq-amber/10 rounded-full blur-[80px]"
      />
    </div>
  );
}

/* ─────────── Pricing Section ─────────── */

function PricingSection({ onGetStarted, compact = false }: { onGetStarted: (feature?: FeaturePage) => void; compact?: boolean }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className={cn('px-4 py-16 sm:py-24', compact ? '' : 'bg-muted/30')}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start free. Upgrade when you&apos;re ready to supercharge your studying.
          </p>
          {/* Yearly/Monthly toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={cn('text-sm font-medium', !yearly && 'text-foreground', yearly && 'text-muted-foreground')}>Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={cn('text-sm font-medium', yearly && 'text-foreground', !yearly && 'text-muted-foreground')}>Yearly</span>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              Save 20%
            </Badge>
          </div>
        </motion.div>

        <div className={cn('grid gap-6', compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3')}>
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={cn(
                'relative rounded-2xl p-6 sm:p-8 transition-all duration-300',
                tier.popular
                  ? 'gradient-border shadow-xl ring-1 ring-primary/20'
                  : 'bg-card border border-border hover:shadow-lg'
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-lg px-3 py-1 text-xs font-semibold">
                    <Crown className="size-3 mr-1" />
                    {tier.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${yearly ? tier.yearlyPrice : tier.price}
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
                {yearly && tier.price > 0 && (
                  <p className="text-xs text-primary mt-1">
                    Billed annually (${((yearly ? tier.yearlyPrice : tier.price) * 12).toFixed(0)}/year)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature.name} className="flex items-center gap-2.5 text-sm">
                    {feature.included ? (
                      <Check className="size-4 text-primary shrink-0" />
                    ) : (
                      <X className="size-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={cn(!feature.included && 'text-muted-foreground/50')}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.ctaVariant}
                className={cn(
                  'w-full h-11',
                  tier.popular && 'btn-glow'
                )}
                onClick={() => onGetStarted()}
              >
                {tier.cta}
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Navbar ─────────── */

function Navbar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass-strong shadow-lg'
          : 'bg-background/60 backdrop-blur-md border-b border-border/50'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <MentoraLogo size={32} showText />

        {/* Nav links - desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {['Features', 'Pricing', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              {item}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-3/4" />
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          <button
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex cursor-pointer"
            onClick={() => onOpenAuth()}
          >
            Sign In
          </button>
          <Button
            size="sm"
            className="btn-glow gap-1.5 hidden sm:inline-flex"
            onClick={() => onOpenAuth()}
          >
            <Sparkles className="size-4" />
            Get Started
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

/* ─────────── Hero Section ─────────── */

function HeroSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  const heroWords = ['Study', 'Smarter', 'with', 'AI'];

  return (
    <section className="relative flex-1 flex items-center justify-center px-4 py-20 sm:py-32 overflow-hidden">
      <FloatingOrbs />

      <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
        {/* Animated headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
          {heroWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.2,
                duration: 0.6,
                type: 'spring',
                stiffness: 100,
                damping: 12,
              }}
              className={cn(
                'inline-block mr-3 sm:mr-4',
                i === 0 && 'text-primary',
                i === 1 && 'gradient-text',
                i >= 2 && 'text-foreground'
              )}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Typewriter subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed min-h-[3rem]"
        >
          <TypewriterText
            text="Your AI-powered study companion that chats, summarizes, quizzes, explains code, builds mind maps, creates flashcards, and plans your study schedule — all in your language."
            delay={1200}
          />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="btn-glow gap-2 text-lg px-8 h-13 rounded-xl shadow-lg shadow-primary/20"
            onClick={() => onOpenAuth()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            asChild
          >
            <motion.button>
              <Sparkles className="size-5" />
              Start Learning Free
            </motion.button>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 text-lg px-8 h-13 rounded-xl group"
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Features
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="flex items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground pt-4"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="size-4 text-primary" /> 8 AI Features
          </span>
          <span className="flex items-center gap-1.5">
            <Languages className="size-4 text-primary" /> 7 Languages
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-primary" /> Free & Open
          </span>
        </motion.div>

        {/* Animated trust line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.6 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex -space-x-2">
            {['🧑‍🎓', '👩‍🎓', '🧑‍💻', '👩‍🔬'].map((emoji, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs"
              >
                {emoji}
              </div>
            ))}
          </div>
          <span>Trusted by <strong className="text-foreground">10,000+</strong> students worldwide</span>
        </motion.div>

        {/* Feature preview cards - properly separated */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-10 max-w-3xl mx-auto">
          {/* Chat preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <MessageSquare className="size-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">AI Chat</span>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-lg p-2.5 text-xs text-left">How do neurons communicate?</div>
              <div className="bg-muted/60 rounded-lg p-2.5 text-xs text-left text-muted-foreground">
                Neurons communicate through electrochemical signals...
              </div>
            </div>
          </motion.div>

          {/* Quiz preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.6 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-lg bg-mcq-amber/15 flex items-center justify-center">
                <HelpCircle className="size-4 text-mcq-amber" />
              </div>
              <span className="text-sm font-semibold">MCQ Quiz</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-left">What is the powerhouse of the cell?</div>
              <div className="grid grid-cols-2 gap-1.5">
                {['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi'].map((opt) => (
                  <div
                    key={opt}
                    className={cn(
                      'text-[10px] p-1.5 rounded-md border text-center',
                      opt === 'Mitochondria' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/50 border-border'
                    )}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Flashcard preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 0.6 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-lg bg-flashcard-rose/15 flex items-center justify-center">
                <Layers className="size-4 text-flashcard-rose" />
              </div>
              <span className="text-sm font-semibold">Flashcards</span>
            </div>
            <div className="space-y-2">
              <div className="bg-flashcard-rose/10 rounded-lg p-2.5 text-xs text-left border border-flashcard-rose/20">
                <div className="text-[10px] text-muted-foreground mb-1">Front</div>
                What is photosynthesis?
              </div>
              <div className="bg-muted/60 rounded-lg p-2.5 text-xs text-left">
                <div className="text-[10px] text-muted-foreground mb-1">Back</div>
                The process by which plants...
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Features Section ─────────── */

function FeaturesSection({ onGetStarted }: { onGetStarted: (feature?: FeaturePage) => void }) {
  return (
    <section id="features" className="px-4 py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Study</span>
          </h2>
          <p className="text-muted-foreground text-lg">One app, eight powerful AI features — all free.</p>
          {/* Animated underline */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-primary to-mindmap-emerald rounded-full mx-auto mt-4"
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  rotateY: 5,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onGetStarted(card.id)}
                className={`p-6 rounded-2xl border ${card.accent} text-left transition-all duration-300 hover:shadow-xl cursor-pointer group relative overflow-hidden`}
                style={{ perspective: 1000 }}
              >
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className={`size-8 mb-3 ${card.iconColor} relative z-10`} />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2 relative z-10">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{card.description}</p>

                <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  Try now <ArrowRight className="size-3 ml-1" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────── How It Works Section ─────────── */

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Lightbulb,
      title: 'Ask Anything',
      description: 'Type your question, paste your notes, or share a URL. Our AI handles all formats.',
    },
    {
      number: '02',
      icon: Cpu,
      title: 'AI Understands',
      description: 'Advanced AI analyzes your input, identifies key concepts, and creates personalized study materials.',
    },
    {
      number: '03',
      icon: Target,
      title: 'Learn Smarter',
      description: 'Get interactive quizzes, mind maps, summaries, and flashcards tailored to your learning style.',
    },
  ];

  return (
    <section className="px-4 py-16 sm:py-24 relative">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">Three simple steps to transform your study sessions.</p>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-primary to-mindmap-emerald rounded-full mx-auto mt-4"
          />
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                  className="relative text-center"
                >
                  {/* Step circle */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 relative z-10"
                  >
                    <StepIcon className="size-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {step.number}
                    </span>
                  </motion.div>

                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Testimonials Section ─────────── */

function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let start: number | null = null;
    const speed = 0.5;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      if (!isPaused) {
        container.scrollLeft += speed;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Loved by <span className="gradient-text">Students</span>
          </h2>
          <p className="text-muted-foreground text-lg">See what students around the world are saying.</p>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-primary to-mindmap-emerald rounded-full mx-auto mt-4"
          />
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-none px-4"
        style={{ scrollbarWidth: 'none' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTestimonials.map((testimonial, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="min-w-[300px] sm:min-w-[340px] bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 flex-shrink-0"
          >
            <Quote className="size-8 text-primary/20 mb-4" />
            <p className="text-sm leading-relaxed mb-4">{testimonial.quote}</p>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star
                  key={si}
                  className={cn(
                    'size-3.5',
                    si < testimonial.rating
                      ? 'text-mcq-amber fill-mcq-amber'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {testimonial.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Stats Section ─────────── */

function StatsSection() {
  return (
    <section className="px-4 py-16 sm:py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <StatIcon className="size-8 text-primary mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────── CTA Section ─────────── */

function CTASection({ onGetStarted }: { onGetStarted: (feature?: FeaturePage) => void }) {
  return (
    <section className="px-4 py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-summarize-violet/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center space-y-6 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Rocket className="size-8 text-primary" />
        </motion.div>

        <h2 className="text-3xl sm:text-4xl font-bold">
          Ready to Transform Your Study?
        </h2>
        <p className="text-muted-foreground text-lg">
          Join thousands of students already learning smarter with AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            className="h-12 rounded-xl bg-background/80 border-border"
          />
          <Button
            size="lg"
            className="btn-glow h-12 px-6 rounded-xl shrink-0"
            onClick={() => onGetStarted()}
          >
            Get Started
            <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Free forever. No credit card required.
        </p>
      </motion.div>
    </section>
  );
}

/* ─────────── Footer ─────────── */

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <MentoraLogo size={28} showText />
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Built for students, powered by AI. Making learning accessible to everyone.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Github, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['AI Chat', 'Summarize', 'MCQ Quiz', 'Mind Maps', 'Flashcards', 'Study Planner'].map((item) => (
                <li key={item}>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">
              {['About', 'Blog', 'Careers', 'Press', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy', 'Terms', 'Security', 'GDPR'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 Mentora AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with <Heart className="size-3 inline text-primary" /> for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── Landing View ─────────── */

function LandingView({ onGetStarted, onOpenAuth }: { onGetStarted: (feature?: FeaturePage) => void; onOpenAuth: () => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAuth={onOpenAuth} />
      <HeroSection onOpenAuth={onOpenAuth} />
      <FeaturesSection onGetStarted={onGetStarted} />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection onGetStarted={onGetStarted} />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}

/* ─────────── Feature Content Router ─────────── */

function FeatureContent({ feature }: { feature: FeaturePage }) {
  switch (feature) {
    case 'chat':
      return <ChatFeature />;
    case 'summarize':
      return <SummarizeFeature />;
    case 'mcq':
      return <MCQFeature />;
    case 'mindmap':
      return <MindMapFeature />;
    case 'code-explainer':
      return <CodeExplainerFeature />;
    case 'url-fetch':
      return <URLFetchFeature />;
    case 'flashcards':
      return <FlashcardsFeature />;
    case 'study-planner':
      return <StudyPlannerFeature />;
    case 'dashboard':
      return <DashboardFeature />;
    default:
      return <ChatFeature />;
  }
}

/* ─────────── App Shell ─────────── */

function AppShell() {
  const { activeFeature } = useAppStore();
  const featureLabel = FEATURE_CARDS.find((f) => f.id === activeFeature)?.title || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <FeatureSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 glass-strong border-b border-border/50 flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <MentoraLogo size={20} />
            <span className="font-semibold text-sm hidden sm:inline">
              Mentora AI
            </span>
            <span className="text-muted-foreground text-sm hidden sm:inline">/</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">{featureLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center relative">
              <span className="text-xs font-bold text-primary">U</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-mindmap-emerald rounded-full border-2 border-background" />
            </div>
          </div>
        </header>

        {/* Feature content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              <FeatureContent feature={activeFeature} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { setActiveFeature } = useAppStore();

  const handleGetStarted = useCallback((feature?: FeaturePage) => {
    if (feature) {
      setActiveFeature(feature);
    }
    setShowApp(true);
    setShowAuth(false);
  }, [setActiveFeature]);

  if (showApp) {
    return <AppShell />;
  }

  if (showAuth) {
    return (
      <AuthModal
        onLogin={handleGetStarted}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return <LandingView onGetStarted={handleGetStarted} onOpenAuth={() => setShowAuth(true)} />;
}
