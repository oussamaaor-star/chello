import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Chello] Supabase non configuré (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants). ' +
    'Le site tourne en mode catalogue local tant que ce n\'est pas renseigné dans .env.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key'
);
