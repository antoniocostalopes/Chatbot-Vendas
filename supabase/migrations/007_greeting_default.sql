-- Corrige o default da coluna `greeting` (uma versão antiga tinha "Joana").
-- Aplica em BDs já existentes; o schema.sql já tem o default correto.
alter table public.bots
  alter column greeting set default 'Olá! Sou o Kyvo. Em que posso ajudar?';

-- Atualiza agentes que ainda tenham o texto antigo.
update public.bots
   set greeting = 'Olá! Sou o Kyvo. Em que posso ajudar?'
 where greeting like '%Joana%';
