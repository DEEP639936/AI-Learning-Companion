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
import {
  CalendarDays,
  Sparkles,
  Clock,
  BookOpen,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lightbulb,
  Calendar,
  GraduationCap,
  Brain,
  Target,
  ListChecks,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { StudyPlanResult } from '@/types';

export function StudyPlannerFeature() {
  const { language } = useAppStore();
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(3);
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanResult | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);
  const [activeView, setActiveView] = useState<'weekly' | 'revision' | 'tips'>('weekly');

  const generatePlan = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!examDate) {
      toast.error('Please select an exam date');
      return;
    }

    const examDateObj = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (examDateObj <= today) {
      toast.error('Exam date must be in the future');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/study-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, examDate, dailyHours, topics, language }),
      });

      if (!res.ok) throw new Error('Failed to generate study plan');
      const data = await res.json();
      setPlan(data);
      setExpandedWeek(0);
      setActiveView('weekly');
      toast.success('Study plan generated!');
    } catch (err: any) {
      toast.error('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubject('');
    setExamDate('');
    setDailyHours(3);
    setTopics('');
    setPlan(null);
    setExpandedWeek(0);
    setActiveView('weekly');
  };

  // Calculate days until exam
  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Study Planner</h1>
              <p className="text-sm text-muted-foreground">Create a personalized study schedule with AI</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!plan ? (
            /* ─────── Setup Form ─────── */
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      Subject
                    </label>
                    <Input
                      placeholder="e.g., Organic Chemistry, Data Structures, World History..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Exam Date & Daily Hours Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="size-4 text-primary" />
                        Exam Date
                      </label>
                      <Input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-12 text-base"
                      />
                      {examDate && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'text-xs font-medium',
                            daysUntilExam <= 7 ? 'text-destructive' : daysUntilExam <= 30 ? 'text-mcq-amber' : 'text-mindmap-emerald'
                          )}
                        >
                          {daysUntilExam} days remaining
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="size-4 text-primary" />
                        Daily Study Hours: <span className="text-primary font-bold">{dailyHours}h</span>
                      </label>
                      <div className="pt-2">
                        <Slider
                          value={[dailyHours]}
                          onValueChange={(v) => setDailyHours(v[0])}
                          min={1}
                          max={12}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1h</span>
                          <span>6h</span>
                          <span>12h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Topics (optional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Target className="size-4 text-primary" />
                      Specific Topics <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Textarea
                      placeholder="List specific topics/chapters you want to cover, e.g., Chapters 1-8, Thermodynamics, Organic Reactions..."
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  {/* Summary Card */}
                  {subject && examDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-primary/5 border border-primary/10 p-4"
                    >
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <GraduationCap className="size-4 text-primary" />
                        Plan Summary
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">{daysUntilExam}</div>
                          <div className="text-xs text-muted-foreground">Days</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-primary">{dailyHours}h</div>
                          <div className="text-xs text-muted-foreground">Daily Hours</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-primary">{Math.ceil(daysUntilExam / 7)}</div>
                          <div className="text-xs text-muted-foreground">Weeks</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-primary">{daysUntilExam * dailyHours}h</div>
                          <div className="text-xs text-muted-foreground">Total Hours</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Generate Button */}
                  <Button
                    size="lg"
                    className="w-full h-12 btn-glow text-base font-semibold gap-2"
                    onClick={generatePlan}
                    disabled={loading || !subject.trim() || !examDate}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="size-5" />
                        </motion.div>
                        Generating Your Study Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        Generate Study Plan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Loading skeleton */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="border-border/50">
                        <CardContent className="p-5 space-y-3">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* ─────── Plan Results ─────── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Plan Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-to-r from-primary/10 via-summarize-violet/5 to-mindmap-emerald/5 border border-primary/15 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{plan.subject}</h2>
                    <p className="text-sm text-muted-foreground">
                      {plan.totalDays} days plan • Exam on {plan.examDate}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
                    <RotateCcw className="size-3.5" />
                    New Plan
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-background/60 border border-border/50 p-3 text-center">
                    <div className="text-xl font-bold text-primary">{plan.totalDays}</div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                  <div className="rounded-xl bg-background/60 border border-border/50 p-3 text-center">
                    <div className="text-xl font-bold text-primary">{plan.dailyHours}h</div>
                    <div className="text-xs text-muted-foreground">Daily Hours</div>
                  </div>
                  <div className="rounded-xl bg-background/60 border border-border/50 p-3 text-center">
                    <div className="text-xl font-bold text-primary">{plan.weeklyPlan.length}</div>
                    <div className="text-xs text-muted-foreground">Weeks</div>
                  </div>
                  <div className="rounded-xl bg-background/60 border border-border/50 p-3 text-center">
                    <div className="text-xl font-bold text-primary">{plan.totalDays * plan.dailyHours}h</div>
                    <div className="text-xs text-muted-foreground">Total Study</div>
                  </div>
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <div className="flex gap-2">
                {[
                  { id: 'weekly' as const, label: 'Weekly Plan', icon: Calendar },
                  { id: 'revision' as const, label: 'Revision Schedule', icon: RotateCcw },
                  { id: 'tips' as const, label: 'Study Tips', icon: Lightbulb },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeView === tab.id ? 'default' : 'outline'}
                      size="sm"
                      className={cn('gap-1.5', activeView === tab.id && 'btn-glow')}
                      onClick={() => setActiveView(tab.id)}
                    >
                      <TabIcon className="size-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Weekly Plan View */}
              <AnimatePresence mode="wait">
                {activeView === 'weekly' && (
                  <motion.div
                    key="weekly"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    {plan.weeklyPlan.map((week, wi) => (
                      <motion.div
                        key={week.weekNumber}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: wi * 0.08 }}
                      >
                        <Card className={cn(
                          'border-border/50 overflow-hidden transition-all duration-300',
                          expandedWeek === wi && 'ring-1 ring-primary/20'
                        )}>
                          {/* Week header */}
                          <button
                            onClick={() => setExpandedWeek(expandedWeek === wi ? null : wi)}
                            className="w-full p-4 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                W{week.weekNumber}
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-sm">Week {week.weekNumber}</h3>
                                <p className="text-xs text-muted-foreground">{week.theme}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{week.days.length} days</span>
                              {expandedWeek === wi ? (
                                <ChevronUp className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="size-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          {/* Week days */}
                          <AnimatePresence>
                            {expandedWeek === wi && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-2">
                                  {week.days.map((day, di) => (
                                    <motion.div
                                      key={day.day}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: di * 0.05 }}
                                      className="rounded-xl bg-muted/30 border border-border/30 p-3.5"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
                                            <CalendarDays className="size-3.5 text-primary" />
                                          </div>
                                          <div>
                                            <span className="text-sm font-semibold">{day.day}</span>
                                            <span className="text-xs text-muted-foreground ml-2">{day.date}</span>
                                          </div>
                                        </div>
                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                          {day.hoursAllocated}h
                                        </span>
                                      </div>

                                      {/* Topics */}
                                      <div className="mb-2">
                                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                          <BookOpen className="size-3" /> Topics
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {day.topics.map((topic, ti) => (
                                            <span
                                              key={ti}
                                              className="text-xs bg-primary/8 text-primary/80 px-2 py-0.5 rounded-md border border-primary/10"
                                            >
                                              {topic}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Tasks */}
                                      <div className="mb-2">
                                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                          <ListChecks className="size-3" /> Tasks
                                        </p>
                                        <ul className="space-y-1">
                                          {day.tasks.map((task, ti) => (
                                            <li key={ti} className="text-xs text-foreground/80 flex items-start gap-1.5">
                                              <ArrowRight className="size-3 text-primary/50 mt-0.5 shrink-0" />
                                              {task}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Revision Items */}
                                      {day.revisionItems && day.revisionItems.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                            <Brain className="size-3" /> Revision
                                          </p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {day.revisionItems.map((item, ri) => (
                                              <span
                                                key={ri}
                                                className="text-xs bg-summarize-violet/8 text-summarize-violet/80 px-2 py-0.5 rounded-md border border-summarize-violet/10"
                                              >
                                                {item}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Revision Schedule View */}
                {activeView === 'revision' && (
                  <motion.div
                    key="revision"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    {plan.revisionSchedule && plan.revisionSchedule.length > 0 ? (
                      <>
                        <div className="rounded-xl bg-summarize-violet/5 border border-summarize-violet/15 p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="size-5 text-summarize-violet" />
                            <h3 className="font-semibold">Spaced Repetition Schedule</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Based on the science of spaced repetition — review material at increasing intervals to lock it into long-term memory.
                          </p>
                        </div>
                        {plan.revisionSchedule.map((rev, ri) => (
                          <motion.div
                            key={ri}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ri * 0.06 }}
                            className="rounded-xl bg-card border border-border/50 p-4 flex items-start gap-3"
                          >
                            <div className={cn(
                              'size-9 rounded-lg flex items-center justify-center shrink-0',
                              rev.type === 'quick review' ? 'bg-mindmap-emerald/10' :
                              rev.type === 'deep revision' ? 'bg-summarize-violet/10' :
                              'bg-mcq-amber/10'
                            )}>
                              <RotateCcw className={cn(
                                'size-4',
                                rev.type === 'quick review' ? 'text-mindmap-emerald' :
                                rev.type === 'deep revision' ? 'text-summarize-violet' :
                                'text-mcq-amber'
                              )} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold">{rev.day}</span>
                                <span className={cn(
                                  'text-xs px-2 py-0.5 rounded-full border',
                                  rev.type === 'quick review' ? 'bg-mindmap-emerald/10 text-mindmap-emerald border-mindmap-emerald/20' :
                                  rev.type === 'deep revision' ? 'bg-summarize-violet/10 text-summarize-violet border-summarize-violet/20' :
                                  'bg-mcq-amber/10 text-mcq-amber border-mcq-amber/20'
                                )}>
                                  {rev.type}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {rev.topics.map((topic, ti) => (
                                  <span
                                    key={ti}
                                    className="text-xs bg-muted/50 px-2 py-0.5 rounded-md"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </>
                    ) : (
                      <Card className="border-border/50">
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <RotateCcw className="size-8 mx-auto mb-3 opacity-30" />
                          <p>No revision schedule available</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* Tips View */}
                {activeView === 'tips' && (
                  <motion.div
                    key="tips"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    {plan.tips && plan.tips.length > 0 ? (
                      <>
                        <div className="rounded-xl bg-mcq-amber/5 border border-mcq-amber/15 p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="size-5 text-mcq-amber" />
                            <h3 className="font-semibold">Pro Study Tips</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Evidence-based strategies to maximize your learning efficiency for {plan.subject}.
                          </p>
                        </div>
                        {plan.tips.map((tip, ti) => (
                          <motion.div
                            key={ti}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ti * 0.06 }}
                            className="rounded-xl bg-card border border-border/50 p-4 flex items-start gap-3"
                          >
                            <div className="size-7 rounded-md bg-mcq-amber/10 flex items-center justify-center shrink-0 text-xs font-bold text-mcq-amber">
                              {ti + 1}
                            </div>
                            <p className="text-sm text-foreground/85 leading-relaxed">{tip}</p>
                          </motion.div>
                        ))}
                      </>
                    ) : (
                      <Card className="border-border/50">
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Lightbulb className="size-8 mx-auto mb-3 opacity-30" />
                          <p>No tips available</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
