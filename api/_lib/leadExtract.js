// Extração simples de contactos (sem IA) — usada no modo 'search' para captar
// leads quando o visitante escreve email/telefone na mensagem.
export function extractContact(text) {
  const s = String(text || '');
  const email = (s.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/) || [])[0] || null;

  let phone = null;
  const m = s.match(/\+?\d[\d\s().-]{7,}\d/);
  if (m) {
    const digits = m[0].replace(/\D/g, '');
    if (digits.length >= 9 && digits.length <= 15) phone = m[0].trim();
  }
  return { email, phone };
}
