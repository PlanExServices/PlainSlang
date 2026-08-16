'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { ageGroupInfo, difficultyInfo } from '@/lib/constants';
import { categoryInfo } from '@/lib/packs';
import { isSaved, toggleSaved, getNote, setNote } from '@/lib/local';

export default function TermDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [term, setTerm] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [note, setNoteState] = useState('');
  const [noteStatus, setNoteStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const noteTimer = useRef(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/terms/${id}`, { cache: 'no-store' });
      if (res.status === 404) throw new Error('This term no longer exists.');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setTerm(data.term);
    } catch (e) {
      setError(String(e.message || e));
    }
  }, [id]);

  useEffect(() => {
    load();
    setSaved(isSaved(Number(id)));
    setNoteState(getNote(Number(id)));
  }, [id, load]);

  const handleToggleSave = () => {
    setSaved(toggleSaved(Number(id)));
  };

  const handleNoteChange = (e) => {
    const v = e.target.value;
    setNoteState(v);
    setNoteStatus('Saving…');
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      setNote(Number(id), v);
      setNoteStatus('Saved to this browser ✓');
      setTimeout(() => setNoteStatus(''), 2000);
    }, 500);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/terms/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      router.push('/');
    } catch (e) {
      setError(String(e.message || e));
      setConfirmDelete(false);
    }
  };

  if (error) {
    return (
      <>
        <AppHeader />
        <main className="page-body">
          <Link href="/glossary" className="back-link">← Back to glossary</Link>
          <div className="error-box" role="alert">
            {error}
            <div style={{ marginTop: 8 }}>
              <button className="btn small" onClick={load}>↻ Retry</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!term) {
    return (
      <>
        <AppHeader />
        <main className="page-body" aria-busy="true">
          <div className="skeleton" style={{ height: 120, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 90, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 90 }} />
        </main>
      </>
    );
  }

  const age = ageGroupInfo(term.ageGroup);
  const diff = difficultyInfo(term.difficulty);
  const isTeen = !term.category || term.category === 'teen';
  const backHref = isTeen ? '/glossary' : `/explore/${term.category}`;

  return (
    <>
      <AppHeader subtitle={isTeen ? `Filed under ${age.label}` : 'From the jargon packs'} />
      <main className="page-body">
        <Link href={backHref} className="back-link">← Back to {isTeen ? 'glossary' : 'the pack'}</Link>

        <div className="detail-hero">
          <div className="detail-emoji" aria-hidden="true">{term.emoji || '💬'}</div>
          <h2 className="detail-term">{term.term}</h2>
          {term.say && <p className="detail-say">say: “{term.say}”</p>}
          <div className="meta-row" style={{ justifyContent: 'center' }}>
            {isTeen && <span className="badge age">{age.emoji} {age.label}</span>}
            <span className="badge" style={{ background: 'rgba(167,139,250,0.14)', color: 'var(--accent)' }}>
              {diff.label}
            </span>
            {term.isWoty && <span className="badge woty">🏆 Word of the Year</span>}
            {term.trending && <span className="badge trend">🔥 Trending now</span>}
            {!term.isSeed && <span className="badge custom">Added by you</span>}
          </div>
          {(term.related?.length > 0) && (
            <div className="xlink-row" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 4 }}>
              <span className="xlink-label">Lives in:</span>
              {[term.category, ...term.related]
                .filter((c, i, a) => a.indexOf(c) === i)
                .map((c) => {
                  const info = categoryInfo(c);
                  const href = c === 'teen' ? '/glossary' : `/explore/${c}`;
                  return (
                    <Link key={c} href={href} className="xlink-chip">
                      {info.emoji} {info.label}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>

        <div className="btn-row">
          <button
            className={`btn${saved ? ' saved-state' : ''}`}
            onClick={handleToggleSave}
            aria-pressed={saved}
          >
            {saved ? '🔖 Saved' : '🔖 Save'}
          </button>
          <Link href={`/term/${term.id}/edit`} className="btn" role="button">✏️ Edit</Link>
        </div>

        <section className="section-card">
          <h3 className="section-label">What it means</h3>
          <p>{term.definition}</p>
        </section>

        {term.example && (
          <section className="section-card">
            <h3 className="section-label">Heard in the wild</h3>
            <p className="example-quote">{term.example}</p>
          </section>
        )}

        {term.notes && (
          <section className="section-card">
            <h3 className="section-label">Origin & notes</h3>
            <p>{term.notes}</p>
          </section>
        )}

        {term.trending && term.trendingEvidence && (
          <section className="section-card">
            <h3 className="section-label">Why it’s marked trending</h3>
            <p style={{ fontSize: 14 }}>
              <strong style={{ color: 'var(--pink)' }}>“{term.trendingEvidence.headline}”</strong>
            </p>
            <p style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 6 }}>
              Source feed: {term.trendingEvidence.feed}
              {term.trendingEvidence.link && (
                <> · <a href={term.trendingEvidence.link} target="_blank" rel="noopener noreferrer">read the story ↗</a></>
              )}
            </p>
          </section>
        )}

        {(term.sourceName || term.sourceUrl) && (
          <section className="section-card">
            <h3 className="section-label">Documented source</h3>
            <p style={{ fontSize: 14 }}>
              {term.sourceUrl ? (
                <a href={term.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {term.sourceName || term.sourceUrl} ↗
                </a>
              ) : (
                term.sourceName
              )}
            </p>
          </section>
        )}

        {term.tags?.length > 0 && (
          <section className="section-card">
            <h3 className="section-label">Tags</h3>
            <div>
              {term.tags.map((t) => (
                <span key={t} className="tag-pill">#{t}</span>
              ))}
            </div>
          </section>
        )}

        <section className="section-card">
          <h3 className="section-label">My private note</h3>
          <textarea
            className="note-area"
            value={note}
            onChange={handleNoteChange}
            placeholder="e.g. “Maya said this at dinner 8/12 — she says it’s ironic now.” Stays in this browser only."
            aria-label="Personal note about this term"
          />
          {noteStatus && <p className="form-hint">{noteStatus}</p>}
        </section>

        {!confirmDelete ? (
          <button className="btn danger" style={{ width: '100%' }} onClick={() => setConfirmDelete(true)}>
            🗑️ Delete this term
          </button>
        ) : (
          <div className="section-card" style={{ borderColor: 'rgba(248,113,113,0.4)' }}>
            <p style={{ fontSize: 14, marginBottom: 10 }}>
              Delete “{term.term}” from the public glossary? This can’t be undone.
            </p>
            <div className="btn-row" style={{ margin: 0 }}>
              <button className="btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn danger" onClick={handleDelete}>Yes, delete</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
