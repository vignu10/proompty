import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/middleware/auth';
import { AIController } from '@/app/controllers/AIController';
import { withRateLimit } from '@/app/middleware/rateLimit';

export async function POST(request: Request) {
  // Rate limit check (10 requests per minute for AI endpoints)
  const rateLimitResponse = await withRateLimit(request, 'ai');
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { description, category, tags } = await request.json();
    const result = await AIController.generate(description, category, tags);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
