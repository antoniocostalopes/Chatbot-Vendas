import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { listLeads, listBots, deleteLead } from '../lib/api.js';
import { EmptyState, Skeleton } from './ui.jsx';

// Página global de Leads (todos os agentes do cliente), com a proveniência
// (de que bot veio cada lead), filtro por agente e pesquisa.
export default function LeadsPage() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const [leads, setLeads] = useState(null);
  const [bots, setBots] = useState([]);
  const [bot, setBot] = useState(params.get('agente') || 'all'); // pré-filtra se vier do editor
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const [{ leads }, { bots }] = await Promise.all([listLeads(token), listBots(token)]);
        if (alive) { setLeads(leads); setBots(bots || []); }
      } catch { if (alive) { setLeads([]); setBots([]); } }
    })();
    return () => { alive = false; };
  }, [token]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    const needle = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (bot !== 'all' && l.bot_id !== bot) return false;
      if (!needle) return true;
      return [l.name, l.email, l.phone, l.notes, l.bot?.name]
        .filter(Boolean).some((v) => v.toLowerCase().includes(needle));
    });
  }, [leads, bot, q]);

  async function remove(id) {
    if (!confirm('Apagar este lead?')) return;
    setLeads((ls) => ls.filter((l) => l.id !== id));
    try { await deleteLead(token, id); } catch (e) { alert(e.message); }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Leads</h1>
        <p className="mt-1 text-[14px] text-ink-500">
          Todos os contactos captados pelos teus agentes, com a origem de cada um.
        </p>
      </header>

      {/* Barra de filtros */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" strokeLinecap="round" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar por nome, email, telefone…"
            className="w-full rounded-xl border border-ink-200 py-2.5 pl-9 pr-3 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:w-80"
          />
        </div>
        <select
          value={bot}
          onChange={(e) => setBot(e.target.value)}
          className="rounded-xl border border-ink-200 px-3 py-2.5 text-[14px] text-ink-700 outline-none focus:border-brand-500"
        >
          <option value="all">Todos os agentes</option>
          {bots.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {leads === null && (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-ink-50 px-4 py-4 last:border-0">
              <Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-44" /><Skeleton className="h-4 w-32" /><Skeleton className="ml-auto h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      )}
      {leads && !filtered.length && (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>}
          title={leads.length ? 'Nenhum lead corresponde ao filtro' : 'Ainda não há leads'}
          subtitle={leads.length ? 'Ajusta a pesquisa ou o filtro de agente.' : 'Quando um agente captar um contacto, ele aparece aqui automaticamente.'}
        />
      )}

      {leads && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
          <table className="w-full text-left text-[13.5px]">
            <thead className="border-b border-ink-100 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Interesse</th>
                <th className="px-4 py-3 font-medium">Agente</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                  <td className="px-4 py-3 font-medium text-ink-900">{l.name || 'Sem nome'}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {l.email && <div>{l.email}</div>}
                    {l.phone && <div className="text-ink-500">{l.phone}</div>}
                    {!l.email && !l.phone && <span className="text-ink-400">sem contacto</span>}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink-600" title={l.notes || ''}>{l.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-medium text-brand-700">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" strokeLinejoin="round" /></svg>
                      {l.bot?.name || 'Agente removido'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-400">{new Date(l.created_at).toLocaleString('pt-PT')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(l.id)} className="text-[12px] text-red-500 hover:underline">Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {leads && filtered.length > 0 && (
        <p className="mt-3 text-[12px] text-ink-400">{filtered.length} lead{filtered.length === 1 ? '' : 's'}</p>
      )}
    </div>
  );
}
