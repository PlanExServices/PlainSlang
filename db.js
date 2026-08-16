export const AGE_GROUPS = [
  { id: 'elementary', label: 'Elementary', short: 'K–5', emoji: '🎒' },
  { id: 'middle', label: 'Middle school', short: '6–8', emoji: '📚' },
  { id: 'high_school', label: 'High school', short: '9–12', emoji: '🎓' },
  { id: 'college', label: 'College', short: '18+', emoji: '🏛️' },
  { id: 'gen_alpha', label: 'Gen Alpha core', short: 'α', emoji: '🧃' },
  { id: 'gen_z', label: 'Gen Z core', short: 'Z', emoji: '📱' },
];

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy to decode' },
  { id: 'medium', label: 'Takes context' },
  { id: 'hard', label: 'Genuinely cryptic' },
];

export function ageGroupInfo(id) {
  return AGE_GROUPS.find((g) => g.id === id) || { id, label: id, short: '?', emoji: '❔' };
}

export function difficultyInfo(id) {
  return DIFFICULTIES.find((d) => d.id === id) || { id, label: id };
}
