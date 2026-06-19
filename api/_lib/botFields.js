// Campos do bot que o cliente pode definir/atualizar (partilhado por
// /api/bots e /api/bots/[id] para não divergirem).
export const BOT_EDITABLE = [
  'name', 'persona', 'greeting', 'language', 'model', 'mode', 'qualification_questions',
  'temperature', 'accent_color', 'capture_fields', 'lead_routing', 'allowed_domains', 'status',
];

export function pickBotFields(obj) {
  const out = {};
  for (const k of BOT_EDITABLE) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}
