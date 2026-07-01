import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai-client';
import { CODE_EXPLAIN_PROMPT, getLanguageInstruction } from '@/lib/prompts';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { mode = 'explain', input, programmingLanguage = 'JavaScript', language = 'en' } = body;

    if (!input || typeof input !== 'string') {
      return corsJson({ error: 'Input is required' }, 400);
    }

    const langInstruction = getLanguageInstruction(language);
    const modeInstruction = mode === 'generate'
      ? `Generate working ${programmingLanguage} code for: ${input}`
      : `Explain the following ${programmingLanguage} code:\n\n${input}`;

    const response = await chatCompletion({
      messages: [{ role: 'user', content: modeInstruction }],
      system: `${CODE_EXPLAIN_PROMPT}\n\nProgramming language: ${programmingLanguage}\nMode: ${mode}\n\n${langInstruction}`,
      temperature: mode === 'generate' ? 0.4 : 0.5,
      maxTokens: 4096,
    });

    let codeExplanation;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        codeExplanation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      codeExplanation = {
        code: mode === 'explain' ? input : `// Generated ${programmingLanguage} code\n// ${input}\nconsole.log("Hello, World!");`,
        lineByLine: [{ lineRange: '1-3', explanation: 'The AI response could not be fully parsed.', analogy: 'Think of this like a recipe with steps to follow.' }],
        overallSummary: response.substring(0, 500),
        realWorldAnalogy: 'This code works like a set of instructions, similar to following a recipe step by step.',
      };
    }

    return corsJson(codeExplanation);
  } catch (error: any) {
    console.error('Code Explain API error:', error.message);
    return corsJson({ error: 'Failed to process code' }, 500);
  }
}
