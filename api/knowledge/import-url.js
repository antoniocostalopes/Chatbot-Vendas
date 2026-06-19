// POST /api/knowledge/import-url  { bot_id, url }
// Vai buscar a página, extrai o texto legível e cria um item de conhecimento
// (indexado para RAG). Import de uma página; o utilizador pode importar várias.
import { supabaseAdmin } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { ownsBot } from '../_lib/ownership.js';
import { json, handlePreflight, readJson } from '../_lib/http.js';
import { reindexKnowledge } from '../_lib/knowledgeIndex.js';
import { resolveOwnerKey } from '../_lib/keys.js';

// Remove scripts/estilos/markup e devolve texto limpo.
function htmlToText(html) {
  let s = String(html || '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<\/(p|div|section|article|h[1-6]|li|br|tr)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  // entidades comuns
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function titleFromHtml(html, fallback) {
  const m = /<title[^>]*>([^<]+)<\/title>/i.exec(html || '');
  return (m ? m[1].trim() : '') || fallback;
}

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });

  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson(req);
  if (!body.bot_id || !(await ownsBot(user.id, body.bot_id))) return json(res, 404, { error: 'Bot não encontrado.' });

  let url = String(body.url || '').trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  let parsed;
  try { parsed = new URL(url); } catch { return json(res, 400, { error: 'URL inválido.' }); }
  if (!['http:', 'https:'].includes(parsed.protocol)) return json(res, 400, { error: 'URL inválido.' });

  // Vai buscar a página.
  let html;
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'KyvoBot/1.0 (+https://kyvo)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    });
    if (!resp.ok) return json(res, 422, { error: `A página respondeu ${resp.status}.` });
    const type = resp.headers.get('content-type') || '';
    if (!/text\/html|text\/plain|application\/xhtml/i.test(type)) {
      return json(res, 422, { error: 'O URL não é uma página de texto/HTML.' });
    }
    html = await resp.text();
  } catch (e) {
    return json(res, 422, { error: 'Não consegui aceder ao URL.', detail: e?.message });
  }

  const text = htmlToText(html);
  if (text.length < 40) return json(res, 422, { error: 'Não encontrei texto útil nessa página.' });

  const title = titleFromHtml(html, parsed.hostname);
  const content = text.slice(0, 100000); // limite de segurança

  const { data, error } = await supabaseAdmin
    .from('knowledge')
    .insert({ bot_id: body.bot_id, title, content, source_type: 'url', source_ref: url })
    .select()
    .single();
  if (error) return json(res, 500, { error: 'Erro a guardar.' });

  const apiKey = await resolveOwnerKey(user.id);
  const idx = await reindexKnowledge(data, apiKey);

  return json(res, 201, { item: data, chunks: idx.chunks || 0, indexed: idx.indexed || 0 });
}
