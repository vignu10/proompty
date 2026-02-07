import { verifyAuth } from '@/app/middleware/auth';
import { RAGService } from '@/app/services/RAGService';
import { checkRateLimit } from '@/app/lib/rate-limiter';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Rate limit check for streaming endpoint
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'localhost';
  const rateLimit = checkRateLimit(ip, 'ai');
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil(rateLimit.resetIn / 1000)
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { description, category, tags } = await request.json();

    if (!description?.trim()) {
      return new Response(JSON.stringify({ error: 'Description is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of RAGService.generatePromptStream({ description, category, tags })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
