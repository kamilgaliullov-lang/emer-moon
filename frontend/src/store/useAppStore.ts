import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Mun, AppUser } from '../utils/types';

interface AppState {
  currentMunId: string | null;
  currentMun: Mun | null;
  user: AppUser | null;
  locale: string;
  setCurrentMun: (mun: Mun | null) => void;
  setUser: (user: AppUser | null) => void;
  setLocale: (locale: string) => void;
  logout: () => void;
}

// Custom storage that safely handles SSR
const webStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Ignore storage errors
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentMunId: null,
      currentMun: null,
      user: null,
      locale: 'en',
      setCurrentMun: (mun) =>
        set({ currentMun: mun, currentMunId: mun?.mun_id || null }),
      setUser: (user) => set({ user }),
      setLocale: (locale) => set({ locale }),
      logout: () => set({ user: null, currentMunId: null, currentMun: null }),
    }),
    {
      name: 'mmuni-storage',
      storage: createJSONStorage(() => webStorage),
      partialize: (state) => ({
        currentMunId: state.currentMunId,
        currentMun: state.currentMun,
        locale: state.locale,
        // Don't persist user - will be restored from Supabase session
      }),
    }
  )
);
