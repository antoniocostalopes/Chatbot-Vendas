// /api/knowledge/:id
//   PATCH  → atualiza title/content
//   DELETE → remove
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { getOwnedRow } from '../_lib/ownership.js';
import { json, handlePreflight, readJson } from '../_lib/http.js';
import { reindexKnowledge } from '../_lib/knowledgeIndex.js';
import { resolveOwnerKey } from '../_lib/keys.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  const id = req.query?.id;
  if (!id) return json(res, 400, { error: 'id em falta.' });

  const row = await getOwnedRow(user.id, 'knowledge', id);
  if (!row) return json(res, 404, { error: 'Não encontrado.' });

  if (req.method === 'PATCH') {
    const body = await readJson(req);
    const updates = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) {
      if (!String(body.content).trim()) return json(res, 400, { error: 'content não pode ficar vazio.' });
      updates.content = String(body.content).trim();
    }
    if (!Object.keys(updates).length) return json(res, 400, { error: 'Nada para atualizar.' });
    const { data, error } = await supabaseAdmin.from('knowledge').update(updates).eq('id', id).select().single();
    if (error) return json(res, 500, { error: 'Erro a atualizar.' });

    // Reindexa se o conteúdo/título mudou.
    if (updates.content !== undefined || updates.title !== undefined) {
      const apiKey = await resolveOwnerKey(user.id);
      await reindexKnowledge(data, apiKey);
    }
    return json(res, 200, { item: data });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('knowledge').delete().eq('id', id);
    if (error) return json(res, 500, { error: 'Erro a apagar.' });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
