// Valida a sessão do painel admin a partir do JWT do Supabase.
import { supabaseAdmin } from './supabase.js';
import { bearer, json } from './http.js';

// Devolve o utilizador autenticado ou responde 401 e devolve null.
export async function requireUser(req, res) {
  const token = bearer(req);
  if (!token) {
    json(res, 401, { error: 'Não autenticado.' });
    return null;
  }
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    json(res, 401, { error: 'Sessão inválida ou expirada.' });
    return null;
  }
  return data.user;
}

// Como requireUser, mas NÃO responde — devolve o utilizador ou null.
// Útil para rotas públicas que dão tratamento especial ao dono autenticado.
export async function optionalUser(req) {
  const token = bearer(req);
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// Carrega o profile (role/status/plan) de um utilizador.
export async function getProfile(userId) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, status, plan, created_at')
    .eq('id', userId)
    .maybeSingle();
  return data || null;
}

// Exige que o utilizador autenticado seja gestor da plataforma.
// Devolve { user, profile } ou responde (401/403) e devolve null.
export async function requirePlatformAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  const profile = await getProfile(user.id);
  if (!profile || profile.role !== 'platform_admin') {
    json(res, 403, { error: 'Acesso restrito à gestão da plataforma.' });
    return null;
  }
  return { user, profile };
}
