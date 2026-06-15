import { useId } from 'react';

// Avatar "Lara" — ilustração humanizada de uma assistente (senhora),
// auto-contida em SVG, legível desde 28px até tamanhos grandes.
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
        <radialGradient id={`bg-${id}`} cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor="#fdf1e7" />
          <stop offset="1" stopColor="#e9eefc" />
        </radialGradient>
        <linearGradient id={`skin-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8d2ad" />
          <stop offset="1" stopColor="#e9b487" />
        </linearGradient>
        <linearGradient id={`hair-${id}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#6e4a2f" />
          <stop offset="1" stopColor="#4a2f1c" />
        </linearGradient>
        <linearGradient id={`hairhi-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5e3b" />
          <stop offset="1" stopColor="#6e4a2f" />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="64" height="64" fill={`url(#bg-${id})`} />
        {/* cabelo (atrás) */}
        <path
          d="M14 33 C14 16 21 7 32 7 C43 7 50 16 50 33 C50 45 48 53 46 59 L41.5 59 C43 50 42.5 40 42 34 C41 24 37 19.5 32 19.5 C27 19.5 23 24 22 34 C21.5 40 21 50 22.5 59 L18 59 C16 53 14 45 14 33 Z"
          fill={`url(#hair-${id})`}
        />
        {/* ombros / blusa */}
        <path d="M12 64 C12.5 51 21 46.5 32 46.5 C43 46.5 51.5 51 52 64 Z" fill="#3461f6" />
        <path d="M27 47 q5 5 10 0 v3 q-5 4 -10 0 Z" fill="#2f57da" />
        {/* pescoço */}
        <path d="M28 40 h8 v5 c0 3.2 -8 3.2 -8 0 Z" fill="#e3a877" />
        {/* rosto */}
        <ellipse cx="32" cy="30" rx="11.6" ry="13.8" fill={`url(#skin-${id})`} />
        {/* orelhas */}
        <circle cx="20.7" cy="31" r="2.3" fill="#e9b487" />
        <circle cx="43.3" cy="31" r="2.3" fill="#e9b487" />
        <circle cx="20.7" cy="33" r="0.9" fill="#d99a5f" />
        <circle cx="43.3" cy="33" r="0.9" fill="#d99a5f" />
        {/* blush */}
        <ellipse cx="25" cy="34.5" rx="2.4" ry="1.7" fill="#f3a081" opacity="0.45" />
        <ellipse cx="39" cy="34.5" rx="2.4" ry="1.7" fill="#f3a081" opacity="0.45" />
        {/* cabelo frente: risca ao lado + franja */}
        <path
          d="M20.2 31 C19.5 19 25 12.5 32 12.5 C39.5 12.5 44.6 18 44.4 30 C44.4 26.5 43 24.5 41.2 24.8 C40 20.5 35.5 18.6 32.6 19 C33.6 21 33.4 22.6 32.8 24 C31.8 21.4 27.5 20.2 24.6 22.8 C23 24.2 21.2 25.5 20.7 28.5 C20.5 29.5 20.3 30.2 20.2 31 Z"
          fill={`url(#hairhi-${id})`}
        />
        {/* sobrancelhas */}
        <path d="M25.3 26.4 q3 -1.7 6 -0.2" stroke="#5a3a23" strokeWidth="1.15" fill="none" strokeLinecap="round" />
        <path d="M32.7 26.2 q3 -1.5 6 0.2" stroke="#5a3a23" strokeWidth="1.15" fill="none" strokeLinecap="round" />
        {/* olhos */}
        <ellipse cx="27.2" cy="29.6" rx="2.7" ry="2" fill="#fff" />
        <ellipse cx="36.8" cy="29.6" rx="2.7" ry="2" fill="#fff" />
        <circle cx="27.5" cy="29.8" r="1.55" fill="#6b4a2c" />
        <circle cx="36.5" cy="29.8" r="1.55" fill="#6b4a2c" />
        <circle cx="27.5" cy="29.8" r="0.7" fill="#2a1c10" />
        <circle cx="36.5" cy="29.8" r="0.7" fill="#2a1c10" />
        <circle cx="28" cy="29.2" r="0.4" fill="#fff" />
        <circle cx="37" cy="29.2" r="0.4" fill="#fff" />
        <path d="M24.4 28.5 Q27.2 26.9 30 28.4" stroke="#3a2a1d" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M34 28.4 Q36.8 26.9 39.6 28.5" stroke="#3a2a1d" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        {/* nariz */}
        <path d="M31.7 31 Q30.9 33.6 32.4 34.2" stroke="#d99a5f" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {/* lábios */}
        <path d="M28.6 37 Q32 36 35.4 37 Q32 40.2 28.6 37 Z" fill="#d77a6e" />
        <path d="M28.6 37 Q32 38 35.4 37" stroke="#b85a4f" strokeWidth="0.5" fill="none" />
        {/* brincos */}
        <circle cx="20.7" cy="35.4" r="1" fill="#f4c453" />
        <circle cx="43.3" cy="35.4" r="1" fill="#f4c453" />
      </g>
    </svg>
  );
}
