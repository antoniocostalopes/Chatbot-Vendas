-- Migração: agente do site (homepage) + perguntas de qualificação.
alter table public.bots add column if not exists qualification_questions jsonb not null default '[]'::jsonb;
alter table public.bots add column if not exists is_site_agent boolean not null default false;

-- Só pode existir UM agente do site.
create unique index if not exists bots_one_site_agent on public.bots (is_site_agent) where is_site_agent;
