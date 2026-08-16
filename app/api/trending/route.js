import { NextResponse } from 'next/server';
import { refreshTrending, getTrendingStatus } from '@/lib/trending';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === '1';
  try {
    const data = await refreshTrending({ force });
    return NextResponse.json(data);
  } catch (e) {
    // Never fail the page: return whatever flags we have.
    const fallback = getTrendingStatus();
    return NextResponse.json({ ...fallback, refreshError: String(e.message || e) });
  }
}
