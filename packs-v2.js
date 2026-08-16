'use client';

// Saved terms + personal notes live in localStorage on this browser only.

const SAVED_KEY = 'plainslang.saved';
const NOTES_KEY = 'plainslang.notes';

// One-time migration from the pre-rebrand keys so nobody loses their saves.
const LEGACY = { saved: 'genadecoder.saved', notes: 'genadecoder.notes' };
function migrate() {
  if (typeof window === 'undefined') return;
  try {
    if (!window.localStorage.getItem(SAVED_KEY) && window.localStorage.getItem(LEGACY.saved)) {
      window.localStorage.setItem(SAVED_KEY, window.localStorage.getItem(LEGACY.saved));
      window.localStorage.removeItem(LEGACY.saved);
    }
    if (!window.localStorage.getItem(NOTES_KEY) && window.localStorage.getItem(LEGACY.notes)) {
      window.localStorage.setItem(NOTES_KEY, window.localStorage.getItem(LEGACY.notes));
      window.localStorage.removeItem(LEGACY.notes);
    }
  } catch {
    /* storage blocked — nothing to migrate */
  }
}
migrate();

function read(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — fail quietly */
  }
}

export function getSavedIds() {
  return read(SAVED_KEY, []);
}

export function isSaved(id) {
  return getSavedIds().includes(id);
}

export function toggleSaved(id) {
  const ids = getSavedIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  write(SAVED_KEY, next);
  return next.includes(id);
}

export function getNote(id) {
  const notes = read(NOTES_KEY, {});
  return notes[String(id)] || '';
}

export function setNote(id, text) {
  const notes = read(NOTES_KEY, {});
  if (text && text.trim()) notes[String(id)] = text;
  else delete notes[String(id)];
  write(NOTES_KEY, notes);
}
