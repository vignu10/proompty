import { NextResponse } from 'next/server';
import { verifyToken } from '@/app/utils/auth';
import { Prompt } from '@/app/models/Prompt';

export async function verifyAuth(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  return { userId: decoded.userId };
}

export async function verifyAuthAndOwnership(request: Request, promptId: string) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return auth;
  }

  const prompt = await Prompt.findById(promptId);
  if (!prompt) {
    return { error: 'Prompt not found', status: 404 };
  }

  if (prompt.userId !== auth.userId) {
    return { error: 'Unauthorized', status: 403 };
  }

  return { userId: auth.userId, prompt };
}

export function handleError(error: unknown) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
