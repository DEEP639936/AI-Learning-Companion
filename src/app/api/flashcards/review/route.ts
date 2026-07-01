import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { calculateSM2 } from '@/lib/utils';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Check if database is available (it won't be on Vercel without a cloud DB)
  if (!isDatabaseAvailable()) {
    return corsJson({
      error: 'Database is not configured. To use flashcard review, set up a cloud database (Supabase/PlanetScale). See DEPLOYMENT.md for instructions.',
      hint: 'All other AI features work without a database — only spaced repetition review requires it.',
    }, 503);
  }

  try {
    const body = await req.json();
    const { cardId, quality } = body as { cardId: string; quality: number };

    if (!cardId || typeof cardId !== 'string') {
      return corsJson({ error: 'cardId is required' }, 400);
    }

    if (typeof quality !== 'number' || quality < 0 || quality > 5) {
      return corsJson({ error: 'Quality must be a number between 0 and 5' }, 400);
    }

    const card = await db!.flashcard.findUnique({ where: { id: cardId } });

    if (!card) {
      return corsJson({ error: 'Flashcard not found' }, 404);
    }

    const { newEaseFactor, newInterval, newRepetitions } = calculateSM2(quality, card.easeFactor, card.intervalDays, card.repetitions);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    const updatedCard = await db!.flashcard.update({
      where: { id: cardId },
      data: { easeFactor: newEaseFactor, intervalDays: newInterval, nextReviewDate, repetitions: newRepetitions },
    });

    return corsJson({
      id: updatedCard.id, front: updatedCard.front, back: updatedCard.back,
      easeFactor: updatedCard.easeFactor, intervalDays: updatedCard.intervalDays,
      nextReviewDate: updatedCard.nextReviewDate, repetitions: updatedCard.repetitions,
    });
  } catch (error: any) {
    console.error('Flashcard review API error:', error);
    return corsJson({ error: error.message || 'Failed to review flashcard' }, 500);
  }
}
