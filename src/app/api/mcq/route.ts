import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { MCQ_PROMPT, getLanguageInstruction } from '@/lib/prompts';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { topic, sourceText = '', difficulty = 'medium', questionCount = 5, language = 'en' } = body;

    if (!topic || typeof topic !== 'string') {
      return corsJson({ error: 'Topic is required' }, 400);
    }

    const langInstruction = getLanguageInstruction(language);
    const difficultyInstruction = `Difficulty level: ${difficulty}. ${difficulty === 'easy' ? 'Use straightforward questions with obvious distractors.' : difficulty === 'hard' ? 'Use complex questions requiring deep understanding and subtle distinctions.' : 'Use moderate difficulty with plausible distractors.'}`;

    const sourceInstruction = sourceText.trim()
      ? `\n\nGenerate questions based on this source material:\n${sourceText}`
      : '';

    const response = await chatCompletion({
      messages: [{ role: 'user', content: `Generate ${questionCount} multiple-choice questions about: ${topic}\n\n${difficultyInstruction}${sourceInstruction}` }],
      system: `${MCQ_PROMPT}\n\n${langInstruction}`,
      temperature: 0.7,
      maxTokens: 4096,
    });

    let questions;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      questions = {
        questions: [{ question: `Sample question about ${topic}`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctIndex: 0, explanation: 'Fallback question.' }],
      };
    }

    return corsJson(questions);
  } catch (error: any) {
    console.error('MCQ API error:', error.message);
    return corsJson({ error: 'Failed to generate quiz' }, 500);
  }
}
