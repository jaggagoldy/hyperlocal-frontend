'use client';

import { useEffect, useState } from 'react';

/**
 * PWA kill-switch — emergency recovery route.
 *
 * If a bad service worker ever ships and clients are stuck on a broken cached
 * shell, sending users to /sw-reset unregisters every service worker and clears
 * all caches, then bounces them home with a clean, un-serviced load. This is the
 * documented escape hatch the Phase F PWA hardening promises.
 */
export default function SwResetPage() {
  const [status, setStatus] = useState<'working' | 'done' | 'unsupported'>('working');

  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        setStatus('unsupported');
        return;
      }
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if (typeof caches !== 'undefined') {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        /* best-effort */
      }
      setStatus('done');
    };
    run();
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-black text-zinc-900">Resetting the app</h1>
      {status === 'working' && <p className="font-medium text-zinc-500">Clearing the service worker &amp; caches…</p>}
      {status === 'unsupported' && (
        <p className="font-medium text-zinc-500">No service worker support in this browser — nothing to reset.</p>
      )}
      {status === 'done' && (
        <>
          <p className="font-medium text-emerald-700">Done. The service worker and caches were cleared.</p>
          <a
            href="/"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Reload NearByBazar
          </a>
        </>
      )}
    </div>
  );
}
