'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AGE_GROUPS, ageGroupInfo, difficultyInfo } from '@/lib/constants';
import { CATEGORIES, categoryInfo } from '@/lib/packs';
import { getSavedIds, toggleSaved } from '@/lib/local';

const DIFF_CHIPS = [
  { id: 'easy', label: '🟢 Easy' },
  { id: 'medium', label: '🟡 Medium' },
  { id: 'hard', label: '🔴 Cryptic' },
];

function normalize(s) {
  return (s || '').toLowerCase();
}

/**
 * Reusable interactive term browser.
 * props:
 *  - category: which category to load ('teen', 'coding', …)
 *  - showAgeChips: show age-group filter chips (teen slang only)
 *  - showTrendingToggle: show the 🔥 Trending filter (teen slang only)
 *  - initialAge / initialTrending: deep-link filter state
 *  - searchPlaceholder: placeholder text for the search box
 */
export default function TermBrowser({
  category = 'teen',
  showAgeChips = true,
  showTrendingToggle = true,
  initialAge = '',
  initialTrending = false,
  searchPlaceholder = 'Type to filter instantly…',
}) {
  const router = useRouter();

  const [all, setAll] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [age, setAge] = useState(initialAge);
  const [diff, setDiff] = useState('');
  const [onlyTrending, setOnlyTrending] = useState(initialTrending);
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const searchRef = useRef(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/terms?category=${encodeURIComponent(category)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setAll(data.terms);
    } catch (e) {
      setError(String(e.message || e));
    }
  }, [category]);

  useEffect(() => {
    load();
    setSavedIds(getSavedIds());
  }, [load]);

  const filtered = useMemo(() => {
    if (!all) return null;
    const nq = normalize(q).trim();
    return all.filter((t) => {
      if (age && t.ageGroup !== age) return false;
      if (diff && t.difficulty !== diff) return false;
      if (onlyTrending && !t.trending) return false;
      if (onlySaved && !savedIds.includes(t.id)) return false;
      if (nq) {
        const hay = `${normalize(t.term)} ${normalize(t.definition)} ${normalize(t.example)} ${(t.tags || []).join(' ')}`;
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [all, q, age, diff, onlyTrending, onlySaved, savedIds]);

  const grouped = useMemo(() => {
    if (!filtered) return null;
    const groups = new Map();
    for (const t of filtered) {
      const c = t.term[0].toUpperCase();
      const key = /[A-Z]/.test(c) ? c : '#';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    }
    const keys = [...groups.keys()].sort((a, b) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)));
    return keys.map((k) => ({ letter: k, terms: groups.get(k) }));
  }, [filtered]);

  const letters = useMemo(() => (grouped ? grouped.map((g) => g.letter) : []), [grouped]);

  const jumpTo = (letter) => {
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const surpriseMe = () => {
    if (!filtered || filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    setExpandedId(pick.id);
    setFlashId(pick.id);
    setTimeout(() => setFlashId(null), 1600);
    requestAnimationFrame(() => {
      document.getElementById(`term-${pick.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleQuickSave = (e, id) => {
    e.stopPropagation();
    toggleSaved(id);
    setSavedIds(getSavedIds());
  };

  const clearAll = () => {
    setQ('');
    setAge('');
    setDiff('');
    setOnlyTrending(false);
    setOnlySaved(false);
    searchRef.current?.focus();
  };

  const activeFilterCount = [age, diff, onlyTrending, onlySaved, q.trim()].filter(Boolean).length;

  return (
    <>
      <div className="glossary-toolbar">
        <div className="search-wrap" style={{ flex: 1, marginBottom: 0 }}>
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            ref={searchRef}
            className="search-input"
            type="search"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search terms"
          />
          {q && (
            <button className="search-clear" onClick={() => setQ('')} aria-label="Clear search">✕</button>
          )}
        </div>
        <button className="dice-btn" onClick={surpriseMe} aria-label="Open a random term" title="Surprise me">
          🎲
        </button>
      </div>

      {showAgeChips && (
        <div className="chip-row" role="group" aria-label="Filter by age group">
          <button className={`chip${age === '' ? ' active' : ''}`} onClick={() => setAge('')}>All ages</button>
          {AGE_GROUPS.map((g) => (
            <button
              key={g.id}
              className={`chip${age === g.id ? ' active' : ''}`}
              onClick={() => setAge(age === g.id ? '' : g.id)}
              aria-pressed={age === g.id}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      )}

      <div className="chip-row" role="group" aria-label="More filters" style={{ paddingTop: 0 }}>
        {DIFF_CHIPS.map((d) => (
          <button
            key={d.id}
            className={`chip${diff === d.id ? ' active' : ''}`}
            onClick={() => setDiff(diff === d.id ? '' : d.id)}
            aria-pressed={diff === d.id}
          >
            {d.label}
          </button>
        ))}
        {showTrendingToggle && (
          <button
            className={`chip${onlyTrending ? ' active' : ''}`}
            onClick={() => setOnlyTrending(!onlyTrending)}
            aria-pressed={onlyTrending}
          >
            🔥 Trending
          </button>
        )}
        <button
          className={`chip${onlySaved ? ' active' : ''}`}
          onClick={() => { setOnlySaved(!onlySaved); setSavedIds(getSavedIds()); }}
          aria-pressed={onlySaved}
        >
          🔖 Saved
        </button>
      </div>

      {error && (
        <div className="error-box" role="alert">
          Couldn’t load terms: {error}
          <div style={{ marginTop: 8 }}>
            <button className="btn small" onClick={load}>↻ Retry</button>
          </div>
        </div>
      )}

      {!all && !error && (
        <div className="card-list" aria-hidden="true">
          {[...Array(7)].map((_, i) => <div key={i} className="skeleton card" />)}
        </div>
      )}

      {filtered && (
        <>
          <p className="count-line">
            {filtered.length} of {all.length} terms
            {activeFilterCount > 0 && (
              <>
                {' · '}
                <button className="link-btn" onClick={clearAll}>clear filters ✕</button>
              </>
            )}
          </p>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji" aria-hidden="true">🫥</div>
              <h3>No matches</h3>
              <p>Nothing fits those filters. Heard something new? Add it yourself.</p>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn small" onClick={clearAll}>Clear filters</button>
                <button className="btn small primary" onClick={() => router.push('/add')}>➕ Add a term</button>
              </div>
            </div>
          ) : (
            <div>
              {grouped.map((g) => (
                <section key={g.letter}>
                  <h2 className="letter-header" id={`letter-${g.letter}`}>{g.letter}</h2>
                  <div className="card-list">
                    {g.terms.map((t) => {
                      const expanded = expandedId === t.id;
                      const saved = savedIds.includes(t.id);
                      const ag = ageGroupInfo(t.ageGroup);
                      const showAge = category === 'teen' && t.category === 'teen';
                      const visiting = t.category !== category; // cross-linked from another pack
                      const homeCat = categoryInfo(t.category);
                      const alsoIn = (t.related || []).filter((c) => c !== category);
                      return (
                        <div
                          key={t.id}
                          id={`term-${t.id}`}
                          className={`x-card${expanded ? ' expanded' : ''}${flashId === t.id ? ' flash' : ''}`}
                        >
                          <button
                            className="x-card-head"
                            onClick={() => setExpandedId(expanded ? null : t.id)}
                            aria-expanded={expanded}
                            aria-label={`${t.term} — tap to ${expanded ? 'collapse' : 'expand'}`}
                          >
                            <span className="term-emoji" aria-hidden="true">{t.emoji || '💬'}</span>
                            <span className="x-card-title">
                              <span className="term-name">{t.term}</span>
                              {!expanded && <span className="x-card-peek">{t.definition}</span>}
                            </span>
                            {(t.tags || []).includes('parent-alert') && (
                              <span className="badge alert" title="Worth a real conversation">⚠️</span>
                            )}
                            {t.isWoty && <span className="badge woty">WOTY</span>}
                            {t.trending && !t.isWoty && <span className="badge trend">🔥</span>}
                            {!t.isSeed && <span className="badge custom">Yours</span>}
                            {visiting && (
                              <span className="badge xlink" title={`Home pack: ${homeCat.label}`}>
                                {homeCat.emoji}
                              </span>
                            )}
                            {showAge && <span className="badge age">{ag.emoji} {ag.short}</span>}
                            <span className={`x-chevron${expanded ? ' open' : ''}`} aria-hidden="true">▾</span>
                          </button>

                          {expanded && (
                            <div className="x-card-body">
                              <p className="x-def">{t.definition}</p>
                              {t.say && <p className="x-say">🗣️ say: “{t.say}”</p>}
                              {t.example && <p className="example-quote" style={{ margin: '8px 0' }}>{t.example}</p>}
                              <div className="meta-row" style={{ marginTop: 6 }}>
                                {showAge && <span className="badge age">{ag.emoji} {ag.label}</span>}
                                <span className="badge" style={{ background: 'rgba(167,139,250,0.14)', color: 'var(--accent)' }}>
                                  {difficultyInfo(t.difficulty).label}
                                </span>
                                {(t.tags || []).slice(0, 4).map((tag) => (
                                  <span key={tag} className="tag-pill" style={{ margin: 0 }}>#{tag}</span>
                                ))}
                              </div>
                              {(visiting || alsoIn.length > 0) && (
                                <div className="xlink-row">
                                  <span className="xlink-label">Lives in:</span>
                                  {[t.category, ...(t.related || [])]
                                    .filter((c, i, a) => a.indexOf(c) === i)
                                    .map((c) => {
                                      const info = categoryInfo(c);
                                      const href = c === 'teen' ? '/glossary' : `/explore/${c}`;
                                      return (
                                        <Link key={c} href={href} className={`xlink-chip${c === category ? ' here' : ''}`}>
                                          {info.emoji} {info.label}
                                        </Link>
                                      );
                                    })}
                                </div>
                              )}
                              <div className="x-actions">
                                <button
                                  className={`btn small${saved ? ' saved-state' : ''}`}
                                  onClick={(e) => handleQuickSave(e, t.id)}
                                  aria-pressed={saved}
                                >
                                  {saved ? '🔖 Saved' : '🔖 Save'}
                                </button>
                                <Link href={`/term/${t.id}`} className="btn small" role="button">
                                  Full entry + notes →
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      {letters.length > 1 && (
        <nav className="az-rail" aria-label="Jump to letter">
          {letters.map((l) => (
            <button key={l} className="az-letter" onClick={() => jumpTo(l)} aria-label={`Jump to ${l}`}>
              {l}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
