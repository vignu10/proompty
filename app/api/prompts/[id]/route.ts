import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/app/utils/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// Get a single prompt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    if (prompt.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Update a prompt
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { title, content, category, tags } = await request.json();

    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    if (prompt.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id: params.id },
      data: {
        title,
        content,
        category,
        tags,
      },
    });

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Delete a prompt
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    if (prompt.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.prompt.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
