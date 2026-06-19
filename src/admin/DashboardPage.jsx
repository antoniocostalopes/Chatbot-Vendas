import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { listLeads, listConversations, listBots } from '../lib/api.js';
import { SkeletonCards, Skeleton } from './ui.jsx';

const fmt = (n) => new Intl.NumberFormat('pt-PT').format(n);
const eur = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const shortTime = (iso) => {
  const d = new Date(iso); const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};

// ── Ícones ───────────────────────────────────────────────────────────────────
const I = {
  users: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>),
  chat: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z" /></svg>),
  target: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></svg>),
  euro: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 7a6 6 0 1 0 0 10M4 10h8M4 14h7" /></svg>),
  up: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 5-5 5 5" /></svg>),
  down: (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 10 5 5 5-5" /></svg>),
};

// Pontos normalizados para um SVG w×h.
function toPoints(data, w, h, pad = 3) {
  const max = Math.max(1, ...data);
  const n = data.length;
  return data.map((v, i) => {
    const x = n === 1 ? w / 2 : (i / (n - 1)) * (w - pad * 2) + pad;
    const y = h - (v / max) * (h - pad * 2) - pad;
    return [x, y];
  });
}

// Sparkline (mini-tendência dentro do KPI).
function Sparkline({ data, id, color = '#2b6bf5' }) {
  const w = 120, h = 34;
  const pts = toPoints(data, w, h);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `M${pts[0][0].toFixed(1)},${h} L${line.replace(/ /g, ' L')} L${pts[pts.length - 1][0].toFixed(1)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full" aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Gráfico de área principal (tendência ao longo do período).
function AreaChart({ days }) {
  const w = 600, h = 200;
  const data = days.map((d) => d.n);
  const pts = toPoints(data, w, h, 6);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `M${pts[0][0].toFixed(1)},${h} L${line.replace(/ /g, ' L')} L${pts[pts.length - 1][0].toFixed(1)},${h} Z`;
  const grid = [0.25, 0.5, 0.75];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-48 w-full" aria-hidden>
      <defs><linearGradient id="area-main" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2b6bf5" stopOpacity="0.20" /><stop offset="100%" stopColor="#2b6bf5" stopOpacity="0" /></linearGradient></defs>
      {grid.map((g) => <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="#e9eef5" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      <path d={area} fill="url(#area-main)" />
      <polyline points={line} fill="none" stroke="#2b6bf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Delta({ d }) {
  if (!d) return null;
  const Ico = d.up ? I.up : I.down;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-semibold ${d.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      <Ico className="h-3.5 w-3.5" />{d.txt}
    </span>
  );
}

function StatCard({ icon, label, value, hint, delta, spark, sparkId }) {
  return (
    <div className="flex flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon({ className: 'h-[18px] w-[18px]' })}</span>
        <Delta d={delta} />
      </div>
      <div className="mt-3 text-[26px] font-bold leading-none tracking-tight text-ink-900">{value}</div>
      <div className="mt-1 text-[13px] text-ink-500">{label}</div>
      <div className="mt-3 -mb-1">{spark && <Sparkline data={spark} id={sparkId} />}</div>
      {hint && <div className="mt-1 text-[11.5px] text-ink-400">{hint}</div>}
    </div>
  );
}

const PERIODS = [{ k: 7, label: '7 dias' }, { k: 30, label: '30 dias' }, { k: 90, label: '90 dias' }];

export default function DashboardPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState(null);
  const [convs, setConvs] = useState(null);
  const [bots, setBots] = useState([]);
  const [avg, setAvg] = useState(() => Number(localStorage.getItem('kyvo_avg_value')) || 150);
  const [period, setPeriod] = useState(30);

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
    const base = new Date(now); base.setHours(0, 0, 0, 0); base.setDate(base.getDate() - (period - 1));
    const baseT = base.getTime();
    const prevStartT = baseT - period * 86400000;
    const dayIdx = (iso) => { const t = new Date(iso); t.setHours(0, 0, 0, 0); return Math.round((t.getTime() - baseT) / 86400000); };

    const buckets = (items) => {
      const arr = Array.from({ length: period }, (_, i) => ({ d: new Date(baseT + i * 86400000), n: 0 }));
      items.forEach((it) => { const i = dayIdx(it.created_at); if (i >= 0 && i < period) arr[i].n++; });
      return arr;
    };
    const leadDays = buckets(leads);
    const convDays = buckets(convs);

    const inCur = (iso) => new Date(iso).getTime() >= baseT;
    const inPrev = (iso) => { const t = new Date(iso).getTime(); return t >= prevStartT && t < baseT; };
    const leadsCur = leads.filter((x) => inCur(x.created_at)).length;
    const leadsPrev = leads.filter((x) => inPrev(x.created_at)).length;
    const convsCur = convs.filter((x) => inCur(x.created_at)).length;
    const convsPrev = convs.filter((x) => inPrev(x.created_at)).length;
    const rate = convsCur ? Math.round((leadsCur / convsCur) * 100) : 0;
    const ratePrev = convsPrev ? Math.round((leadsPrev / convsPrev) * 100) : 0;

    const byBot = bots.map((b) => {
      const lc = leads.filter((x) => x.bot_id === b.id).length;
      const cc = convs.filter((x) => x.bot_id === b.id).length;
      return { id: b.id, name: b.name, leads: lc, convs: cc, rate: cc ? Math.round((lc / cc) * 100) : 0 };
    }).sort((a, b) => b.leads - a.leads);
    const maxBot = Math.max(1, ...byBot.map((b) => b.leads));

    const rateDaily = leadDays.map((d, i) => (convDays[i].n ? d.n / convDays[i].n : 0));
    const recent = [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

    return {
      leadsCur, leadsPrev, convsCur, convsPrev, rate, ratePrev,
      leadDaily: leadDays.map((d) => d.n), convDaily: convDays.map((d) => d.n),
      retDaily: leadDays.map((d) => d.n * avg), rateDaily, leadDays, byBot, maxBot, recent,
      totalLeads: leads.length, totalConvs: convs.length,
    };
  }, [leads, convs, bots, period, avg]);

  const delta = (cur, prev) => {
    if (!prev) return cur ? { up: true, txt: 'novo' } : null;
    const p = Math.round(((cur - prev) / prev) * 100);
    return { up: p >= 0, txt: `${p >= 0 ? '+' : ''}${p}%` };
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-900">Visão geral</h1>
          <p className="mt-1 text-[14px] text-ink-500">O retorno dos teus agentes num relance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-ink-200 bg-white p-0.5">
            {PERIODS.map((p) => (
              <button key={p.k} onClick={() => setPeriod(p.k)} className={`cursor-pointer rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${period === p.k ? 'bg-brand-500 text-white' : 'text-ink-500 hover:text-ink-800'}`}>{p.label}</button>
            ))}
          </div>
          <Link to="/admin/agentes" className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-[13px] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600">Gerir agentes</Link>
        </div>
      </header>

      {!m && (
        <div className="space-y-4">
          <SkeletonCards count={4} />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2"><Skeleton className="h-5 w-48" /><Skeleton className="mt-5 h-48 w-full" /></div>
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card"><Skeleton className="h-5 w-40" /><Skeleton className="mt-5 h-10 w-full" /><Skeleton className="mt-3 h-24 w-full" /></div>
          </div>
        </div>
      )}

      {m && (
        <div className="space-y-4">
          {/* KPIs com sparkline */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={I.users} value={fmt(m.leadsCur)} label="Leads no período" hint={`${fmt(m.totalLeads)} no total`} delta={delta(m.leadsCur, m.leadsPrev)} spark={m.leadDaily} sparkId="sp-leads" />
            <StatCard icon={I.chat} value={fmt(m.convsCur)} label="Conversas no período" hint={`${fmt(m.totalConvs)} no total`} delta={delta(m.convsCur, m.convsPrev)} spark={m.convDaily} sparkId="sp-convs" />
            <StatCard icon={I.target} value={`${m.rate}%`} label="Taxa de captação" hint="leads por conversa" delta={delta(m.rate, m.ratePrev)} spark={m.rateDaily} sparkId="sp-rate" />
            <StatCard icon={I.euro} value={eur(m.leadsCur * avg)} label="Retorno estimado" hint="leads × valor médio" delta={delta(m.leadsCur, m.leadsPrev)} spark={m.retDaily} sparkId="sp-ret" />
          </div>

          {/* Gráfico de área + estimativa */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-ink-900">Leads ao longo do tempo</h2>
                <span className="text-[12px] text-ink-400">{fmt(m.leadDaily.reduce((s, n) => s + n, 0))} nos últimos {period} dias</span>
              </div>
              <div className="mt-4"><AreaChart days={m.leadDays} /></div>
              <div className="mt-1 flex justify-between text-[11px] text-ink-400">
                <span>{m.leadDays[0].d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}</span>
                <span>hoje</span>
              </div>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="text-[15px] font-semibold text-ink-900">Estimativa de retorno</h2>
              <label className="mt-3 block text-[12px] font-medium text-ink-500">Valor médio por lead</label>
              <div className="mt-1 flex items-center rounded-xl border border-ink-200 px-3 focus-within:border-brand-500">
                <span className="text-ink-400">€</span>
                <input type="number" min="0" value={avg} onChange={(e) => saveAvg(e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-[15px] outline-none" />
              </div>
              <div className="mt-4 rounded-xl bg-brand-50 p-4">
                <div className="text-[12px] text-brand-700">Retorno estimado ({period} dias)</div>
                <div className="text-[24px] font-bold text-brand-700">{eur(m.leadsCur * avg)}</div>
                <div className="mt-0.5 text-[12px] text-brand-600/80">{eur(m.totalLeads * avg)} no total captado</div>
              </div>
            </div>
          </div>

          {/* Desempenho por agente + Atividade recente */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="text-[15px] font-semibold text-ink-900">Desempenho por agente</h2>
              {!m.byBot.length && <p className="mt-3 text-[13px] text-ink-500">Ainda não tens agentes. <Link to="/admin/agentes" className="text-brand-600 hover:underline">Cria o primeiro →</Link></p>}
              <div className="mt-4 space-y-3">
                {m.byBot.map((b) => (
                  <Link key={b.id} to={`/admin/leads?agente=${b.id}`} className="block rounded-xl px-2 py-2 transition-colors hover:bg-ink-50/60">
                    <div className="flex items-center justify-between text-[13.5px]">
                      <span className="font-medium text-ink-900">{b.name}</span>
                      <span className="text-ink-500">{fmt(b.leads)} leads · {b.rate}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-grad-brand" style={{ width: `${(b.leads / m.maxBot) * 100}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-ink-900">Atividade recente</h2>
                <Link to="/admin/leads" className="text-[12px] font-medium text-brand-600 hover:underline">Ver tudo</Link>
              </div>
              {!m.recent.length && <p className="mt-3 text-[13px] text-ink-500">Sem atividade ainda.</p>}
              <ul className="mt-3 divide-y divide-ink-50">
                {m.recent.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[12px] font-semibold text-brand-600">{(l.name || 'L').charAt(0).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium text-ink-900">{l.name || l.email || 'Novo lead'}</div>
                      <div className="truncate text-[12px] text-ink-400">{l.bot?.name || 'Agente'}</div>
                    </div>
                    <span className="shrink-0 text-[11.5px] text-ink-400">{shortTime(l.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
