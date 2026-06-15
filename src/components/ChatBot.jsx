import { useEffect, useRef, useState } from 'react';
import Bubble from './Bubble.jsx';
import Typing from './Typing.jsx';
import Options from './Options.jsx';
import TextField from './TextField.jsx';
import Done from './Done.jsx';
import Summary from './Summary.jsx';
import { FLOWS, PRODUCT_STEP } from '../lib/flows.js';

// Etiquetas legíveis para o ecrã de resumo.
const FIELD_LABELS = {
  autoType: 'Veículo',
  plate: 'Matrícula',
  carOwner: 'Proprietário',
  name: 'Nome',
  nif: 'NIF',
  birth: 'Data de nascimento',
  claims: 'Sinistros (2 anos)',
  coverage: 'Cobertura',
  homeType: 'Imóvel',
  regime: 'Regime',
  area: 'Área (m²)',
  year: 'Ano de construção',
  capital: 'Capital',
  postal: 'Código postal',
  email: 'E-mail',
  phone: 'Telefone',
};

// Motor conversacional. Começa pela pergunta do produto (Seguro Auto / Casa);
// conforme a escolha, ramifica para o fluxo correspondente.
export default function ChatBot() {
  const [history, setHistory] = useState([]); // {from, text, key?, value?}
  const [branch, setBranch] = useState(null); // null = ainda a escolher o produto
  const [pageId, setPageId] = useState(null);
  const [typing, setTyping] = useState(true);
  const [finished, setFinished] = useState(false);
  const [editing, setEditing] = useState(false); // a corrigir um campo a partir do resumo
  const scrollRef = useRef(null);

  const page = branch === null ? PRODUCT_STEP : FLOWS[branch].pages[pageId];

  useEffect(() => {
    if (!page) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      // Não repetir o prompt do resumo quando se regressa de uma edição.
      setHistory((h) => {
        if (page.type === 'summary' && h.some((m) => m.from === 'bot' && m.text === page.prompt)) return h;
        return [...h, { from: 'bot', text: page.prompt }];
      });
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
    // Se veio do resumo a corrigir um campo, regressa ao resumo após responder.
    if (editing) {
      setEditing(false);
      setPageId('summary');
      return;
    }
    const answers = { ...collectAnswers(history), [page.key]: value };
    const next = typeof page.next === 'function' ? page.next(answers) : page.next;
    setPageId(next);
  }

  function confirmSummary() {
    setPageId(typeof page.next === 'function' ? page.next(collectAnswers(history)) : page.next);
  }

  function editField(targetPageId) {
    setEditing(true);
    setPageId(targetPageId);
  }

  function restart() {
    setHistory([]);
    setFinished(false);
    setEditing(false);
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

        {showControls && page.type === 'summary' && (
          <Summary rows={buildSummaryRows(branch, history)} onEdit={editField} onConfirm={confirmSummary} />
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

// Constrói as linhas do resumo na ordem do fluxo, usando o último rótulo
// respondido de cada campo (assim correções via "Editar" refletem-se aqui).
function buildSummaryRows(branch, history) {
  const labels = {};
  for (const m of history) if (m.from === 'user' && m.key) labels[m.key] = m.text;

  const rows = [{ key: 'product', field: 'Seguro', value: branch === 'auto' ? 'Automóvel' : 'Casa', editable: false }];
  for (const pid of Object.keys(FLOWS[branch].pages)) {
    const pg = FLOWS[branch].pages[pid];
    if (!pg.key || pg.type === 'summary' || pg.type === 'finish') continue;
    if (labels[pg.key] === undefined) continue;
    rows.push({ key: pg.key, field: FIELD_LABELS[pg.key] || pg.key, value: labels[pg.key], pageId: pid, editable: true });
  }
  return rows;
}
