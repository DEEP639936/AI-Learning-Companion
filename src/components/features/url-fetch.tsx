'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Link,
  Sparkles,
  FileText,
  Youtube,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

type URLType = 'article' | 'youtube' | 'pdf' | 'unknown';

function detectURLType(url: string): URLType {
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/\.pdf$/i.test(url)) return 'pdf';
  if (/^https?:\/\//i.test(url)) return 'article';
  return 'unknown';
}

const URL_TYPE_CONFIG: Record<URLType, { label: string; icon: React.ElementType; color: string }> = {
  article: { label: 'Article', icon: FileText, color: 'bg-primary/10 text-primary' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'bg-destructive/10 text-destructive' },
  pdf: { label: 'PDF', icon: FileDown, color: 'bg-summarize-violet/10 text-summarize-violet' },
  unknown: { label: 'Unknown', icon: Link, color: 'bg-muted text-muted-foreground' },
};

export function URLFetchFeature() {
  const { language } = useAppStore();
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const urlType = detectURLType(url);
  const typeConfig = URL_TYPE_CONFIG[urlType];
  const TypeIcon = typeConfig.icon;

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (urlType === 'unknown') {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, query: query || 'Summarize this content', language }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data.response);
    } catch {
      toast.error('Failed to fetch or analyze the URL. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link className="size-6 text-url-cyan" />
          URL Fetch
        </h1>
        <p className="text-muted-foreground">Fetch and analyze content from any URL.</p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* URL Input with type badge */}
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <div className="flex gap-2 items-center">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                type="url"
                className="flex-1"
              />
              {urlType !== 'unknown' && url && (
                <Badge variant="secondary" className={`gap-1 ${typeConfig.color}`}>
                  <TypeIcon className="size-3" />
                  {typeConfig.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Query input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What do you want me to do?</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Summarize this, Create a quiz, Extract key points"
            />
          </div>

          {/* Language */}
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

          <Button onClick={handleFetch} disabled={loading} className="w-full gap-2">
            <Sparkles className="size-4" />
            {loading ? 'Fetching & Analyzing...' : 'Fetch & Analyze'}
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
