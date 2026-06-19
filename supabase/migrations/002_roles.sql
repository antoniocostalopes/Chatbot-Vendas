-- Migração: papéis e estado de conta (gestão da plataforma + área do cliente).
alter table public.profiles add column if not exists role   text not null default 'client';
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists plan   text not null default 'free';

-- ── Promover o primeiro gestor da plataforma (super-admin) ─────────────────
-- Regista-te primeiro no painel (/admin), depois corre isto com o teu email:
--
--   update public.profiles set role = 'platform_admin'
--   where email = 'TEU_EMAIL@exemplo.pt';
--
-- A partir daí, esse utilizador vê a área "Plataforma" no painel e pode gerir
-- todos os clientes, bots e leads.
