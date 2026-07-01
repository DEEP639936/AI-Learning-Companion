'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  FileText,
  Upload,
  Link,
  Copy,
  Save,
  Sparkles,
  CheckCircle,
  ArrowDownUp,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { SummaryResult, SummarizeDepth } from '@/types';
import { countWords } from '@/lib/utils';

export function SummarizeFeature() {
  const { language } = useAppStore();
  const [tab, setTab] = useState('paste');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState<SummarizeDepth>('detailed');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const handleSummarize = async () => {
    if (tab === 'paste' && !text.trim()) {
      toast.error('Please enter text to summarize');
      return;
    }
    if (tab === 'url' && !url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tab === 'paste' ? text : '',
          url: tab === 'url' ? url : '',
          depth,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to summarize');
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.summary);
      toast.success('Summary copied!');
    }
  };

  const handleSave = () => {
    toast.success('Summary saved!');
  };

  const wordCount = countWords(text);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="size-6 text-summarize-violet" />
          Summarize
        </h1>
        <p className="text-muted-foreground">Get concise summaries with key takeaways from any content.</p>
      </div>

      {/* Input area */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="paste" className="gap-1.5">
                <FileText className="size-3.5" /> Paste Text
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5">
                <Upload className="size-3.5" /> Upload File
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-1.5">
                <Link className="size-3.5" /> From URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground text-right">{wordCount} words</p>
            </TabsContent>

            <TabsContent value="upload">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="size-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Drag & drop a file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                <Input type="file" className="hidden" />
                <p className="text-xs text-muted-foreground mt-3">Supports .txt, .pdf, .md files</p>
              </div>
            </TabsContent>

            <TabsContent value="url">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                type="url"
              />
            </TabsContent>
          </Tabs>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-medium">Depth:</div>
            {(['brief', 'detailed', 'bullet-points'] as SummarizeDepth[]).map((d) => (
              <Button
                key={d}
                variant={depth === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDepth(d)}
                className="capitalize"
              >
                {d.replace('-', ' ')}
              </Button>
            ))}

            <div className="ml-auto">
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
          </div>

          <Button onClick={handleSummarize} disabled={loading} className="w-full gap-2">
            <Sparkles className="size-4" />
            {loading ? 'Summarizing...' : 'Summarize'}
          </Button>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="size-5 text-summarize-violet" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>

              {/* Key Takeaways */}
              {result.keyTakeaways && result.keyTakeaways.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <CheckCircle className="size-4 text-primary" /> Key Takeaways
                  </h4>
                  <ul className="space-y-1.5">
                    {result.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary font-bold shrink-0">•</span>
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Word reduction */}
              {result.originalWordCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowDownUp className="size-4 text-summarize-violet" />
                  <span>
                    Reduced from <strong>{result.originalWordCount}</strong> to{' '}
                    <strong>{result.summaryWordCount}</strong> words (
                    {Math.round((1 - result.summaryWordCount / result.originalWordCount) * 100)}%
                    reduction)
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  <Copy className="size-3.5" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
                  <Save className="size-3.5" /> Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
