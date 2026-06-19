import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { adminGetClient, adminUpdateClient, adminDeleteClient } from '../lib/api.js';

export default function ClientDetail({ isAdmin, ready }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [client, setClient] = useState(null);
  const [bots, setBots] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { client, bots } = await adminGetClient(token, id);
      setClient(client); setBots(bots);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { if (token && isAdmin) load(); /* eslint-disable-next-line */ }, [token, id, isAdmin]);

  async function patch(updates) {
    try {
      const { client: updated } = await adminUpdateClient(token, id, updates);
      setClient(updated);
    } catch (e) { alert(e.message); }
  }

  async function remove() {
    if (!confirm('Apagar este cliente e TODOS os dados dele? Irreversível.')) return;
    try { await adminDeleteClient(token, id); navigate('/admin/plataforma'); }
    catch (e) { alert(e.message); }
  }

  if (!ready) return <p className="text-ink-400">A carregar…</p>;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>;
  if (!client) return <p className="text-ink-400">A carregar…</p>;

  const isSelf = client.id === user?.id;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/admin/plataforma')} className="mb-4 text-[13px] text-ink-500 hover:text-ink-800">← Plataforma</button>
      <h1 className="font-display text-2xl font-bold text-ink-900">{client.email}</h1>
      {client.full_name && <p className="text-ink-500">{client.full_name}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card label="Papel">
          <select
            value={client.role}
            disabled={isSelf}
            onChange={(e) => patch({ role: e.target.value })}
            className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-[13px] disabled:opacity-50"
          >
            <option value="client">Cliente</option>
            <option value="platform_admin">Gestor</option>
          </select>
        </Card>
        <Card label="Plano">
          <select
            value={client.plan}
            onChange={(e) => patch({ plan: e.target.value })}
            className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-[13px]"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </Card>
        <Card label="Estado">
          <button
            onClick={() => patch({ status: client.status === 'suspended' ? 'active' : 'suspended' })}
            disabled={isSelf}
            className={`w-full rounded-lg px-2 py-1.5 text-[13px] font-medium disabled:opacity-50 ${
              client.status === 'suspended' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {client.status === 'suspended' ? 'Reativar conta' : 'Suspender conta'}
          </button>
        </Card>
      </div>
      {isSelf && <p className="mt-2 text-[12px] text-ink-400">Não podes alterar o papel/estado da tua própria conta aqui.</p>}

      <h2 className="mt-8 text-[15px] font-semibold text-ink-900">Agentes ({bots.length})</h2>
      <div className="mt-3 space-y-2">
        {bots.length === 0 && <p className="text-ink-400">Sem agentes.</p>}
        {bots.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-3">
            <div>
              <div className="font-medium text-ink-800">{b.name}</div>
              <code className="text-[12px] text-ink-500">{b.public_id}</code>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-ink-500">
              <span>{b.lead_count} leads</span>
              <span className={`rounded-full px-2 py-0.5 ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                {b.status === 'active' ? 'Ativo' : 'Pausa'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!isSelf && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-[15px] font-semibold text-red-700">Apagar cliente</h2>
          <p className="mt-1 text-[13px] text-red-600/90">Remove a conta e todos os agentes, conversas e leads.</p>
          <button onClick={remove} className="mt-3 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700">
            Apagar cliente
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ label, children }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4">
      <div className="mb-2 text-[12px] font-medium text-ink-500">{label}</div>
      {children}
    </div>
  );
}
