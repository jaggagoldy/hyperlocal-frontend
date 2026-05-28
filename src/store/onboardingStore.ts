import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasOnboarded: boolean;
  markOnboarded: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      markOnboarded: () => set({ hasOnboarded: true }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
