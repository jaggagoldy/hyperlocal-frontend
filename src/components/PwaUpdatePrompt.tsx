'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Phase F PWA hardening — "new version available → reload" prompt.
 *
 * The service worker installs with skipWaiting:false, so a fresh build becomes the
 * *waiting* worker instead of silently taking over. Serwist's auto-registration
 * exposes the window instance as `window.serwist`; we listen for its `waiting`
 * event, surface a non-blocking banner, and only activate the new worker
 * (messageSkipWaiting → SKIP_WAITING) when the user clicks Reload. We reload on
 * `controlling` so the page swaps to the new assets cleanly.
 */
export default function PwaUpdatePrompt() {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let cancelled = false;
    // window.serwist is created asynchronously by Serwist's injected registration
    // script; poll briefly until it exists, then attach lifecycle listeners.
    const attach = () => {
      const sw = (window as any).serwist;
      if (!sw || cancelled) return false;
      sw.addEventListener('waiting', () => setShowReload(true));
      sw.addEventListener('controlling', () => window.location.reload());
      return true;
    };

    if (!attach()) {
      const id = setInterval(() => {
        if (attach() || cancelled) clearInterval(id);
      }, 1000);
      // give up after ~20s; nothing breaks if the SW never registers
      const timeout = setTimeout(() => clearInterval(id), 20000);
      return () => {
        cancelled = true;
        clearInterval(id);
        clearTimeout(timeout);
      };
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = () => {
    const sw = (window as any).serwist;
    if (sw?.messageSkipWaiting) {
      sw.messageSkipWaiting(); // SW skips waiting → 'controlling' fires → reload above
    } else {
      window.location.reload();
    }
  };

  if (!showReload) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-md p-3 sm:bottom-4">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-3 shadow-2xl shadow-emerald-900/20">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <RefreshCw className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-zinc-900">A new version is available</p>
          <p className="truncate text-xs font-medium text-zinc-500">Reload to get the latest NearByBazar.</p>
        </div>
        <button onClick={reload} className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">
          Reload
        </button>
        <button onClick={() => setShowReload(false)} aria-label="Dismiss" className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
