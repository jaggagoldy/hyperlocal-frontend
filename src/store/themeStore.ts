import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'vibrant';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          if (theme === 'vibrant') {
            root.classList.add('vibrant');
          } else {
            root.classList.remove('vibrant');
          }
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
