// Primitivas de UI partilhadas do painel — consistência visual entre páginas.

// Cabeçalho de página uniforme (título + subtítulo + ações à direita).
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-ink-500">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// Bloco de esqueleto (loading) — reserva o espaço e evita saltos de conteúdo.
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-ink-100 ${className}`} />;
}

// Estado vazio amigável: ícone + título + subtítulo + ação opcional.
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
      {icon && <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-500">{icon}</div>}
      <h3 className="text-[15px] font-semibold text-ink-800">{title}</h3>
      {subtitle && <p className="mx-auto mt-1 max-w-sm text-[13.5px] leading-relaxed text-ink-500">{subtitle}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// Grelha de esqueletos para cartões de KPI / listas.
export function SkeletonCards({ count = 4, className = '' }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="mt-4 h-7 w-20" />
          <Skeleton className="mt-2 h-3.5 w-28" />
        </div>
      ))}
    </div>
  );
}
