'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Code2,
  Sparkles,
  Lightbulb,
  BookOpen,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { CodeExplanation } from '@/types';

const LANGUAGES = [
  'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'C#',
  'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'HTML/CSS',
];

export function CodeExplainerFeature() {
  const { language } = useAppStore();
  const [mode, setMode] = useState<'generate' | 'explain'>('explain');
  const [inputText, setInputText] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [progLang, setProgLang] = useState('JavaScript');
  const [viewMode, setViewMode] = useState<'technical' | 'analogy'>('technical');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeExplanation | null>(null);

  const handleSubmit = async () => {
    if (mode === 'generate' && !inputText.trim()) {
      toast.error('Please describe what code to generate');
      return;
    }
    if (mode === 'explain' && !codeInput.trim()) {
      toast.error('Please paste code to explain');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/code-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          input: mode === 'generate' ? inputText : codeInput,
          programmingLanguage: progLang,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error('Failed to process code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b border-border space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="size-6 text-code-teal" />
            Code Explainer
          </h1>
          <p className="text-muted-foreground">Generate or explain code with line-by-line breakdowns and analogies.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'generate' | 'explain')}>
            <TabsList>
              <TabsTrigger value="generate">Generate Code</TabsTrigger>
              <TabsTrigger value="explain">Explain Code</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={progLang} onValueChange={setProgLang}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={useAppStore.getState().setLanguage}>
            <SelectTrigger className="w-[130px] h-9">
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

        {/* Input */}
        <div className="space-y-2">
          {mode === 'generate' ? (
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe what code you want to generate..."
            />
          ) : (
            <Textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste your code here..."
              className="min-h-[120px] font-mono text-sm"
            />
          )}
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            <Sparkles className="size-4" />
            {loading ? 'Processing...' : mode === 'generate' ? 'Generate' : 'Explain'}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Overall Summary */}
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-1.5">
                    <BookOpen className="size-4 text-code-teal" /> Overall Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">{result.overallSummary}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-1.5">
                    <Lightbulb className="size-4 text-mcq-amber" /> Real-World Analogy
                  </h3>
                  <p className="text-sm text-muted-foreground">{result.realWorldAnalogy}</p>
                </div>
              </CardContent>
            </Card>

            {/* Code + Explanation split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Code panel */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Code</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="bg-muted/50 p-4 overflow-auto max-h-[500px] text-sm">
                    <code>{result.code}</code>
                  </pre>
                </CardContent>
              </Card>

              {/* Explanation panel */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Explanation</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={viewMode === 'technical' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('technical')}
                        className="text-xs h-7"
                      >
                        Technical
                      </Button>
                      <Button
                        variant={viewMode === 'analogy' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('analogy')}
                        className="text-xs h-7"
                      >
                        Analogy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                  {result.lineByLine.map((block, i) => (
                    <div key={i} className="border-l-2 border-code-teal/50 pl-3">
                      <p className="text-xs font-mono text-muted-foreground mb-1">Lines {block.lineRange}</p>
                      {viewMode === 'technical' ? (
                        <p className="text-sm">{block.explanation}</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm">{block.explanation}</p>
                          <p className="text-sm text-mcq-amber italic flex items-start gap-1">
                            <Lightbulb className="size-3.5 shrink-0 mt-0.5" />
                            {block.analogy}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Code2 className="size-12 text-code-teal/50" />
            <p className="text-center">Paste code to explain or describe code to generate</p>
          </div>
        )}
      </div>
    </div>
  );
}
