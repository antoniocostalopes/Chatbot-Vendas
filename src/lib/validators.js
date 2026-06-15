// Validações e máscaras para campos PT (matrícula, NIF, código postal, etc.)

export function maskPlate(v) {
  const clean = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return clean.replace(/(.{2})(.{0,2})(.{0,2})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join('-'),
  );
}

export function maskPostal(v) {
  const clean = v.replace(/\D/g, '').slice(0, 7);
  return clean.replace(/(\d{4})(\d{0,3})/, (_, a, b) => (b ? `${a}-${b}` : a));
}

export function maskDate(v) {
  const clean = v.replace(/\D/g, '').slice(0, 8);
  const p = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 8)].filter(Boolean);
  return p.join('/');
}

export function maskDigits(max) {
  return (v) => v.replace(/\D/g, '').slice(0, max);
}

// NIF português com dígito de controlo
export function isValidNIF(nif) {
  if (!/^\d{9}$/.test(nif)) return false;
  if (!'1235689'.includes(nif[0])) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(nif[i]) * (9 - i);
  const check = 11 - (sum % 11);
  const expected = check >= 10 ? 0 : check;
  return expected === Number(nif[8]);
}

export const validators = {
  plate: (v) => /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/.test(v) || 'Matrícula inválida (ex.: 00-AA-00).',
  nif: (v) => isValidNIF(v) || 'NIF inválido.',
  postal: (v) => /^\d{4}-\d{3}$/.test(v) || 'Código postal inválido (ex.: 1000-001).',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido.',
  phone: (v) => /^(9[1236]\d{7}|2\d{8})$/.test(v) || 'Número de telefone inválido.',
  date: (v) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (!m) return 'Data inválida (dd/mm/aaaa).';
    const [_, d, mo, y] = m.map(Number);
    const dt = new Date(y, mo - 1, d);
    const ok = dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
    return ok || 'Data inválida.';
  },
  name: (v) => v.trim().split(/\s+/).length >= 2 || 'Indique o nome completo.',
  number: (v) => (Number(v) > 0 ? true : 'Indique um valor válido.'),
  text: (v) => v.trim().length >= 2 || 'Campo obrigatório.',
};

export const masks = {
  plate: maskPlate,
  postal: maskPostal,
  date: maskDate,
  nif: maskDigits(9),
  phone: maskDigits(9),
  number: maskDigits(8),
};
