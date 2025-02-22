import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/middleware/auth';
import { PromptController } from '@/app/controllers/PromptController';

// Get prompts - public ones for everyone, private ones only for authenticated users
export async function GET(request: Request) {
  const auth = await verifyAuth(request).catch(() => null);
  const userId = auth && !('error' in auth) ? auth.userId : null;

  const result = await PromptController.getAllPrompts(userId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}

// Create a new prompt
export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { title, content, category, tags, isPublic } = await request.json();
    const result = await PromptController.createPrompt({
      title,
      content,
      category,
      tags,
      userId: auth.userId,
      isPublic: isPublic ?? false,
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
