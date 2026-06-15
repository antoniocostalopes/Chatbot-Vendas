// Cartão de confirmação final: a proposta segue por e-mail (captura de lead).
export default function Done({ email, onRestart }) {
  return (
    <div className="ml-[38px] mt-1 flex flex-col gap-3 animate-fade-up">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-500 text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l4.5 4.5L19 7" />
            </svg>
          </span>
          <div>
            <p className="text-[15px] font-semibold text-green-800">Proposta a caminho</p>
            <p className="text-[13px] text-green-700">Enviada para o seu e-mail</p>
          </div>
        </div>

        {email && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 bg-white px-3 py-2.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <span className="truncate text-[14px] font-medium text-slate-700">{email}</span>
          </div>
        )}

        <p className="mt-3 text-[13px] leading-relaxed text-green-700">
          Deverá chegar dentro de minutos. Se não a encontrar, verifique a pasta de spam.
        </p>
      </div>

      <button
        onClick={onRestart}
        className="cursor-pointer self-start rounded-xl border border-slate-300 bg-white px-5 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
      >
        Nova simulação
      </button>
    </div>
  );
}
