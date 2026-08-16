'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import TermForm from '@/components/TermForm';

export default function AddTermPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = async (payload) => {
    setBusy(true);
    setErrors(null);
    try {
      const res = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || [data.error || `Server returned ${res.status}`]);
        setBusy(false);
        return;
      }
      router.push(`/term/${data.term.id}`);
    } catch (e) {
      setErrors([String(e.message || e)]);
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader subtitle="Add a term you’ve heard in the wild" />
      <main className="page-body">
        {errors && (
          <div className="error-box" role="alert">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}
        <TermForm submitLabel="Add to glossary" onSubmit={handleSubmit} busy={busy} />
      </main>
    </>
  );
}
