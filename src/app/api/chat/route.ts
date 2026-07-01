import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { CHAT_SYSTEM_PROMPTS, getLanguageInstruction } from '@/lib/prompts';
import { handleCors, corsJson } from '@/lib/cors';

export async function POST(req: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { message, mode = 'default', language = 'en', history = [] } = body;

    if (!message || typeof message !== 'string') {
      return corsJson({ error: 'Message is required' }, 400);
    }

    const systemPrompt = CHAT_SYSTEM_PROMPTS[mode] || CHAT_SYSTEM_PROMPTS.default;
    const langInstruction = getLanguageInstruction(language);

    const messages = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    console.log('[Chat API] Processing request - mode:', mode, 'language:', language, 'message length:', message.length);

    const response = await chatCompletion({
      messages,
      system: `${systemPrompt}\n\n${langInstruction}`,
      temperature: mode === 'socratic' ? 0.8 : 0.7,
    });

    console.log('[Chat API] Response generated successfully, length:', response.length);

    return corsJson({ response });
  } catch (error: any) {
    console.error('[Chat API] Error:', error.message);
    
    const errorMessage = error.message || 'Failed to generate response';
    const statusCode = errorMessage.includes('not available') ? 503 : 500;
    
    return corsJson({ error: errorMessage }, statusCode);
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}
