import { useEffect, useState } from 'react';
import ChatBot from './ChatBot.jsx';
import Avatar from './Avatar.jsx';

// Widget flutuante ancorado ao canto inferior direito.
// Abre automaticamente na primeira visita da sessão.
export default function Widget({ autoOpen = true, autoOpenDelay = 1200 }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false); // já apareceu uma vez nesta sessão

  useEffect(() => {
    if (!autoOpen) return;
    let alreadyOpened = false;
    try {
      alreadyOpened = sessionStorage.getItem('lara_widget_opened') === '1';
    } catch {
      // sessionStorage indisponível (modo privado/iframe) — abre na mesma
    }
    if (alreadyOpened) {
      setSeen(true);
      return;
    }
    const t = setTimeout(() => {
      setOpen(true);
      setSeen(true);
      try {
        sessionStorage.setItem('lara_widget_opened', '1');
      } catch {}
    }, autoOpenDelay);
    return () => clearTimeout(t);
  }, [autoOpen, autoOpenDelay]);

  // Permite abrir o widget a partir de qualquer CTA da página: window.dispatchEvent(new Event('open-lara'))
  useEffect(() => {
    const openIt = () => {
      setOpen(true);
      setSeen(true);
    };
    window.addEventListener('open-lara', openIt);
    return () => window.removeEventListener('open-lara', openIt);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Painel (abre por cima do launcher) */}
      {open && (
        <div
          className="order-1 flex w-[min(92vw,400px)] flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-neutral3 shadow-2xl animate-fade-up"
          style={{ height: 'min(78vh, 640px)' }}
        >
          {/* Cabeçalho */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-500 px-4 py-3.5 text-white">
            {/* brilho decorativo */}
            <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex">
                  <Avatar size={40} />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-600 bg-green-400" aria-hidden />
                </span>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5 text-[15px] font-semibold">
                    Lara
                    <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/90">
                      Closr
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-brand-100">Online · responde em segundos</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => window.dispatchEvent(new Event('reset-lara'))}
                  aria-label="Recomeçar conversa"
                  title="Recomeçar"
                  className="cursor-pointer rounded-lg p-1.5 text-brand-100 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11a9 9 0 0 1 15-6.7L21 7" /><path d="M21 3v4h-4" />
                    <path d="M21 13a9 9 0 0 1-15 6.7L3 17" /><path d="M3 21v-4h4" />
                  </svg>
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Minimizar"
                  title="Minimizar"
                  className="cursor-pointer rounded-lg p-1.5 text-brand-100 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Conversa */}
          <div className="min-h-0 flex-1">
            <ChatBot />
          </div>
        </div>
      )}

      {/* Launcher (cara da Lara) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fechar assistente' : 'Falar com a Lara'}
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
        {/* ponto de notificação enquanto não foi aberto */}
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
