'use client';

import { useEffect, useRef } from 'react';
import { BadgePercent, ShieldCheck, CalendarCheck, IndianRupee } from 'lucide-react';
import { Listing } from '@/lib/directory';
import type { VerticalExperienceConfig } from '@/config/verticalExperience';

interface DealsStripProps {
  config: VerticalExperienceConfig;
  items: Listing[];
  language: 'en' | 'hi';
}

export default function DealsStrip({ config, items, language }: DealsStripProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const deals: { business: string; label: string }[] = [];
  for (const l of items) {
    const offers = (l as any).metaData?.offers;
    if (Array.isArray(offers) && offers.length) {
      const first = offers[0];
      deals.push({
        business: l.businessName,
        label: typeof first === 'string' ? first : first?.title || first?.label || 'Special offer',
      });
    }
    if (deals.length >= 8) break;
  }

  // Auto-scroll on mobile when ≥4 deals exist
  useEffect(() => {
    if (deals.length < 4 || !scrollerRef.current) return;
    const el = scrollerRef.current;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 180, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [deals.length]);

  if (deals.length > 0) {
    return (
      <div
        ref={scrollerRef}
        className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {deals.map((d, i) => (
          <div
            key={i}
            className="shrink-0 inline-flex items-center gap-2 h-10 sm:h-12 px-4 sm:px-5 rounded-full bg-white border border-zinc-200 shadow-sm"
          >
            <BadgePercent className="w-4 h-4 shrink-0" style={{ color: config.theme.primary }} />
            <span className="text-xs sm:text-sm font-extrabold text-zinc-900 truncate max-w-[180px] sm:max-w-[200px]">
              {d.label}
            </span>
            <span className="text-xs text-zinc-400 font-medium truncate max-w-[120px] hidden sm:inline">
              · {d.business}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const benefits = [
    { icon: ShieldCheck, en: 'Verified partners', hi: 'सत्यापित पार्टनर' },
    { icon: CalendarCheck, en: 'Free booking', hi: 'मुफ़्त बुकिंग' },
    { icon: IndianRupee, en: 'Zero commission', hi: 'शून्य कमीशन' },
  ];

  return (
    <div className="flex flex-wrap gap-2.5">
      {benefits.map((b, i) => {
        const Icon = b.icon;
        return (
          <div
            key={i}
            className="inline-flex items-center gap-2 h-10 sm:h-12 px-4 sm:px-5 rounded-full bg-white border border-zinc-200 shadow-sm"
          >
            <Icon className="w-4 h-4 shrink-0" style={{ color: config.theme.primary }} />
            <span className="text-xs sm:text-sm font-bold text-zinc-700">
              {language === 'hi' ? b.hi : b.en}
            </span>
          </div>
        );
      })}
    </div>
  );
}
