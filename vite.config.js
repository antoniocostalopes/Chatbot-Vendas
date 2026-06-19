import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));

// Plugin de desenvolvimento: serve as funções de /api (estilo Vercel) dentro do
// dev server do Vite, para o stack completo correr com `npm run dev` (sem vercel).
function apiDevPlugin(env) {
  // Expõe as variáveis não-VITE aos handlers (process.env).
  for (const k of [
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY', 'OPENAI_DEFAULT_MODEL', 'ENCRYPTION_KEY', 'PUBLIC_BASE_URL',
  ]) {
    if (env[k] && !process.env[k]) process.env[k] = env[k];
  }

  return {
    name: 'kyvo-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        const u = new URL(req.url, 'http://localhost');
        const segs = u.pathname.replace(/^\/api\//, '').split('/').filter(Boolean);

        // Resolve o ficheiro do handler: exato → index → [id] dinâmico.
        const parent = segs.slice(0, -1).join('/');
        const candidates = [
          { file: `api/${segs.join('/')}.js`, params: {} },
          { file: `api/${segs.join('/')}/index.js`, params: {} },
          { file: `api/${parent ? parent + '/' : ''}[id].js`, params: { id: decodeURIComponent(segs[segs.length - 1] || '') } },
        ];
        const hit = candidates.find((c) => existsSync(path.join(root, c.file)));
        if (!hit) return next();

        // Polyfills estilo Vercel sobre o res do Node.
        res.status = (c) => { res.statusCode = c; return res; };
        res.send = (b) => { res.end(b); return res; };
        req.query = { ...Object.fromEntries(u.searchParams.entries()), ...hit.params };

        try {
          const mod = await server.ssrLoadModule('/' + hit.file);
          await mod.default(req, res);
        } catch (e) {
          server.config.logger.error('[api dev] ' + (e?.stack || e?.message || e));
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Erro interno (dev): ' + (e?.message || e) }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  return {
    plugins: [react(), apiDevPlugin(env)],
    server: { port: 5173, open: true },
  };
});
