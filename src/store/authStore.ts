import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  role: string;
  context: 'customer' | 'vendor' | 'admin';
  hasCustomerProfile: boolean;
  hasVendorProfile: boolean;
  isPhoneVerified: boolean;
  name?: string;
  email?: string;
  phoneNumber?: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  activeContext: 'customer' | 'vendor' | 'admin' | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (token: string, user: User, context?: 'customer' | 'vendor' | 'admin') => void;
  updateToken: (token: string, user: User) => void; // for context switches
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      token: null,
      user: null,
      activeContext: null,
      isAuthenticated: false,
      setAuth: (token, user, context) => set({
        token,
        user,
        isAuthenticated: true,
        activeContext: context || user.context || 'customer',
      }),
      updateToken: (token, user) => set({
        token,
        user,
        activeContext: user.context,
      }),
      logout: () => set({ token: null, user: null, activeContext: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
