// POST /api/chat
// Núcleo do widget: recebe o histórico da conversa, corre o agente OpenAI
// (com captação de lead via function calling) e persiste tudo no Supabase.
//
// Body: { public_id, visitor_id?, conversation_id?, messages: [{role, content}] }
// Resposta: { reply, conversation_id, lead_captured }
import { supabaseAdmin, assertConfig } from './_lib/supabase.js';
import { json, handlePreflight, readJson, startSSE, sse } from './_lib/http.js';
import { runConversationStream } from './_lib/openai.js';
import { routeLead } from './_lib/notify.js';
import { isDomainAllowed, getRequestHost } from './_lib/domains.js';
import { decryptSecret } from './_lib/crypto.js';
import { optionalUser } from './_lib/auth.js';
import { embedQuery } from './_lib/embeddings.js';
import { extractContact } from './_lib/leadExtract.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });

  const missing = assertConfig();
  if (missing.length) {
    return json(res, 500, { error: `Configuração em falta no servidor: ${missing.join(', ')}.` });
  }

  const body = await readJson(req);
  const { public_id, visitor_id, conversation_id } = body;
  const incoming = Array.isArray(body.messages) ? body.messages : [];

  if (!public_id) return json(res, 400, { error: 'public_id em falta.' });
  if (!incoming.length) return json(res, 400, { error: 'messages em falta.' });

  // 1) Carrega o bot pelo public_id.
  const { data: bot, error: botErr } = await supabaseAdmin
    .from('bots')
    .select('*, owner:profiles!inner(status, openai_api_key_enc)')
    .eq('public_id', public_id)
    .maybeSingle();

  if (botErr) return json(res, 500, { error: 'Erro a carregar o agente.' });
  if (!bot) return json(res, 404, { error: 'Agente não encontrado.' });

  // Modo "preview": o dono autenticado a testar no painel ignora as restrições
  // de domínio / pausa / suspensão (é a sua própria conta).
  const authedUser = await optionalUser(req);
  const isOwnerPreview = !!authedUser && authedUser.id === bot.owner_id;

  if (!isOwnerPreview) {
    if (bot.status !== 'active') return json(res, 403, { error: 'Agente em pausa.' });
    if (bot.owner?.status === 'suspended') return json(res, 403, { error: 'Conta indisponível.' });
    const host = getRequestHost(req, body.host);
    if (!isDomainAllowed(bot.allowed_domains, host)) {
      return json(res, 403, { error: 'Este agente não está autorizado neste domínio.' });
    }
  }

  const mode = bot.mode === 'search' ? 'search' : 'ai';

  // 2) Garante a conversa (partilhado pelos dois modos).
  let convId = conversation_id || null;
  if (!convId) {
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .insert({ bot_id: bot.id, visitor_id: visitor_id || null })
      .select('id')
      .single();
    convId = conv?.id || null;
  }

  // 3) Histórico + persistência da última mensagem do utilizador (partilhado).
  const history = incoming.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 4000),
  }));
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  const lastUserMsg = lastUser?.content || '';
  if (convId && lastUser) {
    await supabaseAdmin.from('messages').insert({ conversation_id: convId, role: 'user', content: lastUser.content });
  }

  // ───────────────────────────────────────────────────────────────────────
  // MODO PESQUISA (sem IA): full-text search sobre o conhecimento. 0 custo IA.
  // ───────────────────────────────────────────────────────────────────────
  if (mode === 'search') {
    let reply = '';
    if (lastUserMsg.trim()) {
      // Pesquisa tolerante: QUALQUER palavra significativa (OR), não todas (AND),
      // para que perguntas naturais ("Qual é o horário?") encontrem o conhecimento.
      const terms = lastUserMsg.trim().split(/\s+/).filter((w) => w.length > 2);
      const q = terms.length ? terms.join(' or ') : lastUserMsg.trim();
      const { data: hits } = await supabaseAdmin.rpc('search_knowledge', {
        p_bot_id: bot.id, q, match_count: 2,
      });
      if (hits && hits.length) {
        reply = hits.map((h) => h.content.trim()).join('\n\n').slice(0, 1200);
      }
    }
    if (!reply) {
      reply = 'Não encontrei informação sobre isso. Pode reformular com outras palavras, ou deixar o seu email/telefone que entramos em contacto.';
    }

    // Captação de lead sem IA: deteta email/telefone na mensagem do visitante.
    let leadCaptured = false;
    const contact = extractContact(lastUserMsg);
    if (convId && (contact.email || contact.phone)) {
      const { data: existing } = await supabaseAdmin
        .from('leads').select('id').eq('conversation_id', convId).maybeSingle();
      if (!existing) {
        const lead = {
          bot_id: bot.id, conversation_id: convId,
          email: contact.email, phone: contact.phone, notes: 'Captado em modo pesquisa',
        };
        const { data: saved } = await supabaseAdmin.from('leads').insert(lead).select().single();
        routeLead(bot, saved || lead).catch(() => {});
        leadCaptured = true;
      }
    }

    if (convId && reply) {
      await supabaseAdmin.from('messages').insert({ conversation_id: convId, role: 'assistant', content: reply });
    }
    // Stream (uniforme com o modo IA): emite a resposta de uma vez.
    startSSE(res);
    sse(res, { type: 'delta', text: reply });
    sse(res, { type: 'done', conversation_id: convId, lead_captured: leadCaptured });
    return res.end();
  }

  // ───────────────────────────────────────────────────────────────────────
  // MODO IA (RAG + OpenAI)
  // ───────────────────────────────────────────────────────────────────────
  // Chave OpenAI: a do cliente (BYO) tem prioridade; senão a da plataforma.
  const ownerKey = decryptSecret(bot.owner?.openai_api_key_enc);
  const apiKey = ownerKey || process.env.OPENAI_API_KEY || null;
  if (!apiKey) {
    return json(res, 503, { error: 'O agente ainda não tem uma chave de IA configurada.' });
  }

  // Conhecimento relevante (RAG). Só embeber a query (chamada paga) se houver
  // chunks indexados — para bots sem conhecimento, poupa 1 chamada por mensagem.
  let knowledge = [];
  const { count: embeddedChunks } = await supabaseAdmin
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('bot_id', bot.id)
    .not('embedding', 'is', null);

  if (embeddedChunks > 0) {
    try {
      const qVec = await embedQuery(lastUserMsg, apiKey);
      if (qVec) {
        const { data: matches } = await supabaseAdmin.rpc('match_knowledge', {
          p_bot_id: bot.id,
          query_embedding: '[' + qVec.join(',') + ']',
          match_count: 6,
        });
        knowledge = (matches || []).map((m) => ({ title: '', content: m.content }));
      }
    } catch (e) {
      console.error('[kyvo] retrieval falhou:', e?.message);
    }
  }
  if (!knowledge.length) {
    const { data: all } = await supabaseAdmin
      .from('knowledge').select('title, content').eq('bot_id', bot.id).limit(20);
    knowledge = all || [];
  }

  // Corre o agente em streaming. A partir daqui a resposta é SSE — os erros de
  // validação acima (chave, domínio, etc.) já foram tratados com JSON/HTTP.
  startSSE(res);
  let result = { reply: '', leadCaptured: false };
  try {
    result = await runConversationStream({
      bot,
      knowledge: knowledge || [],
      history,
      apiKey,
      onDelta: (text) => sse(res, { type: 'delta', text }),
      onCaptureLead: async (args) => {
        const lead = {
          bot_id: bot.id,
          conversation_id: convId,
          name: args.name || null,
          email: args.email || null,
          phone: args.phone || null,
          notes: args.notes || null,
        };
        const { data: saved } = await supabaseAdmin.from('leads').insert(lead).select().single();
        routeLead(bot, saved || lead).catch(() => {}); // não bloqueia a resposta
        return saved || lead;
      },
    });
  } catch (e) {
    console.error('[kyvo] OpenAI stream falhou:', e?.message);
    sse(res, { type: 'error', error: 'O agente está indisponível neste momento. Tenta novamente.' });
    return res.end();
  }

  // Persiste a resposta completa do agente.
  if (convId && result.reply) {
    await supabaseAdmin.from('messages').insert({ conversation_id: convId, role: 'assistant', content: result.reply });
  }

  sse(res, { type: 'done', conversation_id: convId, lead_captured: result.leadCaptured });
  return res.end();
}
