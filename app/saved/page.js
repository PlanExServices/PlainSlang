'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import TermCard from '@/components/TermCard';
import { getSavedIds, getNote } from '@/lib/local';

export default function SavedPage() {
  const [terms, setTerms] = useState(null);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    setError(null);
    const ids = getSavedIds();
    if (ids.length === 0) {
      setTerms([]);
      return;
    }
    try {
      const res = await fetch('/api/terms', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const byId = new Map(data.terms.map((t) => [t.id, t]));
      const savedTerms = ids.map((id) => byId.get(id)).filter(Boolean);
      setTerms(savedTerms);
      const n = {};
      for (const id of ids) {
        const note = getNote(id);
        if (note) n[id] = note;
      }
      setNotes(n);
    } catch (e) {
      setError(String(e.message || e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <AppHeader subtitle="Your bookmarks & notes — stored in this browser only" />
      <main className="page-body">
        {error && (
          <div className="error-box" role="alert">
            {error}
            <div style={{ marginTop: 8 }}>
              <button className="btn small" onClick={load}>↻ Retry</button>
            </div>
          </div>
        )}

        {terms === null && !error && (
          <div className="card-list" aria-hidden="true">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton card" />)}
          </div>
        )}

        {terms !== null && terms.length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji" aria-hidden="true">🔖</div>
            <h3>Nothing saved yet</h3>
            <p>Tap “Save” on any term to keep it here. Saved terms and notes never leave this browser.</p>
            <div style={{ marginTop: 14 }}>
              <Link href="/glossary" className="btn small primary" role="button" style={{ display: 'inline-flex' }}>
                Browse the glossary
              </Link>
            </div>
          </div>
        )}

        {terms !== null && terms.length > 0 && (
          <>
            <p className="count-line">{terms.length} saved term{terms.length === 1 ? '' : 's'}</p>
            <div className="card-list">
              {terms.map((t) => (
                <div key={t.id}>
                  <TermCard term={t} />
                  {notes[t.id] && (
                    <p className="evidence-line" style={{ padding: '0 4px' }}>
                      📝 <strong style={{ color: 'var(--amber)' }}>Your note:</strong> {notes[t.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
