/**
 * Lightweight consumer-interaction logging (Phase G5).
 *
 * Fires the backend click-engine endpoint (POST /analytics/interaction) so the
 * vendor F5 dashboard actually has profile_view / call_click / whatsapp_click data
 * to show. Uses sendBeacon when available (survives the page unload that a
 * tel:/wa.me/maps navigation triggers), falling back to keepalive fetch.
 */
import { API_BASE } from './directory';

export type InteractionType =
  | 'profile_view'
  | 'call_click'
  | 'whatsapp_click'
  | 'directions_click';

export function logInteraction(
  businessProfileId: string | undefined | null,
  type: InteractionType,
  metadata?: Record<string, unknown>,
) {
  if (!businessProfileId || typeof window === 'undefined') return;
  try {
    const url = `${API_BASE}/analytics/interaction`;
    const body = JSON.stringify({ businessProfileId, type, metadata });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* never block navigation on analytics */
  }
}

/** Map a directory CTA label to its interaction type (null = not a tracked lead). */
export function ctaInteractionType(label: string): InteractionType | null {
  switch (label) {
    case 'Call':
      return 'call_click';
    case 'WhatsApp':
      return 'whatsapp_click';
    case 'Directions':
      return 'directions_click';
    default:
      return null; // Order/Book navigate to the storefront, which logs profile_view itself
  }
}
