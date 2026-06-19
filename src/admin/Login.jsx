import { useState } from 'react';
import { supabase } from './supabaseClient.js';

// Login / registo do painel (Supabase Auth — email + password).
export default function Login() {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Conta criada. Se o teu projeto exigir confirmação de email, verifica a caixa de entrada.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err.message || 'Não foi possível autenticar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center">
          <img src="/kyvo-logo.png" alt="Kyvo" className="h-9 w-auto select-none" draggable={false} />
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-ink-900">
            {mode === 'signin' ? 'Entrar no painel' : 'Criar conta'}
          </h1>
          <label className="mt-4 block text-[13px] font-medium text-ink-600">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-[14.5px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="tu@empresa.pt"
          />
          <label className="mt-3 block text-[13px] font-medium text-ink-600">Palavra-passe</label>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-[14.5px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="••••••••"
          />
          <button
            type="submit" disabled={busy}
            className="mt-5 w-full rounded-xl bg-brand-500 py-2.5 font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {busy ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : 'Registar'}
          </button>
          {msg && <p className="mt-3 text-[13px] text-ink-600">{msg}</p>}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(''); }}
            className="mt-4 w-full text-center text-[13px] text-brand-600 hover:underline"
          >
            {mode === 'signin' ? 'Não tens conta? Criar conta' : 'Já tens conta? Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
