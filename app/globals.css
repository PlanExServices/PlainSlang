:root {
  --bg: #0b0d12;
  --bg-elev: #12151d;
  --bg-card: #161a24;
  --bg-card-hover: #1b2030;
  --border: #262c3d;
  --border-strong: #343c52;
  --text: #eef1f8;
  --text-dim: #9aa3b8;
  --text-faint: #6b7489;
  --accent: #a78bfa;
  --accent-strong: #8b5cf6;
  --accent-ink: #14091f;
  --green: #4ade80;
  --amber: #fbbf24;
  --red: #f87171;
  --pink: #f472b6;
  --cyan: #22d3ee;
  --radius: 16px;
  --radius-sm: 10px;
  --tab-h: 64px;
}

* { box-sizing: border-box; }

html { color-scheme: dark; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}

a { color: var(--accent); text-decoration: none; }

.app-frame {
  max-width: 560px;
  margin: 0 auto;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
}

@media (min-width: 600px) {
  .app-frame {
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(11, 13, 18, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 14px 16px 10px;
}

.app-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-title .logo-badge {
  width: 30px; height: 30px;
  border-radius: 9px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex: none;
}

.app-subtitle {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--text-dim);
}

.page-body {
  flex: 1;
  padding: 16px 16px calc(var(--tab-h) + 28px);
}

/* ---------- Tab bar ---------- */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 560px;
  height: calc(var(--tab-h) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(15, 17, 24, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--border);
  display: flex;
  z-index: 30;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-dim);
  min-height: 48px;
  transition: color 0.15s;
}

.tab-item .tab-icon { font-size: 21px; line-height: 1; }
.tab-item.active { color: var(--accent); }
.tab-item:active { opacity: 0.7; }

/* ---------- Search + chips ---------- */
.search-wrap { position: relative; margin-bottom: 12px; }

.search-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text);
  font-size: 16px;
  padding: 13px 42px 13px 42px;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--accent-strong); }
.search-input::placeholder { color: var(--text-faint); }

.search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: var(--text-dim); font-size: 16px; pointer-events: none;
}

.search-clear {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: var(--border); border: none; color: var(--text-dim);
  width: 28px; height: 28px; border-radius: 50%;
  font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0 10px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.chip-row::-webkit-scrollbar { display: none; }

.chip {
  flex: none;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 36px;
  transition: all 0.15s;
  white-space: nowrap;
}
.chip.active {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
  color: #fff;
}

/* ---------- Cards ---------- */
.card-list { display: flex; flex-direction: column; gap: 10px; }

.term-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  color: var(--text);
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.term-card:active { transform: scale(0.985); background: var(--bg-card-hover); }

.term-card-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
}
.term-emoji { font-size: 22px; flex: none; }
.term-name { font-size: 17px; font-weight: 700; letter-spacing: -0.01em; flex: 1; min-width: 0; }
.term-def {
  font-size: 14px; color: var(--text-dim); margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.badge {
  flex: none;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}
.badge.trend { background: rgba(244, 114, 182, 0.15); color: var(--pink); }
.badge.woty { background: rgba(251, 191, 36, 0.15); color: var(--amber); }
.badge.age { background: rgba(34, 211, 238, 0.12); color: var(--cyan); }
.badge.custom { background: rgba(74, 222, 128, 0.13); color: var(--green); }

.meta-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

/* ---------- Detail page ---------- */
.detail-hero { text-align: center; padding: 18px 0 6px; }
.detail-emoji { font-size: 52px; line-height: 1; }
.detail-term { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; margin: 10px 0 2px; }
.detail-say { color: var(--text-dim); font-size: 14px; font-style: italic; }

.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-bottom: 12px;
}
.section-label {
  font-size: 11px; font-weight: 800; letter-spacing: 0.09em;
  text-transform: uppercase; color: var(--text-faint); margin: 0 0 6px;
}
.section-card p { margin: 0; font-size: 15px; }
.example-quote {
  border-left: 3px solid var(--accent-strong);
  padding-left: 12px;
  font-style: italic;
  color: var(--text-dim);
}

.btn-row { display: flex; gap: 10px; margin: 14px 0; }

.btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border-radius: 14px;
  border: 1px solid var(--border-strong);
  background: var(--bg-card);
  color: var(--text);
  font-size: 15px;
  font-weight: 700;
  min-height: 48px;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.btn:active { transform: scale(0.97); }
