// Encaminhamento de leads para destinos externos configurados em bot.lead_routing.
// Suporta webhook (genérico — serve Zapier/Make/Slack/CRM). O envio por email
// requer um fornecedor (ex.: Resend); fica preparado mas inativo até configurares.
export async function routeLead(bot, lead) {
  const routing = bot.lead_routing || {};
  const tasks = [];

  if (routing.webhook) {
    tasks.push(
      fetch(routing.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot: { id: bot.id, name: bot.name, public_id: bot.public_id },
          lead,
          at: new Date().toISOString(),
        }),
      }).catch((e) => console.error('[kyvo] webhook lead falhou:', e?.message)),
    );
  }

  // Placeholder para email (descomenta quando tiveres RESEND_API_KEY):
  // if (routing.email && process.env.RESEND_API_KEY) { ... }

  await Promise.allSettled(tasks);
}
