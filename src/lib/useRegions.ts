import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export type District = { name: string; slug: string; state: string };
export type RegionState = { name: string; districts: District[] };

// Module-level cache: the region registry is static config served cached by the
// backend, so fetch it once per page load and share across components.
let cache: RegionState[] | null = null;

/** Returns the canonical PB+HR states + districts ([] until loaded). */
export function useRegions(): RegionState[] {
  const [states, setStates] = useState<RegionState[]>(cache || []);

  useEffect(() => {
    if (cache) return;
    apiClient
      .get('/regions')
      .then((res) => {
        cache = res.data?.data?.states || [];
        setStates(cache!);
      })
      .catch(console.error);
  }, []);

  return states;
}

/** Districts for a given state name, or [] if the state isn't loaded/known. */
export function districtsForState(states: RegionState[], stateName: string): District[] {
  return states.find((s) => s.name === stateName)?.districts || [];
}
