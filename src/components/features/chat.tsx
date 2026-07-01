'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, type ChatMessage } from '@/store/chat-store';
import { useAppStore } from '@/store/app-store';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  Copy,
  Check,
  Bot,
  User,
  Sparkles,
  BookOpen,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { ChatMode } from '@/types';

const MODES: { id: ChatMode; label: string; icon: React.ElementType }[] = [
  { id: 'default', label: 'Default', icon: Sparkles },
  { id: 'eli5', label: 'ELI5', icon: Lightbulb },
  { id: 'socratic', label: 'Socratic', icon: GraduationCap },
  { id: 'exam-prep', label: 'Exam Prep', icon: BookOpen },
];

const STARTER_PROMPTS = [
  'Explain quantum computing in simple terms',
  'Help me understand photosynthesis step by step',
  'What are the key differences between DNA and RNA?',
  'Explain machine learning like I\'m a beginner',
];

export function ChatFeature() {
  const { messages, addMessage, clearMessages, isStreaming, setStreaming, mode, setMode } = useChatStore();
  const { language } = useAppStore();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setStreaming(true);

    const aiMsgId = generateId();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(aiMsg);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          mode,
          language,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      const fullText = data.response || 'Sorry, I could not generate a response.';

      // Simulate streaming
      const words = fullText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30));
        const partial = words.slice(0, i + 1).join(' ');
        const updatedMessages = useChatStore.getState().messages;
        const idx = updatedMessages.findIndex(m => m.id === aiMsgId);
        if (idx !== -1) {
          const newMessages = [...updatedMessages];
          newMessages[idx] = { ...newMessages[idx], content: partial };
          useChatStore.setState({ messages: newMessages });
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to get AI response. Please try again.';
      toast.error(errorMsg);
      // Remove the empty AI message
      const currentMessages = useChatStore.getState().messages;
      useChatStore.setState({ messages: currentMessages.filter(m => m.id !== aiMsgId) });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <Button
              key={m.id}
              variant={mode === m.id ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => setMode(m.id)}
            >
              <Icon className="size-3.5" />
              {m.label}
            </Button>
          );
        })}
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={clearMessages} className="text-xs text-muted-foreground">
            Clear
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="size-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Chat with Mentora AI</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Ask anything — I&apos;ll help you understand concepts, solve problems, and prepare for exams.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {STARTER_PROMPTS.map((prompt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                  >
                    <CardContent className="p-3 text-sm text-muted-foreground">
                      {prompt}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="size-4 text-primary" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.role === 'assistant' && msg.content && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(msg.content, msg.id)}
                >
                  {copiedId === msg.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedId === msg.id ? 'Copied' : 'Copy'}
                </Button>
              )}
            </div>
            {msg.role === 'user' && (
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-accent">
                  <User className="size-4 text-accent-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </motion.div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary/10">
                <Bot className="size-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 h-11 w-11"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
