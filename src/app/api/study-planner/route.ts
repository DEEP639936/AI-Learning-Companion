import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { STUDY_PLANNER_PROMPT, getLanguageInstruction } from '@/lib/prompts';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { subject, examDate, dailyHours, topics, language = 'en' } = body;

    if (!subject || typeof subject !== 'string') {
      return corsJson({ error: 'Subject is required' }, 400);
    }

    if (!examDate || typeof examDate !== 'string') {
      return corsJson({ error: 'Exam date is required' }, 400);
    }

    if (!dailyHours || typeof dailyHours !== 'number' || dailyHours < 1) {
      return corsJson({ error: 'Daily study hours must be at least 1' }, 400);
    }

    const langInstruction = getLanguageInstruction(language);
    const today = new Date().toISOString().split('T')[0];

    const topicsInstruction = topics?.trim()
      ? `\n\nThe student wants to focus on these specific topics/chapters: ${topics}`
      : '';

    const response = await chatCompletion({
      messages: [{
        role: 'user',
        content: `Create a detailed study plan for:\n- Subject: ${subject}\n- Exam date: ${examDate}\n- Today's date: ${today}\n- Daily study hours available: ${dailyHours}${topicsInstruction}\n\nGenerate a complete weekly plan with daily schedules, revision reminders, and study tips.`,
      }],
      system: `${STUDY_PLANNER_PROMPT}\n\n${langInstruction}`,
      temperature: 0.7,
      maxTokens: 8192,
    });

    let plan;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      const examDateObj = new Date(examDate);
      const todayObj = new Date();
      const diffDays = Math.max(1, Math.ceil((examDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24)));
      plan = {
        subject,
        totalDays: diffDays,
        examDate,
        dailyHours,
        weeklyPlan: [{ weekNumber: 1, theme: `Getting started with ${subject}`, days: [{ day: 'Monday', date: today, topics: [`Introduction to ${subject}`], hoursAllocated: dailyHours, tasks: [`Review syllabus and create study notes for ${subject}`], revisionItems: [] }] }],
        revisionSchedule: [{ day: examDate, topics: [`Full revision of ${subject}`], type: 'deep revision' }],
        tips: ['Break study sessions into 25-minute focused blocks with 5-minute breaks', 'Review material within 24 hours of first learning it', 'Get adequate sleep — memory consolidation happens during sleep'],
      };
    }

    return corsJson(plan);
  } catch (error: any) {
    console.error('Study Planner API error:', error.message);
    return corsJson({ error: 'Failed to generate study plan' }, 500);
  }
}
