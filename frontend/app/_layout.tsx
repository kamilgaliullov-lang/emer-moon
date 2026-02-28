import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { SheetProvider } from '../src/components/SheetProvider';
import { useAppStore } from '../src/store/useAppStore';
import { supabase } from '../src/services/supabase';
import '../src/services/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const setUser = useAppStore((s) => s.setUser);
  const setCurrentMun = useAppStore((s) => s.setCurrentMun);
  const hydrateFromStorage = useAppStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    // Hydrate municipality selection from localStorage
    hydrateFromStorage();
    
    // Handle Supabase auth session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('user')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setUser(data);
          if (data.user_mun) {
            const { data: munData } = await supabase
              .from('mun')
              .select('*')
              .eq('mun_id', data.user_mun)
              .single();
            if (munData) setCurrentMun(munData);
          }
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data } = await supabase
          .from('user')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (data) {
          setUser(data);
          if (data.user_mun) {
            const { data: munData } = await supabase
              .from('mun')
              .select('*')
              .eq('mun_id', data.user_mun)
              .single();
            if (munData) setCurrentMun(munData);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentMun(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <SheetProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </SheetProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
