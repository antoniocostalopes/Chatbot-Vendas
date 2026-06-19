# Kyvo — Backlog de Produto

Lista de tarefas/necessidades a criar, priorizadas. Legenda de esforço: **S** (~horas),
**M** (~1 dia), **L** (vários dias). Estado: ☐ por fazer · ◐ parcial · ☑ feito.

> Já feito (base): landing + widget "Kyvo"; backend Vercel Functions + Supabase + OpenAI;
> CRUD de bots/knowledge/leads/conversas; chat IA com captação de lead; allowlist de
> domínios; chave OpenAI por cliente (BYO, cifrada); área do cliente (conta); gestão da
> plataforma (clientes, stats, agentes); embed.js de 1 linha.

---

## P0 — Essencial para vender com confiança

- ☐ **Limites por plano (free/pro)** · M
  Hoje os planos são só etiquetas. Definir e impor limites (ex.: free = 1 agente +
  50 leads/mês; pro = ilimitado) e mostrar uso vs limite no painel. *(ponto 3b)*
- ☐ **Encaminhamento de leads real** · M
  A homepage promete email / folha de cálculo / CRM / Slack-WhatsApp. Só o webhook
  está feito. Falta pelo menos **email** (via Resend) e **Slack**. *(notify.js tem o esqueleto)*
- ◐ **Suspensão bloquear também o painel** · S
  Hoje suspender só desliga o widget; o cliente ainda gere tudo. Bloquear a gestão
  com aviso "conta suspensa". *(ponto 1)*
- ☐ **Consentimento RGPD no widget** · S
  Aviso/checkbox de consentimento antes de captar dados; link para política de
  privacidade. Requisito legal (PT/UE) e prometido na landing.
- ☑ **Streaming das respostas do agente**
  SSE em `/api/chat` (`runConversationStream` mantém o function calling); o widget
  mostra a bolha a crescer token-a-token. Modo Pesquisa emite a resposta de uma vez
  pelo mesmo canal.

## P1 — Robustez e operação

- ☐ **Rate limiting por bot/IP** · M
  Travar abuso/forja de pedidos ao /api/chat (protege a chave OpenAI do cliente).
  Complementa a allowlist de domínios.
- ☐ **Métricas de uso e custo** · M
  Contar mensagens/tokens por bot e cliente; estimativa de custo OpenAI. Necessário
  para planos e para o cliente ver o consumo.
- ☐ **Recuperação de palavra-passe / confirmação de email** · S
  Fluxo "esqueci a password" e confirmação de email no registo (Supabase Auth).
- ☐ **Mudar email de login** · S
  Hoje só dá para mudar nome e password. *(ponto 3a)*
- ☐ **Monitorização de erros e logs** · S
  Captura de erros no /api (ex.: Sentry) e logs estruturados.
- ☐ **Testes automatizados** · M
  Testes de unidade (domínios, cifra — já há alguns ad-hoc) e de integração das rotas.

## Modos de agente · ☑ FEITO (parcial)

- ☑ **Modo Pesquisa (sem IA)** — full-text search (Postgres) sobre o conhecimento;
  devolve excertos; capta lead por regex (email/telefone). Sem custo de IA.
- ☐ **Modo Fluxos (sem IA)** — construtor de perguntas/botões passo-a-passo. *(por fazer)*

## P2 — IA e base de conhecimento (escala) · ☑ FEITO

- ☑ **Conhecimento a partir de ficheiros e site**
  Upload de PDF/TXT/MD/CSV (PDF extraído no browser via pdfjs) + import de página por URL.
  *Futuro: DOCX e crawl multi-página (hoje importa 1 página por URL).*
- ☑ **RAG com embeddings**
  pgvector + `knowledge_chunks` + `match_knowledge`; embeddings `text-embedding-3-small`
  com a chave do cliente; fallback para texto completo quando não há índice.
- ☑ **Editor/teste do agente no painel** — tab "Testar" (preview do dono, sem restrições).
- ☑ **Multi-idioma configurável** — idioma fixo ou "Automático" (idioma do visitante).

## P2 — Monetização

- ☐ **Pagamentos (Stripe) e gestão de subscrição** · L
  Checkout, planos, faturas, upgrade/downgrade, ligação ao campo `plan`.
  *(há a skill `pagou-pix-integrator` se o alvo for PIX/Brasil)*
- ☐ **Onboarding do cliente** · M
  Fluxo guiado: criar 1º agente → colar conhecimento → copiar embed → testar.

## P3 — Personalização e equipas

- ☐ **Personalização do widget** · M
  Posição, avatar, textos, tema claro/escuro, idioma do launcher.
- ☐ **Membros de equipa por conta (orgs)** · L
  Hoje 1 conta = 1 utilizador. Permitir convidar colegas com papéis.
- ☐ **Exportar leads (CSV) + integrações** · S
  Botão exportar; ligações diretas a CRMs populares.
- ☐ **Notificações de novo lead** · S
  Email/Slack instantâneo ao captar um lead (depende do encaminhamento P0).

## Conformidade & dados (RGPD)

- ☐ **Exportar/apagar dados a pedido do visitante** · M
- ☐ **Política de retenção de conversas** · S
- ☐ **Página de política de privacidade e termos** · S

## Dívida técnica / polish

- ☐ Atualizar `README.md` (ainda descreve a velha réplica "Lara" e `mockSimulation.js`).
- ☐ Code-split adicional / reduzir o bundle da landing (framer-motion).
- ☐ Estados de loading/empty e responsividade móvel do painel.
- ☐ i18n do próprio painel (hoje só pt-PT).
