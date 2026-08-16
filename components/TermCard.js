'use client';

import Link from 'next/link';
import { ageGroupInfo } from '@/lib/constants';

export default function TermCard({ term }) {
  const age = ageGroupInfo(term.ageGroup);
  return (
    <Link href={`/term/${term.id}`} className="term-card" aria-label={`${term.term}: ${term.definition}`}>
      <div className="term-card-top">
        <span className="term-emoji" aria-hidden="true">{term.emoji || '💬'}</span>
        <span className="term-name">{term.term}</span>
        {term.isWoty && <span className="badge woty">WOTY</span>}
        {term.trending && !term.isWoty && <span className="badge trend">🔥 Trending</span>}
        {!term.isSeed && <span className="badge custom">Yours</span>}
        <span className="badge age">{age.emoji} {age.short}</span>
      </div>
      <p className="term-def">{term.definition}</p>
    </Link>
  );
}
