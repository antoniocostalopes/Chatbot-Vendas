import { useState } from 'react';
import { masks, validators } from '../lib/validators.js';

export default function TextField({ kind, placeholder, onConfirm }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const mask = masks[kind];
  const validate = validators[kind] || validators.text;
  const errId = `err-${kind}`;

  function handleChange(e) {
    const raw = e.target.value;
    setValue(mask ? mask(raw) : raw);
    if (error) setError('');
  }

  function submit() {
    const result = validate(value.trim());
    if (result !== true) {
      setError(result);
      return;
    }
    onConfirm(value.trim());
  }

  return (
    <div className="ml-[38px] mt-0.5 flex flex-col items-stretch gap-1.5 animate-fade-up">
      <div className="relative">
        <input
          autoFocus
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          inputMode={['nif', 'phone', 'number', 'postal'].includes(kind) ? 'numeric' : 'text'}
          className={[
            'w-full rounded-xl border bg-white py-3 pl-4 pr-14 text-[14.5px] outline-none transition-colors',
            error
              ? 'border-red-400 focus:ring-1 focus:ring-red-400'
              : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
          ].join(' ')}
        />
        <button
          type="button"
          disabled={!value.trim()}
          onClick={submit}
          aria-label="Enviar"
          className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg bg-brand-500 text-white transition-colors enabled:hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
          </svg>
        </button>
      </div>
      {error && (
        <span id={errId} role="alert" className="text-[13px] text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
