// (Re)indexa um item de knowledge: substitui os chunks e gera embeddings.
// Tolerante a falhas: se não houver chave OpenAI ou a API falhar, o item fica
// guardado na mesma (sem embeddings) e o chat cai para o modo "texto completo".
import { supabaseAdmin } from './supabase.js';
import { chunkText, embedTexts, toVectorLiteral } from './embeddings.js';

export async function reindexKnowledge(item, apiKey) {
  // Limpa chunks antigos deste item.
  await supabaseAdmin.from('knowledge_chunks').delete().eq('knowledge_id', item.id);

  const title = item.title ? `${item.title}\n` : '';
  const chunks = chunkText(title + (item.content || ''));
  if (!chunks.length) return { indexed: 0 };

  let embeddings = [];
  if (apiKey) {
    try {
      embeddings = await embedTexts(chunks, apiKey);
    } catch (e) {
      console.error('[kyvo] embeddings falhou:', e?.message);
      embeddings = []; // guarda os chunks sem vetor; reindexa-se mais tarde
    }
  }

  const rows = chunks.map((content, i) => ({
    bot_id: item.bot_id,
    knowledge_id: item.id,
    content,
    embedding: embeddings[i] ? toVectorLiteral(embeddings[i]) : null,
  }));

  const { error } = await supabaseAdmin.from('knowledge_chunks').insert(rows);
  if (error) console.error('[kyvo] inserir chunks falhou:', error.message);
  return { indexed: embeddings.length, chunks: chunks.length };
}
