// Cifra de segredos em repouso (ex.: chave OpenAI de cada cliente).
// AES-256-GCM com chave derivada de um segredo do servidor. Nunca corre no
// browser — só dentro de /api.
import crypto from 'node:crypto';

const SECRET =
  process.env.ENCRYPTION_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'kyvo-dev-secret-change-me';

const KEY = crypto.createHash('sha256').update(String(SECRET)).digest(); // 32 bytes

export function encryptSecret(plain) {
  if (!plain) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64'); // iv(12)+tag(16)+dados
}

export function decryptSecret(blob) {
  if (!blob) return null;
  try {
    const raw = Buffer.from(String(blob), 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const enc = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return null; // segredo cifrado com outra chave / corrompido
  }
}

// Pista segura para mostrar ao utilizador (nunca a chave inteira).
export function keyHint(plain) {
  if (!plain) return null;
  const s = String(plain).trim();
  return s.length <= 6 ? 'sk-…' : `sk-…${s.slice(-4)}`;
}
