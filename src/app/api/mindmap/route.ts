import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { MINDMAP_PROMPT, getLanguageInstruction } from '@/lib/prompts';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { topic, sourceText = '', language = 'en' } = body;

    if (!topic || typeof topic !== 'string') {
      return corsJson({ error: 'Topic is required' }, 400);
    }

    const langInstruction = getLanguageInstruction(language);
    const sourceInstruction = sourceText.trim()
      ? `\n\nBase the mind map on this source material:\n${sourceText}`
      : '';

    const response = await chatCompletion({
      messages: [{ role: 'user', content: `Create a mind map for the topic: ${topic}${sourceInstruction}` }],
      system: `${MINDMAP_PROMPT}\n\n${langInstruction}`,
      temperature: 0.6,
      maxTokens: 4096,
    });

    let mindMapData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mindMapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      mindMapData = {
        root: topic,
        children: [
          { label: 'Overview', children: [{ label: 'Definition', children: [] }, { label: 'Key Concepts', children: [] }] },
          { label: 'Applications', children: [{ label: 'Real-world uses', children: [] }] },
          { label: 'Related Topics', children: [] },
        ],
      };
    }

    return corsJson(mindMapData);
  } catch (error: any) {
    console.error('MindMap API error:', error.message);
    return corsJson({ error: 'Failed to generate mind map' }, 500);
  }
}
