import { NextResponse } from 'next/server';
import { AuthController } from '@/app/controllers/AuthController';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const result = await AuthController.signup({ email, password, name });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
