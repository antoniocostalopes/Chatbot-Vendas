// GET /api/admin/clients  → lista todos os clientes (perfis) com nº de bots.
// Restrito a gestores da plataforma (role = platform_admin).
import { supabaseAdmin } from '../../_lib/supabase.js';
import { requirePlatformAdmin } from '../../_lib/auth.js';
import { json, handlePreflight } from '../../_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });

  const auth = await requirePlatformAdmin(req, res);
  if (!auth) return;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, status, plan, created_at, bots(count)')
    .order('created_at', { ascending: false });

  if (error) return json(res, 500, { error: 'Erro a carregar clientes.', detail: error.message });

  const clients = (data || []).map((p) => ({
    id: p.id, email: p.email, full_name: p.full_name,
    role: p.role, status: p.status, plan: p.plan, created_at: p.created_at,
    bot_count: p.bots?.[0]?.count ?? 0,
  }));
  return json(res, 200, { clients });
}
