import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { listBots, createBot } from '../lib/api.js';

export default function BotsList() {
  const { token } = useAuth();
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
      await createBot(token, { name: 'Novo agente' });
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
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
          className="rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {creating ? 'A criar…' : '+ Novo agente'}
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {bots === null && <p className="text-ink-400">A carregar…</p>}
        {bots && bots.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-ink-200 p-10 text-center text-ink-500">
            Ainda não tens agentes. Cria o primeiro →
          </div>
        )}
        {bots?.map((bot) => (
          <Link
            key={bot.id}
            to={`/admin/agentes/${bot.public_id}`}
            className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink-900">{bot.name}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${bot.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                {bot.status === 'active' ? 'Ativo' : 'Em pausa'}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-[13px] text-ink-500">{bot.greeting}</p>
            <code className="mt-3 inline-block rounded bg-ink-50 px-2 py-1 text-[12px] text-ink-600">{bot.public_id}</code>
          </Link>
        ))}
      </div>
    </div>
  );
}
