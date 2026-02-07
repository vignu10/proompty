import { NextResponse } from 'next/server';
import { AuthController } from '@/app/controllers/AuthController';
import { withRateLimit } from '@/app/middleware/rateLimit';

export async function POST(request: Request) {
  const rateLimitResponse = await withRateLimit(request, 'auth');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email, password } = await request.json();
    const result = await AuthController.login(email, password);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
