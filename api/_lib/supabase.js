// Cliente Supabase server-side com a SERVICE_ROLE (ignora RLS).
// SÓ é importado por funções dentro de /api — nunca pelo frontend.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // Não deita o processo abaixo no import; cada handler valida e responde 500
  // com uma mensagem clara (ver assertConfig).
  console.warn('[kyvo] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em falta.');
}

export const supabaseAdmin = createClient(url || 'http://invalid.local', serviceKey || 'invalid', {
  auth: { persistSession: false, autoRefreshToken: false },
});

export function assertConfig() {
  // A chave OpenAI já NÃO é obrigatória aqui: cada cliente traz a sua (BYO key)
  // e há fallback opcional à da plataforma. O chat valida a chave efetiva.
  const missing = [];
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
}

// Cliente "como utilizador": valida o JWT do painel e respeita o RLS.
// Usado nas rotas admin para garantir que cada um só mexe no que é seu.
export function supabaseAsUser(accessToken) {
  return createClient(url || 'http://invalid.local', process.env.SUPABASE_ANON_KEY || serviceKey || 'invalid', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
