import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { FLASHCARD_PROMPT, getLanguageInstruction } from '@/lib/prompts';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { topic, sourceText = '', count = 5, language = 'en' } = body;

    if (!topic || typeof topic !== 'string') {
      return corsJson({ error: 'Topic is required' }, 400);
    }

    const langInstruction = getLanguageInstruction(language);
    const sourceInstruction = sourceText.trim()
      ? `\n\nBase the flashcards on this source material:\n${sourceText}`
      : '';

    const response = await chatCompletion({
      messages: [{ role: 'user', content: `Create ${count} flashcards about: ${topic}${sourceInstruction}` }],
      system: `${FLASHCARD_PROMPT}\n\n${langInstruction}`,
      temperature: 0.7,
      maxTokens: 4096,
    });

    let flashcardData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        flashcardData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      flashcardData = {
        cards: [{ front: `What is ${topic}?`, back: `${topic} is a concept that requires further study.` }],
      };
    }

    return corsJson(flashcardData);
  } catch (error: any) {
    console.error('Flashcards API error:', error.message);
    return corsJson({ error: 'Failed to generate flashcards' }, 500);
  }
}
