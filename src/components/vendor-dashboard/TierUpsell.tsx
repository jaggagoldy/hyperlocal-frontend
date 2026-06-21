'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { ListingTier, getUpgradeOptions, tierUpsellCopy, tierBadge } from '@/lib/directory';

/**
 * Phase F5 upsell: shows a listing's current tier and, when the vertical allows it,
 * an "Activate your storefront / your own app" CTA that calls PATCH /business/:id/tier.
 * Rendered inside the dashboard business card; stops click propagation so it doesn't
 * also launch the workspace.
 */
export default function TierUpsell({
  businessId,
  businessType,
  listingTier,
  onUpgraded,
}: {
  businessId: string;
  businessType: string;
  listingTier: ListingTier | null;
  onUpgraded?: (tier: ListingTier) => void;
}) {
  const [loading, setLoading] = useState(false);
  const options = getUpgradeOptions(businessType, listingTier);
  const target = options[0]; // the headline upgrade (e.g. COMMERCE for retail)
  const badge = tierBadge(listingTier);

  const upgrade = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!target) return;
    setLoading(true);
    try {
      await apiClient.patch(`/business/${businessId}/tier`, { listingTier: target });
      toast.success(`${tierUpsellCopy(target).cta} — activated!`);
      onUpgraded?.(target);
    } catch {
      /* api-client surfaces the error toast */
    } finally {
      setLoading(false);
    }
  };

  if (!target) {
    return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge.cls}`}>{badge.label}</span>;
  }

  const copy = tierUpsellCopy(target);
  return (
    <button
      onClick={upgrade}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-60"
      title={copy.title}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {copy.cta}
    </button>
  );
}
