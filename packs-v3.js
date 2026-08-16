'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { AGE_GROUPS, ageGroupInfo, difficultyInfo } from '@/lib/constants';
import { CATEGORIES } from '@/lib/packs';
import { getSavedIds } from '@/lib/local';

const AGE_COLORS = {
  elementary: '#4ade80',
  middle: '#22d3ee',
  high_school: '#a78bfa',
  college: '#f472b6',
  gen_alpha: '#fbbf24',
  gen_z: '#f87171',
};

const DIFF_COLORS = { easy: '#4ade80', medium: '#fbbf24', hard: '#f87171' };
const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Cryptic' };

function parentScore(pct) {
  if (pct >= 80) return { title: 'Certified Rizzler 😎', blurb: 'You could pass as a group-chat member.' };
  if (pct >= 60) return { title: 'Pretty Based 👌', blurb: 'The kids might actually be impressed.' };
  if (pct >= 40) return { title: 'Mid… no cap 😬', blurb: 'Respectable, but keep studying.' };
  if (pct >= 1) return { title: 'Kinda Cheugy 🧀', blurb: 'It\u2019s giving "how do you do, fellow kids."' };
  return { title: 'NPC Energy 🤖', blurb: 'Time to hit the glossary.' };
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [quizError, setQuizError] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const loadStats = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      setError(String(e.message || e));
    }
  }, []);

  const loadQuiz = useCallback(async () => {
    setLoadingQuiz(true);
    setQuizError(null);
    setPicked(null);
    try {
      const res = await fetch('/api/quiz', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setQuiz(await res.json());
    } catch (e) {
      setQuizError(String(e.message || e));
    } finally {
      setLoadingQuiz(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadQuiz();
    setSavedCount(getSavedIds().length);
  }, [loadStats, loadQuiz]);

  const handlePick = (id) => {
    if (picked !== null) return;
    setPicked(id);
    setScore((s) => ({ right: s.right + (id === quiz.correctId ? 1 : 0), total: s.total + 1 }));
  };

  const pct = score.total ? Math.round((score.right / score.total) * 100) : 0;
  const rank = parentScore(pct);
  const maxAge = stats ? Math.max(...stats.byAge.map((a) => a.c), 1) : 1;
  const sotd = stats?.slangOfTheDay;

  return (
    <>
      <AppHeader subtitle="Know what your kids mean." />
      <main className="page-body">
        {error && (
          <div className="error-box" role="alert">
            Couldn’t load stats: {error}
            <div style={{ marginTop: 8 }}>
              <button className="btn small" onClick={loadStats}>↻ Retry</button>
            </div>
          </div>
        )}

        {!stats && !error && (
          <>
            <div className="stat-grid" aria-hidden="true">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 84 }} />)}
            </div>
            <div className="skeleton" style={{ height: 160, marginTop: 12 }} />
            <div className="skeleton" style={{ height: 220, marginTop: 12 }} />
          </>
        )}

        {stats && (
          <>
            {/* ----- Stat tiles ----- */}
            <div className="stat-grid">
              <Link href="/glossary" className="stat-tile" style={{ '--tile': '#a78bfa' }}>
                <span className="stat-num">{stats.total}</span>
                <span className="stat-label">📖 Terms decoded</span>
              </Link>
              <Link href="/trending" className="stat-tile" style={{ '--tile': '#f472b6' }}>
                <span className="stat-num">{stats.trending}</span>
                <span className="stat-label">🔥 Trending now</span>
              </Link>
              <Link href="/saved" className="stat-tile" style={{ '--tile': '#fbbf24' }}>
                <span className="stat-num">{savedCount}</span>
                <span className="stat-label">🔖 Saved by you</span>
              </Link>
              <Link href="/add" className="stat-tile" style={{ '--tile': '#4ade80' }}>
                <span className="stat-num">{stats.custom}</span>
                <span className="stat-label">✍️ Added by you</span>
              </Link>
            </div>

            {/* ----- Slang of the Day ----- */}
            {sotd && (
              <Link href={`/term/${sotd.id}`} className="sotd-card">
                <div className="sotd-kicker">✨ Slang of the Day</div>
                <div className="sotd-term">
                  <span aria-hidden="true">{sotd.emoji || '💬'}</span> {sotd.term}
                </div>
                <p className="sotd-def">{sotd.definition}</p>
                {sotd.example && <p className="sotd-example">“{sotd.example}”</p>}
                <span className="sotd-cta">Read the full entry →</span>
              </Link>
            )}

            {/* ----- Explore teaser ----- */}
            <Link href="/explore" className="explore-teaser">
              <div className="explore-teaser-title">🧭 Explore other jargon worlds</div>
              <div className="explore-teaser-sub">
                Coding, texting, gaming, corporate — every dialect, decoded.
              </div>
              <div className="explore-teaser-row" aria-hidden="true">
                {CATEGORIES.filter((c) => c.id !== 'teen').map((c) => (
                  <span key={c.id} className="explore-mini">
                    <span className="mini-emoji">{c.emoji}</span>
                    {c.label.split(' ')[0]}
                  </span>
                ))}
              </div>
            </Link>

            {/* ----- Quiz ----- */}
            <section className="section-card quiz-card">
              <h3 className="section-label">🎯 Do you speak teen? — pop quiz</h3>
              {quizError && (
                <div className="error-box" role="alert" style={{ marginTop: 8 }}>
                  {quizError}
                  <div style={{ marginTop: 8 }}>
                    <button className="btn small" onClick={loadQuiz}>↻ Retry</button>
                  </div>
                </div>
              )}
              {!quiz && !quizError && <div className="skeleton" style={{ height: 150 }} aria-busy="true" />}
              {quiz && (
                <>
                  <p className="quiz-question">
                    What does <strong>{quiz.question.emoji} “{quiz.question.term}”</strong> mean?
                  </p>
                  <div className="quiz-options" role="group" aria-label="Quiz answers">
                    {quiz.options.map((o) => {
                      let cls = 'quiz-option';
                      if (picked !== null) {
                        if (o.id === quiz.correctId) cls += ' correct';
                        else if (o.id === picked) cls += ' wrong';
                        else cls += ' faded';
                      }
                      return (
                        <button key={o.id} className={cls} onClick={() => handlePick(o.id)} disabled={picked !== null}>
                          {o.definition}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== null && (
                    <div className="quiz-result" role="status">
                      {picked === quiz.correctId ? (
                        <span className="source-ok">✓ Correct — ate, no crumbs.</span>
                      ) : (
                        <span className="source-fail">✕ Not quite — that’s cap.</span>
                      )}
                      <button className="btn small primary" onClick={loadQuiz} disabled={loadingQuiz}>
                        {loadingQuiz ? '…' : 'Next question →'}
                      </button>
                    </div>
                  )}
                  {score.total > 0 && (
                    <div className="quiz-score">
                      <div className="quiz-score-bar" aria-hidden="true">
                        <div className="quiz-score-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="quiz-score-line">
                        {score.right}/{score.total} correct · <strong>{rank.title}</strong>
                        <span className="quiz-score-blurb"> {rank.blurb}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ----- Age group chart ----- */}
            <section className="section-card">
              <h3 className="section-label">👪 Who says what — terms by age group</h3>
              <div className="bar-chart">
                {AGE_GROUPS.map((g) => {
                  const row = stats.byAge.find((a) => a.g === g.id);
                  const count = row ? row.c : 0;
                  return (
                    <Link key={g.id} href={`/glossary?age=${g.id}`} className="bar-row" aria-label={`${g.label}: ${count} terms — view them`}>
                      <span className="bar-name">{g.emoji} {g.label}</span>
                      <span className="bar-track">
                        <span
                          className="bar-fill"
                          style={{ width: `${Math.max((count / maxAge) * 100, 4)}%`, background: AGE_COLORS[g.id] }}
                        />
                      </span>
                      <span className="bar-count">{count}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ----- Difficulty donut-ish ----- */}
            <section className="section-card">
              <h3 className="section-label">🧩 How cryptic is it out there?</h3>
              <div className="diff-strip" aria-hidden="true">
                {stats.byDifficulty.map((d) => (
                  <span
                    key={d.d}
                    className="diff-seg"
                    style={{ flex: d.c, background: DIFF_COLORS[d.d] || '#666' }}
                  />
                ))}
              </div>
              <div className="diff-legend">
                {['easy', 'medium', 'hard'].map((k) => {
                  const row = stats.byDifficulty.find((d) => d.d === k);
                  return (
                    <span key={k} className="diff-key">
                      <span className="diff-dot" style={{ background: DIFF_COLORS[k] }} aria-hidden="true" />
                      {DIFF_LABELS[k]} · {row ? row.c : 0}
                    </span>
                  );
                })}
              </div>
              <p className="form-hint" style={{ marginTop: 8 }}>
                “Cryptic” = you would never guess it from context. Looking at you, “6-7.”
              </p>
            </section>

            {/* ----- Newest community terms ----- */}
            {stats.newestCustom.length > 0 && (
              <section className="section-card">
                <h3 className="section-label">🆕 Freshly added by you</h3>
                {stats.newestCustom.map((t) => (
                  <Link key={t.id} href={`/term/${t.id}`} className="fresh-row">
                    <span aria-hidden="true">{t.emoji || '💬'}</span>
                    <span className="fresh-term">{t.term}</span>
                    <span className="fresh-age">{ageGroupInfo(t.ageGroup).label}</span>
                  </Link>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
