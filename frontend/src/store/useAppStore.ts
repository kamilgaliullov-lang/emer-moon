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
}

export const useAppStore = create<AppState>()((set) => ({
  currentMunId: null,
  currentMun: null,
  user: null,
  locale: 'en',
  setCurrentMun: (mun) => {
    console.log('setCurrentMun called with:', mun?.mun_name, mun?.mun_id);
    set({ currentMun: mun, currentMunId: mun?.mun_id || null });
  },
  setUser: (user) => set({ user }),
  setLocale: (locale) => set({ locale }),
  logout: () => set({ user: null, currentMunId: null, currentMun: null }),
}));
