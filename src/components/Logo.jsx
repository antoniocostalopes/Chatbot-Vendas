/* Logótipo Kyvo — imagem (PNG recortado e transparente em /public). */
export default function Logo({ size = 38, className = '' }) {
  // `size` controla a altura; a largura ajusta-se pela proporção (~2.4:1).
  return (
    <img
      src="/kyvo-logo.png"
      alt="Kyvo"
      height={size}
      style={{ height: size, width: 'auto' }}
      className={`select-none ${className}`}
      draggable={false}
    />
  );
}
