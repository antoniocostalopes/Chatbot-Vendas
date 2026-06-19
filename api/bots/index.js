// /api/bots
//   GET  → lista os bots do utilizador autenticado
//   POST → cria um bot (body: { name?, persona?, greeting?, ... })
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { json, handlePreflight, readJson } from '../_lib/http.js';
import { pickBotFields as pick } from '../_lib/botFields.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('bots')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return json(res, 500, { error: 'Erro a carregar bots.' });
    return json(res, 200, { bots: data || [] });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    const insert = { ...pick(body), owner_id: user.id };
    const { data, error } = await supabaseAdmin.from('bots').insert(insert).select().single();
    if (error) return json(res, 500, { error: 'Erro a criar o bot.', detail: error.message });
    return json(res, 201, { bot: data });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
