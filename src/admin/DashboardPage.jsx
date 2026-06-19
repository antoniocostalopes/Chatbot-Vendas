import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { listLeads, listConversations, listBots } from '../lib/api.js';
import { SkeletonCards, Skeleton } from './ui.jsx';

const fmt = (n) => new Intl.NumberFormat('pt-PT').format(n);
const eur = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

// ── Ícones ───────────────────────────────────────────────────────────────────
const I = {
  users: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>),
  chat: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z" /></svg>),
  target: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></svg>),
  euro: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 7a6 6 0 1 0 0 10M4 10h8M4 14h7" /></svg>),
};

function StatCard({ icon, label, value, hint, delta }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon({ className: 'h-5 w-5' })}</span>
        {delta && (
          <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${delta.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{delta.txt}</span>
        )}
      </div>
      <div className="mt-4 text-[28px] font-bold leading-none tracking-tight text-ink-900">{value}</div>
      <div className="mt-1.5 text-[13.5px] text-ink-500">{label}</div>
      {hint && <div className="mt-0.5 text-[12px] text-ink-400">{hint}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState(null);
  const [convs, setConvs] = useState(null);
  const [bots, setBots] = useState([]);
  const [avg, setAvg] = useState(() => Number(localStorage.getItem('kyvo_avg_value')) || 150);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const [l, c, b] = await Promise.all([listLeads(token), listConversations(token), listBots(token)]);
        if (alive) { setLeads(l.leads); setConvs(c.conversations); setBots(b.bots || []); }
      } catch { if (alive) { setLeads([]); setConvs([]); setBots([]); } }
    })();
    return () => { alive = false; };
  }, [token]);

  function saveAvg(v) { const n = Math.max(0, Number(v) || 0); setAvg(n); localStorage.setItem('kyvo_avg_value', String(n)); }

  const m = useMemo(() => {
    if (!leads || !convs) return null;
    const now = new Date();
    const som = startOfMonth(now).getTime();
    const prevSom = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1)).getTime();
    const inThis = (iso) => new Date(iso).getTime() >= som;
    const inPrev = (iso) => { const t = new Date(iso).getTime(); return t >= prevSom && t < som; };
    const leadsMonth = leads.filter((x) => inThis(x.created_at)).length;
    const leadsPrev = leads.filter((x) => inPrev(x.created_at)).length;
    const convMonth = convs.filter((x) => inThis(x.created_at)).length;
    const convPrev = convs.filter((x) => inPrev(x.created_at)).length;
    const capture = convs.length ? Math.round((leads.length / convs.length) * 100) : 0;

    const byBot = bots.map((b) => {
      const lc = leads.filter((x) => x.bot_id === b.id).length;
      const cc = convs.filter((x) => x.bot_id === b.id).length;
      return { id: b.id, public_id: b.public_id, name: b.name, leads: lc, convs: cc, rate: cc ? Math.round((lc / cc) * 100) : 0 };
    }).sort((a, b) => b.leads - a.leads);
    const maxBotLeads = Math.max(1, ...byBot.map((b) => b.leads));

    const days = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push({ d, n: 0 }); }
    leads.forEach((x) => { const t = new Date(x.created_at); t.setHours(0, 0, 0, 0); const i = Math.round((t - days[0].d) / 86400000); if (i >= 0 && i < 30) days[i].n++; });
    const maxDay = Math.max(1, ...days.map((d) => d.n));

    return {
      leadsMonth, leadsPrev, convMonth, convPrev, capture, byBot, maxBotLeads, days, maxDay,
      activeBots: bots.filter((b) => b.status === 'active').length, totalBots: bots.length,
      totalLeads: leads.length, totalConvs: convs.length,
    };
  }, [leads, convs, bots]);

  const delta = (cur, prev) => {
    if (!prev) return cur ? { up: true, txt: 'novo' } : null;
    const p = Math.round(((cur - prev) / prev) * 100);
    return { up: p >= 0, txt: `${p >= 0 ? '+' : ''}${p}%` };
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Visão geral</h1>
          <p className="mt-1 text-[14px] text-ink-500">O retorno dos teus agentes num relance.</p>
        </div>
        <Link to="/admin/agentes" className="rounded-xl bg-brand-500 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600">Gerir agentes</Link>
      </header>

      {!m && (
        <div className="space-y-4">
          <SkeletonCards count={4} />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2"><Skeleton className="h-5 w-48" /><Skeleton className="mt-5 h-36 w-full" /></div>
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card"><Skeleton className="h-5 w-40" /><Skeleton className="mt-5 h-10 w-full" /><Skeleton className="mt-3 h-20 w-full" /></div>
          </div>
        </div>
      )}

      {m && (
        <>
          {/* KPIs principais */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={I.users} value={fmt(m.leadsMonth)} label="Leads este mês" hint={`${fmt(m.totalLeads)} no total`} delta={delta(m.leadsMonth, m.leadsPrev)} />
            <StatCard icon={I.chat} value={fmt(m.convMonth)} label="Conversas este mês" hint={`${fmt(m.totalConvs)} no total`} delta={delta(m.convMonth, m.convPrev)} />
            <StatCard icon={I.target} value={`${m.capture}%`} label="Taxa de captação" hint="leads por conversa" />
            <StatCard icon={I.euro} value={eur(m.leadsMonth * avg)} label="Retorno estimado (mês)" hint={`${fmt(m.leadsMonth)} leads × valor médio`} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {/* Evolução 30 dias */}
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-ink-900">Leads nos últimos 30 dias</h2>
                <span className="text-[12px] text-ink-400">{fmt(m.days.reduce((s, d) => s + d.n, 0))} no período</span>
              </div>
              <div className="mt-5 flex h-36 items-end gap-1">
                {m.days.map((d, i) => (
                  <div
                    key={i}
                    title={`${d.d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}: ${d.n} lead${d.n === 1 ? '' : 's'}`}
                    className="flex-1 rounded-t bg-brand-200 transition-colors hover:bg-brand-400"
                    style={{ height: `${Math.max(4, (d.n / m.maxDay) * 100)}%`, background: d.n ? undefined : '#eef1f6' }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-ink-400">
                <span>há 30 dias</span><span>hoje</span>
              </div>
            </div>

            {/* Retorno: valor médio editável */}
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="text-[15px] font-semibold text-ink-900">Estimativa de retorno</h2>
              <p className="mt-1 text-[13px] text-ink-500">Define o valor médio por lead/venda para estimar o retorno.</p>
              <label className="mt-4 block text-[12px] font-medium text-ink-500">Valor médio por lead</label>
              <div className="mt-1 flex items-center rounded-xl border border-ink-200 px-3 focus-within:border-brand-500">
                <span className="text-ink-400">€</span>
                <input type="number" min="0" value={avg} onChange={(e) => saveAvg(e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-[15px] outline-none" />
              </div>
              <div className="mt-4 rounded-xl bg-brand-50 p-4">
                <div className="text-[12px] text-brand-700">Retorno estimado este mês</div>
                <div className="text-[24px] font-bold text-brand-700">{eur(m.leadsMonth * avg)}</div>
                <div className="mt-0.5 text-[12px] text-brand-600/80">{eur(m.totalLeads * avg)} no total captado</div>
              </div>
            </div>
          </div>

          {/* Desempenho por agente */}
          <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="text-[15px] font-semibold text-ink-900">Desempenho por agente</h2>
            {!m.byBot.length && <p className="mt-3 text-[13px] text-ink-500">Ainda não tens agentes. <Link to="/admin/agentes" className="text-brand-600 hover:underline">Cria o primeiro →</Link></p>}
            <div className="mt-4 space-y-3">
              {m.byBot.map((b) => (
                <Link key={b.id} to={`/admin/leads?agente=${b.id}`} className="block rounded-xl px-2 py-2 transition-colors hover:bg-ink-50/60">
                  <div className="flex items-center justify-between text-[13.5px]">
                    <span className="font-medium text-ink-900">{b.name}</span>
                    <span className="text-ink-500">{fmt(b.leads)} leads · {fmt(b.convs)} conversas · {b.rate}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${(b.leads / m.maxBotLeads) * 100}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
