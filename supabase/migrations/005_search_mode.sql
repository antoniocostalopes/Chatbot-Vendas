-- Migração: modo de agente 'search' (full-text, sem IA).
alter table public.bots add column if not exists mode text not null default 'ai';

-- Coluna de full-text + índice GIN sobre os chunks de conhecimento.
alter table public.knowledge_chunks
  add column if not exists tsv tsvector
  generated always as (to_tsvector('portuguese', content)) stored;
create index if not exists knowledge_chunks_tsv_idx on public.knowledge_chunks using gin (tsv);

-- Procura por palavras-chave: top-N chunks por relevância full-text.
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
