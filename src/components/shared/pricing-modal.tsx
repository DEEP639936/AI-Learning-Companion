'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Check,
  X,
  ArrowRight,
  Crown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started.',
    badge: null,
    features: [
      { name: '50 AI messages/day', included: true },
      { name: 'Basic summarization', included: true },
      { name: '5 MCQ quizzes/day', included: true },
      { name: '3 flashcard decks', included: true },
      { name: '1 mind map/day', included: true },
      { name: 'Standard response speed', included: true },
      { name: 'Advanced summarization', included: false },
      { name: 'Code explainer with analogies', included: false },
      { name: 'Export to PDF', included: false },
    ],
    cta: 'Get Started',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: 9.99,
    yearlyPrice: 7.99,
    description: 'For serious students.',
    badge: 'Most Popular',
    features: [
      { name: 'Unlimited AI messages', included: true },
      { name: 'Advanced summarization', included: true },
      { name: 'Unlimited MCQ quizzes', included: true },
      { name: 'Unlimited flashcard decks', included: true },
      { name: 'Unlimited mind maps', included: true },
      { name: 'Priority response speed', included: true },
      { name: 'Code explainer with analogies', included: true },
      { name: 'Export to PDF', included: true },
      { name: 'Progress analytics', included: true },
    ],
    cta: 'Start Pro Trial',
    ctaVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'Premium',
    price: 19.99,
    yearlyPrice: 15.99,
    description: 'The ultimate study companion.',
    badge: null,
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Voice-to-text input', included: true },
      { name: 'Collaborative study rooms', included: true },
      { name: 'Custom AI tutor personality', included: true },
      { name: 'API access', included: true },
      { name: 'Priority support', included: true },
      { name: 'Early access to new features', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom study plans', included: true },
    ],
    cta: 'Go Premium',
    ctaVariant: 'outline' as const,
    popular: false,
  },
];

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-center">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Start free. Upgrade when you&apos;re ready to supercharge your studying.
            </DialogDescription>

            {/* Yearly toggle */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className={cn('text-sm font-medium', !yearly && 'text-foreground', yearly && 'text-muted-foreground')}>
                Monthly
              </span>
              <Switch checked={yearly} onCheckedChange={setYearly} />
              <span className={cn('text-sm font-medium', yearly && 'text-foreground', !yearly && 'text-muted-foreground')}>
                Yearly
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Save 20%
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={cn(
                  'relative rounded-2xl p-5 transition-all duration-300',
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

                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    ${yearly ? tier.yearlyPrice : tier.price}
                  </span>
                  <span className="text-muted-foreground text-xs">/month</span>
                  {yearly && tier.price > 0 && (
                    <p className="text-[10px] text-primary mt-0.5">
                      Billed ${((yearly ? tier.yearlyPrice : tier.price) * 12).toFixed(0)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-5">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2 text-xs">
                      {feature.included ? (
                        <Check className="size-3.5 text-primary shrink-0" />
                      ) : (
                        <X className="size-3.5 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={cn(!feature.included && 'text-muted-foreground/50')}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.ctaVariant}
                  className={cn('w-full h-10', tier.popular && 'btn-glow')}
                  onClick={() => onOpenChange(false)}
                >
                  {tier.cta}
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
