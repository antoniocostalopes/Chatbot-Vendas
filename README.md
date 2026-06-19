# Kyvo — Agente de Vendas com IA

Kyvo é um **agente de vendas com IA** que conversa com cada visitante do site,
qualifica o interesse, capta o lead e conduz à proposta. Funciona 24/7, é
treinado nos produtos de cada cliente e instala-se com **uma linha de código**.

O projeto tem três partes:

1. **Landing page** (marketing) que apresenta o produto e leva o visitante a
   experimentar o agente ali mesmo, no widget do canto do ecrã.
2. **Painel** (`/admin`) onde cada cliente cria e configura os seus agentes,
   importa conhecimento, vê leads e conversas, e gere a conta. Inclui uma área
   de **administração da plataforma** (gestão de clientes, planos e estado).
3. **Widget embebível** que qualquer site pode instalar com um snippet.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 + framer-motion |
| Routing | react-router-dom (`/`, `/widget`, `/admin/*`) |
| Backend | Vercel Serverless Functions (`/api`) |
| Base de dados / Auth | Supabase (Postgres + Auth + pgvector) |
| IA | OpenAI (Chat Completions com streaming + function calling, embeddings) |

## Funcionalidades

- **Criação e gestão de agentes** (CRUD completo): persona, modelo, criatividade,
  perguntas de qualificação, domínios permitidos, webhook de leads.
- **Dois modos de agente**: `ai` (RAG + OpenAI) ou `search` (full-text, sem IA).
- **Conhecimento (RAG)**: importação de ficheiros (PDF/txt/md) e de URLs,
  indexação com embeddings (pgvector) e pesquisa semântica `match_knowledge`.
- **Captação de leads** via function calling (`capture_lead`) e encaminhamento
  por webhook (Zapier/Make/Slack/CRM).
- **Respostas em streaming** (SSE) no widget.
- **Chave OpenAI por cliente** (BYO key), cifrada em repouso (AES-256-GCM).
- **Restrição por domínio** (allowlist por agente).
- **Agente do site**: o widget da homepage é um agente configurável no painel.
- **Dois níveis de gestão**: área de cliente vs. administração da plataforma
  (papéis `client` / `platform_admin`, com `status` e `plano`).

## Estrutura

```
api/            Funções serverless (chat, bots, leads, knowledge, account, admin/*)
  _lib/         Helpers: supabase, openai, auth, crypto, embeddings, domains, http
src/
  components/   Landing, Widget, ChatBot, AiChat, Avatar, Logo…
  admin/        Painel: AdminApp, BotEditor, AccountPage, PlatformPage, Login
  lib/          api.js (cliente), flows.js (demo determinística), validators…
  pages/        WidgetPage (iframe do /widget)
supabase/       schema.sql + migrations (papéis, RAG, modo search, agente do site)
public/         embed.js (a "1 linha"), logótipos, avatar, og-cover…
```

## Correr localmente

```bash
npm install
npm run dev        # http://localhost:5173
```

> O `npm run dev` corre **tudo** (frontend + `/api`) graças a um plugin Vite
> (`kyvo-api-dev` em `vite.config.js`) que serve as funções serverless em
> desenvolvimento. Não é preciso `vercel dev`.

Build de produção:

```bash
npm run build && npm run preview
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha (o `.env` está em `.gitignore` e
**nunca** deve ser versionado):

| Variável | Para quê |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase (servidor) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (apenas no servidor; ignora RLS) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Cliente (browser) |
| `OPENAI_API_KEY` | Chave OpenAI da plataforma (opcional; cada cliente pode usar a sua) |
| `OPENAI_DEFAULT_MODEL` | Modelo por omissão (ex.: `gpt-4o-mini`) |
| `ENCRYPTION_KEY` | Cifra das chaves OpenAI dos clientes (fallback: service role) |
| `VITE_DEMO_PUBLIC_ID` | Liga a demo da landing a um agente real (opcional) |

## Instalar o widget noutro site

```html
<script src="https://SEU-DOMINIO/embed.js" data-kyvo-id="cl_xxxxx" defer></script>
```

O script injeta um launcher e um `iframe` com `/widget`, e expõe
`window.Kyvo.open()`.

## Deploy

- **Frontend + API**: Vercel (ver `vercel.json` — funções em `/api` + rewrite SPA).
- **Base de dados**: Supabase. Aplicar `supabase/schema.sql` e as migrações em
  `supabase/migrations/` ao projeto.

## Documentação adicional

- [`BACKEND.md`](BACKEND.md) — arquitetura detalhada do backend e das funções.
- [`BACKLOG.md`](BACKLOG.md) — tarefas e necessidades do produto.
- [`PRODUCT.md`](PRODUCT.md) — posicionamento, utilizadores e princípios de design.