.btn.primary { background: var(--accent-strong); border-color: var(--accent-strong); color: #fff; }
.btn.saved-state { background: rgba(167, 139, 250, 0.15); border-color: var(--accent-strong); color: var(--accent); }
.btn.danger { color: var(--red); border-color: rgba(248, 113, 113, 0.35); }
.btn.small { flex: none; min-height: 40px; font-size: 13.5px; padding: 0 14px; border-radius: 11px; }

/* ---------- Forms ---------- */
.form-field { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: var(--text-dim); }
.form-input, .form-textarea, .form-select {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 16px;
  padding: 12px 14px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}
.form-input:focus, .form-textarea:focus, .form-select:focus { border-color: var(--accent-strong); }
.form-textarea { min-height: 90px; resize: vertical; }
.form-hint { font-size: 12px; color: var(--text-faint); margin-top: 4px; }

.error-box {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: var(--red);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 14px;
  margin-bottom: 14px;
}

.success-box {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.35);
  color: var(--green);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 14px;
  margin-bottom: 14px;
}

/* ---------- States ---------- */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-dim);
}
.empty-state .empty-emoji { font-size: 44px; margin-bottom: 10px; }
.empty-state h3 { margin: 0 0 6px; color: var(--text); font-size: 17px; }
.empty-state p { margin: 0; font-size: 14px; }

.skeleton {
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.skeleton.card { height: 86px; }

.count-line { font-size: 12.5px; color: var(--text-faint); margin: 2px 0 10px; }

/* ---------- Trending page ---------- */
.verify-panel {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--text-dim);
}
.verify-panel h4 { margin: 0 0 8px; font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 6px; }
.verify-panel ul { margin: 6px 0 0; padding-left: 18px; }
.verify-panel li { margin-bottom: 4px; }
.source-ok { color: var(--green); }
.source-fail { color: var(--red); }

.evidence-line {
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--text-faint);
  border-top: 1px dashed var(--border);
  padding-top: 8px;
}
.evidence-line strong { color: var(--pink); font-weight: 700; }

/* ---------- Note ---------- */
.note-area {
  width: 100%;
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14.5px;
  padding: 12px 14px;
  min-height: 70px;
  resize: vertical;
  outline: none;
  font-family: inherit;
}
.note-area:focus { border-color: var(--amber); }

.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--text-dim); font-size: 14px; font-weight: 600;
  margin-bottom: 10px; min-height: 44px;
}

.tag-pill {
  display: inline-block;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 999px;
  margin: 0 4px 4px 0;
}

.fab {
  position: fixed;
  right: max(16px, calc(50% - 264px));
  bottom: calc(var(--tab-h) + 18px);
  width: 54px; height: 54px;
  border-radius: 18px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff;
  font-size: 26px;
  display: flex; align-items: center; justify-content: center;
  border: none;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
  z-index: 25;
  cursor: pointer;
}
.fab:active { transform: scale(0.94); }

/* ---------- Dashboard ---------- */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.stat-tile {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 4px solid var(--tile, var(--accent));
  border-radius: var(--radius);
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--text);
  transition: transform 0.1s, background 0.15s;
}
.stat-tile:active { transform: scale(0.97); background: var(--bg-card-hover); }
.stat-num { font-size: 30px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--tile, var(--text)); }
.stat-label { font-size: 12.5px; font-weight: 600; color: var(--text-dim); }

.sotd-card {
  display: block;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(236, 72, 153, 0.14));
  border: 1px solid rgba(167, 139, 250, 0.4);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  color: var(--text);
  transition: transform 0.1s;
}
.sotd-card:active { transform: scale(0.985); }
.sotd-kicker {
  font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 6px;
}
.sotd-term { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 4px; }
.sotd-def { margin: 0 0 6px; font-size: 14.5px; color: var(--text-dim); }
.sotd-example { margin: 0 0 8px; font-size: 13.5px; font-style: italic; color: var(--text-faint); }
.sotd-cta { font-size: 13px; font-weight: 700; color: var(--accent); }

