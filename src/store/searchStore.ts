import { create } from 'zustand';

interface SearchState {
  selectedCity: string;
  selectedCategory: string;
  searchQuery: string; // locality/pincode
  page: number;
  setCity: (city: string) => void;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  selectedCity: 'dadri', // Default launch city
  selectedCategory: 'electrician', // Default category
  searchQuery: '',
  page: 1,
  setCity: (city) => set({ selectedCity: city, page: 1 }),
  setCategory: (category) => set({ selectedCategory: category, page: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ selectedCategory: '', searchQuery: '', page: 1 }),
}));
