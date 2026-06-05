import { create } from 'zustand';

interface SearchState {
  selectedCity: string;
  selectedCategory: string;
  searchQuery: string; // locality/pincode
  page: number;
  businessType: string;
  minRating: string;
  openNow: boolean;
  setCity: (city: string) => void;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  setFilters: (filters: { businessType?: string, minRating?: string, openNow?: boolean }) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  selectedCity: 'hisar', // Default launch city
  selectedCategory: 'electrician', // Default category
  searchQuery: '',
  page: 1,
  businessType: '',
  minRating: '',
  openNow: false,
  setCity: (city) => set({ selectedCity: city, page: 1 }),
  setCategory: (category) => set({ selectedCategory: category, page: 1 }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setPage: (page) => set({ page }),
  setFilters: (filters) => set({ ...filters, page: 1 }),
  resetFilters: () => set({ selectedCategory: '', searchQuery: '', businessType: '', minRating: '', openNow: false, page: 1 }),
}));
