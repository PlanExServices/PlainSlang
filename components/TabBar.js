'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home', icon: '🏠', match: (p) => p === '/' },
  { href: '/glossary', label: 'Glossary', icon: '📖', match: (p) => p.startsWith('/glossary') || p.startsWith('/term') },
  { href: '/explore', label: 'Explore', icon: '🧭', match: (p) => p.startsWith('/explore') },
  { href: '/trending', label: 'Trending', icon: '🔥', match: (p) => p.startsWith('/trending') },
  { href: '/saved', label: 'Saved', icon: '🔖', match: (p) => p.startsWith('/saved') || p.startsWith('/add') },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tab-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
