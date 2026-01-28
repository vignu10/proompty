import { NextResponse } from 'next/server';
import { verifyAuth } from '@/app/middleware/auth';
import { SearchController } from '@/app/controllers/SearchController';

export async function GET(request: Request) {
  const auth = await verifyAuth(request).catch(() => null);
  const userId = auth && !('error' in auth) ? auth.userId : null;

  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  const mode = (url.searchParams.get('mode') || 'hybrid') as 'semantic' | 'keyword' | 'hybrid';

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  if (isNaN(limit) || limit < 1) {
    return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
  }

  let result;
  switch (mode) {
    case 'semantic':
      result = await SearchController.semanticSearch(query, userId, limit);
      break;
    case 'keyword':
      result = await SearchController.keywordSearch(query, userId, limit);
      break;
    case 'hybrid':
    default:
      result = await SearchController.hybridSearch(query, userId, limit);
      break;
  }

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ prompts: result.data, total: result.data.length }, { status: 200 });
}
