import Link from 'next/link';
import TipJar from '@/components/TipJar';

export default function AppHeader({ subtitle }) {
  return (
    <header className="app-header">
      <h1 className="app-title">
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit' }}>
          <span className="logo-badge" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-64.png" alt="" width={30} height={30} />
          </span>
          PlainSlang
        </Link>
      </h1>
      <p className="app-subtitle">{subtitle || 'Know what your kids mean.'}</p>
      <TipJar />
    </header>
  );
}
