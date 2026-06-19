import { useEffect, useRef, useState } from 'react';
import Bubble from './Bubble.jsx';
import Typing from './Typing.jsx';
import { streamChat } from '../lib/api.js';

// Identificador anónimo persistente do visitante (para agrupar conversas).
function getVisitorId() {
  try {
    let id = localStorage.getItem('kyvo_visitor');
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('kyvo_visitor', id);
    }
    return id;
  } catch {
    return 'v_anon';
  }
}

// Motor de conversa com IA: fala com /api/chat (OpenAI no servidor).
// `host` = domínio anfitrião real (reportado pelo embed); valida a allowlist.
// `authToken` = quando presente, o dono testa o seu bot (preview, sem restrições).
export default function AiChat({ publicId, greeting, host, authToken }) {
  const [messages, setMessages] = useState(() =>
    greeting ? [{ role: 'assistant', content: greeting }] : [],
  );
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState(null); // texto a chegar em tempo real
  const [error, setError] = useState('');
  const convId = useRef(null);
  const visitorId = useRef(getVisitorId());
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, streaming]);

  async function send() {
    const text = input.trim();
    if (!text || typing) return;
    setError('');
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setTyping(true);

    let acc = '';
    let started = false;
    await streamChat(
      {
        public_id: publicId,
        visitor_id: visitorId.current,
        conversation_id: convId.current,
        host: host || window.location.hostname,
        messages: next,
      },
      authToken,
      {
        onDelta: (t) => {
          if (!started) { started = true; setTyping(false); }
          acc += t;
          setStreaming(acc);
        },
        onDone: (meta) => { convId.current = meta.conversation_id || convId.current; },
        onError: (msg) => setError(typeof msg === 'string' ? msg : 'Não consegui responder agora.'),
      },
    );

    if (acc) setMessages((m) => [...m, { role: 'assistant', content: acc }]);
    setStreaming(null);
    setTyping(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="chat-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((m, i) => {
          const nextM = messages[i + 1];
          const showAvatar = m.role === 'assistant' && (!nextM || nextM.role !== 'assistant');
          return (
            <Bubble key={i} from={m.role === 'assistant' ? 'bot' : 'user'} showAvatar={showAvatar}>
              {m.content}
            </Bubble>
          );
        })}
        {/* Bolha a crescer em tempo real (streaming) */}
        {streaming !== null && (
          <Bubble from="bot" showAvatar>
            {streaming || '…'}
          </Bubble>
        )}
        {typing && <Typing />}
        {error && (
          <div className="ml-[38px] rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-600" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Caixa de texto */}
      <div className="border-t border-slate-100 bg-white p-3">
        <div className="relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Escreva a sua mensagem…"
            aria-label="Mensagem"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-14 text-[14.5px] outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || typing}
            aria-label="Enviar"
            className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg bg-brand-500 text-white transition-colors enabled:hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
