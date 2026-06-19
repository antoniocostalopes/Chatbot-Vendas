-- ===========================================================================
-- Kyvo — schema da base de dados (Supabase / Postgres)
-- ---------------------------------------------------------------------------
-- Como aplicar:
--   Supabase Dashboard → SQL Editor → cola este ficheiro inteiro → Run.
-- É idempotente: pode correr-se mais do que uma vez sem partir nada.
-- ===========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "vector";   -- pgvector (RAG / embeddings)

-- ── Helper: gerar public_id curto e legível (ex.: ky_a1b2c3d4e5) ───────────
create or replace function kyvo_public_id()
returns text
language sql
volatile
as $$
  select 'ky_' || encode(gen_random_bytes(8), 'hex');
$$;

-- ── Helper: manter updated_at ──────────────────────────────────────────────
create or replace function kyvo_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- profiles — espelha auth.users (dono dos bots / login do painel)
-- ===========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  -- Papel na plataforma: 'client' (dono de bots) | 'platform_admin' (gere tudo).
  role        text not null default 'client',
  -- Estado da conta: 'active' | 'suspended' (bots param de responder).
  status      text not null default 'active',
  plan        text not null default 'free',   -- free | pro (informativo por agora)
  -- Chave OpenAI do próprio cliente (BYO key), cifrada em repouso (AES-GCM).
  -- Nunca é devolvida ao browser; só o hint (últimos 4) é mostrado.
  openai_api_key_enc text,
  openai_key_hint    text,
  created_at  timestamptz not null default now()
);

-- Para bases já existentes (a criação acima não corre se a tabela já existir).
alter table public.profiles add column if not exists role   text not null default 'client';
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists plan   text not null default 'free';
alter table public.profiles add column if not exists openai_api_key_enc text;
alter table public.profiles add column if not exists openai_key_hint    text;

-- Cria automaticamente um profile quando se regista um utilizador.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- bots — configuração de cada agente
-- ===========================================================================
create table if not exists public.bots (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  public_id      text not null unique default kyvo_public_id(),
  name           text not null default 'Novo agente',
  -- Personalidade / instruções base (vai para o system prompt).
  persona        text not null default
    'És um agente de vendas simpático, direto e prestável. Respondes em português de Portugal. Ajudas o visitante, esclareces dúvidas sobre os produtos e, quando houver interesse, recolhes os contactos para a equipa fazer seguimento.',
  greeting       text not null default 'Olá! Sou o Kyvo. Em que posso ajudar?',
  language       text not null default 'pt-PT',
  model          text,                        -- null => usa OPENAI_DEFAULT_MODEL
  temperature    real not null default 0.5,
  accent_color   text not null default '#2b6bf5',
  -- Campos a recolher do lead (slots de qualificação).
  capture_fields jsonb not null default '["name","email","phone"]'::jsonb,
  -- Para onde encaminhar leads (ex.: {"email":"vendas@...","webhook":"https://..."}).
  lead_routing   jsonb not null default '{}'::jsonb,
  -- Domínios onde o widget pode aparecer/responder. Vazio = sem restrição.
  -- Ex.: ["exemplo.pt","*.loja.pt"]. Validado no servidor (config + chat).
  allowed_domains jsonb not null default '[]'::jsonb,
  -- Motor: 'ai' (RAG + OpenAI) | 'search' (full-text, sem IA).
  mode           text not null default 'ai',
  -- Perguntas de qualificação que o agente deve procurar fazer (lista).
  qualification_questions jsonb not null default '[]'::jsonb,
  -- Marca o agente mostrado na homepage do Kyvo (apenas um).
  is_site_agent  boolean not null default false,
  status         text not null default 'active',  -- active | paused
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Para bases já existentes (a criação acima não corre se a tabela já existir).
alter table public.bots add column if not exists allowed_domains jsonb not null default '[]'::jsonb;
alter table public.bots add column if not exists mode text not null default 'ai';
alter table public.bots add column if not exists qualification_questions jsonb not null default '[]'::jsonb;
alter table public.bots add column if not exists is_site_agent boolean not null default false;
create unique index if not exists bots_one_site_agent on public.bots (is_site_agent) where is_site_agent;

create index if not exists bots_owner_idx on public.bots(owner_id);

drop trigger if exists bots_touch on public.bots;
create trigger bots_touch before update on public.bots
  for each row execute function kyvo_touch_updated_at();

-- ===========================================================================
-- knowledge — base de conhecimento (produtos / FAQ) de cada bot
-- ===========================================================================
create table if not exists public.knowledge (
  id          uuid primary key default gen_random_uuid(),
  bot_id      uuid not null references public.bots(id) on delete cascade,
  title       text not null default '',
  content     text not null,
  source_type text not null default 'text',   -- text | file | url
  source_ref  text,                            -- nome do ficheiro / URL
  created_at  timestamptz not null default now()
);

create index if not exists knowledge_bot_idx on public.knowledge(bot_id);
alter table public.knowledge add column if not exists source_type text not null default 'text';
alter table public.knowledge add column if not exists source_ref  text;

-- Pedaços indexados para RAG (cada item de knowledge é dividido em chunks).
create table if not exists public.knowledge_chunks (
  id            uuid primary key default gen_random_uuid(),
  bot_id        uuid not null references public.bots(id) on delete cascade,
  knowledge_id  uuid not null references public.knowledge(id) on delete cascade,
  content       text not null,
  embedding     vector(1536),                  -- text-embedding-3-small
  created_at    timestamptz not null default now()
);

create index if not exists knowledge_chunks_bot_idx on public.knowledge_chunks(bot_id);
create index if not exists knowledge_chunks_kn_idx  on public.knowledge_chunks(knowledge_id);
create index if not exists knowledge_chunks_vec_idx on public.knowledge_chunks
  using hnsw (embedding vector_cosine_ops);

-- Full-text search (modo 'search', sem IA): coluna tsv + índice GIN.
alter table public.knowledge_chunks
  add column if not exists tsv tsvector
  generated always as (to_tsvector('portuguese', content)) stored;
create index if not exists knowledge_chunks_tsv_idx on public.knowledge_chunks using gin (tsv);

-- Procura semântica: top-N chunks mais próximos da query, para um bot.
create or replace function public.match_knowledge(
  p_bot_id uuid,
  query_embedding vector(1536),
  match_count int default 6
)
returns table (content text, similarity float)
language sql stable
as $$
  select c.content, 1 - (c.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks c
  where c.bot_id = p_bot_id and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- Procura por palavras-chave (sem IA): top-N chunks por relevância full-text.
create or replace function public.search_knowledge(
  p_bot_id uuid,
  q text,
  match_count int default 3
)
returns table (content text, title text, rank real)
language sql stable
as $$
  select c.content, k.title,
         ts_rank(c.tsv, websearch_to_tsquery('portuguese', q)) as rank
  from public.knowledge_chunks c
  join public.knowledge k on k.id = c.knowledge_id
  where c.bot_id = p_bot_id
    and c.tsv @@ websearch_to_tsquery('portuguese', q)
  order by rank desc
  limit match_count;
$$;

-- ===========================================================================
-- conversations / messages — histórico de cada visitante
-- ===========================================================================
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  bot_id      uuid not null references public.bots(id) on delete cascade,
  visitor_id  text,                 -- id anónimo gerado pelo widget
  created_at  timestamptz not null default now()
);

create index if not exists conversations_bot_idx on public.conversations(bot_id);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  role             text not null,    -- user | assistant
  content          text not null default '',
  created_at       timestamptz not null default now()
);

