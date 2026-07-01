import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { URL_FETCH_PROMPT, getLanguageInstruction } from '@/lib/prompts';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { url, query = 'Summarize this content', language = 'en' } = body;

    if (!url || typeof url !== 'string') {
      return corsJson({ error: 'URL is required' }, 400);
    }

    const langInstruction = getLanguageInstruction(language);

    const response = await chatCompletion({
      messages: [{ role: 'user', content: `URL: ${url}\n\nUser's request: ${query}\n\nPlease analyze this URL and fulfill the user's request.` }],
      system: `${URL_FETCH_PROMPT}\n\n${langInstruction}`,
      temperature: 0.6,
    });

    return corsJson({ response });
  } catch (error: any) {
    console.error('URL Fetch API error:', error.message);
    return corsJson({ error: 'Failed to fetch or analyze URL' }, 500);
  }
}
