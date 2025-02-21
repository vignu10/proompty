import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/app/utils/auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// Get all prompts for the authenticated user
export async function GET(request: Request) {
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

    const prompts = await prisma.prompt.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Create a new prompt
export async function POST(request: Request) {
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

    const prompt = await prisma.prompt.create({
      data: {
        title,
        content,
        category,
        tags,
        userId: decoded.userId,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
