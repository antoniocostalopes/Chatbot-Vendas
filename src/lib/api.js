// Cliente da API Kyvo (usado pelo widget e pelo painel).
// Base URL: por defeito a mesma origem (funciona na Vercel e em `vercel dev`).
// Define VITE_API_BASE só se a API estiver noutro domínio.
const BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

// ── Widget (público) ───────────────────────────────────────────────────────
export const getBotConfig = (publicId, host) =>
  request(`/api/bots/config?public_id=${encodeURIComponent(publicId)}${host ? `&host=${encodeURIComponent(host)}` : ''}`);

// Agente da homepage (público) e get-or-create no painel (gestor).
export const getSiteAgent = () => request('/api/site-agent');
export const adminEnsureSiteAgent = (token) => request('/api/admin/site-agent', { token });

// Conversa em streaming (SSE). Chama onDelta(text) por cada pedaço, onDone(meta)
// no fim e onError(msg) em caso de erro. token opcional = preview do dono.
export async function streamChat(payload, token, { onDelta, onDone, onError } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${BASE}/api/chat`, { method: 'POST', headers, body: JSON.stringify(payload) });
  } catch {
    onError?.('Sem ligação. Tenta novamente.');
    return;
  }
  // Erros pré-stream vêm como JSON normal.
  if (!res.ok || !res.body) {
    let msg = `Erro ${res?.status || ''}`.trim();
    try { const d = await res.json(); msg = d.error || msg; } catch {}
    onError?.(msg);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n\n')) >= 0) {
      const raw = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (!raw.startsWith('data:')) continue;
      let msg;
      try { msg = JSON.parse(raw.slice(5).trim()); } catch { continue; }
      if (msg.type === 'delta') onDelta?.(msg.text);
      else if (msg.type === 'done') onDone?.(msg);
      else if (msg.type === 'error') onError?.(msg.error);
    }
  }
}

// ── Painel (autenticado) ────────────────────────────────────────────────────
export const listBots = (token) => request('/api/bots', { token });
export const createBot = (token, bot) => request('/api/bots', { method: 'POST', body: bot, token });
export const getBot = (token, id) => request(`/api/bots/${id}`, { token });
export const updateBot = (token, id, updates) => request(`/api/bots/${id}`, { method: 'PATCH', body: updates, token });
export const deleteBot = (token, id) => request(`/api/bots/${id}`, { method: 'DELETE', token });

// knowledge
export const listKnowledge = (token, botId) => request(`/api/knowledge?bot_id=${botId}`, { token });
export const addKnowledge = (token, item) => request('/api/knowledge', { method: 'POST', body: item, token });
export const updateKnowledge = (token, id, updates) => request(`/api/knowledge/${id}`, { method: 'PATCH', body: updates, token });
export const deleteKnowledge = (token, id) => request(`/api/knowledge/${id}`, { method: 'DELETE', token });
export const importKnowledgeUrl = (token, bot_id, url) => request('/api/knowledge/import-url', { method: 'POST', body: { bot_id, url }, token });

// leads
export const listLeads = (token, botId) => request(`/api/leads${botId ? `?bot_id=${botId}` : ''}`, { token });
export const createLead = (token, lead) => request('/api/leads', { method: 'POST', body: lead, token });
export const updateLead = (token, id, updates) => request(`/api/leads/${id}`, { method: 'PATCH', body: updates, token });
export const deleteLead = (token, id) => request(`/api/leads/${id}`, { method: 'DELETE', token });

// conversations — leitura + apagar
export const listConversations = (token, botId) =>
  request(`/api/conversations${botId ? `?bot_id=${botId}` : ''}`, { token });
export const getConversation = (token, id) => request(`/api/conversations/${id}`, { token });
export const deleteConversation = (token, id) => request(`/api/conversations/${id}`, { method: 'DELETE', token });

// ── Área do cliente (a própria conta) ───────────────────────────────────────
export const getAccount = (token) => request('/api/account', { token });
export const updateAccount = (token, updates) => request('/api/account', { method: 'PATCH', body: updates, token });
export const deleteAccount = (token) => request('/api/account', { method: 'DELETE', token });

// ── Gestão da plataforma (platform_admin) ───────────────────────────────────
export const adminStats = (token) => request('/api/admin/stats', { token });
export const adminListClients = (token) => request('/api/admin/clients', { token });
export const adminGetClient = (token, id) => request(`/api/admin/clients/${id}`, { token });
export const adminUpdateClient = (token, id, updates) => request(`/api/admin/clients/${id}`, { method: 'PATCH', body: updates, token });
export const adminDeleteClient = (token, id) => request(`/api/admin/clients/${id}`, { method: 'DELETE', token });
export const adminListBots = (token) => request('/api/admin/bots', { token });
