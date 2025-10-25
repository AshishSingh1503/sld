import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Access Supabase environment variables from app.json safely
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Check your app.json extra config.'
  );
}

// It's a good practice to supply a storage implementation for React Native.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});