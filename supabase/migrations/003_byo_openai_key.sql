-- Migração: chave OpenAI por cliente (BYO key), cifrada em repouso.
alter table public.profiles add column if not exists openai_api_key_enc text;
alter table public.profiles add column if not exists openai_key_hint    text;
