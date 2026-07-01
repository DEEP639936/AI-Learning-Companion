import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { SUMMARIZE_PROMPT, getLanguageInstruction } from '@/lib/prompts';
import { countWords } from '@/lib/utils';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { text = '', url = '', depth = 'detailed', language = 'en' } = body;

    if (!text.trim() && !url.trim()) {
      return corsJson({ error: 'Text or URL is required' }, 400);
    }

    const langInstruction = getLanguageInstruction(language);
    const depthInstruction = depth === 'brief'
      ? 'Create a brief summary (2-3 paragraphs).'
      : depth === 'bullet-points'
      ? 'Create a bullet-point summary with key points.'
      : 'Create a detailed summary with section headings.';

    const contentToSummarize = text.trim() || `Content fetched from: ${url}`;

    const response = await chatCompletion({
      messages: [{ role: 'user', content: `Please summarize the following content.\n\nDepth: ${depthInstruction}\n\nContent:\n${contentToSummarize}` }],
      system: `${SUMMARIZE_PROMPT}\n\n${langInstruction}`,
      temperature: 0.5,
    });

    const takeawaysMatch = response.match(/(?:key\s+takeaways?|main\s+points?)[^\n]*:?\n((?:[-•*]\s+.+\n?)+)/i);
    const keyTakeaways = takeawaysMatch
      ? takeawaysMatch[1].split('\n').filter((l: string) => l.trim()).map((l: string) => l.replace(/^[-•*]\s*/, '').trim())
      : [];

    const summary = response.replace(/(?:key\s+takeaways?|main\s+points?)[^\n]*:?\n((?:[-•*]\s+.+\n?)+)/i, '').trim();

    return corsJson({
      summary,
      keyTakeaways,
      originalWordCount: countWords(contentToSummarize),
      summaryWordCount: countWords(summary),
    });
  } catch (error: any) {
    console.error('Summarize API error:', error.message);
    return corsJson({ error: 'Failed to generate summary' }, 500);
  }
}
