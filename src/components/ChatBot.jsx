import { useEffect, useRef, useState } from 'react';
import Bubble from './Bubble.jsx';
import Typing from './Typing.jsx';
import Options from './Options.jsx';
import TextField from './TextField.jsx';
import Done from './Done.jsx';
import { FLOWS, PRODUCT_STEP } from '../lib/flows.js';

// Motor conversacional. Começa pela pergunta do produto (Seguro Auto / Casa);
// conforme a escolha, ramifica para o fluxo correspondente.
export default function ChatBot() {
  const [history, setHistory] = useState([]); // {from, text, key?, value?}
  const [branch, setBranch] = useState(null); // null = ainda a escolher o produto
  const [pageId, setPageId] = useState(null);
  const [typing, setTyping] = useState(true);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef(null);

  const page = branch === null ? PRODUCT_STEP : FLOWS[branch].pages[pageId];

  useEffect(() => {
    if (!page) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setHistory((h) => [...h, { from: 'bot', text: page.prompt }]);
      if (page.type === 'finish') setTimeout(() => setFinished(true), 700);
    }, 850);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, pageId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, typing, finished]);

  // Permite recomeçar a conversa a partir do header: window.dispatchEvent(new Event('reset-lara'))
  useEffect(() => {
    const onReset = () => restart();
    window.addEventListener('reset-lara', onReset);
    return () => window.removeEventListener('reset-lara', onReset);
  }, []);

  function answer(label, value) {
    setHistory((h) => [...h, { from: 'user', text: label, key: page.key, value }]);
    if (branch === null) {
      setBranch(value);
      setPageId(FLOWS[value].start);
      return;
    }
    const answers = { ...collectAnswers(history), [page.key]: value };
    const next = typeof page.next === 'function' ? page.next(answers) : page.next;
    setPageId(next);
  }

  function restart() {
    setHistory([]);
    setFinished(false);
    setBranch(null);
    setPageId(null);
  }

  const showControls = !typing && !finished && page && page.type !== 'finish';

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="chat-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {history.map((m, i) => {
          const next = history[i + 1];
          const showAvatar = m.from === 'bot' && (!next || next.from !== 'bot');
          return (
            <Bubble key={i} from={m.from} showAvatar={showAvatar}>
              {m.text}
            </Bubble>
          );
        })}

        {typing && <Typing />}

        {showControls && page.type === 'options' && (
          <Options key={`${branch}-${pageId}`} options={page.options} onConfirm={(opt) => answer(opt.label, opt.value)} />
        )}

        {showControls && page.type === 'input' && (
          <TextField key={`${branch}-${pageId}`} kind={page.kind} placeholder={page.placeholder} onConfirm={(val) => answer(val, val)} />
        )}

        {finished && <Done email={collectAnswers(history).email} onRestart={restart} />}
      </div>
    </div>
  );
}

function collectAnswers(history) {
  const out = {};
  for (const m of history) if (m.from === 'user' && m.key) out[m.key] = m.value;
  return out;
}
