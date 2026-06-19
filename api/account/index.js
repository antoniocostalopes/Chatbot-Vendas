// /api/account  (área do cliente — opera sempre sobre a própria conta)
//   GET    → o meu perfil (role/status/plan, se tenho chave OpenAI) + nº de bots
//   PATCH  → atualiza full_name e/ou a minha chave OpenAI (BYO key)
//   DELETE → apaga a minha conta e tudo o que é meu (cascata)
// (mudança de email/password faz-se no cliente via supabase.auth.updateUser)
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser, getProfile } from '../_lib/auth.js';
import { json, handlePreflight, readJson } from '../_lib/http.js';
import { encryptSecret, keyHint } from '../_lib/crypto.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const profile = await getProfile(user.id);
    if (!profile) return json(res, 404, { error: 'Perfil não encontrado.' });
    // Indica se há chave + a pista; NUNCA devolve a chave nem o ciframento.
    const { data: keyRow } = await supabaseAdmin
      .from('profiles').select('openai_api_key_enc, openai_key_hint').eq('id', user.id).maybeSingle();
    const { count } = await supabaseAdmin
      .from('bots').select('*', { count: 'exact', head: true }).eq('owner_id', user.id);
    return json(res, 200, {
      profile: {
        ...profile,
        bot_count: count ?? 0,
        has_openai_key: !!keyRow?.openai_api_key_enc,
        openai_key_hint: keyRow?.openai_key_hint || null,
      },
    });
  }

  if (req.method === 'PATCH') {
    const body = await readJson(req);
    const updates = {};
    if (body.full_name !== undefined) updates.full_name = body.full_name;

    // Chave OpenAI: string vazia/null → remover; valor → cifrar e guardar pista.
    if (body.openai_api_key !== undefined) {
      const k = String(body.openai_api_key || '').trim();
      if (!k) {
        updates.openai_api_key_enc = null;
        updates.openai_key_hint = null;
      } else if (!k.startsWith('sk-')) {
        return json(res, 400, { error: 'A chave OpenAI deve começar por "sk-".' });
      } else {
        updates.openai_api_key_enc = encryptSecret(k);
        updates.openai_key_hint = keyHint(k);
      }
    }

    // role/status/plan NÃO são editáveis pelo próprio (só pela plataforma).
    if (!Object.keys(updates).length) return json(res, 400, { error: 'Nada para atualizar.' });
    const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', user.id);
    if (error) return json(res, 500, { error: 'Erro a atualizar.' });

    const profile = await getProfile(user.id);
    return json(res, 200, {
      profile: {
        ...profile,
        has_openai_key: updates.openai_api_key_enc !== undefined
          ? !!updates.openai_api_key_enc
          : undefined,
        openai_key_hint: updates.openai_key_hint,
      },
    });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) {
      const { error: e2 } = await supabaseAdmin.from('profiles').delete().eq('id', user.id);
      if (e2) return json(res, 500, { error: 'Erro a apagar a conta.', detail: error.message });
    }
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
