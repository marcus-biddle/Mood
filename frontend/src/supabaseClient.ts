import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // replace with your Supabase project URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // replace with your anon/public key


export const supabase = createClient(supabaseUrl, supabaseAnonKey);