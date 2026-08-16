'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { CATEGORIES } from '@/lib/packs';

export default function ExplorePage() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/terms', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const c = {};
      for (const t of data.terms) {
        c[t.category] = (c[t.category] || 0) + 1;
        for (const r of t.related || []) c[r] = (c[r] || 0) + 1; // cross-linked terms count everywhere they appear
      }
      setCounts(c);
    } catch (e) {
      setError(String(e.message || e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <AppHeader subtitle="Every dialect of the internet, one decoder" />
      <main className="page-body">
        <p className="explore-intro">
          Teen slang is just the beginning. Pick a jargon world to decode — every
          entry cites a published reference, same as the main glossary.
        </p>

        {error && (
          <div className="error-box" role="alert">
            {error}
            <div style={{ marginTop: 8 }}>
              <button className="btn small" onClick={load}>↻ Retry</button>
            </div>
          </div>
        )}

        {!counts && !error && (
          <div className="card-list" aria-hidden="true">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 108 }} />)}
          </div>
        )}

        {counts && (
          <div className="pack-list">
            {CATEGORIES.map((c) => {
              const href = c.id === 'teen' ? '/glossary' : `/explore/${c.id}`;
              const n = counts[c.id] || 0;
              return (
                <Link key={c.id} href={href} className="pack-card" style={{ '--pack': c.color }}>
                  <span className="pack-emoji" aria-hidden="true">{c.emoji}</span>
                  <span className="pack-info">
                    <span className="pack-title">{c.label}</span>
                    <span className="pack-blurb">{c.blurb}</span>
                  </span>
                  <span className="pack-count">
                    {n}
                    <span className="pack-count-label">terms</span>
                  </span>
                  <span className="pack-arrow" aria-hidden="true">›</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="section-card" style={{ marginTop: 16 }}>
          <h3 className="section-label">💡 Missing a world?</h3>
          <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            You can add your own terms to any pack from the Add tab — pick the
            category in the form. Sports talk, finance bro speak, theater kid
            lingo… build your own decoder.
          </p>
        </div>
      </main>
    </>
  );
}
