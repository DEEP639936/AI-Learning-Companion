'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MentoraLogo } from '@/components/shared/mentora-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Eye, EyeOff, Mail, Lock, User, Sparkles, Loader2, ArrowRight, CheckCircle2, Shield, Zap, BookOpen } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
  onBack: () => void;
}

type AuthTab = 'signin' | 'signup';

/* ─── Animated Background Blobs ─── */
function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep purple gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.1_0.05_265)] via-[oklch(0.13_0.06_240)] to-[oklch(0.1_0.04_200)]" />

      {/* Aurora blobs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] aurora-blob opacity-20 blur-[80px]"
      />
      <motion.div
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 20, -25, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-[15%] -right-[10%] w-[55%] h-[55%] aurora-blob opacity-15 blur-[80px]"
      />
      <motion.div
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -15, 25, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-gradient-to-br from-[oklch(0.44_0.26_265)] to-[oklch(0.6_0.22_330)] opacity-10 blur-[100px] rounded-full"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Feature List on Right Side ─── */
function AuthFeatureList() {
  const features = [
    { icon: Brain, text: '7 AI-Powered Study Tools' },
    { icon: Zap, text: 'Instant Explanations & Quizzes' },
    { icon: BookOpen, text: 'Smart Flashcards & Mind Maps' },
    { icon: Shield, text: 'Free to Start, No Credit Card' },
  ];

  return (
    <div className="space-y-5">
      {features.map((feat, i) => {
        const Icon = feat.icon;
        return (
          <motion.div
            key={feat.text}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Icon className="size-5 text-primary" />
            </div>
            <span className="text-white/80 text-sm font-medium">{feat.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Main Auth Page ─── */
export function AuthModal({ onLogin, onBack }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    onLogin();
  };

  const handleSignUp = async () => {
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword) return;
    if (signUpPassword !== signUpConfirmPassword) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    onLogin();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    onLogin();
  };

  const resetForm = () => {
    setSignInEmail('');
    setSignInPassword('');
    setSignUpName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    setIsSuccess(false);
  };

  const switchTab = (tab: AuthTab) => {
    resetForm();
    setActiveTab(tab);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      <AuthBackground />

      {/* Left side - Branding (hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between relative z-10 w-[45%] p-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MentoraLogo size={48} showText />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-4xl font-bold text-white leading-tight mb-4"
            >
              Study Smarter
              <br />
              <span className="gradient-text">Not Harder.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-white/50 text-base leading-relaxed max-w-sm"
            >
              Your AI-powered study companion that helps you learn 3x faster with personalized tools.
            </motion.p>
          </div>
          <AuthFeatureList />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-white/30 text-xs"
        >
          &copy; 2025 Mentora AI. All rights reserved.
        </motion.p>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[440px]"
        >
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mb-8 text-sm cursor-pointer"
          >
            <ArrowRight className="size-4 rotate-180" />
            Back to home
          </motion.button>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <MentoraLogo size={40} showText />
          </div>

          {/* Auth Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 auth-card-glow relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[oklch(0.44_0.26_265)] via-[oklch(0.5_0.24_300)] to-[oklch(0.55_0.19_200)]" />

            {/* Success overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[oklch(0.44_0.26_265)]/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="size-16 text-primary" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <div className="lg:hidden mb-4 flex justify-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MentoraLogo size={44} />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-white/40 text-sm">
                {activeTab === 'signin'
                  ? 'Sign in to continue your learning journey'
                  : 'Start learning smarter with AI today'}
              </p>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex mb-6 bg-white/[0.04] rounded-xl p-1 relative"
            >
              {(['signin', 'signup'] as AuthTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className="relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg border border-white/[0.08]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${activeTab === tab ? 'text-white' : 'text-white/40'}`}>
                    {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Form */}
            <AnimatePresence mode="wait">
              {activeTab === 'signin' ? (
                <motion.div
                  key="signin-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl transition-all duration-200 focus:bg-white/[0.06] focus:border-primary/40 input-glow"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl transition-all duration-200 focus:bg-white/[0.06] focus:border-primary/40 input-glow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Forgot password */}
                  <div className="flex justify-end">
                    <button className="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer">
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-[oklch(0.44_0.26_265)] to-[oklch(0.5_0.24_300)] hover:from-[oklch(0.38_0.26_265)] hover:to-[oklch(0.44_0.24_300)] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 border-0"
                    onClick={handleSignIn}
                    disabled={isLoading || !signInEmail || !signInPassword}
                  >
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-transparent px-3 text-xs text-white/25">
                        or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Button */}
                  <Button
                    variant="outline"
                    className="w-full h-12 gap-2.5 text-sm font-medium bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.12] rounded-xl transition-all duration-200"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5"
                >
                  {/* Full Name */}
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl transition-all duration-200 focus:bg-white/[0.06] focus:border-primary/40 input-glow"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl transition-all duration-200 focus:bg-white/[0.06] focus:border-primary/40 input-glow"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl transition-all duration-200 focus:bg-white/[0.06] focus:border-primary/40 input-glow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl transition-all duration-200 focus:bg-white/[0.06] focus:border-primary/40 input-glow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Password mismatch indicator */}
                  {signUpConfirmPassword && signUpPassword !== signUpConfirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 ml-1"
                    >
                      Passwords do not match
                    </motion.p>
                  )}

                  {/* Terms */}
                  <p className="text-[11px] text-white/25 leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <span className="text-primary/60 cursor-pointer hover:text-primary/80">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-primary/60 cursor-pointer hover:text-primary/80">Privacy Policy</span>.
                  </p>

                  {/* Create Account Button */}
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-[oklch(0.44_0.26_265)] to-[oklch(0.5_0.24_300)] hover:from-[oklch(0.38_0.26_265)] hover:to-[oklch(0.44_0.24_300)] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 border-0"
                    onClick={handleSignUp}
                    disabled={isLoading || !signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword || (signUpPassword !== signUpConfirmPassword)}
                  >
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-transparent px-3 text-xs text-white/25">
                        or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Button */}
                  <Button
                    variant="outline"
                    className="w-full h-12 gap-2.5 text-sm font-medium bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.12] rounded-xl transition-all duration-200"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom switch hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-5"
            >
              <p className="text-xs text-white/30">
                {activeTab === 'signin' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => switchTab('signup')}
                      className="text-primary/70 hover:text-primary font-medium transition-colors cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => switchTab('signin')}
                      className="text-primary/70 hover:text-primary font-medium transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
