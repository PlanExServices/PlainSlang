import { NextResponse } from 'next/server';
import { refreshTrending, getTrendingStatus } from '@/lib/trending';
import { runRadar, getRadarStatus } from '@/lib/radar';

export const dynamic = 'force-dynamic';

// Unified daily verification: news-feed trending check + Bark/Axis slang radar.
// Each half is gated to once per calendar day (America/New_York) unless ?force=1.
// Halves fail independently — one failing never blocks the other.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === '1';

  const [trendingResult, radarResult] = await Promise.allSettled([
    refreshTrending({ force }),
    runRadar({ force }),
  ]);

  const trending =
    trendingResult.status === 'fulfilled'
      ? trendingResult.value
      : { ...getTrendingStatus(), refreshError: String(trendingResult.reason?.message || trendingResult.reason) };

  const radar =
    radarResult.status === 'fulfilled'
      ? radarResult.value
      : { ...getRadarStatus(), radarError: String(radarResult.reason?.message || radarResult.reason) };

  return NextResponse.json({ trending, radar });
}
