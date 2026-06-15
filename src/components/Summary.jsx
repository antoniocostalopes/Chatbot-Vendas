// Cartão de resumo: mostra os dados recolhidos antes do envio, com a opção de
// editar cada campo (reduz erros e aumenta a confiança).
export default function Summary({ rows, onEdit, onConfirm }) {
  return (
    <div className="ml-[38px] mt-1 flex flex-col gap-3 animate-fade-up">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-slate-400">
          Os seus dados
        </div>
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <div className="text-[12px] text-slate-400">{r.field}</div>
                <div className="truncate text-[14px] font-medium text-slate-800">{r.value}</div>
              </div>
              {r.editable && (
                <button
                  onClick={() => onEdit(r.pageId)}
                  aria-label={`Editar ${r.field}`}
                  className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                  </svg>
                  Editar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onConfirm}
        className="w-full cursor-pointer rounded-xl bg-brand-500 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Confirmar e enviar
      </button>
    </div>
  );
}
