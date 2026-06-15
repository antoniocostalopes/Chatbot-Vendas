import { useId } from 'react';

/* Logomark da Closr.
   Conceito: balão de conversa com um visto — a venda fecha-se na conversa
   ("closer"). Squircle com o azul da marca. */
export function LogoMark({ size = 40, className = '' }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Closr"
    >
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3461f6" />
          <stop offset="1" stopColor="#2347db" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#g-${uid})`} />
      {/* balão de conversa */}
      <path
        d="M14 13 h20 a4 4 0 0 1 4 4 v11 a4 4 0 0 1 -4 4 h-9 l-7 5 v-5 h-4 a4 4 0 0 1 -4 -4 v-11 a4 4 0 0 1 4 -4 Z"
        fill="#fff"
      />
      {/* visto (venda fechada) */}
      <path
        d="M18.5 22.5 l4 4 l7.5 -8"
        fill="none"
        stroke="#2347db"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Logótipo completo: logomark + wordmark "Closr". */
export default function Logo({ size = 38, showWordmark = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[19px] font-bold tracking-tight text-slate-900">Closr</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-500">
            Agente de Vendas
          </span>
        </span>
      )}
    </span>
  );
}
