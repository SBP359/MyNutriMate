import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// This helper is used to display a warning if the credentials are not set.
// It checks if the variables exist and are not empty.
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// The app's UI will show a warning based on the isSupabaseConfigured flag.
export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);