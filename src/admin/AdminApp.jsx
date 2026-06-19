import { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, Navigate, useParams, useLocation } from 'react-router-dom';
import { isConfigured, supabase } from './supabaseClient.js';
import { useAuth } from './useAuth.js';
import { adminEnsureSiteAgent } from '../lib/api.js';
import Login from './Login.jsx';
import BotsList from './BotsList.jsx';
import BotEditor from './BotEditor.jsx';
import AccountPage from './AccountPage.jsx';
import DashboardPage from './DashboardPage.jsx';
import LeadsPage from './LeadsPage.jsx';
import ConversationsPage from './ConversationsPage.jsx';
import PlatformPage from './PlatformPage.jsx';
import ClientDetail from './ClientDetail.jsx';

function ConfigMissing() {
  return (
    <div className="mx-auto mt-24 max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      <h1 className="text-lg font-semibold text-ink-900">Painel por configurar</h1>
      <p className="mt-2 text-[14px] text-ink-600">
        Define <code className="rounded bg-white px-1">VITE_SUPABASE_URL</code> e{' '}
        <code className="rounded bg-white px-1">VITE_SUPABASE_ANON_KEY</code> no teu <code>.env</code> e reinicia o servidor.
        Vê o <code>BACKEND.md</code>.
      </p>
    </div>
  );
}

// Redireciona o URL antigo /admin/bots/:id para /admin/agentes/:id.
function RedirectToAgente() {
  const { id } = useParams();
  return <Navigate to={`/admin/agentes/${id}`} replace />;
}

// Página inicial conforme o papel: gestor → Negócio; cliente → Agentes.
function HomeRedirect({ isPlatformAdmin, ready }) {
  if (!ready) return <div className="text-ink-400">A carregar…</div>;
  return <Navigate to={isPlatformAdmin ? '/admin/plataforma' : '/admin/painel'} replace />;
}

// Garante o agente do site (cria se não existir) e abre o seu editor.
function SiteAgentRedirect() {
  const { token } = useAuth();
  const [pid, setPid] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!token) return;
    adminEnsureSiteAgent(token).then(({ bot }) => setPid(bot.public_id)).catch((e) => setErr(e.message));
  }, [token]);
  if (err) return <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{err}</p>;
  if (!pid) return <div className="text-ink-400">A preparar o agente do site…</div>;
  return <Navigate to={`/admin/agentes/${pid}`} replace />;
}

