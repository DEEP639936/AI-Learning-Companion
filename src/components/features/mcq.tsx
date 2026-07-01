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
  HelpCircle,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Confetti } from '@/components/shared/confetti';
import type { MCQQuestion, Difficulty } from '@/types';

interface QuizState {
  phase: 'setup' | 'quiz' | 'results';
  questions: MCQQuestion[];
  currentQuestion: number;
  answers: (number | null)[];
  showExplanation: boolean;
  score: number;
}

export function MCQFeature() {
  const { language } = useAppStore();
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizState>({
    phase: 'setup',
    questions: [],
    currentQuestion: 0,
    answers: [],
    showExplanation: false,
    score: 0,
  });

  const [expandedExplanation, setExpandedExplanation] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sourceText, difficulty, questionCount, language }),
      });

      if (!res.ok) throw new Error('Failed to generate quiz');
      const data = await res.json();

      setQuiz({
        phase: 'quiz',
        questions: data.questions,
        currentQuestion: 0,
        answers: new Array(data.questions.length).fill(null),
        showExplanation: false,
        score: 0,
      });
    } catch {
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (quiz.showExplanation) return;

    const newAnswers = [...quiz.answers];
    newAnswers[quiz.currentQuestion] = optionIndex;

    const isCorrect = optionIndex === quiz.questions[quiz.currentQuestion].correctIndex;
    const newScore = isCorrect ? quiz.score + 1 : quiz.score;

    setQuiz({
      ...quiz,
      answers: newAnswers,
      showExplanation: true,
      score: newScore,
    });
    setExpandedExplanation(false);
  };

  const nextQuestion = () => {
    if (quiz.currentQuestion < quiz.questions.length - 1) {
      setQuiz({
        ...quiz,
        currentQuestion: quiz.currentQuestion + 1,
        showExplanation: false,
      });
      setExpandedExplanation(false);
    } else {
      setQuiz({ ...quiz, phase: 'results' });
    }
  };

  const resetQuiz = () => {
    setQuiz({
      phase: 'setup',
      questions: [],
      currentQuestion: 0,
      answers: [],
      showExplanation: false,
      score: 0,
    });
    setExpandedExplanation(false);
  };

  const percentage = quiz.questions.length > 0
    ? Math.round((quiz.score / quiz.questions.length) * 100)
    : 0;

  const showConfetti = quiz.phase === 'results' && percentage > 80;

  // Setup phase
  if (quiz.phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="size-6 text-mcq-amber" />
            MCQ Quiz
          </h1>
          <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes.</p>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic *</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., World War II, Photosynthesis, Python Basics"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source Text (optional)</label>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste study material to generate questions from..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <Button
                    key={d}
                    variant={difficulty === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty(d)}
                    className="capitalize flex-1"
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Questions: {questionCount}
              </label>
              <Slider
                value={[questionCount]}
                onValueChange={([v]) => setQuestionCount(v)}
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

            <Button onClick={generateQuiz} disabled={loading} className="w-full gap-2">
              <Sparkles className="size-4" />
              {loading ? 'Generating...' : 'Generate Quiz'}
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Results phase
  if (quiz.phase === 'results') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <Confetti show={showConfetti} />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardContent className="p-6 sm:p-8 text-center space-y-6">
              <Trophy className={`size-16 mx-auto ${percentage > 80 ? 'text-mcq-amber' : percentage > 50 ? 'text-primary' : 'text-muted-foreground'}`} />
              <h2 className="text-2xl font-bold">Quiz Complete!</h2>

              {/* Score circle */}
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="currentColor" strokeWidth="8"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    strokeLinecap="round"
                    className={percentage > 80 ? 'text-mcq-amber' : percentage > 50 ? 'text-primary' : 'text-destructive'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{percentage}%</span>
                </div>
              </div>

              <p className="text-muted-foreground">
                You scored <strong>{quiz.score}</strong> out of <strong>{quiz.questions.length}</strong>
              </p>

              {/* Question breakdown */}
              <div className="text-left space-y-3 max-h-64 overflow-y-auto">
                {quiz.questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {quiz.answers[i] === q.correctIndex ? (
                      <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <span className="text-muted-foreground">{q.question}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={resetQuiz} className="gap-1.5">
                  <RotateCcw className="size-4" /> Retake
                </Button>
                <Button onClick={() => { setTopic(''); resetQuiz(); }} className="gap-1.5">
                  <Plus className="size-4" /> New Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Quiz phase
  const currentQ = quiz.questions[quiz.currentQuestion];
  const progress = ((quiz.currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Question {quiz.currentQuestion + 1} of {quiz.questions.length}
          </h2>
          <span className="text-sm text-mcq-amber font-medium">{quiz.score} correct</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={quiz.currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-semibold">{currentQ.question}</h3>

              <div className="space-y-2">
                {currentQ.options.map((option, i) => {
                  const isSelected = quiz.answers[quiz.currentQuestion] === i;
                  const isCorrect = i === currentQ.correctIndex;
                  const showResult = quiz.showExplanation;

                  return (
                    <Button
                      key={i}
                      variant="outline"
                      className={`w-full justify-start text-left h-auto py-3 px-4 transition-all ${
                        showResult && isCorrect
                          ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                          : showResult && isSelected && !isCorrect
                          ? 'bg-destructive/10 border-destructive text-destructive'
                          : isSelected
                          ? 'bg-primary/10 border-primary'
                          : ''
                      }`}
                      onClick={() => handleAnswer(i)}
                      disabled={quiz.showExplanation}
                    >
                      <span className="mr-3 font-medium shrink-0">{String.fromCharCode(65 + i)}.</span>
                      <span>{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="size-4 ml-auto text-green-500 shrink-0" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="size-4 ml-auto text-destructive shrink-0" />}
                    </Button>
                  );
                })}
              </div>

              {/* Explanation */}
              {quiz.showExplanation && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-primary mb-2"
                    onClick={() => setExpandedExplanation(!expandedExplanation)}
                  >
                    {expandedExplanation ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    {expandedExplanation ? 'Hide' : 'Show'} Explanation
                  </button>
                  <AnimatePresence>
                    {expandedExplanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground"
                      >
                        {currentQ.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button onClick={nextQuestion} className="w-full mt-4 gap-1.5">
                    {quiz.currentQuestion < quiz.questions.length - 1 ? (
                      <>Next Question <ChevronRight className="size-4" /></>
                    ) : (
                      <>See Results <Trophy className="size-4" /></>
                    )}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
