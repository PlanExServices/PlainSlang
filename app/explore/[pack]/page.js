'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import TermBrowser from '@/components/TermBrowser';
import { CATEGORIES } from '@/lib/packs';

export default function PackPage({ params }) {
  const { pack } = use(params);
  const router = useRouter();
  const cat = CATEGORIES.find((c) => c.id === pack && c.id !== 'teen');

  if (!cat) {
    return (
      <>
        <AppHeader />
        <main className="page-body">
          <Link href="/explore" className="back-link">← Back to Explore</Link>
          <div className="empty-state">
            <div className="empty-emoji" aria-hidden="true">🗺️</div>
            <h3>Unknown pack</h3>
            <p>That jargon world doesn’t exist (yet).</p>
            <div style={{ marginTop: 14 }}>
              <Link href="/explore" className="btn small primary" role="button" style={{ display: 'inline-flex' }}>
                Browse all packs
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader subtitle={`${cat.emoji} ${cat.label} — ${cat.blurb}`} />
      <main className="page-body" style={{ paddingRight: 34 }}>
        <Link href="/explore" className="back-link">← All jargon worlds</Link>
        {cat.id === 'safety' && (
          <div className="safety-note" role="note">
            <strong>⚠️ A note for parents:</strong> seeing one of these terms isn’t proof of
            anything — context matters, and many double as jokes. Use them as conversation
            starters, not accusations. Terms marked ⚠️ are the ones Bark and safety experts
            flag as higher-risk signals.
          </div>
        )}
        {cat.id === 'emoji' && (
          <div className="safety-note" role="note" style={{ borderColor: 'rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.07)' }}>
            <strong>🙂 How to read this:</strong> emojis are context-dependent — a 🍑 in a
            grocery list is a peach. These are the coded meanings documented by Bark’s 2026
            emoji guide, most common in DMs and comments.
          </div>
        )}
        <TermBrowser
          category={cat.id}
          showAgeChips={false}
          showTrendingToggle={false}
          searchPlaceholder={`Search ${cat.label.toLowerCase()}…`}
        />
      </main>
      <button className="fab" onClick={() => router.push('/add')} aria-label="Add a new term">＋</button>
    </>
  );
}
