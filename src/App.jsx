import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing.jsx';
import Widget from './components/Widget.jsx';
import { getSiteAgent } from './lib/api.js';

// Admin e página de embed em chunks próprios: a landing não carrega o
// supabase-js nem o painel; o embed não carrega a landing.
const WidgetPage = lazy(() => import('./pages/WidgetPage.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

// Demo da landing: usa IA se VITE_DEMO_PUBLIC_ID estiver definido; caso
// contrário corre a demo determinística (assim a landing nunca "parte").
const DEMO_ID = import.meta.env.VITE_DEMO_PUBLIC_ID || undefined;

function Home() {
  // O widget da homepage usa o "agente do site" configurado no painel.
  const [publicId, setPublicId] = useState(DEMO_ID);
  useEffect(() => {
    getSiteAgent()
      .then((a) => { if (a?.public_id) setPublicId(a.public_id); })
      .catch(() => {}); // sem agente do site → mantém o fallback determinístico
  }, []);
  return (
    <>
      <Landing />
      <Widget autoOpen={false} publicId={publicId} />
    </>
  );
}

const Fallback = () => <div className="grid h-screen place-items-center text-ink-400">A carregar…</div>;

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/widget" element={<WidgetPage />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </Suspense>
  );
}
