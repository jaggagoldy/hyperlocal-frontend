import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '@/types/models';

interface SavedProsState {
  savedPros: CatalogItem[];
  savePro: (item: CatalogItem) => void;
  removePro: (itemId: string) => void;
  isSaved: (itemId: string) => boolean;
}

export const useSavedProsStore = create<SavedProsState>()(
  persist(
    (set, get) => ({
      savedPros: [],
      savePro: (item) => set((state) => {
        if (!state.savedPros.find(p => p.id === item.id)) {
          return { savedPros: [...state.savedPros, item] };
        }
        return state;
      }),
      removePro: (itemId) => set((state) => ({
        savedPros: state.savedPros.filter((p) => p.id !== itemId)
      })),
      isSaved: (itemId) => get().savedPros.some((p) => p.id === itemId),
    }),
    {
      name: 'saved-pros-storage',
    }
  )
);
