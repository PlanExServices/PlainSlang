import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Tells the browser which live-update transport to use.
// - sse: Node runtimes (local, Render, Docker) — /api/stream
// - supabase: Cloudflare Workers — browser subscribes straight to Supabase
//   Realtime with the PUBLIC anon key (safe to expose; RLS limits it to reads).
export async function GET() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({
      transport: 'supabase',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
  return NextResponse.json({ transport: 'sse' });
}
