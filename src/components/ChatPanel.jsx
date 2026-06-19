import Avatar from './Avatar.jsx';

// "Chrome" do painel de chat (cabeçalho + corpo). Partilhado pelo widget da
// landing e pela página embebível /widget. O conteúdo (motor de conversa) é
// passado como children.
export default function ChatPanel({
  name = 'Kyvo',
  badge = null,
  accentColor,
  onReset,
  onClose,
  children,
}) {
  // Honra a cor de marca do bot (accent_color) quando fornecida.
  const headerStyle = accentColor
    ? { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }
    : undefined;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-ink-100">
      {/* Cabeçalho */}
      <div
        className={`relative overflow-hidden px-4 py-3.5 text-white ${accentColor ? '' : 'bg-gradient-to-br from-brand-600 to-brand-500'}`}
        style={headerStyle}
      >
        <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex">
              <Avatar size={40} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white/40 bg-green-400" aria-hidden />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 text-[15px] font-semibold">
                {name}
                {badge && (
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/90">
                    {badge}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[12px] text-white/80">Online · responde em segundos</div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {onReset && (
              <button
                onClick={onReset}
                aria-label="Recomeçar conversa"
                title="Recomeçar"
                className="cursor-pointer rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11a9 9 0 0 1 15-6.7L21 7" /><path d="M21 3v4h-4" />
                  <path d="M21 13a9 9 0 0 1-15 6.7L3 17" /><path d="M3 21v-4h4" />
                </svg>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Minimizar"
                title="Minimizar"
                className="cursor-pointer rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Corpo (motor de conversa) */}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
