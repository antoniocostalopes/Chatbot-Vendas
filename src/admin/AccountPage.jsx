import { useState } from 'react';
import { supabase } from './supabaseClient.js';
import { useAuth } from './useAuth.js';
import { updateAccount, deleteAccount } from '../lib/api.js';

const inputCls = 'mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

// Cartão de secção reutilizável (definido fora do componente: ver Field em BotEditor).
function Card({ title, action, children }) {
  return (
    <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-5">
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Mensagem de feedback (sucesso/erro) por secção.
function Note({ note }) {
  if (!note) return null;
  const err = note.type === 'error';
  return <p className={`mt-2 text-[13px] ${err ? 'text-red-600' : 'text-green-600'}`}>{note.text}</p>;
}

// Área do cliente: gerir a própria conta (R/U/D).
export default function AccountPage({ profile, onProfile }) {
  const { token, user } = useAuth();
  const isAdmin = profile?.role === 'platform_admin';

  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState('');           // qual a ação a decorrer
  const [notes, setNotes] = useState({});         // feedback por secção

  const setNote = (k, type, text) => setNotes((n) => ({ ...n, [k]: { type, text } }));
  const hasKey = !!profile?.has_openai_key;

  // ── Read helpers ───────────────────────────────────────────────────────────
  const since = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-PT') : '—';

  // ── Update: perfil (nome) ──────────────────────────────────────────────────
  async function saveName() {
    setBusy('name');
    try {
      const { profile: up } = await updateAccount(token, { full_name: name });
      onProfile?.((p) => ({ ...(p || {}), ...up }));
      setNote('name', 'ok', 'Nome guardado ✓');
    } catch (e) { setNote('name', 'error', e.message); } finally { setBusy(''); }
  }

  // ── Update: email (via Supabase Auth, com confirmação) ─────────────────────
  async function saveEmail() {
    const e = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(e)) { setNote('email', 'error', 'Email inválido.'); return; }
    if (e === user?.email) { setNote('email', 'error', 'É o email atual.'); return; }
    setBusy('email');
    try {
      const { error } = await supabase.auth.updateUser({ email: e });
      if (error) throw error;
      setNote('email', 'ok', 'Enviámos um link de confirmação para o novo email. A mudança só fica ativa depois de confirmares.');
    } catch (err) { setNote('email', 'error', err.message); } finally { setBusy(''); }
  }

  // ── Update: password ───────────────────────────────────────────────────────
  async function changePassword() {
    if (password.length < 6) { setNote('pw', 'error', 'A palavra-passe precisa de ≥ 6 caracteres.'); return; }
    setBusy('pw');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setNote('pw', 'ok', 'Palavra-passe alterada ✓');
    } catch (e) { setNote('pw', 'error', e.message); } finally { setBusy(''); }
  }

  // ── Update: chave OpenAI ───────────────────────────────────────────────────
  async function saveKey() {
    const k = apiKey.trim();
    if (!k.startsWith('sk-')) { setNote('key', 'error', 'A chave OpenAI deve começar por "sk-".'); return; }
    setBusy('key');
    try {
      const { profile: up } = await updateAccount(token, { openai_api_key: k });
      onProfile?.((p) => ({ ...(p || {}), has_openai_key: true, openai_key_hint: up.openai_key_hint }));
      setApiKey('');
      setNote('key', 'ok', 'Chave OpenAI guardada ✓');
    } catch (e) { setNote('key', 'error', e.message); } finally { setBusy(''); }
  }
  async function removeKey() {
    if (!confirm('Remover a tua chave OpenAI? Os teus agentes deixam de poder responder.')) return;
    setBusy('key');
    try {
      await updateAccount(token, { openai_api_key: '' });
      onProfile?.((p) => ({ ...(p || {}), has_openai_key: false, openai_key_hint: null }));
      setNote('key', 'ok', 'Chave removida.');
    } catch (e) { setNote('key', 'error', e.message); } finally { setBusy(''); }
  }

  // ── Delete: conta ──────────────────────────────────────────────────────────
  async function removeAccount() {
    if (!confirm('Apagar a tua conta e TODOS os dados associados? Esta ação é irreversível.')) return;
    setBusy('delete');
    try {
      await deleteAccount(token);
      await supabase.auth.signOut();
    } catch (e) { setNote('delete', 'error', e.message); setBusy(''); }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">A minha conta</h1>
      <p className="mt-1 text-[14px] text-ink-500">Gere o teu perfil, segurança e acesso.</p>

      {/* Resumo (read-only) */}
      <Card title="Resumo">
        <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div><div className="text-ink-400">Papel</div><div className="mt-0.5 font-medium text-ink-800">{isAdmin ? 'Gestor' : 'Cliente'}</div></div>
          <div><div className="text-ink-400">Plano</div><div className="mt-0.5 font-medium text-ink-800">{profile?.plan || 'free'}</div></div>
          <div><div className="text-ink-400">Estado</div><div className={`mt-0.5 font-medium ${profile?.status === 'suspended' ? 'text-red-600' : 'text-green-600'}`}>{profile?.status === 'suspended' ? 'Suspensa' : 'Ativa'}</div></div>
          <div><div className="text-ink-400">Membro desde</div><div className="mt-0.5 font-medium text-ink-800">{since}</div></div>
          {!isAdmin && (
            <div><div className="text-ink-400">Agentes</div><div className="mt-0.5 font-medium text-ink-800">{profile?.bot_count ?? 0}</div></div>
          )}
        </div>
      </Card>

      {/* Perfil: nome */}
      <Card title="Perfil">
        <label className="block">
          <span className="text-[13px] font-medium text-ink-600">Nome</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="O teu nome" />
        </label>
        <button onClick={saveName} disabled={busy === 'name'} className="mt-3 rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
          {busy === 'name' ? 'A guardar…' : 'Guardar nome'}
        </button>
        <Note note={notes.name} />
      </Card>

      {/* Email */}
      <Card title="Email">
        <label className="block">
          <span className="text-[13px] font-medium text-ink-600">Email de acesso</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </label>
        <p className="mt-1 text-[12px] text-ink-400">Mudar o email exige confirmação por link no novo endereço.</p>
        <button onClick={saveEmail} disabled={busy === 'email'} className="mt-3 rounded-xl border border-ink-200 px-4 py-2.5 font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">
          {busy === 'email' ? 'A enviar…' : 'Alterar email'}
        </button>
        <Note note={notes.email} />
      </Card>

      {/* Palavra-passe */}
      <Card title="Palavra-passe">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Nova palavra-passe" autoComplete="new-password" />
        <button onClick={changePassword} disabled={busy === 'pw'} className="mt-3 rounded-xl border border-ink-200 px-4 py-2.5 font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">
          {busy === 'pw' ? 'A alterar…' : 'Alterar palavra-passe'}
        </button>
        <Note note={notes.pw} />
      </Card>

      {/* Chave OpenAI — só faz sentido para clientes (têm agentes) */}
      {!isAdmin && (
        <Card
          title="Chave OpenAI"
          action={hasKey
            ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">Configurada {profile?.openai_key_hint ? `(${profile.openai_key_hint})` : ''}</span>
            : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">Em falta</span>}
        >
          <p className="text-[13px] text-ink-500">
            Os teus agentes usam a <b>tua</b> chave da OpenAI (o consumo é faturado na tua conta).
            Cria uma em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">platform.openai.com/api-keys</a>. Guardada cifrada, nunca mostrada de volta.
          </p>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className={`${inputCls} mt-2`} placeholder={hasKey ? 'Introduz uma nova chave para substituir' : 'sk-…'} autoComplete="off" />
          <div className="mt-3 flex items-center gap-2">
            <button onClick={saveKey} disabled={busy === 'key' || !apiKey.trim()} className="rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
              {hasKey ? 'Substituir chave' : 'Guardar chave'}
            </button>
            {hasKey && (
              <button onClick={removeKey} disabled={busy === 'key'} className="rounded-xl border border-ink-200 px-4 py-2.5 font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">Remover</button>
            )}
          </div>
          <Note note={notes.key} />
        </Card>
      )}

      {/* Zona de perigo */}
      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-[15px] font-semibold text-red-700">Zona de perigo</h2>
        <p className="mt-1 text-[13px] text-red-600/90">Apagar a conta remove permanentemente tudo o que lhe está associado.</p>
        <button onClick={removeAccount} disabled={busy === 'delete'} className="mt-3 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
          {busy === 'delete' ? 'A apagar…' : 'Apagar a minha conta'}
        </button>
        <Note note={notes.delete} />
      </div>
    </div>
  );
}
