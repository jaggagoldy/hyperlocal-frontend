'use client';

import { Search, MapPin, ChevronDown } from 'lucide-react';
import type { VerticalExperienceConfig } from '@/config/verticalExperience';

interface VerticalHeroProps {
  config: VerticalExperienceConfig;
  language: 'en' | 'hi';
  cityName: string;
  query: string;
  onQueryChange: (q: string) => void;
  onOpenLocation: () => void;
}

export default function VerticalHero({
  config,
  language,
  cityName,
  query,
  onQueryChange,
  onOpenLocation,
}: VerticalHeroProps) {
  const title = config.hero.title[language].replace('{city}', cityName || '');
  const subtitle = config.hero.subtitle[language];

  return (
    /* Mobile: full-bleed (no rounded corners); sm+: rounded card */
    <div className="relative overflow-hidden shadow-xl sm:rounded-3xl -mx-4 sm:mx-0">
      {/* Backdrop */}
      <img
        src={config.hero.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${config.theme.heroGradient} opacity-90`} />
      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 px-5 sm:px-10 py-8 sm:py-14 flex flex-col items-center text-center text-white">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-sm max-w-2xl leading-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-white/85 font-medium max-w-xl leading-relaxed">
          {subtitle}
        </p>

        {/* Search bar — glass on mobile, solid on desktop */}
        <div className="mt-6 w-full max-w-2xl flex items-center bg-white/90 sm:bg-white backdrop-blur-sm rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden h-12 sm:h-14">
          <button
            onClick={onOpenLocation}
            className="flex items-center gap-2 px-3 sm:px-4 h-full bg-zinc-50/80 sm:bg-zinc-50 hover:bg-zinc-100 transition-colors border-r border-zinc-200 shrink-0"
          >
            <MapPin className="w-4 h-4 shrink-0" style={{ color: config.theme.primary }} />
            <span className="text-sm font-bold text-zinc-800 truncate max-w-[80px] sm:max-w-[140px]">
              {cityName || (language === 'hi' ? 'स्थान' : 'Location')}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-400 hidden sm:block" />
          </button>
          <div className="flex-1 flex items-center h-full">
            <Search className="w-4 h-4 text-zinc-400 ml-3 sm:ml-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder={config.hero.searchPlaceholder[language]}
              className="w-full h-full px-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
