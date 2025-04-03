
import { createClient } from '@supabase/supabase-js';

// This should be replaced with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
