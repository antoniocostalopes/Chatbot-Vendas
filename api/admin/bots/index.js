// GET /api/admin/bots  → todos os bots da plataforma com o dono (platform_admin).
import { supabaseAdmin } from '../../_lib/supabase.js';
import { requirePlatformAdmin } from '../../_lib/auth.js';
import { json, handlePreflight } from '../../_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });

  const auth = await requirePlatformAdmin(req, res);
  if (!auth) return;

  const { data, error } = await supabaseAdmin
    .from('bots')
    .select('id, name, public_id, status, created_at, owner:profiles!inner(id, email, status)')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) return json(res, 500, { error: 'Erro a carregar bots.', detail: error.message });
  return json(res, 200, { bots: data || [] });
}
