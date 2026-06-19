// /api/conversations/:id
//   GET    → conversa + todas as mensagens (ordenadas)
//   DELETE → apaga a conversa (cascata: mensagens)
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { getOwnedRow } from '../_lib/ownership.js';
import { json, handlePreflight } from '../_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  const id = req.query?.id;
  if (!id) return json(res, 400, { error: 'id em falta.' });

  const conv = await getOwnedRow(user.id, 'conversations', id);
  if (!conv) return json(res, 404, { error: 'Conversa não encontrada.' });

  if (req.method === 'GET') {
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    if (error) return json(res, 500, { error: 'Erro a carregar mensagens.' });
    return json(res, 200, { conversation: conv, messages: messages || [] });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin.from('conversations').delete().eq('id', id);
    if (error) return json(res, 500, { error: 'Erro a apagar.' });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
