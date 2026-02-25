import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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

// Create a storage that handles SSR gracefully
const createStorage = (): StateStorage => {
  // During SSR on web, use a no-op storage
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return AsyncStorage;
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
      storage: createJSONStorage(() => createStorage()),
      skipHydration: Platform.OS === 'web' && typeof window === 'undefined',
    }
  )
);
