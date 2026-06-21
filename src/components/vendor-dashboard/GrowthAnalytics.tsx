'use client';

import { CheckCircle2, Circle, BadgeCheck, TrendingUp, Eye, Users } from 'lucide-react';
import { ListingTier, tierBadge } from '@/lib/directory';
import TierUpsell from './TierUpsell';

export interface Completeness {
  percent: number;
  completed: number;
  total: number;
  items: { key: string; label: string; done: boolean }[];
}

export interface Funnel {
  isClaimed: boolean;
  source: string;
  listingTier: ListingTier | null;
  upgradeableTo: ListingTier[];
}

interface Last30 {
  profileViews: number;
  leads: number;
}

/**
 * Phase F5 vendor growth panel: profile-completeness checklist, a 30-day activity
 * snapshot, and the claim/upgrade funnel (reuses TierUpsell → PATCH /business/:id/tier).
 */
export default function GrowthAnalytics({
  completeness,
  funnel,
  businessId,
  businessType,
  last30Days,
  onUpgraded,
}: {
  completeness?: Completeness;
  funnel?: Funnel;
  businessId: string;
  businessType: string;
  last30Days?: Last30;
  onUpgraded?: (tier: ListingTier) => void;
}) {
  const pct = completeness?.percent ?? 0;
  const badge = tierBadge(funnel?.listingTier ?? null);
  const canUpgrade = (funnel?.upgradeableTo?.length ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* ─── Profile completeness ─── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="flex items-start gap-5">
          {/* Percent ring */}
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-100" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                className="text-emerald-500"
                strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-zinc-900">{pct}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">complete</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-black text-zinc-900">Complete your profile</h3>
            <p className="mb-3 text-xs font-medium text-zinc-500">
              A complete profile ranks higher and wins more leads.
            </p>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {completeness?.items.map((it) => (
                <li key={it.key} className={`flex items-center gap-1.5 text-xs font-semibold ${it.done ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {it.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
                  )}
                  <span className={it.done ? 'line-through' : ''}>{it.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 30-day snapshot */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Eye className="h-4 w-4" /></span>
            <div>
              <p className="text-lg font-black leading-none text-zinc-900">{last30Days?.profileViews ?? 0}</p>
              <p className="text-[11px] font-bold text-zinc-400">views · 30 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Users className="h-4 w-4" /></span>
            <div>
              <p className="text-lg font-black leading-none text-zinc-900">{last30Days?.leads ?? 0}</p>
              <p className="text-[11px] font-bold text-zinc-400">leads · 30 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Claim & upgrade funnel ─── */}
      <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="font-black text-zinc-900">Your listing</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge.cls}`}>{badge.label}</span>
          {funnel?.isClaimed ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" /> Claimed
            </span>
          ) : (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Unclaimed</span>
          )}
        </div>

        {canUpgrade ? (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-zinc-700">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Ready to grow?
            </p>
            <p className="mb-3 text-xs font-medium text-zinc-500">
              Activate a storefront or your own ordering app to take bookings &amp; orders online.
            </p>
            <TierUpsell
              businessId={businessId}
              businessType={businessType}
              listingTier={funnel?.listingTier ?? null}
              onUpgraded={onUpgraded}
            />
          </div>
        ) : (
          <p className="mt-4 text-xs font-medium text-zinc-500">
            You&apos;re on the highest tier for your category — your storefront &amp; ordering app are live.
          </p>
        )}
      </div>
    </div>
  );
}
