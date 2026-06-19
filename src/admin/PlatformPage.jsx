import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { adminStats, adminListClients, adminUpdateClient, adminListBots } from '../lib/api.js';

// ── helpers ──────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 13) return 'Bom dia';
  if (h < 20) return 'Boa tarde';
  return 'Boa noite';
}
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'agora';
  const m = Math.floor(s / 60); if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24); if (d < 30) return `há ${d}d`;
  return new Date(iso).toLocaleDateString('pt-PT');
}

const ic = 'h-[18px] w-[18px]';
const IconUsers = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5a3.5 3.5 0 0 1 0 7M18 20a6 6 0 0 0-3-5.2" /></svg>);
const IconBot = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /><path d="M12 7v4M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>);
const IconChat = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const IconLead = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 7l-10 6L2 7" /><rect x="2" y="5" width="20" height="14" rx="2" /></svg>);

// ── métrica ──────────────────────────────────────────────────────────────────
function Metric({ icon, label, value, sub, to, loading, accent }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent ? 'bg-brand-50 text-brand-600' : 'bg-ink-50 text-ink-500'}`}>{icon}</span>
        {to && <span className="text-ink-300 transition-transform group-hover:translate-x-0.5">→</span>}
      </div>
      <div className="mt-3 text-[26px] font-bold leading-none text-ink-900 tabular-nums">
        {loading ? <span className="inline-block h-6 w-10 animate-pulse rounded bg-ink-100" /> : value}
      </div>
      <div className="mt-1 text-[13px] text-ink-500">{label}</div>
      {sub && <div className="mt-1 text-[12px] text-ink-400">{sub}</div>}
    </>
  );
  const cls = 'group rounded-2xl border border-ink-100 bg-white p-4 transition-all';
  return to
    ? <Link to={to} className={`${cls} hover:border-brand-300 hover:shadow-glow-sm`}>{inner}</Link>
    : <div className={cls}>{inner}</div>;
}

function StatusBadge({ status }) {
  const sus = status === 'suspended';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${sus ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{sus ? 'Suspenso' : 'Ativo'}</span>;
}

export default function PlatformPage({ isAdmin, ready }) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState(null);
  const [bots, setBots] = useState(null);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const view = params.get('view') === 'clientes' ? 'clientes' : params.get('view') === 'agentes' ? 'agentes' : 'overview';

  async function refresh() {
    try {
      const [{ stats }, { clients }] = await Promise.all([adminStats(token), adminListClients(token)]);
      setStats(stats); setClients(clients);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { if (token && isAdmin) refresh(); /* eslint-disable-next-line */ }, [token, isAdmin]);
  useEffect(() => {
    if (view === 'agentes' && bots === null && token) adminListBots(token).then(({ bots }) => setBots(bots)).catch((e) => setError(e.message));
    /* eslint-disable-next-line */
  }, [view, token]);

  async function toggleStatus(c) {
    const next = c.status === 'suspended' ? 'active' : 'suspended';
    setClients((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    try { await adminUpdateClient(token, c.id, { status: next }); } catch (e) { alert(e.message); refresh(); }
  }

  if (!ready) return <DashSkeleton />;
  if (!isAdmin) return <Navigate to="/admin" replace />;

  const firstName = (user?.email || '').split('@')[0];
  const free = clients?.filter((c) => c.plan === 'free').length ?? 0;
  const pro = clients?.filter((c) => c.plan === 'pro').length ?? 0;
  const planTotal = Math.max(free + pro, 1);

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {view === 'clientes' ? 'Clientes' : view === 'agentes' ? 'Agentes' : `${greeting()}, ${firstName}`}
          </h1>
          <p className="mt-1 text-[14px] text-ink-500">
            {view === 'clientes' ? 'Todos os clientes da plataforma.'
              : view === 'agentes' ? 'Todos os agentes criados na plataforma.'
              : 'Visão geral do negócio Kyvo.'}
          </p>
        </div>
        {view === 'overview' && (
          <div className="flex gap-2">
            <Link to="/admin/plataforma?view=clientes" className="rounded-xl border border-ink-200 px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-50">Gerir clientes</Link>
            <Link to="/admin/plataforma?view=agentes" className="rounded-xl border border-ink-200 px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-50">Ver agentes</Link>
          </div>
        )}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>}

      {/* ── OVERVIEW (dashboard) ─────────────────────────────────────────── */}
      {view === 'overview' && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric icon={<IconUsers />} label="Clientes" value={stats?.clients} loading={!stats}
              sub={stats?.suspended ? `${stats.suspended} suspenso${stats.suspended > 1 ? 's' : ''}` : 'todos ativos'} to="/admin/plataforma?view=clientes" />
            <Metric icon={<IconBot />} label="Agentes" value={stats?.bots} loading={!stats} to="/admin/plataforma?view=agentes" />
            <Metric icon={<IconChat />} label="Conversas" value={stats?.conversations} loading={!stats} />
            <Metric icon={<IconLead />} label="Leads captados" value={stats?.leads} loading={!stats} accent />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {/* Clientes recentes */}
            <div className="lg:col-span-2 rounded-2xl border border-ink-100 bg-white">
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
                <h2 className="text-[15px] font-semibold text-ink-900">Clientes recentes</h2>
                <Link to="/admin/plataforma?view=clientes" className="text-[13px] font-medium text-brand-600 hover:underline">Ver todos</Link>
              </div>
              <div className="divide-y divide-ink-50">
                {clients === null && [0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className="h-9 w-9 animate-pulse rounded-full bg-ink-100" />
                    <span className="h-3 w-40 animate-pulse rounded bg-ink-100" />
                  </div>
                ))}
                {clients?.length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-[14px] font-medium text-ink-700">Ainda não há clientes</p>
                    <p className="mt-1 text-[13px] text-ink-400">Assim que alguém se registar no painel, aparece aqui.</p>
                  </div>
                )}
                {clients?.slice(0, 6).map((c) => (
                  <Link key={c.id} to={`/admin/plataforma/clientes/${c.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50/60">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[13px] font-bold uppercase text-brand-700">{(c.email || '?')[0]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium text-ink-800">{c.email}</div>
                      <div className="text-[12px] text-ink-400">{c.bot_count} agente{c.bot_count === 1 ? '' : 's'} · {timeAgo(c.created_at)}</div>
                    </div>
                    <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-600">{c.plan}</span>
                    <StatusBadge status={c.status} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Planos + estado */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-ink-100 bg-white p-5">
                <h2 className="text-[15px] font-semibold text-ink-900">Planos</h2>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-ink-100">
                  <div className="bg-ink-300" style={{ width: `${(free / planTotal) * 100}%` }} />
                  <div className="bg-brand-500" style={{ width: `${(pro / planTotal) * 100}%` }} />
                </div>
                <div className="mt-3 space-y-1.5 text-[13px]">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-ink-600"><span className="h-2.5 w-2.5 rounded-full bg-ink-300" />Free</span><span className="font-medium text-ink-800">{free}</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-ink-600"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" />Pro</span><span className="font-medium text-ink-800">{pro}</span></div>
                </div>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-5">
                <h2 className="text-[15px] font-semibold text-ink-900">Estado das contas</h2>
                <div className="mt-3 flex items-center gap-4">
                  <div><div className="text-2xl font-bold text-emerald-600 tabular-nums">{(stats?.clients ?? 0) - (stats?.suspended ?? 0)}</div><div className="text-[12px] text-ink-400">ativas</div></div>
                  <div className="h-8 w-px bg-ink-100" />
                  <div><div className="text-2xl font-bold text-ink-400 tabular-nums">{stats?.suspended ?? 0}</div><div className="text-[12px] text-ink-400">suspensas</div></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CLIENTES (gestão) ────────────────────────────────────────────── */}
      {view === 'clientes' && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-ink-100 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 font-medium">Plano</th><th className="px-4 py-3 font-medium">Agentes</th>
                <th className="px-4 py-3 font-medium">Estado</th><th className="px-4 py-3 font-medium">Registo</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients === null && <tr><td colSpan={7} className="px-4 py-6 text-ink-400">A carregar…</td></tr>}
              {clients?.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-400">Sem clientes.</td></tr>}
              {clients?.map((c) => (
                <tr key={c.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                  <td className="px-4 py-3"><Link to={`/admin/plataforma/clientes/${c.id}`} className="font-medium text-brand-600 hover:underline">{c.email}</Link></td>
                  <td className="px-4 py-3">{c.role === 'platform_admin' ? <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-medium text-white">Gestor</span> : <span className="text-ink-600">Cliente</span>}</td>
                  <td className="px-4 py-3 text-ink-600">{c.plan}</td>
                  <td className="px-4 py-3 text-ink-700 tabular-nums">{c.bot_count}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-ink-400">{new Date(c.created_at).toLocaleDateString('pt-PT')}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => toggleStatus(c)} className="text-[12px] text-ink-600 hover:underline">{c.status === 'suspended' ? 'Reativar' : 'Suspender'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── AGENTES (gestão) ─────────────────────────────────────────────── */}
      {view === 'agentes' && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-ink-100 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Agente</th><th className="px-4 py-3 font-medium">public_id</th>
                <th className="px-4 py-3 font-medium">Dono</th><th className="px-4 py-3 font-medium">Estado</th><th className="px-4 py-3 font-medium">Criado</th>
              </tr>
            </thead>
            <tbody>
              {bots === null && <tr><td colSpan={5} className="px-4 py-6 text-ink-400">A carregar…</td></tr>}
              {bots?.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-400">Sem agentes.</td></tr>}
              {bots?.map((b) => (
                <tr key={b.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                  <td className="px-4 py-3 font-medium text-ink-800">{b.name}</td>
                  <td className="px-4 py-3"><code className="text-[12px] text-ink-500">{b.public_id}</code></td>
                  <td className="px-4 py-3 text-ink-600">{b.owner?.email}{b.owner?.status === 'suspended' && <span className="ml-1 text-[11px] text-red-500">(suspenso)</span>}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${b.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500'}`}>{b.status === 'active' ? 'Ativo' : 'Pausa'}</span></td>
                  <td className="px-4 py-3 text-ink-400">{new Date(b.created_at).toLocaleDateString('pt-PT')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Skeleton enquanto o perfil/role ainda carrega.
function DashSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-56 rounded bg-ink-100" />
      <div className="mt-2 h-4 w-40 rounded bg-ink-100" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl border border-ink-100 bg-white" />)}
      </div>
    </div>
  );
}
