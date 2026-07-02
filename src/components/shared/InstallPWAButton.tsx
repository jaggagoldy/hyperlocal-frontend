'use client';

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Download, X, Smartphone, Share, Plus, Check } from 'lucide-react';

/**
 * "Install app" button + guide. Clicking opens a modal that:
 *  - triggers the native install prompt when available (Chromium desktop/Android),
 *  - shows a QR code to open the site on a phone,
 *  - gives platform-specific "add to home screen" steps (incl. iOS).
 * Hidden once the app is running installed (standalone).
 */
export default function InstallPWAButton() {
  const [mounted, setMounted] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);
  const [standalone, setStandalone] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUrl(window.location.origin);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setStandalone(window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone || false);
    const onPrompt = (e: any) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setStandalone(true); setOpen(false); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!mounted || standalone) return null;

  const nativeInstall = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { const { outcome } = await deferred.userChoice; if (outcome === 'accepted') setOpen(false); } catch {}
    setDeferred(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Install app"
        className="flex items-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold text-sm hover:bg-primary/15 active:scale-[0.97] transition-all"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Install app</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white text-zinc-900 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><Smartphone className="w-4 h-4" /></span>
                <span className="font-black text-base">Install NearByBazar</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5">
              {deferred && (
                <button onClick={nativeInstall} className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 mb-5 active:scale-[0.98] transition-all">
                  <Download className="w-4 h-4" /> Install now
                </button>
              )}

              <div className="flex flex-col items-center text-center">
                <p className="text-sm font-bold text-zinc-800 mb-3">Get it on your phone</p>
                <div className="p-3 bg-white rounded-2xl border border-zinc-200">
                  <QRCode value={url || 'https://nearbybazar.in'} size={148} />
                </div>
                <p className="text-xs text-zinc-500 mt-3 max-w-[240px]">Scan with your phone camera to open NearByBazar, then add it to your home screen.</p>
              </div>

              <div className="mt-5 rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                  {isIOS ? 'On iPhone / iPad' : 'On your phone'}
                </p>
                {isIOS ? (
                  <ol className="text-[13px] text-zinc-700 space-y-1.5">
                    <li className="flex items-center gap-2"><Share className="w-4 h-4 text-emerald-600 shrink-0" /> Tap the Share button</li>
                    <li className="flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-600 shrink-0" /> Choose “Add to Home Screen”</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Open it like a normal app</li>
                  </ol>
                ) : (
                  <ol className="text-[13px] text-zinc-700 space-y-1.5">
                    <li className="flex items-center gap-2"><Download className="w-4 h-4 text-emerald-600 shrink-0" /> Tap “Install” when prompted</li>
                    <li className="flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-600 shrink-0" /> Or browser menu → “Add to Home screen”</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Launch from your home screen</li>
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
