'use client';

import { useEffect, useState } from 'react';

/**
 * Small floating indicator that appears ONLY when the backend is connected to a
 * LOCAL dev database (test data). In production the backend reports dbMode
 * 'remote', so this renders nothing and never ships a badge to real users.
 */
export default function DbModeBadge() {
  const [mode, setMode] = useState<'local' | 'remote' | null>(null);
  const [host, setHost] = useState<string>('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    const controller = new AbortController();
    fetch(`${base}/meta`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.dbMode) {
          setMode(d.dbMode);
          setHost(d.dbHost || '');
        }
      })
      .catch(() => {/* backend down / no meta route — show nothing */});
    return () => controller.abort();
  }, []);

  if (mode !== 'local' || dismissed) return null;

  return (
    <div className="fixed left-3 bottom-20 md:bottom-4 z-[60] flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/90 backdrop-blur px-3 py-1.5 shadow-lg shadow-black/30 select-none">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-70 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
      <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">Local DB</span>
      <span className="hidden sm:inline text-[10px] font-semibold text-amber-400/60">{host}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="ml-0.5 text-amber-400/60 hover:text-amber-200 text-xs leading-none"
      >
        ✕
      </button>
    </div>
  );
}
