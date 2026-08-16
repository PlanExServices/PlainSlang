import Link from 'next/link';

export default function AppHeader({ subtitle }) {
  return (
    <header className="app-header">
      <h1 className="app-title">
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit' }}>
          <span className="logo-badge" aria-hidden="true">💬</span>
          PlainSlang
        </Link>
      </h1>
      <p className="app-subtitle">{subtitle || 'Know what your kids mean.'}</p>
    </header>
  );
}
