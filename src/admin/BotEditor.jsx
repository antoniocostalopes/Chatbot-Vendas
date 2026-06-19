import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import {
  getBot, updateBot, deleteBot,
  listKnowledge, addKnowledge, updateKnowledge, deleteKnowledge, importKnowledgeUrl,
} from '../lib/api.js';
import { extractFileText, ACCEPTED_FILES } from './extractFile.js';
import AiChat from '../components/AiChat.jsx';

// Campo de formulário rotulado. Definido ao nível do módulo (NÃO dentro de um
// componente) para não ser recriado a cada render — senão os inputs remontam e
// perdem o foco a cada tecla.
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-ink-600">{label}</span>
      {children}
    </label>
  );
}

const TABS = [
  { id: 'config', label: 'Configuração' },
  { id: 'knowledge', label: 'Conhecimento' },
  { id: 'test', label: 'Testar' },
  { id: 'install', label: 'Instalar' },
];

export default function BotEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tab, setTab] = useState('config');
  const [bot, setBot] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) getBot(token, id).then(({ bot }) => setBot(bot)).catch((e) => setError(e.message));
  }, [token, id]);

  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>;
  if (!bot) return <p className="text-ink-400">A carregar…</p>;

  return (
    <div>
      <button onClick={() => navigate('/admin/agentes')} className="mb-4 text-[13px] text-ink-500 hover:text-ink-800">← Voltar</button>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">{bot.name}</h1>
        <code className="rounded bg-ink-50 px-2 py-1 text-[12px] text-ink-600">{bot.public_id}</code>
      </div>

      {/* Atalhos para os resultados deste agente (vivem nas páginas globais). */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`/admin/leads?agente=${bot.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-[13px] font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
          Leads deste agente
        </Link>
        <Link to={`/admin/conversas?agente=${bot.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-[13px] font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z" /></svg>
          Conversas deste agente
        </Link>
      </div>

      <div className="mt-5 flex gap-1 border-b border-ink-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[14px] font-medium transition-colors ${
              tab === t.id ? 'border-brand-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'config' && <ConfigTab token={token} bot={bot} onChange={setBot} onDeleted={() => navigate('/admin/agentes')} />}
        {tab === 'knowledge' && <KnowledgeTab token={token} botId={bot.id} />}
        {tab === 'test' && <PlaygroundTab token={token} bot={bot} />}
        {tab === 'install' && <InstallTab bot={bot} />}
      </div>
    </div>
  );
}

// ── Configuração ────────────────────────────────────────────────────────────
function ConfigTab({ token, bot, onChange, onDeleted }) {
  const [form, setForm] = useState({
    name: bot.name, greeting: bot.greeting, persona: bot.persona,
    language: bot.language, model: bot.model || '', temperature: bot.temperature,
    accent_color: bot.accent_color, status: bot.status, mode: bot.mode || 'ai',
    webhook: bot.lead_routing?.webhook || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [domains, setDomains] = useState(Array.isArray(bot.allowed_domains) ? bot.allowed_domains : []);
  const [domainInput, setDomainInput] = useState('');
  const [questions, setQuestions] = useState(Array.isArray(bot.qualification_questions) ? bot.qualification_questions : []);
  const [questionInput, setQuestionInput] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function addQuestion() {
    const q = questionInput.trim();
    if (!q) return;
    setQuestions([...questions, q]);
    setQuestionInput('');
  }
  function removeQuestion(i) { setQuestions(questions.filter((_, idx) => idx !== i)); }

  function normalizeDomain(v) {
    return String(v || '').trim().toLowerCase()
      .replace(/^https?:\/\//, '').split('/')[0].split(':')[0].replace(/\.$/, '');
  }
  function addDomain() {
    const d = normalizeDomain(domainInput);
    if (!d) return;
    if (!domains.includes(d)) setDomains([...domains, d]);
    setDomainInput('');
  }
  function removeDomain(d) {
    setDomains(domains.filter((x) => x !== d));
  }

  async function save() {
    setSaving(true); setSaved(false);
    try {
      const updates = {
        name: form.name, greeting: form.greeting, persona: form.persona,
        language: form.language, model: form.model || null,
        temperature: Number(form.temperature), accent_color: form.accent_color,
        status: form.status, mode: form.mode, allowed_domains: domains,
        qualification_questions: questions,
        lead_routing: { ...(bot.lead_routing || {}), webhook: form.webhook || undefined },
      };
      const { bot: updated } = await updateBot(token, bot.id, updates);
      onChange(updated);
      setSaved(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('Apagar este agente e todos os seus dados?')) return;
    await deleteBot(token, bot.id);
    onDeleted();
  }

  const inputCls = 'mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

  const isSearch = form.mode === 'search';

  return (
    <div className="max-w-2xl space-y-4">
      {/* Modo do agente */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4">
        <span className="text-[13px] font-medium text-ink-600">Modo do agente</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <button
            type="button" onClick={() => setForm({ ...form, mode: 'ai' })}
            className={`rounded-xl border p-3 text-left transition-colors ${!isSearch ? 'border-brand-500 bg-brand-50/50' : 'border-ink-200 hover:border-brand-300'}`}
          >
            <div className="text-[14px] font-semibold text-ink-900">IA (conversa)</div>
            <div className="mt-0.5 text-[12px] text-ink-500">Responde e conversa com base no conhecimento (OpenAI). Tem custo por uso.</div>
          </button>
          <button
            type="button" onClick={() => setForm({ ...form, mode: 'search' })}
            className={`rounded-xl border p-3 text-left transition-colors ${isSearch ? 'border-brand-500 bg-brand-50/50' : 'border-ink-200 hover:border-brand-300'}`}
          >
            <div className="text-[14px] font-semibold text-ink-900">Pesquisa (sem IA)</div>
            <div className="mt-0.5 text-[12px] text-ink-500">Devolve o excerto do conhecimento que contém as palavras do visitante. Sem custo de IA.</div>
          </button>
        </div>
        {isSearch && (
          <p className="mt-2 text-[12px] text-ink-400">
            Neste modo a personalidade, o modelo e o idioma não se aplicam. Carrega o conhecimento na tab Conhecimento.
          </p>
        )}
      </div>

      <Field label="Nome do agente">
        <input value={form.name} onChange={set('name')} className={inputCls} />
      </Field>
      <Field label="Mensagem de saudação">
        <input value={form.greeting} onChange={set('greeting')} className={inputCls} />
      </Field>
      <Field label="Personalidade / tipo de conversa (system prompt)">
        <textarea value={form.persona} onChange={set('persona')} rows={6} className={inputCls} />
      </Field>

      {/* Perguntas de qualificação */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4">
        <div className="text-[13px] font-semibold text-ink-800">Perguntas de qualificação</div>
        <p className="mt-1 text-[13px] text-ink-500">
          O que o agente deve procurar saber na conversa (de forma natural, uma de cada vez). Ex.: <i>"Que tipo de negócio tem?"</i>
        </p>
        {questions.length === 0 ? (
          <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-[12.5px] text-ink-500">
            Sem perguntas — o agente qualifica livremente conforme a persona.
          </div>
        ) : (
          <ol className="mt-3 space-y-2">
            {questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-ink-50 px-3 py-2 text-[13.5px] text-ink-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">{i + 1}</span>
                <span className="flex-1">{q}</span>
                <button onClick={() => removeQuestion(i)} aria-label="Remover" className="text-ink-400 hover:text-red-500">×</button>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-3 flex gap-2">
          <input
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQuestion(); } }}
            placeholder="Escreva uma pergunta e Enter…"
            className="flex-1 rounded-xl border border-ink-200 px-3.5 py-2 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button onClick={addQuestion} className="rounded-xl border border-ink-200 px-4 py-2 font-medium text-ink-700 hover:bg-ink-50">Adicionar</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Idioma">
          <select value={form.language} onChange={set('language')} className={inputCls}>
            <option value="auto">Automático (o do visitante)</option>
            <option value="pt-PT">Português (Portugal)</option>
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en">Inglês</option>
            <option value="es">Espanhol</option>
            <option value="fr">Francês</option>
            <option value="de">Alemão</option>
          </select>
        </Field>
        <Field label="Modelo OpenAI (vazio = padrão)">
          <input value={form.model} onChange={set('model')} className={inputCls} placeholder="gpt-4o-mini" />
        </Field>
        <Field label="Criatividade (0–1)">
          <input type="number" step="0.1" min="0" max="1" value={form.temperature} onChange={set('temperature')} className={inputCls} />
        </Field>
        <Field label="Cor de marca">
          <input type="color" value={form.accent_color} onChange={set('accent_color')} className="mt-1 h-11 w-full rounded-xl border border-ink-200" />
        </Field>
      </div>
      <Field label="Webhook de leads (opcional — Zapier/Make/Slack/CRM)">
        <input value={form.webhook} onChange={set('webhook')} className={inputCls} placeholder="https://hooks.zapier.com/..." />
      </Field>

      {/* Domínios permitidos */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4">
        <div className="text-[13px] font-semibold text-ink-800">Domínios permitidos</div>
        <p className="mt-1 text-[13px] text-ink-500">
          O widget só aparece e responde nestes domínios. Deixa vazio para permitir em qualquer site.
          Usa <code className="rounded bg-ink-50 px-1">exemplo.pt</code> (inclui subdomínios) ou{' '}
          <code className="rounded bg-ink-50 px-1">*.exemplo.pt</code> (só subdomínios). <code className="rounded bg-ink-50 px-1">localhost</code> é sempre permitido.
        </p>

        {domains.length === 0 ? (
          <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-700">
            Sem restrição — o widget pode ser usado em qualquer site.
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {domains.map((d) => (
              <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1 text-[13px] text-ink-700">
                {d}
                <button onClick={() => removeDomain(d)} aria-label={`Remover ${d}`} className="text-ink-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <input
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); } }}
            placeholder="exemplo.pt"
            className="flex-1 rounded-xl border border-ink-200 px-3.5 py-2 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button onClick={addDomain} className="rounded-xl border border-ink-200 px-4 py-2 font-medium text-ink-700 hover:bg-ink-50">
            Adicionar
          </button>
        </div>
      </div>

      <Field label="Estado">
        <select value={form.status} onChange={set('status')} className={inputCls}>
          <option value="active">Ativo</option>
          <option value="paused">Em pausa</option>
        </select>
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} disabled={saving} className="rounded-xl bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
          {saving ? 'A guardar…' : 'Guardar'}
        </button>
        {saved && <span className="text-[13px] text-green-600">Guardado ✓</span>}
        <button onClick={remove} className="ml-auto text-[13px] text-red-500 hover:underline">Apagar agente</button>
      </div>
    </div>
  );
}

// ── Conhecimento ────────────────────────────────────────────────────────────
function KnowledgeTab({ token, botId }) {
  const [items, setItems] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const { knowledge } = await listKnowledge(token, botId);
    setItems(knowledge);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [botId]);

  async function add() {
    if (!content.trim()) return;
    setBusy(true);
    try {
      await addKnowledge(token, { bot_id: botId, title, content });
      setTitle(''); setContent('');
      await refresh();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function remove(itemId) {
    await deleteKnowledge(token, itemId);
    await refresh();
  }

  // Upload de ficheiro (PDF/txt/md) — extrai texto no browser e cria knowledge.
  const [importing, setImporting] = useState('');
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting('A ler ficheiro…');
    try {
      const text = await extractFileText(file);
      if (!text.trim()) throw new Error('Não encontrei texto no ficheiro.');
      setImporting('A indexar…');
      await addKnowledge(token, { bot_id: botId, title: file.name, content: text, source_type: 'file', source_ref: file.name });
      await refresh();
    } catch (err) { alert(err.message); } finally { setImporting(''); }
  }

  // Import de um URL.
  const [url, setUrl] = useState('');
  async function onImportUrl() {
    if (!url.trim()) return;
    setImporting('A importar página…');
    try {
      await importKnowledgeUrl(token, botId, url.trim());
      setUrl('');
      await refresh();
    } catch (err) { alert(err.message); } finally { setImporting(''); }
  }

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  function startEdit(it) { setEditId(it.id); setEditTitle(it.title || ''); setEditContent(it.content); }
  async function saveEdit() {
    if (!editContent.trim()) return;
    try {
      await updateKnowledge(token, editId, { title: editTitle, content: editContent });
      setEditId(null);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  const inputCls = 'w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

  return (
    <div className="max-w-2xl">
      <p className="text-[14px] text-ink-500">
        Cola aqui o que o agente deve saber: descrição de produtos, preços, FAQ, políticas. Quanto melhor o conteúdo, melhores as respostas.
      </p>
      {/* Importar: ficheiro ou URL */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white p-5 text-center hover:border-brand-400">
          <span className="text-[14px] font-medium text-ink-800">Carregar ficheiro</span>
          <span className="mt-0.5 text-[12px] text-ink-400">PDF, TXT, MD, CSV</span>
          <input type="file" accept={ACCEPTED_FILES} onChange={onFile} className="hidden" />
        </label>
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <span className="text-[14px] font-medium text-ink-800">Importar de um site</span>
          <div className="mt-2 flex gap-2">
            <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onImportUrl()} placeholder="https://exemplo.pt/produtos" className={inputCls} />
            <button onClick={onImportUrl} className="shrink-0 rounded-xl border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">Importar</button>
          </div>
        </div>
      </div>
      {importing && <p className="mt-2 text-[13px] text-brand-600">{importing}</p>}

      <div className="mt-3 rounded-2xl border border-ink-100 bg-white p-4">
        <div className="mb-2 text-[13px] font-medium text-ink-500">Ou escreve à mão</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ex.: Preços)" className={inputCls} />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Conteúdo…" className={`${inputCls} mt-2`} />
        <button onClick={add} disabled={busy} className="mt-2 rounded-xl bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
          {busy ? 'A guardar…' : 'Adicionar'}
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {items === null && <p className="text-ink-400">A carregar…</p>}
        {items?.length === 0 && <p className="text-ink-400">Sem conteúdo ainda.</p>}
        {items?.map((it) => (
          <div key={it.id} className="rounded-xl border border-ink-100 bg-white p-4">
            {editId === it.id ? (
              <>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputCls} placeholder="Título" />
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className={`${inputCls} mt-2`} />
                <div className="mt-2 flex gap-2">
                  <button onClick={saveEdit} className="rounded-lg bg-brand-500 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-600">Guardar</button>
                  <button onClick={() => setEditId(null)} className="rounded-lg border border-ink-200 px-3 py-1.5 text-[13px] text-ink-600 hover:bg-ink-50">Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-ink-900">{it.title || 'Nota'}</h3>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(it)} className="text-[12px] text-ink-500 hover:underline">Editar</button>
                    <button onClick={() => remove(it.id)} className="text-[12px] text-red-500 hover:underline">Remover</button>
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-ink-600">{it.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Testar (playground) ──────────────────────────────────────────────────────
function PlaygroundTab({ token, bot }) {
  return (
    <div className="max-w-md">
      <p className="mb-3 text-[14px] text-ink-500">
        Conversa com o teu agente como um visitante, usando a persona e o conhecimento atuais.
        Funciona mesmo com o agente em pausa ou com domínios restritos (é um teste teu).
      </p>
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-100" style={{ height: 'min(70vh, 560px)' }}>
        <AiChat key={bot.id} publicId={bot.public_id} greeting={bot.greeting} authToken={token} />
      </div>
    </div>
  );
}

// ── Instalar ────────────────────────────────────────────────────────────────
function InstallTab({ bot }) {
  const origin = window.location.origin;
  const snippet = `<script src="${origin}/embed.js" data-kyvo-id="${bot.public_id}" data-color="${bot.accent_color}" defer></script>`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[14px] text-ink-500">
        Cola esta linha antes de <code>&lt;/body&gt;</code> no site onde queres o agente. Funciona em qualquer site (WordPress, Shopify, Wix ou código próprio).
      </p>
      <div className="mt-4 rounded-2xl bg-ink-900 p-4">
        <code className="block break-all text-[13px] text-brand-200">{snippet}</code>
      </div>
      <button onClick={copy} className="mt-3 rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">
        {copied ? 'Copiado ✓' : 'Copiar código'}
      </button>
      <p className="mt-4 text-[13px] text-ink-400">
        Também podes abrir o widget a partir dos teus botões com <code>Kyvo.open()</code>.
      </p>
    </div>
  );
}
