// /api/leads
//   GET  ?bot_id=...                         → lista de leads do dono
//   POST { bot_id, name?, email?, phone?, notes?, data? }  → cria lead manual
// (get/update/delete de um lead: /api/leads/:id)
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { ownsBot, ownedBotIds } from '../_lib/ownership.js';
import { json, handlePreflight, readJson, getQuery } from '../_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const botId = getQuery(req, 'bot_id');
    const ids = await ownedBotIds(user.id, botId);
    if (!ids.length) return json(res, 200, { leads: [] });
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .in('bot_id', ids)
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return json(res, 500, { error: 'Erro a carregar leads.' });
    return json(res, 200, { leads: data || [] });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    if (!body.bot_id || !(await ownsBot(user.id, body.bot_id))) return json(res, 404, { error: 'Bot não encontrado.' });
    const insert = {
      bot_id: body.bot_id,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      notes: body.notes || null,
      data: body.data && typeof body.data === 'object' ? body.data : {},
    };
    const { data, error } = await supabaseAdmin.from('leads').insert(insert).select().single();
    if (error) return json(res, 500, { error: 'Erro a criar lead.' });
    return json(res, 201, { lead: data });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
