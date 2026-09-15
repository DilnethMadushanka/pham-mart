import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://qmqibmqjuofoutcjtadu.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b3UN3pV9NB2FCeAS3oAX2w_7E12LjoV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
