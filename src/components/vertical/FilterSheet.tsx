'use client';

import { Check, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

export interface FilterState {
  minRating: string;
  openNow: boolean;
  verifiedOnly: boolean;
}

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  language?: 'en' | 'hi';
}

const RATINGS = [
  { label: 'Any', value: '' },
  { label: '3.5+', value: '3.5' },
  { label: '4.0+', value: '4.0' },
  { label: '4.5+', value: '4.5' },
];

export default function FilterSheet({ open, onClose, filters, onApply, language = 'en' }: FilterSheetProps) {
  const hi = language === 'hi';

  const toggle = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const next = { ...filters, [key]: value };
    onApply(next);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[70vh] pb-safe">
        <DrawerHeader className="border-b border-zinc-100 pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-black text-zinc-900">
              {hi ? 'फ़िल्टर' : 'Filters'}
            </DrawerTitle>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {/* Rating */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wide">
              {hi ? 'रेटिंग' : 'Rating'}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {RATINGS.map(r => (
                <button
                  key={r.value}
                  onClick={() => toggle('minRating', r.value)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all active:scale-[0.98] ${
                    filters.minRating === r.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {filters.minRating === r.value && <Check className="w-3.5 h-3.5" />}
                  {r.label === 'Any' ? (hi ? 'कोई भी' : 'Any') : r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Open Now */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-black text-zinc-800">{hi ? 'अभी खुले' : 'Open Now'}</p>
              <p className="text-xs text-zinc-500">{hi ? 'केवल खुले हुए व्यवसाय' : 'Currently accepting customers'}</p>
            </div>
            <button
              onClick={() => toggle('openNow', !filters.openNow)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${filters.openNow ? 'bg-emerald-500' : 'bg-zinc-200'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${filters.openNow ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Verified Only */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-black text-zinc-800">{hi ? 'सत्यापित' : 'Verified Only'}</p>
              <p className="text-xs text-zinc-500">{hi ? 'NearByBazar सत्यापित व्यवसाय' : 'NearByBazar verified businesses'}</p>
            </div>
            <button
              onClick={() => toggle('verifiedOnly', !filters.verifiedOnly)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${filters.verifiedOnly ? 'bg-emerald-500' : 'bg-zinc-200'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${filters.verifiedOnly ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 pb-safe">
          <button
            onClick={() => { onApply({ minRating: '', openNow: false, verifiedOnly: false }); onClose(); }}
            className="w-full py-3 rounded-2xl text-sm font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 active:scale-[0.98] transition"
          >
            {hi ? 'सभी साफ़ करें' : 'Clear All'}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
