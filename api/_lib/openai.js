// Motor de IA do bot — OpenAI Chat Completions com function calling.
// A chave é resolvida por pedido (BYO key do cliente, com fallback à plataforma).
import OpenAI from 'openai';

// Constrói o system prompt a partir da config do bot + base de conhecimento.
export function buildSystemPrompt(bot, knowledge) {
  const fields = Array.isArray(bot.capture_fields) ? bot.capture_fields : ['name', 'email', 'phone'];
  const fieldsPt = fields
    .map((f) => ({ name: 'nome', email: 'email', phone: 'telefone' }[f] || f))
    .join(', ');

  const kb = (knowledge || [])
    .map((k) => `### ${k.title || 'Nota'}\n${k.content}`)
    .join('\n\n')
    .trim();

  const lang = (bot.language || 'pt-PT').trim();
  const langLine = (!lang || lang.toLowerCase() === 'auto')
    ? 'Responde no MESMO idioma em que o visitante escrever (deteta-o a cada mensagem).'
    : `Responde sempre em ${lang}.`;

  const questions = Array.isArray(bot.qualification_questions) ? bot.qualification_questions.filter(Boolean) : [];
  const questionsLine = questions.length
    ? `Ao longo da conversa, procura saber (de forma natural, uma de cada vez, sem soar a interrogatório): ${questions.map((q) => `«${q}»`).join('; ')}.`
    : '';

  return [
    bot.persona?.trim() || 'És um agente de vendas simpático e prestável.',
    `${langLine} Sê conciso (1-3 frases por mensagem), natural e humano.`,
    'Objetivo: ajudar o visitante e, quando houver interesse genuíno, recolher os contactos para a equipa fazer seguimento.',
    questionsLine,
    `Quando tiveres os dados do visitante (${fieldsPt}), chama a função "capture_lead" para os registar. Não inventes dados; recolhe-os na conversa de forma natural, um de cada vez, sem soar a formulário.`,
    'Nunca prometas preços ou condições que não constem da base de conhecimento. Se não souberes, diz que a equipa confirma e propõe recolher o contacto.',
    kb ? `\n--- BASE DE CONHECIMENTO (usa só esta informação como factual) ---\n${kb}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

// Definição da tool de captação de lead.
export const CAPTURE_LEAD_TOOL = {
  type: 'function',
  function: {
    name: 'capture_lead',
    description:
      'Regista os contactos do visitante quando há interesse comercial. Chama apenas quando tiveres pelo menos um contacto válido (email ou telefone).',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome do visitante' },
        email: { type: 'string', description: 'Email do visitante' },
        phone: { type: 'string', description: 'Telefone do visitante' },
        notes: {
          type: 'string',
          description: 'Resumo curto do interesse/necessidade detetado na conversa',
        },
      },
      additionalProperties: false,
    },
  },
};

// Corre uma volta de conversa, resolvendo eventuais chamadas a capture_lead.
// `apiKey` = chave OpenAI a usar (do cliente ou da plataforma).
// `onCaptureLead(args)` é chamado quando o modelo capta um lead.
// Devolve { reply, leadCaptured, lead }.
// Versão em streaming: emite o texto via onDelta(text) à medida que é gerado.
// Mantém o function calling (capture_lead): se o modelo chamar a tool, executa-a
// e faz uma segunda passagem para gerar (em stream) a resposta final.
export async function runConversationStream({ bot, knowledge, history, onCaptureLead, onDelta, apiKey }) {
  const openai = new OpenAI({ apiKey });
  const model = bot.model || process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini';
  const messages = [
    { role: 'system', content: buildSystemPrompt(bot, knowledge) },
    ...history.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') })),
  ];

  let leadCaptured = false;
  let lead = null;
  let fullText = '';

  // Até 3 iterações para resolver tool calls e produzir a resposta final.
  for (let i = 0; i < 3; i++) {
    const stream = await openai.chat.completions.create({
      model,
      temperature: typeof bot.temperature === 'number' ? bot.temperature : 0.5,
      messages,
      tools: [CAPTURE_LEAD_TOOL],
      tool_choice: 'auto',
      max_tokens: 500,
      stream: true,
    });

    let content = '';
    const toolCalls = []; // acumula deltas de tool_calls por índice

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        content += delta.content;
        fullText += delta.content;
        onDelta?.(delta.content);
      }
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          toolCalls[idx] = toolCalls[idx] || { id: '', type: 'function', function: { name: '', arguments: '' } };
          if (tc.id) toolCalls[idx].id = tc.id;
          if (tc.function?.name) toolCalls[idx].function.name += tc.function.name;
          if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
        }
      }
    }

    const calls = toolCalls.filter(Boolean);
    if (calls.length === 0) {
      return { reply: fullText.trim(), leadCaptured, lead };
    }

    // Há tool calls: regista a mensagem do assistente e executa as tools.
    messages.push({ role: 'assistant', content: content || null, tool_calls: calls });
    for (const call of calls) {
      let args = {};
      try { args = JSON.parse(call.function.arguments || '{}'); } catch {}
      if (call.function.name === 'capture_lead') {
        try {
          lead = (await onCaptureLead?.(args)) || args;
          leadCaptured = true;
        } catch (e) {
          console.error('[kyvo] capture_lead falhou:', e);
        }
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify({ ok: leadCaptured }) });
      } else {
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify({ ok: false }) });
      }
    }
    // Volta ao topo do loop: a próxima passagem gera (em stream) o texto final.
  }

  return { reply: fullText.trim() || 'Obrigado! Falamos em breve.', leadCaptured, lead };
}