create index if not exists messages_conv_idx on public.messages(conversation_id);

-- ===========================================================================
-- leads — contactos captados
-- ===========================================================================
create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  bot_id           uuid not null references public.bots(id) on delete cascade,
  conversation_id  uuid references public.conversations(id) on delete set null,
  name             text,
  email            text,
  phone            text,
  notes            text,             -- resumo/interesse detetado pelo agente
  data             jsonb not null default '{}'::jsonb,  -- campos extra
  created_at       timestamptz not null default now()
);

create index if not exists leads_bot_idx on public.leads(bot_id);

-- ===========================================================================
-- Row Level Security
-- ---------------------------------------------------------------------------
-- O painel admin usa a anon key + sessão do utilizador → só vê o que é seu.
-- A API serverless (/api) usa a SERVICE_ROLE → ignora o RLS (acesso total),
-- por isso o widget/visitante anónimo nunca toca diretamente na DB.
-- ===========================================================================
alter table public.profiles        enable row level security;
alter table public.bots            enable row level security;
alter table public.knowledge       enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.leads         enable row level security;

-- profiles: cada um vê/edita o seu
drop policy if exists "profiles self" on public.profiles;
create policy "profiles self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- bots: dono total
drop policy if exists "bots owner" on public.bots;
create policy "bots owner" on public.bots
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- knowledge: via dono do bot
drop policy if exists "knowledge owner" on public.knowledge;
create policy "knowledge owner" on public.knowledge
  for all using (
    exists (select 1 from public.bots b where b.id = knowledge.bot_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.bots b where b.id = knowledge.bot_id and b.owner_id = auth.uid())
  );

-- knowledge_chunks: via dono do bot (a procura no chat usa a service role)
drop policy if exists "knowledge_chunks owner" on public.knowledge_chunks;
create policy "knowledge_chunks owner" on public.knowledge_chunks
  for all using (
    exists (select 1 from public.bots b where b.id = knowledge_chunks.bot_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.bots b where b.id = knowledge_chunks.bot_id and b.owner_id = auth.uid())
  );

-- conversations: leitura via dono do bot (escrita é feita pela service role)
drop policy if exists "conversations owner read" on public.conversations;
create policy "conversations owner read" on public.conversations
  for select using (
    exists (select 1 from public.bots b where b.id = conversations.bot_id and b.owner_id = auth.uid())
  );

-- messages: leitura via dono do bot
drop policy if exists "messages owner read" on public.messages;
create policy "messages owner read" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      join public.bots b on b.id = c.bot_id
      where c.id = messages.conversation_id and b.owner_id = auth.uid()
    )
  );

-- leads: leitura/gestão via dono do bot
drop policy if exists "leads owner" on public.leads;
create policy "leads owner" on public.leads
  for all using (
    exists (select 1 from public.bots b where b.id = leads.bot_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.bots b where b.id = leads.bot_id and b.owner_id = auth.uid())
  );

-- ===========================================================================
-- FIM. Para criar um bot de demonstração, vê supabase/seed.sql
-- ===========================================================================
