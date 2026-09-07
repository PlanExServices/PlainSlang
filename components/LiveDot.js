'use client';

export default function LiveDot({ status }) {
  const label = status === 'live' ? 'Live — updates in real time'
    : status === 'connecting' ? 'Connecting to live updates…'
    : 'Live updates unavailable';
  return (
    <span className={`live-dot ${status}`} title={label} aria-label={label}>
      <span className="live-dot-core" />
      {status === 'live' ? 'LIVE' : status === 'connecting' ? '…' : 'OFF'}
    </span>
  );
}
