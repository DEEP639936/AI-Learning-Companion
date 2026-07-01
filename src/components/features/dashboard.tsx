'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LayoutDashboard,
  HelpCircle,
  Layers,
  Flame,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data
const quizScoreData = [
  { date: 'Mon', score: 65 },
  { date: 'Tue', score: 72 },
  { date: 'Wed', score: 68 },
  { date: 'Thu', score: 80 },
  { date: 'Fri', score: 75 },
  { date: 'Sat', score: 88 },
  { date: 'Sun', score: 92 },
];

const topicsData = [
  { topic: 'Biology', count: 12 },
  { topic: 'Physics', count: 8 },
  { topic: 'History', count: 15 },
  { topic: 'Math', count: 10 },
  { topic: 'Chemistry', count: 6 },
  { topic: 'English', count: 9 },
];

const weakTopics = ['Organic Chemistry', 'Calculus II', 'World War II Dates', 'Quantum Mechanics'];

// Activity heatmap data (last 12 weeks)
const heatmapData: { week: number; day: number; count: number }[] = [];
for (let w = 0; w < 12; w++) {
  for (let d = 0; d < 7; d++) {
    heatmapData.push({
      week: w,
      day: d,
      count: Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0,
    });
  }
}

const HEATMAP_COLORS = [
  'bg-muted',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/60',
  'bg-primary/80',
  'bg-primary',
];

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v: number) => Math.round(v));

  React.useEffect(() => {
    const controls = animate(count, target, { duration: duration / 1000 });
    return () => controls.stop();
  }, [count, target, duration]);

  return <motion.span>{rounded}</motion.span>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex items-center gap-4">
        <div className={`size-12 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardFeature() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="size-6 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground">Your study progress at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HelpCircle} label="Total Quizzes" value={24} accent="bg-mcq-amber/20 text-mcq-amber" />
        <StatCard icon={TrendingUp} label="Average Score" value={78} accent="bg-primary/20 text-primary" />
        <StatCard icon={Layers} label="Cards Mastered" value={156} accent="bg-flashcard-rose/20 text-flashcard-rose" />
        <StatCard icon={Flame} label="Current Streak" value={7} accent="bg-mindmap-emerald/20 text-mindmap-emerald" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quiz scores over time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quiz Scores Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizScoreData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'var(--primary)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Topics studied */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Topics Studied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="topic" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity heatmap + Weak topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {Array.from({ length: 12 }, (_, w) => (
                <div key={w} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, d) => {
                    const cell = heatmapData.find((h) => h.week === w && h.day === d);
                    const level = cell ? Math.min(cell.count, 5) : 0;
                    return (
                      <div
                        key={d}
                        className={`size-3 rounded-sm ${HEATMAP_COLORS[level]}`}
                        title={`${cell?.count || 0} activities`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>Less</span>
              {HEATMAP_COLORS.map((color, i) => (
                <div key={i} className={`size-3 rounded-sm ${color}`} />
              ))}
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Weak topics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <BookOpen className="size-4 text-mcq-amber" /> Weak Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weakTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                >
                  <span>{topic}</span>
                  <span className="text-xs text-destructive font-medium">Needs review</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
