// /api/conversations?bot_id=...
//   GET → lista de conversas de um bot do dono (com nº de mensagens)
// (detalhe com mensagens / apagar: /api/conversations/:id)
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { ownedBotIds } from '../_lib/ownership.js';
import { json, handlePreflight, getQuery } from '../_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });

  const user = await requireUser(req, res);
  if (!user) return;

  const botId = getQuery(req, 'bot_id');
  const ids = await ownedBotIds(user.id, botId);
  if (!ids.length) return json(res, 200, { conversations: [] });

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('id, bot_id, visitor_id, created_at, messages(count)')
    .in('bot_id', ids)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return json(res, 500, { error: 'Erro a carregar conversas.' });

  const conversations = (data || []).map((c) => ({
    id: c.id,
    bot_id: c.bot_id,
    visitor_id: c.visitor_id,
    created_at: c.created_at,
    message_count: c.messages?.[0]?.count ?? 0,
  }));
  return json(res, 200, { conversations });
}
