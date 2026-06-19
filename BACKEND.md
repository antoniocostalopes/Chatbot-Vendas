# Kyvo — Backend (Vercel Functions + Supabase + OpenAI)

Este documento explica como pôr o backend a funcionar. A arquitetura:

- **Frontend** — React + Vite (landing, widget e painel `/admin`), na Vercel.
- **API** — funções serverless em `/api` (Node), na mesma Vercel.
- **Base de dados + Auth** — Supabase (Postgres).
- **Motor de IA** — OpenAI (Chat Completions + function calling).

```
api/
  _lib/        supabase.js · openai.js · http.js · auth.js · notify.js · ownership.js
  chat.js                  POST  — conversa do widget (OpenAI + captação de lead) [público]
  bots/config.js           GET   — config pública do bot (widget) [público]
  bots/index.js            GET/POST          — listar/criar bots (auth)
  bots/[id].js             GET/PATCH/DELETE  — gerir um bot (auth)
  knowledge/index.js       GET/POST          — listar/criar conhecimento (auth, indexa p/ RAG)
  knowledge/[id].js        PATCH/DELETE      — gerir um item (auth, reindexa)
  knowledge/import-url.js  POST              — importar uma página por URL (auth)
  leads/index.js           GET/POST          — listar/criar leads (auth)
  leads/[id].js            GET/PATCH/DELETE  — gerir um lead (auth)
  conversations/index.js   GET               — listar conversas de um bot (auth)
  conversations/[id].js    GET/DELETE        — conversa + mensagens / apagar (auth)
  account/index.js         GET/PATCH/DELETE  — a própria conta do cliente (auth)
  admin/stats.js           GET               — totais da plataforma (platform_admin)
  admin/clients/index.js   GET               — listar todos os clientes (platform_admin)
  admin/clients/[id].js    GET/PATCH/DELETE  — gerir um cliente (platform_admin)
  admin/bots/index.js      GET               — todos os bots da plataforma (platform_admin)
supabase/
  schema.sql   tabelas, RLS e triggers
  seed.sql     bot de demonstração (opcional)
public/embed.js            a "1 linha de código" para instalar o widget
src/admin/                 painel: login, lista de bots, editor, knowledge, leads
```

## 1. Supabase

1. Cria um projeto em https://supabase.com.
2. **SQL Editor** → cola o conteúdo de `supabase/schema.sql` → **Run**.
3. **Project Settings → API**, copia:
   - `Project URL` → `SUPABASE_URL` e `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` (secreta!) → `SUPABASE_SERVICE_ROLE_KEY`
4. (Opcional) **Authentication → Providers → Email**: para testar rápido, desliga
   "Confirm email" para conseguires entrar sem confirmação.

## 2. OpenAI

1. Cria a chave em https://platform.openai.com/api-keys → `OPENAI_API_KEY`.
2. Modelo por defeito: `gpt-4o-mini` (rápido e barato). Podes mudar por bot no painel.

## 3. Variáveis de ambiente

Copia `.env.example` para `.env` e preenche. (Na Vercel, mete os mesmos nomes em
*Project Settings → Environment Variables*.)

| Variável | Onde é usada |
|---|---|
| `OPENAI_API_KEY` | servidor (`/api/chat`) |
| `OPENAI_DEFAULT_MODEL` | servidor (default `gpt-4o-mini`) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | servidor (`/api`) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | frontend (painel) |
| `VITE_DEMO_PUBLIC_ID` | opcional — liga a demo da landing a um bot real |
| `VITE_API_BASE` | opcional — só se a API estiver noutro domínio |

## 4. Correr localmente

⚠️ `npm run dev` (Vite) **não** corre as funções `/api`. Para o stack completo
(frontend + API) usa o Vercel CLI:

```bash
npm i -g vercel
vercel link          # liga a um projeto Vercel (uma vez)
vercel env pull .env # ou preenche o .env à mão
vercel dev           # frontend + /api em http://localhost:3000
```

Só o frontend (sem API): `npm run dev` → http://localhost:5173.

## 5. Criar o primeiro bot

1. Abre `/admin` → **Criar conta** (email + password).
2. **+ Novo agente** → entra no editor.
3. **Configuração**: nome, saudação, personalidade, cor, idioma.
4. **Conhecimento**: cola os teus produtos / FAQ / preços.
5. **Instalar**: copia o `<script>` e cola no site onde queres o widget.
6. **Leads**: vê os contactos captados (e configura um *webhook* na Configuração
   para os enviar para Zapier/Make/Slack/CRM).

## 6. Como o widget funciona

- O `embed.js` injeta um launcher + um iframe que abre `/widget?id=<public_id>`.
- O `/widget` carrega a config pública (`GET /api/bots/config`) e conversa via
  `POST /api/chat`.
- No `/api/chat`, o servidor monta o system prompt (persona + conhecimento),
  chama a OpenAI e, quando há interesse, o modelo chama `capture_lead` →
  grava em `leads` e dispara o webhook.

## Modos de agente (com IA vs sem IA)

Cada bot tem um `mode`:

- **`ai`** (por defeito) — RAG + OpenAI: lê o conhecimento, procura por **significado**
  (embeddings) e **redige** a resposta. Precisa de chave OpenAI. Tem custo por uso.
- **`search`** — sem IA: **full-text search** (Postgres) sobre o conhecimento. Devolve
  o **excerto** cujos termos coincidem com as palavras do visitante. **Zero custo de IA**
  e não precisa de chave. Capta lead por deteção de email/telefone na mensagem
  (`_lib/leadExtract.js`). Limitação: encontra por palavras exatas, não por significado.

