import { create } from 'zustand';

export interface DebugErrorDetails {
  url?: string;
  method?: string;
  status?: number;
  statusText?: string;
  message?: string;
  whyItHappened?: string;
  rawResponse?: any;
  requestPayload?: any;
  type?: 'api' | 'runtime' | 'promise';
  stack?: string;
}

interface ErrorState {
  activeError: DebugErrorDetails | null;
  setError: (error: DebugErrorDetails | null) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  activeError: null,
  setError: (error) => set({ activeError: error }),
  clearError: () => set({ activeError: null }),
}));
