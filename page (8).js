import { NextResponse } from 'next/server';
import { runRadar, getRadarStatus } from '@/lib/radar';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === '1';
  try {
    const data = await runRadar({ force });
    return NextResponse.json(data);
  } catch (e) {
    const fallback = getRadarStatus();
    return NextResponse.json({ ...fallback, radarError: String(e.message || e) });
  }
}
