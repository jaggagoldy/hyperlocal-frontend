'use client';

import { Phone } from 'lucide-react';
import { Cta } from '@/lib/directory';
import { logInteraction, ctaInteractionType } from '@/lib/analytics';

/**
 * Client-side render of a listing's tier-aware CTAs (Phase G5). Identical markup to
 * the previous inline server version, but logs the interaction (call_click /
 * whatsapp_click / directions_click) before the tel:/wa.me/maps navigation so the
 * vendor F5 dashboard gets real lead data.
 */
export default function ListingCtas({ ctas, businessProfileId }: { ctas: Cta[]; businessProfileId: string }) {
  if (ctas.length === 0) {
    return <span className="flex-1 text-center text-xs font-semibold text-zinc-400 py-2">Details coming soon</span>;
  }
  return (
    <>
      {ctas.slice(0, 3).map((c) => {
        const isExternal = c.href.startsWith('http');
        const type = ctaInteractionType(c.label);
        return (
          <a
            key={c.label}
            href={c.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            onClick={() => type && logInteraction(businessProfileId, type)}
            className={
              c.kind === 'primary'
                ? 'flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors'
                : 'flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors'
            }
          >
            {c.label === 'Call' && <Phone className="h-3.5 w-3.5" />}
            {c.label}
          </a>
        );
      })}
    </>
  );
}
