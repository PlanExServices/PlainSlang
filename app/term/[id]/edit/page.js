'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import TermForm from '@/components/TermForm';

export default function EditTermPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [term, setTerm] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/terms/${id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.status === 404 ? 'Term not found.' : `Server returned ${res.status}`);
        const data = await res.json();
        setTerm(data.term);
      } catch (e) {
        setError(String(e.message || e));
      }
    })();
  }, [id]);

  const handleSubmit = async (payload) => {
    setBusy(true);
    setErrors(null);
    try {
      const res = await fetch(`/api/terms/${id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || [data.error || `Server returned ${res.status}`]);
        setBusy(false);
        return;
      }
      router.push(`/term/${id}`);
    } catch (e) {
      setErrors([String(e.message || e)]);
      setBusy(false);
    }
  };

  return (
    <>
      <AppHeader subtitle="Edit term" />
      <main className="page-body">
        <Link href={`/term/${id}`} className="back-link">← Back to term</Link>
        {error && <div className="error-box" role="alert">{error}</div>}
        {errors && (
          <div className="error-box" role="alert">
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}
        {!term && !error && <div className="skeleton" style={{ height: 400 }} aria-busy="true" />}
        {term && <TermForm initial={term} submitLabel="Save changes" onSubmit={handleSubmit} busy={busy} />}
      </main>
    </>
  );
}
