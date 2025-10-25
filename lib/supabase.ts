import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ltvbirplabbbaqpucgvf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmJpcnBsYWJiYmFxcHVjZ3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzAxNTEsImV4cCI6MjA2OTA0NjE1MX0.92oi-OlnwwwTtqldQxFcuiiVlM3Qcgu1OgMAPiTWYkU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
