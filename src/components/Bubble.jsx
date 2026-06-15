import Avatar from './Avatar.jsx';

// Bolha de mensagem. `showAvatar` controla o agrupamento: numa sequência de
// mensagens do mesmo emissor, apenas a última mostra o avatar; as restantes
// ficam alinhadas com um espaçador, para um visual mais limpo.
export default function Bubble({ from = 'bot', showAvatar = true, children }) {
  const isBot = from === 'bot';
  return (
    <div className={`flex w-full items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot &&
        (showAvatar ? (
          <Avatar size={30} />
        ) : (
          <span className="w-[30px] shrink-0" aria-hidden />
        ))}
      <div
        className={[
          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm animate-fade-up',
          isBot
            ? `bg-white text-slate-800 ${showAvatar ? 'rounded-bl-md' : 'rounded-l-md'}`
            : `bg-brand-500 text-white ${showAvatar ? 'rounded-br-md' : 'rounded-r-md'}`,
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
