// GET /api/site-agent — config pública do agente da homepage do Kyvo.
// A homepage usa o public_id devolvido para montar o widget.
import { supabaseAdmin } from './_lib/supabase.js';
import { json, handlePreflight } from './_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });

  const { data: bot, error } = await supabaseAdmin
    .from('bots')
    .select('public_id, name, greeting, accent_color, status, owner:profiles!inner(status)')
    .eq('is_site_agent', true)
    .maybeSingle();

  if (error) return json(res, 500, { error: 'Erro a carregar o agente.' });
  if (!bot || bot.status !== 'active' || bot.owner?.status === 'suspended') {
    return json(res, 404, { error: 'Sem agente do site configurado.' });
  }
  return json(res, 200, {
    public_id: bot.public_id,
    name: bot.name,
    greeting: bot.greeting,
    accent_color: bot.accent_color,
  });
}
