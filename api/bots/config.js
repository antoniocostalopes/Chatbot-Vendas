// GET /api/bots/config?public_id=ky_xxx&host=exemplo.pt
// Config pública (segura) que o widget carrega para se renderizar.
// NÃO devolve persona/knowledge/routing — só o necessário para a UI.
// Valida o domínio: se o bot tiver allowed_domains e o host não estiver lá → 403.
import { supabaseAdmin } from '../_lib/supabase.js';
import { json, handlePreflight, getQuery } from '../_lib/http.js';
import { isDomainAllowed, getRequestHost } from '../_lib/domains.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });

  const publicId = getQuery(req, 'public_id');
  const reportedHost = getQuery(req, 'host');
  if (!publicId) return json(res, 400, { error: 'public_id em falta.' });

  const { data: bot, error } = await supabaseAdmin
    .from('bots')
    .select('public_id, name, greeting, language, accent_color, status, allowed_domains, owner:profiles!inner(status)')
    .eq('public_id', publicId)
    .maybeSingle();

  if (error) return json(res, 500, { error: 'Erro a carregar a config.' });
  if (!bot || bot.status !== 'active') return json(res, 404, { error: 'Agente não encontrado.' });
  if (bot.owner?.status === 'suspended') return json(res, 404, { error: 'Agente não encontrado.' });

  // Restrição de domínio.
  const host = getRequestHost(req, reportedHost);
  if (!isDomainAllowed(bot.allowed_domains, host)) {
    return json(res, 403, { error: 'Este agente não está autorizado neste domínio.' });
  }

  return json(res, 200, {
    public_id: bot.public_id,
    name: bot.name,
    greeting: bot.greeting,
    language: bot.language,
    accent_color: bot.accent_color,
  });
}
