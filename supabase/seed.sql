-- ===========================================================================
-- Kyvo — bot de demonstração (opcional)
-- ---------------------------------------------------------------------------
-- Pré-requisito: já existe um utilizador registado (painel /admin → Registar).
-- Substitui o email abaixo pelo teu e corre no SQL Editor do Supabase.
-- Depois copia o public_id devolvido e usa-o no widget/embed.
-- ===========================================================================

with me as (
  select id from public.profiles where email = 'TEU_EMAIL_AQUI@exemplo.pt' limit 1
)
insert into public.bots (owner_id, public_id, name, persona, greeting, accent_color)
select
  me.id,
  'ky_demo123456',
  'Kyvo — Demo',
  'És o Kyvo, um agente de vendas com IA. Falas português de Portugal, com energia comercial, confiante e direto. Conversas com cada visitante do site, qualificas o interesse e captas o lead — 24/7, treinado nos produtos do cliente e instalável com uma linha de código. Quando o visitante mostrar interesse, recolhes nome, email e telefone para a equipa fazer seguimento.',
  'Olá! Sou o Kyvo. Quer ver como capto leads no seu site 24/7?',
  '#d98a1f'
from me
on conflict (public_id) do nothing;

-- Conhecimento de exemplo para o bot demo
with bot as (
  select id from public.bots where public_id = 'ky_demo123456' limit 1
)
insert into public.knowledge (bot_id, title, content)
select bot.id, 'O que é a Kyvo',
  'A Kyvo é um agente de vendas com IA que conversa com cada visitante do site, qualifica o interesse e capta o lead — 24/7. É treinado nos produtos do cliente, instala-se com uma linha de código (funciona em WordPress, Shopify, Wix ou código próprio) e os leads vão para email, folha de cálculo, CRM ou Slack/WhatsApp, sempre em conformidade com o RGPD.'
from bot
on conflict do nothing;

select public_id, name from public.bots where public_id = 'ky_demo123456';
