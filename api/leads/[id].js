// /api/leads/:id
//   PATCH  → atualiza name/email/phone/notes/data
//   DELETE → remove
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { getOwnedRow } from '../_lib/ownership.js';
import { json, handlePreflight, readJson } from '../_lib/http.js';

const EDITABLE = ['name', 'email', 'phone', 'notes', 'data'];

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  const id = req.query?.id;
  if (!id) return json(res, 400, { error: 'id em falta.' });

  const row = await getOwnedRow(user.id, 'leads', id);
  if (!row) return json(res, 404, { error: 'Lead não encontrado.' });

  if (req.method === 'PATCH') {
    const body = await readJson(req);
    const updates = {};
    for (const k of EDITABLE) if (body[k] !== undefined) updates[k] = body[k];
    if (!Object.keys(updates).length) return json(res, 400, { error: 'Nada para atualizar.' });
    const { data, error } = await supabaseAdmin.from('leads').update(updates).eq('id', id).select().single();
    if (error) return json(res, 500, { error: 'Erro a atualizar.' });
    return json(res, 200, { lead: data });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('leads').delete().eq('id', id);
    if (error) return json(res, 500, { error: 'Erro a apagar.' });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
