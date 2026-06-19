// GET /api/admin/site-agent (platform_admin)
// Devolve o agente do site; se ainda não existir, cria-o (com defaults do Kyvo).
// O gestor depois edita-o pela rota normal /api/bots/:id (BotEditor).
import { supabaseAdmin } from '../_lib/supabase.js';
import { requirePlatformAdmin } from '../_lib/auth.js';
import { json, handlePreflight } from '../_lib/http.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });

  const auth = await requirePlatformAdmin(req, res);
  if (!auth) return;

  let { data: bot } = await supabaseAdmin.from('bots').select('*').eq('is_site_agent', true).maybeSingle();

  if (!bot) {
    const { data: created, error } = await supabaseAdmin
      .from('bots')
      .insert({
        owner_id: auth.user.id,
        is_site_agent: true,
        name: 'Agente do site',
        greeting: 'Olá! 👋 Em que posso ajudar?',
        persona:
          'És o Kyvo, o agente de vendas com IA da própria Kyvo. Falas português de Portugal, de forma calorosa, humana e consultiva — sem soar a vendedor agressivo. Conversas com cada visitante do site, percebes o que procura, explicas como o Kyvo capta leads 24/7 (treinado nos produtos do cliente, instalável com uma linha de código) e, quando houver interesse, recolhes o contacto para a equipa fazer seguimento.',
        qualification_questions: [
          'Que tipo de site ou negócio tem?',
          'Qual é o maior desafio com os contactos que chegam ao site?',
        ],
      })
      .select()
      .single();
    if (error) return json(res, 500, { error: 'Erro a criar o agente do site.', detail: error.message });
    bot = created;
  }

  return json(res, 200, { bot });
}
