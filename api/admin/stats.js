// GET /api/admin/stats  → totais da plataforma (platform_admin).
import { supabaseAdmin } from '../_lib/supabase.js';
import { requirePlatformAdmin } from '../_lib/auth.js';
import { json, handlePreflight } from '../_lib/http.js';

async function count(table, filter) {
  let q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });

  const auth = await requirePlatformAdmin(req, res);
  if (!auth) return;

  const [clients, suspended, bots, leads, conversations] = await Promise.all([
    count('profiles'),
    count('profiles', (q) => q.eq('status', 'suspended')),
    count('bots'),
    count('leads'),
    count('conversations'),
  ]);

  return json(res, 200, { stats: { clients, suspended, bots, leads, conversations } });
}
