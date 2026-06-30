'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { VerticalExperienceConfig } from '@/config/verticalExperience';

interface QuickFilterChipsProps {
  config: VerticalExperienceConfig;
  language: 'en' | 'hi';
  active: string | null;
  onToggle: (id: string | null) => void;
  onOpenFilters?: () => void;
}

export default function QuickFilterChips({
  config,
  language,
  active,
  onToggle,
  onOpenFilters,
}: QuickFilterChipsProps) {
  if (!config.quickFilters.length) return null;

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
      {config.quickFilters.map((chip) => {
        const isActive = active === chip.id;
        return (
          <button
            key={chip.id}
            onClick={() => onToggle(isActive ? null : chip.id)}
            className={`shrink-0 inline-flex items-center gap-2 h-10 sm:h-12 px-4 sm:px-5 rounded-full border text-sm font-bold transition-all duration-150 active:scale-[0.98] ${
              isActive
                ? config.theme.chipActive
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
            }`}
          >
            {chip.emoji && <span className="text-base sm:text-lg leading-none">{chip.emoji}</span>}
            <span className="whitespace-nowrap">{chip.label[language]}</span>
          </button>
        );
      })}

      {onOpenFilters && (
        <button
          onClick={onOpenFilters}
          className="shrink-0 inline-flex items-center gap-2 h-10 sm:h-12 px-4 sm:px-5 rounded-full border border-zinc-300 bg-white text-zinc-700 text-sm font-bold hover:bg-zinc-50 active:scale-[0.98] transition-all duration-150"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="whitespace-nowrap">{language === 'hi' ? 'फ़िल्टर' : 'Filters'}</span>
        </button>
      )}
    </div>
  );
}
