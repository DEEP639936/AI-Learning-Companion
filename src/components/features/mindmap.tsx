'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GitBranch,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MindMapNode, MindMapChild } from '@/types';

const DEPTH_COLORS = [
  'bg-primary text-primary-foreground',
  'bg-mindmap-emerald/20 text-mindmap-emerald border border-mindmap-emerald/30',
  'bg-mcq-amber/20 text-mcq-amber border border-mcq-amber/30',
  'bg-summarize-violet/20 text-summarize-violet border border-summarize-violet/30',
  'bg-flashcard-rose/20 text-flashcard-rose border border-flashcard-rose/30',
];

function MindMapNodeComponent({
  node,
  depth = 0,
  onToggle,
  collapsed,
}: {
  node: MindMapChild;
  depth: number;
  onToggle: (label: string) => void;
  collapsed: Set<string>;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = collapsed.has(node.label);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        {hasChildren && (
          <button
            onClick={() => onToggle(node.label)}
            className="shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-5 shrink-0" />}
        <div
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]}`}
        >
          {node.label}
        </div>
      </div>
      {hasChildren && !isCollapsed && (
        <div className="ml-5 border-l-2 border-border pl-3 mt-1 space-y-1">
          {node.children.map((child, i) => (
            <MindMapNodeComponent
              key={i}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MindMapFeature() {
  const { language } = useAppStore();
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(100);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    setMindMapData(null);

    try {
      const res = await fetch('/api/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sourceText, language }),
      });

      if (!res.ok) throw new Error('Failed to generate mind map');
      const data = await res.json();
      setMindMapData(data);
    } catch {
      toast.error('Failed to generate mind map. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleExpandAll = () => setCollapsed(new Set());
  const handleCollapseAll = () => {
    if (!mindMapData) return;
    const allLabels = new Set<string>();
    const collectLabels = (nodes: MindMapChild[]) => {
      nodes.forEach((n) => {
        if (n.children?.length) {
          allLabels.add(n.label);
          collectLabels(n.children);
        }
      });
    };
    collectLabels(mindMapData.children);
    setCollapsed(allLabels);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="size-6 text-mindmap-emerald" />
          Mind Map
        </h1>
        <p className="text-muted-foreground">Visualize concepts as interactive, collapsible mind maps.</p>
      </div>

      {/* Input */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic *</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Machine Learning, Solar System"
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source Text (optional)</label>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste study material to structure as a mind map..."
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            <Sparkles className="size-4" />
            {loading ? 'Generating...' : 'Generate Mind Map'}
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-3 ml-4">
              <Skeleton className="h-6 w-36" />
              <div className="ml-4 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-28" />
              </div>
              <Skeleton className="h-6 w-44" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mind Map Output */}
      {mindMapData && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4 sm:p-6">
              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(150, zoom + 10))} className="gap-1">
                  <ZoomIn className="size-3.5" /> Zoom In
                </Button>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))} className="gap-1">
                  <ZoomOut className="size-3.5" /> Zoom Out
                </Button>
                <Button variant="outline" size="sm" onClick={handleExpandAll}>Expand All</Button>
                <Button variant="outline" size="sm" onClick={handleCollapseAll}>Collapse All</Button>
                <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-1 ml-auto">
                  <RotateCcw className="size-3.5" /> Regenerate
                </Button>
              </div>

              {/* Mind map tree */}
              <div
                className="overflow-auto transition-transform duration-200 origin-top-left"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <div className="min-w-[300px]">
                  {/* Root node */}
                  <div className="flex items-center justify-center mb-4">
                    <div className={`px-4 py-2 rounded-xl text-base font-bold ${DEPTH_COLORS[0]}`}>
                      {mindMapData.root}
                    </div>
                  </div>

                  {/* Children */}
                  <div className="ml-4 border-l-2 border-primary/30 pl-4 space-y-1">
                    {mindMapData.children.map((child, i) => (
                      <MindMapNodeComponent
                        key={i}
                        node={child}
                        depth={1}
                        onToggle={handleToggle}
                        collapsed={collapsed}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