A escolha faz-se no painel (Configuração → Modo do agente). Em ambos os modos o
conhecimento é carregado da mesma forma (texto/ficheiro/URL).

## Conhecimento e RAG (pgvector)

O agente responde com base no conhecimento do bot, usando **RAG**:

- O conhecimento pode ser **escrito à mão**, **carregado de ficheiro** (PDF/TXT/MD/CSV —
  o PDF é extraído no browser com pdfjs) ou **importado de um URL** (`/api/knowledge/import-url`).
- Cada item é dividido em **chunks** e cada chunk é convertido num **embedding**
  (`text-embedding-3-small`, OpenAI) guardado em `knowledge_chunks.embedding` (pgvector).
- No chat, a última mensagem do visitante é convertida em embedding e a função SQL
  `match_knowledge` devolve os ~6 chunks mais próximos — só esses vão para o prompt
  (em vez de todo o conhecimento). Se ainda não houver índice, cai para o texto completo.
- Os embeddings usam a **mesma chave** do cliente (BYO). Pré-requisito: correr a
  migração `004_rag.sql` (ativa a extensão `vector`).

**Playground:** no painel, a tab **Testar** conversa com o bot usando o teu login.
O `/api/chat` reconhece o dono autenticado (modo *preview*) e ignora as restrições
de domínio/pausa — útil para afinar persona e conhecimento antes de publicar.

**Idioma:** cada bot tem um idioma fixo ou **Automático** (responde no idioma do visitante).

## Chave OpenAI por cliente (BYO key)

Cada cliente põe a **sua própria** chave OpenAI no painel (**Conta → Chave OpenAI**).
Os agentes desse cliente passam a usar essa chave — o consumo é faturado na conta
OpenAI dele.

- A chave é **cifrada em repouso** (AES-256-GCM, `api/_lib/crypto.js`) e **nunca**
  é devolvida ao browser; o painel só mostra uma pista (`sk-…1234`).
- `/api/chat` resolve a chave por esta ordem: **chave do cliente** → senão a
  `OPENAI_API_KEY` da plataforma (fallback opcional) → senão devolve **503**
  ("agente sem chave de IA configurada").
- Define `ENCRYPTION_KEY` em produção (ver `.env.example`). Mudá-la invalida as
  chaves já guardadas (os clientes teriam de as repor).

## Papéis: gestão da plataforma vs área do cliente

Cada conta (`profiles`) tem `role`, `status` e `plan`:

- **`role`** — `client` (default, dono de bots) ou `platform_admin` (gere a Kyvo toda).
- **`status`** — `active` ou `suspended`. Conta suspensa → os bots dela param de
  responder (`/api/chat` e `/api/bots/config` devolvem erro).
- **`plan`** — `free` / `pro` (informativo por agora).

**Área do cliente** (`/admin`): cada utilizador gere os seus agentes, conhecimento,
leads, conversas e a sua conta (tab **Conta**: nome, palavra-passe, apagar conta).

**Gestão da plataforma** (`/admin/platform`, só para `platform_admin`): estatísticas
globais, lista de clientes, e por cliente — promover/despromover, suspender/reativar,
mudar plano, ver agentes/leads, apagar cliente. (Um gestor não pode suspender-se nem
despromover-se a si próprio, para evitar lockout.)

### Tornar-te o primeiro gestor da plataforma

1. Regista-te no painel (`/admin`) com o teu email.
2. No SQL Editor do Supabase corre (substitui o email):
   ```sql
   update public.profiles set role = 'platform_admin' where email = 'tu@empresa.pt';
   ```
3. Volta ao painel — aparece a área **Plataforma**.

## Restrição de domínios (onde o widget pode aparecer)

Cada bot tem `allowed_domains`. O widget **só aparece e responde** nos domínios
listados — protege contra usarem o teu snippet noutros sites.

- No painel (tab **Configuração → Domínios permitidos**) adicionas os domínios.
- Formato: `exemplo.pt` (inclui subdomínios) ou `*.exemplo.pt` (só subdomínios).
  `localhost`/`127.0.0.1` são sempre permitidos (desenvolvimento).
- **Lista vazia = sem restrição** (visível em qualquer site).
- Como funciona: o `embed.js` corre na página do cliente, lê o `hostname` real
  e reporta-o; o servidor valida-o em `/api/bots/config` (o `embed.js` nem mostra
  o launcher se vier 403) **e** em `/api/chat` (reforço, protege o custo de IA).
- Nota de modelo de ameaça: o host é reportado pelo loader. Isto bloqueia o caso
  real (copiar o snippet para outro site). Um atacante a forjar pedidos
  manualmente é outro nível de ameaça — para isso, a restrição de domínio não é
  a defesa (seria preciso, p.ex., assinar pedidos); mas nesse ponto já não está a
  "usar o teu widget", está a construir o seu próprio cliente.

## Segurança

- A `service_role` só vive no servidor (`/api`); nunca é exposta ao browser.
- O visitante anónimo nunca toca na DB diretamente — só fala com `/api/chat`.
- O painel usa a `anon key` + RLS: cada utilizador só vê os seus bots/leads.

## Custos

- Supabase: plano grátis chega para começar.
- OpenAI: paga-se por uso (tokens). `gpt-4o-mini` torna cada conversa em cêntimos.
