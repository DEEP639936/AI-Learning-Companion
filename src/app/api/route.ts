import { NextRequest, NextResponse } from 'next/server';
import { handleCors, corsJson } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) || new NextResponse(null, { status: 204 });
}

export async function GET() {
  return corsJson({ message: "Mentora AI API is running!" });
}
