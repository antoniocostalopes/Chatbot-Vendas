-- Migração: restrição de domínios por bot.
-- Aplica em bases que foram criadas antes desta funcionalidade.
-- (O schema.sql já inclui isto para instalações novas.)
alter table public.bots
  add column if not exists allowed_domains jsonb not null default '[]'::jsonb;
