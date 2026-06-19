// /api/bots/:id   (o :id pode ser o UUID interno OU o public_id "ky_…")
//   GET    → detalhe de um bot (do dono)
//   PATCH  → atualiza campos
//   DELETE → apaga o bot (e cascata: knowledge/conversas/leads)
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { json, handlePreflight, readJson } from '../_lib/http.js';
import { pickBotFields as pick } from '../_lib/botFields.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  const ref = req.query?.id;
  if (!ref) return json(res, 400, { error: 'id em falta.' });

  // Resolve por public_id (ky_…) ou por UUID; confirma a posse.
  const column = String(ref).startsWith('ky_') ? 'public_id' : 'id';
  const { data: found } = await supabaseAdmin
    .from('bots')
    .select('id, owner_id')
    .eq(column, ref)
    .maybeSingle();
  if (!found || found.owner_id !== user.id) return json(res, 404, { error: 'Bot não encontrado.' });
  const botId = found.id; // UUID interno, usado nas operações abaixo

  if (req.method === 'GET') {
    const { data } = await supabaseAdmin.from('bots').select('*').eq('id', botId).single();
    return json(res, 200, { bot: data });
  }

  if (req.method === 'PATCH') {
    const body = await readJson(req);
    const updates = pick(body);
    if (!Object.keys(updates).length) return json(res, 400, { error: 'Nada para atualizar.' });
    const { data, error } = await supabaseAdmin.from('bots').update(updates).eq('id', botId).select().single();
    if (error) return json(res, 500, { error: 'Erro a atualizar.', detail: error.message });
    return json(res, 200, { bot: data });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('bots').delete().eq('id', botId);
    if (error) return json(res, 500, { error: 'Erro a apagar.' });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
