'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import TermBrowser from '@/components/TermBrowser';

function GlossaryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <>
      <AppHeader subtitle="Teen & Gen Alpha slang, decoded and cited" />
      <main className="page-body" style={{ paddingRight: 34 }}>
        <TermBrowser
          category="teen"
          showAgeChips
          showTrendingToggle
          initialAge={searchParams.get('age') || ''}
          initialTrending={searchParams.get('trending') === '1'}
          searchPlaceholder="Type to filter instantly… try “rizz”"
        />
      </main>
      <button className="fab" onClick={() => router.push('/add')} aria-label="Add a new term">＋</button>
    </>
  );
}

export default function GlossaryPage() {
  return (
    <Suspense
      fallback={
        <>
          <AppHeader subtitle="Loading the decoder…" />
          <main className="page-body" aria-busy="true">
            <div className="card-list">
              {[...Array(7)].map((_, i) => <div key={i} className="skeleton card" />)}
            </div>
          </main>
        </>
      }
    >
      <GlossaryInner />
    </Suspense>
  );
}
