import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { listBots, createBot } from '../lib/api.js';
import { EmptyState, Skeleton } from './ui.jsx';

const BotIcon = (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /><path d="M12 7v4M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>);

export default function BotsList() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    try {
      const { bots } = await listBots(token);
      setBots(bots);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { if (token) refresh(); /* eslint-disable-next-line */ }, [token]);

  async function handleCreate() {
    setCreating(true);
    setError('');
    try {
      // Cria o agente e abre logo a janela de configuração dele.
      const { bot } = await createBot(token, { name: 'Novo agente' });
      navigate(`/admin/agentes/${bot.public_id}`);
    } catch (e) {
      setError(e.message);
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Os teus agentes</h1>
          <p className="mt-1 text-[14px] text-ink-500">Cria, treina e instala bots de vendas no teu site.</p>
        </div>
        <button
          onClick={handleCreate} disabled={creating}
          className="cursor-pointer rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white shadow-glow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-600 disabled:opacity-50"
        >
          {creating ? 'A criar…' : '+ Novo agente'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>}

      {bots === null && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-3 h-5 w-32" />
              <Skeleton className="mt-2 h-3.5 w-full" />
              <Skeleton className="mt-4 h-6 w-28" />
            </div>
          ))}
        </div>
      )}

      {bots && bots.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<BotIcon className="h-6 w-6" />}
            title="Ainda não tens agentes"
            subtitle="Cria o teu primeiro agente de vendas com IA e instala-o no teu site em minutos."
            action={(
              <button onClick={handleCreate} disabled={creating} className="cursor-pointer rounded-xl bg-brand-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
                {creating ? 'A criar…' : '+ Criar primeiro agente'}
              </button>
            )}
          />
        </div>
      )}

      {bots && bots.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Link
              key={bot.id}
              to={`/admin/agentes/${bot.public_id}`}
              className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <BotIcon className="h-5 w-5" />
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${bot.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-500'}`}>
                  {bot.status === 'active' ? 'Ativo' : 'Em pausa'}
                </span>
              </div>
              <h2 className="mt-3 font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{bot.name}</h2>
              <p className="mt-1 line-clamp-2 text-[13px] text-ink-500">{bot.greeting}</p>
              <code className="mt-3 inline-block rounded bg-ink-50 px-2 py-1 text-[11px] text-ink-500">{bot.public_id}</code>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
