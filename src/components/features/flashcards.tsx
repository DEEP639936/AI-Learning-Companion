'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Layers,
  Sparkles,
  Plus,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ThumbsDown,
  ThumbsUp,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateId, calculateSM2 } from '@/lib/utils';
import type { FlashcardData } from '@/types';

interface FlashcardDeck {
  id: string;
  title: string;
  topic: string;
  cards: FlashcardItem[];
  createdAt: number;
}

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: number;
  lastRating?: number;
}

const RATING_BUTTONS = [
  { rating: 1, label: 'Again', color: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', icon: RotateCcw },
  { rating: 2, label: 'Hard', color: 'bg-mcq-amber text-white hover:bg-mcq-amber/90', icon: Minus },
  { rating: 3, label: 'Good', color: 'bg-primary text-primary-foreground hover:bg-primary/90', icon: ThumbsUp },
  { rating: 4, label: 'Easy', color: 'bg-mindmap-emerald text-white hover:bg-mindmap-emerald/90', icon: ThumbsUp },
];

export function FlashcardsFeature() {
  const { language } = useAppStore();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [view, setView] = useState<'deck' | 'create' | 'study'>('deck');
  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dueToday, setDueToday] = useState(0);

  // Create form
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleCreateDeck = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sourceText, count: cardCount, language }),
      });

      if (!res.ok) throw new Error('Failed');
      const data: FlashcardData = await res.json();

      const newDeck: FlashcardDeck = {
        id: generateId(),
        title: topic,
        topic,
        cards: data.cards.map((card) => ({
          id: generateId(),
          front: card.front,
          back: card.back,
          easeFactor: 2.5,
          intervalDays: 0,
          repetitions: 0,
          nextReview: Date.now(),
        })),
        createdAt: Date.now(),
      };

      setDecks((prev) => [newDeck, ...prev]);
      setView('deck');
      setTopic('');
      setSourceText('');
      toast.success(`Deck "${topic}" created with ${data.cards.length} cards!`);
    } catch {
      toast.error('Failed to create deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startStudy = (deck: FlashcardDeck) => {
    const now = Date.now();
    const dueCards = deck.cards.filter((c) => c.nextReview <= now);
    setCurrentDeck({ ...deck, cards: dueCards.length > 0 ? dueCards : deck.cards });
    setDueToday(dueCards.length);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setView('study');
  };

  const handleRate = (rating: number) => {
    if (!currentDeck) return;

    const card = currentDeck.cards[currentCardIndex];
    const { newEaseFactor, newInterval, newRepetitions } = calculateSM2(
      rating,
      card.easeFactor,
      card.intervalDays,
      card.repetitions
    );

    const updatedCard: FlashcardItem = {
      ...card,
      easeFactor: newEaseFactor,
      intervalDays: newInterval,
      repetitions: newRepetitions,
      nextReview: Date.now() + newInterval * 24 * 60 * 60 * 1000,
      lastRating: rating,
    };

    const updatedCards = currentDeck.cards.map((c) =>
      c.id === card.id ? updatedCard : c
    );

    const updatedDeck = { ...currentDeck, cards: updatedCards };
    setCurrentDeck(updatedDeck);

    // Also update in decks list
    setDecks((prev) => prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)));

    // Move to next card
    if (currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      toast.success('You have reviewed all cards in this deck!');
      setView('deck');
    }
  };

  // Deck View
  if (view === 'deck') {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="size-6 text-flashcard-rose" />
              Flashcards
            </h1>
            <p className="text-muted-foreground">Create decks and study with spaced repetition.</p>
          </div>
          <Button onClick={() => setView('create')} className="gap-1.5">
            <Plus className="size-4" /> Create New Deck
          </Button>
        </div>

        {decks.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <Layers className="size-12 text-flashcard-rose/50 mx-auto" />
              <h3 className="text-lg font-semibold">No decks yet</h3>
              <p className="text-muted-foreground text-sm">
                Create your first flashcard deck to start studying.
              </p>
              <Button onClick={() => setView('create')} className="gap-1.5">
                <Plus className="size-4" /> Create New Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => {
              const due = deck.cards.filter((c) => c.nextReview <= Date.now()).length;
              return (
                <motion.div
                  key={deck.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => startStudy(deck)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold">{deck.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{deck.cards.length} cards</span>
                        {due > 0 && (
                          <span className="text-flashcard-rose font-medium">{due} due</span>
                        )}
                      </div>
                      <Progress
                        value={
                          (deck.cards.filter((c) => c.lastRating && c.lastRating >= 3).length /
                            deck.cards.length) *
                          100
                        }
                        className="h-1.5"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Create View
  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('deck')} className="gap-1">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <h1 className="text-xl font-bold">Create New Deck</h1>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic *</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Biology Chapter 5, JavaScript Basics"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source Text (optional)</label>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste study material to generate flashcards from..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Cards: {cardCount}</label>
              <Slider
                value={[cardCount]}
                onValueChange={([v]) => setCardCount(v)}
                min={3}
                max={20}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={useAppStore.getState().setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCreateDeck} disabled={loading} className="w-full gap-2">
              <Sparkles className="size-4" />
              {loading ? 'Generating...' : 'Generate Deck'}
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Study View
  if (!currentDeck || currentDeck.cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <p>No cards to study. Go back and select a deck.</p>
        <Button onClick={() => setView('deck')} className="mt-4">Back to Decks</Button>
      </div>
    );
  }

  const card = currentDeck.cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / currentDeck.cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setView('deck')} className="gap-1">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <span className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {currentDeck.cards.length}
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Flashcard with 3D flip */}
      <div className="flex justify-center" style={{ perspective: '1000px' }}>
        <div
          className="w-full max-w-md cursor-pointer"
          style={{ minHeight: '280px' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full"
          >
            {/* Front */}
            <Card
              className="absolute inset-0 w-full"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 min-h-[280px]">
                <p className="text-xs text-muted-foreground mb-2">Question</p>
                <p className="text-lg font-medium text-center">{card.front}</p>
                <p className="text-xs text-muted-foreground mt-4">Click to flip</p>
              </CardContent>
            </Card>

            {/* Back */}
            <Card
              className="absolute inset-0 w-full bg-primary/5 border-primary/20"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 min-h-[280px]">
                <p className="text-xs text-muted-foreground mb-2">Answer</p>
                <p className="text-lg font-medium text-center">{card.back}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Rating buttons (shown after flip) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-4 gap-2"
          >
            {RATING_BUTTONS.map((btn) => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btn.rating}
                  className={`${btn.color} gap-1 flex-col h-auto py-3`}
                  onClick={() => handleRate(btn.rating)}
                >
                  <Icon className="size-4" />
                  <span className="text-xs">{btn.label}</span>
                </Button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
