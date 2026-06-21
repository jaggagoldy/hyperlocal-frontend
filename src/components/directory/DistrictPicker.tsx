'use client';

import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import type { RegionState } from '@/lib/directory';

/**
 * District selector for the directory hub. Navigates to /directory?district=<slug>
 * so the (server-rendered) hub re-renders its category links for the chosen district.
 */
export default function DistrictPicker({ states, value }: { states: RegionState[]; value: string }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
      <span className="text-sm font-semibold text-zinc-500">District</span>
      <select
        value={value}
        onChange={(e) => router.push(`/directory?district=${e.target.value}`)}
        className="flex-1 bg-transparent text-sm font-bold text-zinc-900 outline-none"
      >
        {states.map((s) => (
          <optgroup key={s.name} label={s.name}>
            {s.districts.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
