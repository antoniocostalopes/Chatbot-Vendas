import { useId } from 'react';

// Avatar "Lara" — ilustração de uma assistente (senhora), auto-contida em SVG.
export default function Avatar({ size = 36 }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="shrink-0 rounded-full ring-2 ring-white shadow-sm"
      role="img"
      aria-label="Lara, assistente"
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        {/* fundo */}
        <rect width="64" height="64" fill="#e7eefc" />
        {/* cabelo (atrás, comprido) */}
        <path
          d="M15 32 C15 15 22 7 32 7 C42 7 49 15 49 32 C49 44 47 52 45 58 L41 58 L41 32 C41 23 37 19 32 19 C27 19 23 23 23 32 L23 58 L19 58 C17 52 15 44 15 32 Z"
          fill="#5b3b26"
        />
        {/* ombros / blusa */}
        <path d="M14 64 C14 51 22 47 32 47 C42 47 50 51 50 64 Z" fill="#3461f6" />
        {/* pescoço */}
        <path d="M28 41 h8 v6 c0 3 -8 3 -8 0 Z" fill="#eab98f" />
        {/* rosto */}
        <ellipse cx="32" cy="30" rx="12" ry="14" fill="#f4cba6" />
        {/* orelhas */}
        <circle cx="20.5" cy="31" r="2.3" fill="#eab98f" />
        <circle cx="43.5" cy="31" r="2.3" fill="#eab98f" />
        {/* franja / cabelo frente */}
        <path
          d="M20 30 C20 18 25 13 32 13 C39 13 44 18 44 30 C44 25 41 22 38 24 C35 19 29 19 26 24 C23 22 20 25 20 30 Z"
          fill="#6b4a30"
        />
        {/* sobrancelhas */}
        <path d="M25.5 27 q3 -1.6 6 0" stroke="#5b3b26" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M32.5 27 q3 -1.6 6 0" stroke="#5b3b26" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* olhos */}
        <circle cx="27.6" cy="30.6" r="1.8" fill="#3a2a1d" />
        <circle cx="36.4" cy="30.6" r="1.8" fill="#3a2a1d" />
        <circle cx="28.1" cy="30.1" r="0.5" fill="#fff" />
        <circle cx="36.9" cy="30.1" r="0.5" fill="#fff" />
        {/* blush */}
        <circle cx="24.5" cy="34.5" r="2" fill="#f4a08a" opacity="0.45" />
        <circle cx="39.5" cy="34.5" r="2" fill="#f4a08a" opacity="0.45" />
        {/* sorriso */}
        <path d="M28 37.5 q4 3.6 8 0" stroke="#c97b54" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* brincos */}
        <circle cx="20.5" cy="35" r="1" fill="#f6c453" />
        <circle cx="43.5" cy="35" r="1" fill="#f6c453" />
      </g>
    </svg>
  );
}
