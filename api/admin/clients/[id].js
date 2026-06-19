// /api/admin/clients/:id  (platform_admin)
//   GET    → detalhe do cliente + os seus bots (com nº de leads)
//   PATCH  → atualiza full_name | role | status | plan
//   DELETE → apaga o cliente e tudo o que é dele (cascata)
import { supabaseAdmin } from '../../_lib/supabase.js';
import { requirePlatformAdmin } from '../../_lib/auth.js';
import { json, handlePreflight, readJson } from '../../_lib/http.js';

const ROLES = ['client', 'platform_admin'];
const STATUSES = ['active', 'suspended'];

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const auth = await requirePlatformAdmin(req, res);
  if (!auth) return;

  const id = req.query?.id;
  if (!id) return json(res, 400, { error: 'id em falta.' });

  const { data: client } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, status, plan, created_at')
    .eq('id', id)
    .maybeSingle();
  if (!client) return json(res, 404, { error: 'Cliente não encontrado.' });

  if (req.method === 'GET') {
    const { data: bots } = await supabaseAdmin
      .from('bots')
      .select('id, name, public_id, status, created_at, leads(count)')
      .eq('owner_id', id)
      .order('created_at', { ascending: false });
    const withCounts = (bots || []).map((b) => ({
      id: b.id, name: b.name, public_id: b.public_id, status: b.status,
      created_at: b.created_at, lead_count: b.leads?.[0]?.count ?? 0,
    }));
    return json(res, 200, { client, bots: withCounts });
  }

  if (req.method === 'PATCH') {
    const body = await readJson(req);
    const updates = {};
    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.plan !== undefined) updates.plan = body.plan;
    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) return json(res, 400, { error: 'Papel inválido.' });
      // Evita auto-despromoção acidental (lockout).
      if (id === auth.user.id && body.role !== 'platform_admin') {
        return json(res, 400, { error: 'Não podes remover o teu próprio acesso de gestor aqui.' });
      }
      updates.role = body.role;
    }
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) return json(res, 400, { error: 'Estado inválido.' });
      if (id === auth.user.id && body.status === 'suspended') {
        return json(res, 400, { error: 'Não podes suspender a tua própria conta.' });
      }
      updates.status = body.status;
    }
    if (!Object.keys(updates).length) return json(res, 400, { error: 'Nada para atualizar.' });

    const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id).select().single();
    if (error) return json(res, 500, { error: 'Erro a atualizar.', detail: error.message });
    return json(res, 200, { client: data });
  }

  if (req.method === 'DELETE') {
    if (id === auth.user.id) return json(res, 400, { error: 'Usa a Área de conta para apagar a tua própria conta.' });
    // Apaga o utilizador no Auth → cascata apaga profile/bots/leads/etc.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) {
      // Fallback: apaga o profile (cascata nas tabelas da app).
      const { error: e2 } = await supabaseAdmin.from('profiles').delete().eq('id', id);
      if (e2) return json(res, 500, { error: 'Erro a apagar o cliente.', detail: error.message });
    }
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
