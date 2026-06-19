// Resolve a chave OpenAI a usar para um dado dono (cliente).
// Prioridade: chave do cliente (BYO, cifrada) → fallback da plataforma → null.
import { supabaseAdmin } from './supabase.js';
import { decryptSecret } from './crypto.js';

export async function resolveOwnerKey(ownerId) {
  if (ownerId) {
    const { data } = await supabaseAdmin
      .from('profiles').select('openai_api_key_enc').eq('id', ownerId).maybeSingle();
    const own = decryptSecret(data?.openai_api_key_enc);
    if (own) return own;
  }
  return process.env.OPENAI_API_KEY || null;
}
