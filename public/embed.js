/* Kyvo — script de embed (a "1 linha de código").
 * Uso no site do cliente:
 *   <script src="https://SEU-DOMINIO/embed.js" data-kyvo-id="ky_xxx" defer></script>
 *
 * Injeta um botão flutuante (launcher) + um iframe com o painel de chat.
 * O launcher vive no site do cliente; o painel corre isolado no iframe.
 */
(function () {
  var script = document.currentScript;
  var botId = script && script.getAttribute('data-kyvo-id');
  // Origem de onde o script foi servido (onde está alojada a app Kyvo).
  var origin = (function () {
    try { return new URL(script.src).origin; } catch (e) { return ''; }
  })();
  var color = (script && script.getAttribute('data-color')) || '#2b6bf5';

  if (!botId) {
    console.error('[Kyvo] data-kyvo-id em falta no <script> de embed.');
    return;
  }
  if (window.__kyvoLoaded) return;
  window.__kyvoLoaded = true;

  // Host anfitrião real (o site onde o snippet está instalado).
  var host = location.hostname;
  var open = false;

  // ── Painel (iframe) ───────────────────────────────────────────────────────
  var frame = document.createElement('iframe');
  frame.src = origin + '/widget?id=' + encodeURIComponent(botId) + '&h=' + encodeURIComponent(host);
  frame.title = 'Assistente';
  frame.setAttribute('allow', 'clipboard-write');
  frame.style.cssText = [
    'position:fixed', 'z-index:2147483000', 'right:16px', 'bottom:88px',
    'width:min(92vw,400px)', 'height:min(78vh,640px)', 'border:0',
    'border-radius:24px', 'box-shadow:0 24px 60px -15px rgba(0,0,0,.35)',
    'background:transparent', 'display:none', 'overflow:hidden',
  ].join(';');

  // ── Launcher ──────────────────────────────────────────────────────────────
  var btn = document.createElement('button');
  btn.setAttribute('aria-label', 'Falar com o assistente');
  btn.style.cssText = [
    'position:fixed', 'z-index:2147483001', 'right:16px', 'bottom:16px',
    'width:60px', 'height:60px', 'border-radius:50%', 'border:0', 'cursor:pointer',
    'background:' + color, 'color:#fff', 'box-shadow:0 12px 30px -8px rgba(0,0,0,.35)',
    'display:flex', 'align-items:center', 'justify-content:center', 'transition:transform .15s ease',
  ].join(';');
  btn.onmouseenter = function () { btn.style.transform = 'scale(1.06)'; };
  btn.onmouseleave = function () { btn.style.transform = 'scale(1)'; };

  var iconChat = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var iconClose = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  btn.innerHTML = iconChat;

  function setOpen(v) {
    open = v;
    frame.style.display = v ? 'block' : 'none';
    btn.innerHTML = v ? iconClose : iconChat;
  }
  btn.addEventListener('click', function () { setOpen(!open); });

  // Fecho a partir de dentro do iframe (botão minimizar do painel).
  window.addEventListener('message', function (e) {
    if (e && e.data && e.data.type === 'kyvo:close') setOpen(false);
  });

  // API pública para CTAs do site: Kyvo.open() / Kyvo.close()
  window.Kyvo = {
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    toggle: function () { setOpen(!open); },
  };

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(btn);
  }

  // Só monta o widget se este domínio estiver autorizado para o bot.
  // (A mesma regra é reforçada em /api/chat — isto é a 1ª linha de defesa.)
  function authorizeThenMount() {
    fetch(origin + '/api/bots/config?public_id=' + encodeURIComponent(botId) + '&host=' + encodeURIComponent(host))
      .then(function (r) {
        if (!r.ok) {
          if (r.status === 403) console.warn('[Kyvo] Widget não autorizado neste domínio (' + host + ').');
          return;
        }
        if (document.body) mount();
        else document.addEventListener('DOMContentLoaded', mount);
      })
      .catch(function () { /* rede indisponível: não mostra o widget */ });
  }
  authorizeThenMount();
})();
