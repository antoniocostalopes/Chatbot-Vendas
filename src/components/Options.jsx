import { useState } from 'react';

// Opções listadas verticalmente — uma por linha. Clicar avança imediatamente.
export default function Options({ options, onConfirm }) {
  const [chosen, setChosen] = useState(null);

  return (
    <div className="ml-[38px] mt-0.5 flex flex-col items-stretch gap-1.5 animate-fade-up" role="group" aria-label="Opções">
      {options.map((opt) => {
        const active = chosen === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            disabled={chosen !== null}
            onClick={() => {
              setChosen(opt.value);
              onConfirm(opt);
            }}
            className={[
              'radio-chat-input group flex min-h-[46px] w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] font-medium transition-colors duration-200 disabled:cursor-default',
              active
                ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50/50',
            ].join(' ')}
          >
            <span>{opt.label}</span>
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? 'translate-x-0.5 text-white' : 'text-slate-300 group-hover:translate-x-0.5 group-hover:text-brand-400'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
