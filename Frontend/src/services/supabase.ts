import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get the environment variables from Expo Constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Debug logging for development
if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl);
  // Don't log the full key for security
  console.log('Supabase Key set:', !!supabaseKey);
}