/* Quiz */
.quiz-card { border-color: rgba(167, 139, 250, 0.35); }
.quiz-question { font-size: 16px; margin: 4px 0 12px; }
.quiz-options { display: flex; flex-direction: column; gap: 8px; }
.quiz-option {
  text-align: left;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  padding: 12px 14px;
  min-height: 48px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}
.quiz-option:not(:disabled):active { transform: scale(0.98); border-color: var(--accent-strong); }
.quiz-option.correct { border-color: var(--green); background: rgba(74, 222, 128, 0.12); }
.quiz-option.wrong { border-color: var(--red); background: rgba(248, 113, 113, 0.1); }
.quiz-option.faded { opacity: 0.45; }
.quiz-option:disabled { cursor: default; }

.quiz-result {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  margin-top: 12px; font-size: 14px; font-weight: 600;
}

.quiz-score { margin-top: 14px; border-top: 1px dashed var(--border); padding-top: 12px; }
.quiz-score-bar {
  height: 8px; border-radius: 999px; background: var(--bg-elev);
  border: 1px solid var(--border); overflow: hidden; margin-bottom: 8px;
}
.quiz-score-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  transition: width 0.4s ease;
}
.quiz-score-line { font-size: 13.5px; color: var(--text-dim); }
.quiz-score-line strong { color: var(--text); }
.quiz-score-blurb { color: var(--text-faint); }

/* Bar chart */
.bar-chart { display: flex; flex-direction: column; gap: 8px; }
.bar-row {
  display: grid;
  grid-template-columns: 118px 1fr 30px;
  align-items: center;
  gap: 8px;
  color: var(--text);
  min-height: 30px;
}
.bar-name { font-size: 12.5px; font-weight: 600; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-track { height: 14px; background: var(--bg-elev); border-radius: 999px; overflow: hidden; border: 1px solid var(--border); }
.bar-fill { display: block; height: 100%; border-radius: 999px; transition: width 0.5s ease; }
.bar-count { font-size: 12.5px; font-weight: 700; text-align: right; color: var(--text-dim); }

/* Difficulty strip */
.diff-strip {
  display: flex; height: 18px; border-radius: 999px; overflow: hidden;
  border: 1px solid var(--border); margin-bottom: 10px;
}
.diff-seg { display: block; height: 100%; }
.diff-legend { display: flex; flex-wrap: wrap; gap: 12px; }
.diff-key { font-size: 12.5px; color: var(--text-dim); display: inline-flex; align-items: center; gap: 5px; font-weight: 600; }
.diff-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

/* Tag cloud */
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: baseline; }
.cloud-tag { color: var(--accent); font-weight: 700; line-height: 1.3; }
.cloud-tag:nth-child(3n) { color: var(--pink); }
.cloud-tag:nth-child(3n+1) { color: var(--cyan); }

/* Fresh rows */
.fresh-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 2px; color: var(--text);
  border-bottom: 1px solid var(--border);
  min-height: 44px;
}
.fresh-row:last-child { border-bottom: none; }
.fresh-term { font-weight: 700; font-size: 15px; flex: 1; }
.fresh-age { font-size: 12px; color: var(--text-faint); }

/* ---------- Interactive glossary ---------- */
.glossary-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: stretch;
}

.dice-btn {
  flex: none;
  width: 50px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  font-size: 22px;
  cursor: pointer;
  transition: transform 0.12s, border-color 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.dice-btn:active { transform: rotate(20deg) scale(0.92); border-color: var(--accent-strong); }

.link-btn {
  background: none; border: none; padding: 0;
  color: var(--accent); font-size: 12.5px; font-weight: 700;
  cursor: pointer; font-family: inherit;
}

.letter-header {
  font-size: 14px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: 0.06em;
  margin: 18px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
  scroll-margin-top: 86px;
}

/* Expandable cards */
.x-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  scroll-margin-top: 96px;
}
.x-card.expanded { border-color: var(--accent-strong); }
.x-card.flash {
  border-color: var(--pink);
  box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.25);
  animation: flashpulse 1.6s ease;
}
@keyframes flashpulse {
  0% { box-shadow: 0 0 0 6px rgba(244, 114, 182, 0.45); }
  100% { box-shadow: 0 0 0 0 rgba(244, 114, 182, 0); }
}

.x-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  color: var(--text);
  font-family: inherit;
  text-align: left;
  padding: 13px 14px;
  min-height: 56px;
  cursor: pointer;
}
.x-card-head:active { background: var(--bg-card-hover); }

