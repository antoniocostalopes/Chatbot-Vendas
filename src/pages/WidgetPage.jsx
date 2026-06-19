import { useEffect, useState } from 'react';
import ChatPanel from '../components/ChatPanel.jsx';
import AiChat from '../components/AiChat.jsx';
import { getBotConfig } from '../lib/api.js';

// Página embebível: renderiza APENAS o painel de chat, para ser carregada
// dentro do iframe que o embed.js injeta no site do cliente.
// URL: /widget?id=ky_xxx
export default function WidgetPage() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [resetKey, setResetKey] = useState(0);

  const params = new URLSearchParams(window.location.search);
  const publicId = params.get('id');
  // Host anfitrião real, reportado pelo embed.js (o iframe corre no nosso
  // domínio, por isso não dá para usar window.location.hostname aqui).
  const host = params.get('h') || '';

  // Fundo transparente para o iframe do embed.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = 'transparent';
    return () => { document.body.style.background = prev; };
  }, []);

  useEffect(() => {
    if (!publicId) { setStatus('error'); return; }
    getBotConfig(publicId, host)
      .then((cfg) => { setConfig(cfg); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [publicId, host]);

  // Avisa o host (embed.js) para fechar/minimizar o iframe.
  const closeToHost = () => window.parent?.postMessage({ type: 'kyvo:close' }, '*');

  return (
    <div className="h-screen w-screen bg-transparent">
      <div className="mx-auto flex h-full max-w-[420px] flex-col">
        {status === 'error' && (
          <div className="m-auto rounded-2xl bg-white p-6 text-center text-[14px] text-ink-700 shadow-xl">
            Não foi possível carregar o assistente.
          </div>
        )}
        {status !== 'error' && (
          <ChatPanel
            name={config?.name || 'Assistente'}
            accentColor={config?.accent_color}
            onReset={() => setResetKey((k) => k + 1)}
            onClose={closeToHost}
          >
            {status === 'ready' ? (
              <AiChat key={resetKey} publicId={publicId} greeting={config?.greeting} host={host} />
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-ink-500">A carregar…</div>
            )}
          </ChatPanel>
        )}
      </div>
    </div>
  );
}
