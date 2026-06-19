import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { listConversations, listBots, getConversation, deleteConversation } from '../lib/api.js';

// Etiqueta curta para o visitante (anónimo).
const visitorLabel = (c) => {
  const id = c.visitor_id || c.id || '';
  const tail = String(id).replace(/-/g, '').slice(-4).toUpperCase();
  return tail ? `Visitante ${tail}` : 'Visitante';
};

// Hora curta: HH:MM se for hoje, senão DD/MM.
function shortTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

function Avatar({ name }) {
  const initial = (name || 'A').trim().charAt(0).toUpperCase();
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[15px] font-semibold text-white">
      {initial}
    </div>
  );
}

export default function ConversationsPage() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const [convs, setConvs] = useState(null);
  const [bots, setBots] = useState([]);
  const [bot, setBot] = useState(params.get('agente') || 'all'); // pré-filtra se vier do editor
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);       // conversa selecionada
  const [messages, setMessages] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const [{ conversations }, { bots }] = await Promise.all([listConversations(token), listBots(token)]);
        if (alive) { setConvs(conversations); setBots(bots || []); }
      } catch { if (alive) { setConvs([]); setBots([]); } }
    })();
    return () => { alive = false; };
  }, [token]);

  const filtered = useMemo(() => {
    if (!convs) return [];
    const needle = q.trim().toLowerCase();
    return convs.filter((c) => {
      if (bot !== 'all' && c.bot_id !== bot) return false;
      if (!needle) return true;
      return [c.last_message, c.bot?.name, visitorLabel(c)]
        .filter(Boolean).some((v) => v.toLowerCase().includes(needle));
    });
  }, [convs, bot, q]);

  async function view(c) {
    setOpen(c); setMessages(null);
    try { const { messages } = await getConversation(token, c.id); setMessages(messages); }
    catch { setMessages([]); }
  }

  async function remove(id, e) {
    e?.stopPropagation();
    if (!confirm('Apagar esta conversa?')) return;
    setConvs((cs) => cs.filter((c) => c.id !== id));
    if (open?.id === id) { setOpen(null); setMessages(null); }
    try { await deleteConversation(token, id); } catch (err) { alert(err.message); }
  }

  useEffect(() => {
    if (messages) bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
        {/* ── Lista (coluna esquerda) ── */}
        <aside className={`${open ? 'hidden md:flex' : 'flex'} w-full flex-col border-r border-ink-100 md:w-[340px] lg:w-[380px]`}>
          <div className="border-b border-ink-100 p-3">
            <h1 className="mb-2 px-0.5 text-[17px] font-bold text-ink-900">Conversas</h1>
            <select
              value={bot}
              onChange={(e) => setBot(e.target.value)}
              className="mb-2 w-full rounded-lg border border-ink-200 px-2.5 py-2 text-[13px] text-ink-700 outline-none focus:border-brand-500"
            >
              <option value="all">Todos os agentes</option>
              {bots.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="relative">
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" strokeLinecap="round" /></svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Procurar conversa…"
                className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3 text-[13px] outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convs === null && <p className="p-4 text-[13px] text-ink-400">A carregar…</p>}
            {convs && !filtered.length && (
              <p className="p-4 text-[13px] text-ink-500">
                {convs.length ? 'Nenhuma conversa corresponde ao filtro.' : 'Ainda não há conversas.'}
              </p>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => view(c)}
                className={`flex w-full items-center gap-3 border-b border-ink-50 px-3 py-3 text-left transition-colors ${open?.id === c.id ? 'bg-brand-50/60' : 'hover:bg-ink-50/60'}`}
              >
                <Avatar name={c.bot?.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[14px] font-semibold text-ink-900">{visitorLabel(c)}</span>
                    <span className="shrink-0 text-[11px] text-ink-400">{shortTime(c.last_at)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-[10.5px] font-medium text-brand-700">{c.bot?.name || 'Agente'}</span>
                    <span className="truncate text-[12.5px] text-ink-500">
                      {c.last_role === 'assistant' && <span className="text-ink-400">Agente: </span>}{c.last_message || 'Sem mensagens'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Janela da conversa (coluna direita) ── */}
        <section className={`${open ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-[#f5f6f8]`}>
          {!open ? (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-500">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" strokeLinejoin="round" /></svg>
                </div>
                <p className="text-[14px] text-ink-500">Seleciona uma conversa para a ler.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cabeçalho */}
              <header className="flex items-center gap-3 border-b border-ink-100 bg-white px-4 py-2.5">
                <button onClick={() => { setOpen(null); setMessages(null); }} className="rounded-lg p-1 text-ink-500 hover:bg-ink-50 md:hidden" aria-label="Voltar">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <Avatar name={open.bot?.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-ink-900">{visitorLabel(open)}</div>
                  <div className="truncate text-[12px] text-ink-500">via {open.bot?.name || 'Agente'} · {open.message_count} mensagens</div>
                </div>
                <button onClick={(e) => remove(open.id, e)} className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-red-500 hover:bg-red-50">Apagar</button>
              </header>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {messages === null && <p className="text-[13px] text-ink-400">A carregar…</p>}
                {messages && !messages.length && <p className="text-[13px] text-ink-400">Sem mensagens.</p>}
                {messages && messages.length > 0 && (
                  <div className="mx-auto flex max-w-2xl flex-col gap-1.5">
                    {messages.map((m) => {
                      const mine = m.role === 'assistant'; // o agente = "nós" (direita)
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug shadow-sm ${mine ? 'rounded-br-md bg-brand-500 text-white' : 'rounded-bl-md bg-white text-ink-800'}`}>
                            <div className="whitespace-pre-wrap break-words">{m.content}</div>
                            <div className={`mt-1 text-right text-[10px] ${mine ? 'text-white/70' : 'text-ink-400'}`}>{shortTime(m.created_at)}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-ink-100 bg-white px-4 py-2 text-center text-[11.5px] text-ink-400">
                Histórico da conversa (apenas leitura)
              </div>
            </>
          )}
        </section>
    </div>
  );
}
