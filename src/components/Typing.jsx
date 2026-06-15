import Avatar from './Avatar.jsx';

export default function Typing() {
  return (
    <div className="flex items-end gap-2" aria-label="A escrever" role="status">
      <Avatar size={30} />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