.x-card-title { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.x-card-peek {
  font-size: 12.5px;
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.x-chevron {
  color: var(--text-faint);
  font-size: 14px;
  transition: transform 0.2s;
  flex: none;
}
.x-chevron.open { transform: rotate(180deg); color: var(--accent); }

.x-card-body {
  padding: 0 16px 14px;
  animation: slidein 0.18s ease;
}
@keyframes slidein {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.x-def { margin: 0; font-size: 14.5px; }
.x-say { margin: 6px 0 0; font-size: 13px; color: var(--text-dim); font-style: italic; }
.x-actions { display: flex; gap: 8px; margin-top: 12px; }

/* A–Z rail */
.az-rail {
  position: fixed;
  right: max(2px, calc(50% - 278px));
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  z-index: 24;
  background: rgba(18, 21, 29, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 1px;
  max-height: 72vh;
  overflow-y: auto;
  scrollbar-width: none;
}
.az-rail::-webkit-scrollbar { display: none; }

.az-letter {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 10.5px;
  font-weight: 800;
  font-family: inherit;
  width: 26px;
  padding: 2.5px 0;
  cursor: pointer;
  border-radius: 999px;
  line-height: 1;
}
.az-letter:active { color: var(--accent); background: rgba(139, 92, 246, 0.25); }

/* ---------- Explore packs ---------- */
.explore-intro {
  font-size: 14px;
  color: var(--text-dim);
  margin: 2px 0 14px;
}

.pack-list { display: flex; flex-direction: column; gap: 10px; }

.pack-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 4px solid var(--pack, var(--accent));
  border-radius: var(--radius);
  padding: 14px;
  color: var(--text);
  min-height: 76px;
  transition: transform 0.1s, background 0.15s;
}
.pack-card:active { transform: scale(0.98); background: var(--bg-card-hover); }

.pack-emoji {
  font-size: 30px;
  flex: none;
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-elev);
  border-radius: 14px;
}
.pack-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pack-title { font-size: 16px; font-weight: 800; letter-spacing: -0.01em; }
.pack-blurb { font-size: 12.5px; color: var(--text-dim); }
.pack-count {
  flex: none;
  display: flex; flex-direction: column; align-items: center;
  font-size: 20px; font-weight: 800; color: var(--pack, var(--accent));
  line-height: 1.1;
}
.pack-count-label { font-size: 10px; font-weight: 600; color: var(--text-faint); }
.pack-arrow { color: var(--text-faint); font-size: 22px; flex: none; }

/* Dashboard explore teaser */
.explore-teaser {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-bottom: 12px;
  color: var(--text);
  transition: transform 0.1s;
}
.explore-teaser:active { transform: scale(0.985); }
.explore-teaser-title { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.explore-teaser-sub { font-size: 12.5px; color: var(--text-dim); margin-bottom: 10px; }
.explore-teaser-row { display: flex; gap: 8px; }
.explore-mini {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 9px 4px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-dim);
  text-align: center;
}
.explore-mini .mini-emoji { font-size: 20px; }

/* ---------- Cross-category links ---------- */
.badge.xlink { background: rgba(139, 92, 246, 0.12); color: var(--accent); font-size: 12px; }

.xlink-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  margin-top: 10px; padding-top: 10px;
  border-top: 1px dashed var(--border);
}
.xlink-label { font-size: 11px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-faint); }
.xlink-chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 12px; font-weight: 700;
  padding: 4px 10px; border-radius: 999px;
  min-height: 28px;
  transition: border-color 0.15s;
}
.xlink-chip:active { border-color: var(--accent-strong); }
.xlink-chip.here { border-color: var(--accent-strong); color: var(--accent); }

/* ---------- Safety pack ---------- */
.badge.alert { background: rgba(248, 113, 113, 0.16); color: var(--red); font-size: 12px; }

.safety-note {
  background: rgba(248, 113, 113, 0.07);
  border: 1px solid rgba(248, 113, 113, 0.4);
  border-radius: var(--radius);
  padding: 12px 14px;
  font-size: 13.5px;
  color: var(--text-dim);
  margin-bottom: 14px;
  line-height: 1.5;
}
.safety-note strong { color: var(--text); }
