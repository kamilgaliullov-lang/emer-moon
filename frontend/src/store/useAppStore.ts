import { create } from 'zustand';
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
  hydrateFromStorage: () => void;
}

// Helper to safely access localStorage
const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  }
};

export const useAppStore = create<AppState>()((set, get) => ({
  currentMunId: null,
  currentMun: null,
  user: null,
  locale: 'en',
  setCurrentMun: (mun) => {
    set({ currentMun: mun, currentMunId: mun?.mun_id || null });
    // Persist to localStorage
    if (mun) {
      storage.set('mmuni-mun', { currentMunId: mun.mun_id, currentMun: mun });
    } else {
      storage.remove('mmuni-mun');
    }
  },
  setUser: (user) => set({ user }),
  setLocale: (locale) => {
    set({ locale });
    storage.set('mmuni-locale', locale);
  },
  logout: () => {
    set({ user: null, currentMunId: null, currentMun: null });
    storage.remove('mmuni-mun');
  },
  hydrateFromStorage: () => {
    const munData = storage.get('mmuni-mun');
    const locale = storage.get('mmuni-locale');
    if (munData) {
      set({ currentMunId: munData.currentMunId, currentMun: munData.currentMun });
    }
    if (locale) {
      set({ locale });
    }
  },
}));
