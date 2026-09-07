'use client';

import { useEffect, useState, useCallback } from 'react';
import AppHeader from '@/components/AppHeader';
import TermCard from '@/components/TermCard';
import { useLiveRefresh } from '@/lib/useLive';
import LiveDot from '@/components/LiveDot';

export default function TrendingPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    setError(null);
    if (force) setRefreshing(true);
    try {
      const res = await fetch(`/api/verify${force ? '?force=1' : ''}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: when any instance completes a verify (or terms change), refresh —
  // without forcing a new feed fetch.
  const liveStatus = useLiveRefresh(() => load(false));

  const trending = data?.trending;
  const radar = data?.radar;
  const status = trending?.status;
  const radarStatus = radar?.status;
  const radarCandidates = radarStatus
    ? radarStatus.results.filter((r) => r.ok).flatMap((r) => r.newCandidates.map((t) => ({ t, s: r.source })))
    : [];
  const discovery = radarStatus?.discovery || [];
  const newArticles = discovery.filter((d) => d.ok).flatMap((d) => d.newGuideUrls.map((u) => ({ u, i: d.index })));
  const newArticleCount = newArticles.length;
  const feedSources = status?.sourcesChecked || [];
  const guideSources = radarStatus?.results || [];
  const sourceOkCount = feedSources.filter((s) => s.ok).length + guideSources.filter((r) => r.ok).length;
  const sourceTotal = feedSources.length + guideSources.length;
  const allSourcesOk = sourceTotal > 0 && sourceOkCount === sourceTotal;

  return (
    <>
      <AppHeader subtitle="Verified against live news feeds — we don’t invent what’s hot" />
      <main className="page-body">
        {error && (
          <div className="error-box" role="alert">
            Couldn’t load verification data: {error}
            <div style={{ marginTop: 8 }}>
              <button className="btn small" onClick={() => load()}>↻ Retry</button>
            </div>
          </div>
        )}

        {!data && !error && (
          <>
            <div className="skeleton" style={{ height: 170, marginBottom: 12 }} />
            <div className="card-list" aria-hidden="true">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton card" />)}
            </div>
          </>
        )}

        {data && (
          <>
            {/* ---- Unified daily verification panel (collapsed by default) ---- */}
            <details className="verify-panel collapsible">
              <summary className="verify-summary">
                <span className="verify-summary-title">
                  🛡️ Daily verification <LiveDot status={liveStatus} />
                </span>
                <span className="verify-summary-line">
                  {status
                    ? `${allSourcesOk ? '✓' : '⚠'} ${sourceOkCount}/${sourceTotal} sources · ${status.matchedCount} headline match${status.matchedCount === 1 ? '' : 'es'}${newArticleCount > 0 ? ` · 🆕 ${newArticleCount} new guide article${newArticleCount === 1 ? '' : 's'} found` : ''}${radarCandidates.length > 0 ? ` · ${radarCandidates.length} term candidate${radarCandidates.length === 1 ? '' : 's'}` : ''}`
                    : 'not yet run — expand for details'}
                </span>
                <span className="verify-chevron" aria-hidden="true">▾</span>
              </summary>
              <div className="verify-body">

              {status ? (
                <>
                  <div>
                    Trending last verified:{' '}
                    <strong style={{ color: 'var(--text)' }}>
                      {new Date(status.verifiedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
                    </strong>{' '}
                    · {status.matchedCount} headline match{status.matchedCount === 1 ? '' : 'es'}
                  </div>
                  <ul>
                    {status.sourcesChecked.map((s, i) => (
                      <li key={i}>
                        {s.ok ? (
                          <span className="source-ok">✓ {s.name} — {s.items} items read</span>
                        ) : (
                          <span className="source-fail">✕ {s.name} — {s.error}</span>
                        )}
                      </li>
                    ))}
                    {status.wiktionarySample?.length > 0 && (
                      <li>
                        Wiktionary spot-check:{' '}
                        {status.wiktionarySample
                          .map((w) => `${w.term} ${w.confirmed === true ? '✓' : w.confirmed === false ? '—' : '?'}`)
                          .join(' · ')}
                      </li>
                    )}
                  </ul>
                </>
              ) : (
                <div>
                  No trending verification has completed yet.
                  {trending?.lastFailedAttempt && (
                    <span className="source-fail">
                      {' '}Last attempt failed; showing existing flags — official Words of the Year stay marked.
                    </span>
                  )}
                </div>
              )}
              {trending?.refreshError && (
                <div className="source-fail" style={{ marginTop: 6 }}>
                  Feed refresh error: {trending.refreshError}. Yesterday’s flags kept.
                </div>
              )}

              <div style={{ borderTop: '1px dashed var(--border)', marginTop: 10, paddingTop: 10 }}>
                {radarStatus ? (
                  <>
                    <div>
                      📡 Slang radar last scan:{' '}
                      <strong style={{ color: 'var(--text)' }}>
                        {new Date(radarStatus.checkedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
                      </strong>
                    </div>
                    <ul>
                      {radarStatus.results.map((r, i) => (
                        <li key={i}>
                          {r.ok ? (
                            <span className="source-ok">
                              ✓ {r.source} — {r.scanned} terms scanned,{' '}
                              {r.newCandidates.length === 0
                                ? 'library is current'
                                : `${r.newCandidates.length} new candidate${r.newCandidates.length === 1 ? '' : 's'}`}
                            </span>
                          ) : (
                            <span className="source-fail">✕ {r.source} — {r.error}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {radarCandidates.length > 0 && (
                      <details style={{ marginTop: 6 }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                          New term candidates (need review — we never auto-write definitions)
                        </summary>
                        <ul>
                          {radarCandidates.map(({ t, s }, i) => (
                            <li key={i}>
                              “{t}” <em style={{ color: 'var(--text-faint)' }}>({s})</em>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </>
                ) : (
                  <div>
                    📡 Slang radar hasn’t completed a scan yet.
                    {radar?.lastFailedAttempt && <span className="source-fail"> Last attempt failed; will retry.</span>}
                  </div>
                )}
                {radar?.radarError && (
                  <div className="source-fail" style={{ marginTop: 6 }}>
                    Radar error: {radar.radarError}. Last good scan kept.
                  </div>
                )}
              </div>

              {/* ---- New-article discovery ---- */}
              <div style={{ borderTop: '1px dashed var(--border)', marginTop: 10, paddingTop: 10 }}>
                <div>🔭 New-guide discovery (index pages)</div>
                <ul>
                  {discovery.length === 0 && <li style={{ color: 'var(--text-faint)' }}>No discovery data yet — runs with the next verification.</li>}
                  {discovery.map((d, i) => (
                    <li key={i}>
                      {d.ok ? (
                        <span className={d.newGuideUrls.length ? 'source-warn' : 'source-ok'}>
                          {d.newGuideUrls.length ? '🆕' : '✓'} {d.index} — {d.linksScanned} links scanned,{' '}
                          {d.newGuideUrls.length === 0 ? 'no new guide articles' : `${d.newGuideUrls.length} possible new guide${d.newGuideUrls.length === 1 ? '' : 's'}`}
                        </span>
                      ) : (
                        <span className="source-fail">✕ {d.index} — {d.error}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {newArticles.length > 0 && (
                  <ul>
                    {newArticles.map((a, i) => (
                      <li key={i}>
                        <a href={a.u} target="_blank" rel="noopener noreferrer">{a.u}</a>{' '}
                        <em style={{ color: 'var(--text-faint)' }}>— review &amp; add to watched sources if it’s a slang guide</em>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How this works</summary>
                <ul>
                  <li>Once per day (America/New_York) — or when you tap the button — one process runs both checks:</li>
                  <li>1. Reads Google News + Merriam-Webster feeds and re-flags trending terms actually in headlines.</li>
                  <li>2. Re-scans Bark’s and Axis’s parent guides for slang we don’t have yet.</li>
                  <li>If a source fails, its previous results stay put; the other check still runs.</li>
                </ul>
              </details>

              {status?.headlinesSample?.length > 0 && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                    Headlines we checked ({status.headlinesSample.length} shown)
                  </summary>
                  <ul>
                    {status.headlinesSample.map((h, i) => (
                      <li key={i}>
                        {h.link ? (
                          <a href={h.link} target="_blank" rel="noopener noreferrer">{h.title}</a>
                        ) : (
                          h.title
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              <div style={{ marginTop: 10 }}>
                <button className="btn small primary" onClick={() => load(true)} disabled={refreshing}>
                  {refreshing ? 'Verifying feeds & guides…' : '🛡️ Verify now'}
                </button>
              </div>
              </div>
            </details>

            <p className="count-line">
              {trending?.terms?.length ?? 0} trending term{(trending?.terms?.length ?? 0) === 1 ? '' : 's'}
            </p>

            {(!trending?.terms || trending.terms.length === 0) ? (
              <div className="empty-state">
                <div className="empty-emoji" aria-hidden="true">🧊</div>
                <h3>Quiet news day</h3>
                <p>No glossary terms appeared in today’s headlines. That’s honest — not broken.</p>
              </div>
            ) : (
              <div className="card-list">
                {trending.terms.map((t) => (
                  <div key={t.id}>
                    <TermCard term={t} />
                    {t.trendingEvidence?.headline && (
                      <p className="evidence-line" style={{ padding: '0 4px' }}>
                        📰 <strong>Evidence:</strong> “{t.trendingEvidence.headline}” <em>({t.trendingEvidence.feed})</em>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
