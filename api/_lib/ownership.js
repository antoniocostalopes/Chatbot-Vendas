// Helpers de verificação de posse. Todas as tabelas-filhas (knowledge, leads,
// conversations) têm uma FK bot_id → bots(owner_id), por isso conseguimos
// confirmar a posse com um único join.
import { supabaseAdmin } from './supabase.js';

export async function ownsBot(userId, botId) {
  if (!botId) return false;
  const { data } = await supabaseAdmin
    .from('bots')
    .select('id')
    .eq('id', botId)
    .eq('owner_id', userId)
    .maybeSingle();
  return !!data;
}

// Devolve a linha (sem o campo auxiliar) se o utilizador for dono do bot-pai;
// caso contrário devolve null. `table` ∈ { knowledge, leads, conversations }.
export async function getOwnedRow(userId, table, id) {
  if (!id) return null;
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*, _owner:bots!inner(owner_id)')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  const ownerId = data._owner?.owner_id;
  delete data._owner;
  return ownerId === userId ? data : null;
}

// Lista de ids de bots do utilizador (opcionalmente filtrada a um bot).
export async function ownedBotIds(userId, botId) {
  let q = supabaseAdmin.from('bots').select('id').eq('owner_id', userId);
  if (botId) q = q.eq('id', botId);
  const { data } = await q;
  return (data || []).map((b) => b.id);
}
