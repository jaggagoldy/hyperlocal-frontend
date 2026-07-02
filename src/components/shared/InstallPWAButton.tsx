'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

/**
 * Shows an "Install app" button when the browser fires beforeinstallprompt
 * (Chromium desktop + Android). Hidden once installed / in standalone mode.
 * iOS Safari has no such event — users add to home screen via the share sheet.
 */
export default function InstallPWAButton() {
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (standalone) return;
    const onPrompt = (e: any) => { e.preventDefault(); setDeferred(e); setVisible(true); };
    const onInstalled = () => { setVisible(false); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') setVisible(false);
    } catch {/* dismissed */}
    setDeferred(null);
  };

  return (
    <button
      onClick={install}
      aria-label="Install app"
      className="flex items-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold text-sm hover:bg-primary/15 active:scale-[0.97] transition-all"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install app</span>
    </button>
  );
}