// ── Ícones (inline, leves) ───────────────────────────────────────────────────
const ic = 'h-[18px] w-[18px] shrink-0';
const IconBot = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /><path d="M12 7v4M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>);
const IconUser = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
const IconChart = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" /><rect x="13" y="7" width="3" height="10" /></svg>);
const IconUsers = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5a3.5 3.5 0 0 1 0 7M18 20a6 6 0 0 0-3-5.2" /></svg>);
const IconGrid = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
const IconGlobe = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></svg>);
const IconLeads = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>);
const IconChats = () => (<svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z" /></svg>);

function NavItem({ to, end, icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
          isActive ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-ink-200 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

function GroupLabel({ children, first }) {
  return <div className={`px-3 pb-1 ${first ? 'pt-1' : 'pt-5'} text-[11px] font-semibold uppercase tracking-wider text-white/35`}>{children}</div>;
}

function SidebarContent({ isPlatformAdmin, user, onNavigate }) {
  // Os sub-itens da Plataforma partilham o path; o "active" vem do ?view=.
  const loc = useLocation();
  const onPlat = loc.pathname === '/admin/plataforma';
  const pv = new URLSearchParams(loc.search).get('view');
  const platCls = (active) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
      active ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-ink-200 hover:bg-white/10 hover:text-white'
    }`;
  const home = isPlatformAdmin ? '/admin/plataforma' : '/admin/painel';

  return (
    <div className="flex h-full flex-col">
      <Link to={home} onClick={onNavigate} className="flex items-center justify-center px-2 py-2">
        <img src="/kyvo-wordmark-white.png" alt="Kyvo" className="h-8 w-auto select-none" draggable={false} />
      </Link>

      <nav className="mt-3 flex-1 overflow-y-auto">
        {isPlatformAdmin ? (
          // Gestor da plataforma: controla o negócio; não cria agentes próprios.
          <>
            <GroupLabel first>Negócio</GroupLabel>
            <Link to="/admin/plataforma" onClick={onNavigate} className={platCls(onPlat && !pv)}><IconChart />Visão geral</Link>
            <Link to="/admin/plataforma?view=clientes" onClick={onNavigate} className={platCls(onPlat && pv === 'clientes')}><IconUsers />Clientes</Link>
            <Link to="/admin/plataforma?view=agentes" onClick={onNavigate} className={platCls(onPlat && pv === 'agentes')}><IconGrid />Agentes (todos)</Link>
            <GroupLabel>Site</GroupLabel>
            <NavItem to="/admin/agente-site" icon={<IconGlobe />} onClick={onNavigate}>Agente do site</NavItem>
            <GroupLabel>Conta</GroupLabel>
            <NavItem to="/admin/conta" icon={<IconUser />} onClick={onNavigate}>A minha conta</NavItem>
          </>
        ) : (
          // Cliente: cria e gere os seus agentes.
          <>
            <GroupLabel first>Principal</GroupLabel>
            <NavItem to="/admin/painel" icon={<IconChart />} onClick={onNavigate}>Visão geral</NavItem>
            <NavItem to="/admin/agentes" icon={<IconBot />} onClick={onNavigate}>Agentes</NavItem>
            <NavItem to="/admin/leads" icon={<IconLeads />} onClick={onNavigate}>Leads</NavItem>
            <NavItem to="/admin/conversas" icon={<IconChats />} onClick={onNavigate}>Conversas</NavItem>
            <NavItem to="/admin/conta" icon={<IconUser />} onClick={onNavigate}>Conta</NavItem>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-grad-brand text-[13px] font-semibold text-white ring-1 ring-white/15">
            {(user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-white">{user.email}</div>
            <div className="text-[11px] text-white/50">{isPlatformAdmin ? 'Gestor da plataforma' : 'Conta de cliente'}</div>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[13px] font-medium text-ink-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
          Sair
        </button>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Lê o perfil DIRETO do Supabase (anon key + RLS "profiles self") — assim a
  // deteção de papel/menus funciona sem depender das funções /api.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const { data: p } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, status, plan, created_at, openai_key_hint')
          .eq('id', user.id)
          .single();
        const { count } = await supabase
          .from('bots').select('id', { count: 'exact', head: true }).eq('owner_id', user.id);
        if (alive) setProfile(p ? { ...p, has_openai_key: !!p.openai_key_hint, bot_count: count ?? 0 } : null);
      } catch { /* ignora */ }
      finally { if (alive) setProfileLoaded(true); }
    })();
    return () => { alive = false; };
  }, [user]);

  // Fecha o drawer ao mudar de rota.
  useEffect(() => { setMenuOpen(false); }, [location.pathname, location.search]);

  if (!isConfigured) return <ConfigMissing />;
  if (loading) return <div className="grid h-screen place-items-center text-ink-500">A carregar…</div>;
  if (!user) return <Login />;

  const isPlatformAdmin = profile?.role === 'platform_admin';

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-800 bg-ink-900 p-4 md:flex">
        <SidebarContent isPlatformAdmin={isPlatformAdmin} user={user} />
      </aside>

      {/* Barra de topo (mobile) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/admin/agentes" className="flex items-center">
          <img src="/kyvo-logo.png" alt="Kyvo" className="h-6 w-auto select-none" draggable={false} />
        </Link>
        <button onClick={() => setMenuOpen(true)} aria-label="Abrir menu" className="rounded-lg p-2 text-ink-600 hover:bg-ink-50">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      {/* Drawer (mobile) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-900/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-ink-900 p-4 shadow-xl">
            <SidebarContent isPlatformAdmin={isPlatformAdmin} user={user} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Conteúdo: cada página ocupa toda a área ao lado do sidebar (como as
          Conversas). Conversas gere o próprio scroll; as restantes têm padding
          e scroll vertical interno. */}
      <main className="md:pl-60">
        <div
          key={location.pathname}
          className={
            location.pathname === '/admin/conversas'
              ? 'h-[calc(100dvh-3.25rem)] overflow-hidden md:h-screen'
              : 'h-[calc(100dvh-3.25rem)] overflow-y-auto px-5 py-8 md:h-screen lg:px-8'
          }
        >
          <Routes>
            <Route index element={<HomeRedirect isPlatformAdmin={isPlatformAdmin} ready={profileLoaded} />} />
            <Route path="agentes" element={<BotsList />} />
            <Route path="agentes/:id" element={<BotEditor />} />
            <Route path="painel" element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="conversas" element={<ConversationsPage />} />
            <Route path="conta" element={<AccountPage profile={profile} onProfile={setProfile} />} />
            <Route path="agente-site" element={<SiteAgentRedirect />} />
            <Route path="plataforma" element={<PlatformPage isAdmin={isPlatformAdmin} ready={profileLoaded} />} />
            <Route path="plataforma/clientes/:id" element={<ClientDetail isAdmin={isPlatformAdmin} ready={profileLoaded} />} />
            {/* Compatibilidade com URLs antigos */}
            <Route path="bots/:id" element={<RedirectToAgente />} />
            <Route path="platform" element={<Navigate to="/admin/plataforma" replace />} />
            <Route path="*" element={<HomeRedirect isPlatformAdmin={isPlatformAdmin} ready={profileLoaded} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
