'use client';

import { useState } from 'react';
import { AGE_GROUPS, DIFFICULTIES } from '@/lib/constants';
import { CATEGORIES } from '@/lib/packs';

export default function TermForm({ initial, submitLabel, onSubmit, busy }) {
  const [form, setForm] = useState({
    term: initial?.term || '',
    emoji: initial?.emoji || '',
    definition: initial?.definition || '',
    example: initial?.example || '',
    notes: initial?.notes || '',
    ageGroup: initial?.ageGroup || 'middle',
    difficulty: initial?.difficulty || 'medium',
    say: initial?.say || '',
    sourceName: initial?.sourceName || '',
    sourceUrl: initial?.sourceUrl || '',
    tags: (initial?.tags || []).join(', '),
    category: initial?.category || 'teen',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label" htmlFor="f-term">Term *</label>
        <input id="f-term" className="form-input" value={form.term} onChange={set('term')} required maxLength={80} placeholder="e.g. rizz" />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div className="form-field" style={{ width: 90 }}>
          <label className="form-label" htmlFor="f-emoji">Emoji</label>
          <input id="f-emoji" className="form-input" value={form.emoji} onChange={set('emoji')} maxLength={16} placeholder="✨" />
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label className="form-label" htmlFor="f-say">How to say it</label>
          <input id="f-say" className="form-input" value={form.say} onChange={set('say')} maxLength={120} placeholder="e.g. six seven" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="f-cat">Jargon world *</label>
        <select id="f-cat" className="form-select" value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>
        <p className="form-hint">Which decoder this term belongs to.</p>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="f-def">What it means *</label>
        <textarea id="f-def" className="form-textarea" value={form.definition} onChange={set('definition')} required maxLength={2000} placeholder="Plain-English meaning a parent can use" />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="f-ex">Example</label>
        <textarea id="f-ex" className="form-textarea" style={{ minHeight: 60 }} value={form.example} onChange={set('example')} maxLength={500} placeholder="“That fit is fire.”" />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div className="form-field" style={{ flex: 1 }}>
          <label className="form-label" htmlFor="f-age">Age / grade group *</label>
          <select id="f-age" className="form-select" value={form.ageGroup} onChange={set('ageGroup')}>
            {AGE_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>{g.emoji} {g.label}</option>
            ))}
          </select>
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label className="form-label" htmlFor="f-diff">Difficulty</label>
          <select id="f-diff" className="form-select" value={form.difficulty} onChange={set('difficulty')}>
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="f-notes">Origin / notes</label>
        <textarea id="f-notes" className="form-textarea" style={{ minHeight: 60 }} value={form.notes} onChange={set('notes')} maxLength={2000} placeholder="Where you heard it, background, etc." />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="f-srcname">Source name</label>
        <input id="f-srcname" className="form-input" value={form.sourceName} onChange={set('sourceName')} maxLength={200} placeholder="e.g. My 8th grader / a published guide" />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="f-srcurl">Source URL</label>
        <input id="f-srcurl" className="form-input" type="url" value={form.sourceUrl} onChange={set('sourceUrl')} maxLength={500} placeholder="https://…" />
        <p className="form-hint">Optional, but citations keep the glossary trustworthy.</p>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="f-tags">Tags</label>
        <input id="f-tags" className="form-input" value={form.tags} onChange={set('tags')} placeholder="comma, separated, tags" />
      </div>

      <button className="btn primary" type="submit" disabled={busy} style={{ width: '100%' }}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
