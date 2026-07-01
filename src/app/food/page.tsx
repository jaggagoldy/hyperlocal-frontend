'use client';

import { Suspense } from 'react';
import VerticalExperience from '@/components/vertical/VerticalExperience';
import { getVerticalExperience } from '@/config/verticalExperience';

// Search-driven page (the engine reads the shared search store + URL) — render on
// demand, not statically prerendered.
export const dynamic = 'force-dynamic';

const FOOD_CONFIG = getVerticalExperience('food-beverage')!;

export default function FoodPage() {
  return (
    <Suspense fallback={null}>
      <VerticalExperience config={FOOD_CONFIG} />
    </Suspense>
  );
}
