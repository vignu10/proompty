import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/middleware/auth';
import { PromptController } from '@/app/controllers/PromptController';

// Get all prompts for the authenticated user
export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await PromptController.getAllPrompts(auth.userId);
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
    const { title, content, category, tags } = await request.json();
    const result = await PromptController.createPrompt({
      title,
      content,
      category,
      tags,
      userId: auth.userId,
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
