import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  
  // Only use AsyncStorage on native platforms, not during SSR
  const storage = Platform.OS === 'web' && typeof window === 'undefined' 
    ? undefined 
    : AsyncStorage;
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: Platform.OS !== 'web' || typeof window !== 'undefined',
      detectSessionInUrl: false,
    },
  });
  
  return supabaseInstance;
}

export const supabase = createSupabaseClient();
