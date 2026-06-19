// Embeddings (RAG) — divide texto em chunks e gera vetores com a OpenAI.
import OpenAI from 'openai';

export const EMBED_MODEL = 'text-embedding-3-small'; // 1536 dims

// Divide texto em pedaços ~maxChars com sobreposição, cortando em fronteiras
// de parágrafo/frase quando possível.
export function chunkText(text, maxChars = 1200, overlap = 150) {
  const clean = String(text || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + maxChars, clean.length);
    if (end < clean.length) {
      // tenta cortar numa quebra de parágrafo/frase perto do fim
      const slice = clean.slice(i, end);
      const cut = Math.max(slice.lastIndexOf('\n\n'), slice.lastIndexOf('. '), slice.lastIndexOf('\n'));
      if (cut > maxChars * 0.5) end = i + cut + 1;
    }
    chunks.push(clean.slice(i, end).trim());
    if (end >= clean.length) break;
    i = end - overlap; // sobreposição para não partir contexto
  }
  return chunks.filter(Boolean);
}

// Gera embeddings para um array de textos (uma chamada à API).
export async function embedTexts(texts, apiKey) {
  if (!texts.length) return [];
  const openai = new OpenAI({ apiKey });
  const res = await openai.embeddings.create({ model: EMBED_MODEL, input: texts });
  return res.data.map((d) => d.embedding);
}

// Embedding de uma única query (procura no chat).
export async function embedQuery(text, apiKey) {
  const [v] = await embedTexts([String(text || '').slice(0, 4000)], apiKey);
  return v || null;
}

// pgvector aceita o formato de texto "[0.1,0.2,...]".
export function toVectorLiteral(arr) {
  return '[' + arr.join(',') + ']';
}
