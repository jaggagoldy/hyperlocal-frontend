export type ThemeFlavor = 'trust-utility' | 'vibrant-local' | 'premium-wellness' | 'eco-fresh';

export interface ThemeConfig {
  id: ThemeFlavor;
  name: string;
  isPro: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    headerGradient: string;
    badge: string;
    button: string;
  };
}

export const THEME_FLAVORS: Record<ThemeFlavor, ThemeConfig> = {
  'trust-utility': {
    id: 'trust-utility',
    name: 'Trust Utility (Blue/Slate)',
    isPro: false,
    colors: {
      primary: 'text-blue-600 dark:text-blue-400',
      secondary: 'text-slate-500 dark:text-slate-400',
      background: 'bg-slate-50 dark:bg-slate-900',
      headerGradient: 'from-blue-50 to-slate-100 dark:from-blue-950/40 dark:to-slate-900',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none',
    }
  },
  'vibrant-local': {
    id: 'vibrant-local',
    name: 'Vibrant Local (Orange/Coral)',
    isPro: false,
    colors: {
      primary: 'text-orange-600 dark:text-orange-400',
      secondary: 'text-stone-500 dark:text-stone-400',
      background: 'bg-orange-50/30 dark:bg-orange-950/10',
      headerGradient: 'from-orange-50 to-rose-50 dark:from-orange-950/40 dark:to-rose-950/40',
      badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      button: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200 dark:shadow-none',
    }
  },
  'premium-wellness': {
    id: 'premium-wellness',
    name: 'Premium Wellness (Zinc/Gold)',
    isPro: true,
    colors: {
      primary: 'text-amber-600 dark:text-amber-400',
      secondary: 'text-zinc-500 dark:text-zinc-400',
      background: 'bg-zinc-50 dark:bg-zinc-900',
      headerGradient: 'from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      button: 'bg-zinc-900 hover:bg-black text-amber-400 dark:bg-zinc-100 dark:hover:bg-white dark:text-amber-600 shadow-zinc-300 dark:shadow-none',
    }
  },
  'eco-fresh': {
    id: 'eco-fresh',
    name: 'Eco Fresh (Emerald/Teal)',
    isPro: true,
    colors: {
      primary: 'text-emerald-600 dark:text-emerald-400',
      secondary: 'text-teal-600 dark:text-teal-400',
      background: 'bg-emerald-50/20 dark:bg-emerald-950/10',
      headerGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none',
    }
  }
};
