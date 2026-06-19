import { useEffect, useState } from 'react';
import ChatBot from './ChatBot.jsx';
import AiChat from './AiChat.jsx';
import ChatPanel from './ChatPanel.jsx';
import Avatar from './Avatar.jsx';

// Widget flutuante ancorado ao canto inferior direito.
// - Se `publicId` for fornecido, usa o motor de IA (fala com /api/chat).
// - Caso contrário, usa a demo determinística (ChatBot) — assim a landing
//   funciona mesmo antes de o backend estar configurado.
export default function Widget({ autoOpen = true, autoOpenDelay = 1200, publicId, greeting, name = 'Kyvo' }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [resetKey, setResetKey] = useState(0); // força recomeço no modo IA

  useEffect(() => {
    if (!autoOpen) return;
    let alreadyOpened = false;
    try {
      alreadyOpened = sessionStorage.getItem('kyvo_widget_opened') === '1';
    } catch {}
    if (alreadyOpened) {
      setSeen(true);
      return;
    }
    const t = setTimeout(() => {
      setOpen(true);
      setSeen(true);
      try { sessionStorage.setItem('kyvo_widget_opened', '1'); } catch {}
    }, autoOpenDelay);
    return () => clearTimeout(t);
  }, [autoOpen, autoOpenDelay]);

  // Abrir a partir de qualquer CTA da página.
  useEffect(() => {
    const openIt = () => { setOpen(true); setSeen(true); };
    window.addEventListener('kyvo:open', openIt);
    return () => window.removeEventListener('kyvo:open', openIt);
  }, []);

  const handleReset = () => {
    if (publicId) setResetKey((k) => k + 1);
    else window.dispatchEvent(new Event('kyvo:reset'));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          className="order-1 w-[min(92vw,400px)] overflow-hidden rounded-3xl border border-ink-100 shadow-2xl animate-fade-up"
          style={{ height: 'min(78vh, 640px)' }}
        >
          <ChatPanel name={name} onReset={handleReset} onClose={() => setOpen(false)}>
            {publicId ? (
              <AiChat key={resetKey} publicId={publicId} greeting={greeting} />
            ) : (
              <ChatBot />
            )}
          </ChatPanel>
        </div>
      )}

      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fechar assistente' : `Falar com a ${name}`}
        className="group relative order-2 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-brand-500/20 ring-1 ring-neutral-200 transition hover:scale-105"
      >
        {open ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        ) : (
          <Avatar size={62} />
        )}
        {!seen && !open && (
          <span className="absolute right-0 top-0 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />
          </span>
        )}
      </button>
    </div>
  );
}
