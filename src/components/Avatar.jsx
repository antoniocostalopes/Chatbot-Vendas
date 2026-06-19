// Avatar do assistente — imagem em /public/avatar.png (personagem Kyvo).
// Mantém a API `size` para todos os usos (bolhas, header, launcher).
export default function Avatar({ size = 36 }) {
  return (
    <img
      src="/avatar.png"
      alt="Assistente Kyvo"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      draggable={false}
    />
  );
}
