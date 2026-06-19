// /api/knowledge
//   GET  ?bot_id=...                     → lista o conhecimento de um bot
//   POST { bot_id, title?, content }     → cria um pedaço de conhecimento
// (get/update/delete de um item: /api/knowledge/:id)
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { ownsBot } from '../_lib/ownership.js';
import { json, handlePreflight, readJson, getQuery } from '../_lib/http.js';
import { reindexKnowledge } from '../_lib/knowledgeIndex.js';
import { resolveOwnerKey } from '../_lib/keys.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const botId = getQuery(req, 'bot_id');
    if (!botId || !(await ownsBot(user.id, botId))) return json(res, 404, { error: 'Bot não encontrado.' });
    const { data, error } = await supabaseAdmin
      .from('knowledge')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });
    if (error) return json(res, 500, { error: 'Erro a carregar conhecimento.' });
    return json(res, 200, { knowledge: data || [] });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    if (!body.bot_id || !(await ownsBot(user.id, body.bot_id))) return json(res, 404, { error: 'Bot não encontrado.' });
    if (!body.content?.trim()) return json(res, 400, { error: 'content em falta.' });
    const { data, error } = await supabaseAdmin
      .from('knowledge')
      .insert({
        bot_id: body.bot_id,
        title: body.title || '',
        content: body.content.trim(),
        source_type: body.source_type || 'text',
        source_ref: body.source_ref || null,
      })
      .select()
      .single();
    if (error) return json(res, 500, { error: 'Erro a guardar.' });

    // Indexa para RAG (com a chave do dono; tolerante a falhas).
    const apiKey = await resolveOwnerKey(user.id);
    await reindexKnowledge(data, apiKey);

    return json(res, 201, { item: data });
  }

  return json(res, 405, { error: 'Método não permitido.' });
}
