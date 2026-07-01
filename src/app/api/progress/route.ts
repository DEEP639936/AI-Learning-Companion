import { NextRequest, NextResponse } from 'next/server';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function GET() {
  try {
    const mockProgress = {
      totalQuizzes: 12,
      averageScore: 76,
      flashcardCount: 48,
      summariesCount: 8,
      recentActivity: [
        { id: '1', type: 'quiz' as const, title: 'JavaScript Fundamentals', score: 85, totalQuestions: 10, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: '2', type: 'flashcard' as const, title: 'Biology Chapter 5', cardCount: 15, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: '3', type: 'summary' as const, title: 'Physics: Thermodynamics', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: '4', type: 'quiz' as const, title: 'Python Data Structures', score: 70, totalQuestions: 10, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
        { id: '5', type: 'flashcard' as const, title: 'Organic Chemistry', cardCount: 20, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
      ],
      weeklyStats: [
        { day: 'Mon', quizzes: 2, flashcards: 5, summaries: 1 },
        { day: 'Tue', quizzes: 1, flashcards: 3, summaries: 0 },
        { day: 'Wed', quizzes: 0, flashcards: 7, summaries: 2 },
        { day: 'Thu', quizzes: 3, flashcards: 4, summaries: 1 },
        { day: 'Fri', quizzes: 1, flashcards: 6, summaries: 0 },
        { day: 'Sat', quizzes: 4, flashcards: 8, summaries: 3 },
        { day: 'Sun', quizzes: 1, flashcards: 15, summaries: 1 },
      ],
    };
    return corsJson(mockProgress);
  } catch (error: any) {
    console.error('Progress API error:', error);
    return corsJson({ error: error.message || 'Failed to fetch progress data' }, 500);
  }
}
