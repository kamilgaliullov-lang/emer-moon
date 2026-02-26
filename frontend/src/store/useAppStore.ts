import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Mun, AppUser } from '../utils/types';

interface AppState {
  currentMunId: string | null;
  currentMun: Mun | null;
  user: AppUser | null;
  locale: string;
  _hasHydrated: boolean;
  setCurrentMun: (mun: Mun | null) => void;
  setUser: (user: AppUser | null) => void;
  setLocale: (locale: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

// Custom storage that safely handles SSR
const webStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentMunId: null,
      currentMun: null,
      user: null,
      locale: 'en',
      _hasHydrated: false,
      setCurrentMun: (mun) =>
        set({ currentMun: mun, currentMunId: mun?.mun_id || null }),
      setUser: (user) => set({ user }),
      setLocale: (locale) => set({ locale }),
      logout: () => set({ user: null, currentMunId: null, currentMun: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'mmuni-storage',
      storage: createJSONStorage(() => webStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        currentMunId: state.currentMunId,
        currentMun: state.currentMun,
        locale: state.locale,
        // Don't persist user - will be restored from Supabase session
      }),
    }
  )
);
