// Utilitários HTTP partilhados pelas funções serverless (Vercel Node runtime).

// CORS aberto: o widget é embebido em sites de clientes (outra origem).
// As rotas admin restringem por auth, não por origem.
export function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// Responde a preflight. Devolve true se o pedido era OPTIONS (já tratado).
export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    applyCors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(res, status, body) {
  applyCors(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).send(JSON.stringify(body));
}

// Lê o corpo JSON de forma robusta (o Vercel já costuma fazer parse, mas
// garantimos compatibilidade quando vem como string ou stream).
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

// Inicia uma resposta em streaming (Server-Sent Events). Depois usa-se sse().
export function startSSE(res) {
  applyCors(res);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // desliga buffering de proxies
  res.flushHeaders?.();
}

// Emite um evento SSE com um objeto JSON.
export function sse(res, obj) {
  res.write(`data: ${JSON.stringify(obj)}\n\n`);
}

// Lê um parâmetro de query, seja do parse do Vercel (req.query) ou do URL cru.
export function getQuery(req, key) {
  if (req.query && req.query[key] != null) return req.query[key];
  try { return new URL(req.url, 'http://x').searchParams.get(key); } catch { return null; }
}

// Extrai o Bearer token do header Authorization.
export function bearer(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1] : null;
}
