// Restrição de domínios do widget.
// O host é reportado pelo embed.js (corre na página do cliente) e validado aqui.
// Regras de correspondência:
//   - lista vazia            → sem restrição (widget visível em qualquer site)
//   - "exemplo.pt"           → apex + subdomínios (app.exemplo.pt incluído)
//   - "*.exemplo.pt"         → apenas subdomínios
//   - localhost/127.0.0.1    → sempre permitido (desenvolvimento)

export function normalizeHost(value) {
  if (!value) return '';
  let h = String(value).trim().toLowerCase();
  // Aceita URLs completas ou só o host.
  try {
    if (h.includes('://')) h = new URL(h).hostname;
  } catch { /* usa o valor tal como veio */ }
  h = h.replace(/^https?:\/\//, '');
  h = h.split('/')[0].split(':')[0]; // remove path e porta
  h = h.replace(/^www\./, '').replace(/\.$/, '');
  return h;
}

const DEV_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

export function isDomainAllowed(allowedList, host) {
  const list = Array.isArray(allowedList) ? allowedList : [];
  // Sem restrição definida → permitido.
  if (list.length === 0) return true;

  const h = normalizeHost(host);
  if (!h) return false;
  if (DEV_HOSTS.has(h)) return true;

  return list.some((raw) => {
    const entry = String(raw || '').trim().toLowerCase().replace(/\.$/, '');
    if (!entry) return false;
    if (entry.startsWith('*.')) {
      const base = normalizeHost(entry.slice(2));
      return h === base || h.endsWith('.' + base);
    }
    const base = normalizeHost(entry);
    return h === base || h.endsWith('.' + base);
  });
}

// Determina o host do pedido: prefere o reportado (embed/widget) e cai para os
// cabeçalhos Origin/Referer quando não há nenhum.
export function getRequestHost(req, reported) {
  if (reported) return normalizeHost(reported);
  const origin = req.headers?.origin;
  const referer = req.headers?.referer || req.headers?.referrer;
  return normalizeHost(origin || referer || '');
}
