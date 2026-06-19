// Cliente Supabase do frontend (painel admin) — anon key, protegido por RLS.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anon);

// Cria o cliente mesmo sem config (com valores fictícios) para a app não
// rebentar no import; as páginas mostram um aviso quando isConfigured é falso.
export const supabase = createClient(url || 'http://localhost', anon || 'anon');
