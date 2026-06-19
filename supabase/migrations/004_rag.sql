-- Migração: RAG (pgvector) + import de conhecimento por ficheiro/URL.
create extension if not exists "vector";

alter table public.knowledge add column if not exists source_type text not null default 'text';
alter table public.knowledge add column if not exists source_ref  text;

create table if not exists public.knowledge_chunks (
  id            uuid primary key default gen_random_uuid(),
  bot_id        uuid not null references public.bots(id) on delete cascade,
  knowledge_id  uuid not null references public.knowledge(id) on delete cascade,
  content       text not null,
  embedding     vector(1536),
  created_at    timestamptz not null default now()
);

create index if not exists knowledge_chunks_bot_idx on public.knowledge_chunks(bot_id);
create index if not exists knowledge_chunks_kn_idx  on public.knowledge_chunks(knowledge_id);
create index if not exists knowledge_chunks_vec_idx on public.knowledge_chunks
  using hnsw (embedding vector_cosine_ops);

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

alter table public.knowledge_chunks enable row level security;
drop policy if exists "knowledge_chunks owner" on public.knowledge_chunks;
create policy "knowledge_chunks owner" on public.knowledge_chunks
  for all using (
    exists (select 1 from public.bots b where b.id = knowledge_chunks.bot_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.bots b where b.id = knowledge_chunks.bot_id and b.owner_id = auth.uid())
  );
