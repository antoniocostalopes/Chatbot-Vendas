import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Avatar from './Avatar.jsx';

const openKyvo = () => window.dispatchEvent(new Event('kyvo:open'));

const EASE = [0.16, 1, 0.3, 1]; // ease-out-expo

/* ---------- Motion helper (respeita prefers-reduced-motion) ---------- */
function Reveal({ children, className, delay = 0, y = 18, as = 'div' }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      // amount (em vez de margin) dispara de forma fiável quando ~15% está
      // visível — evita secções que ficam em branco se o reveal não disparar.
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Ícones (SVG, estilo Lucide) ---------- */
const Icon = {
  home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  chat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  ),
  shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />
    </svg>
  ),
  send: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  ),
  target: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M9.2 16.2 4.8 11.8a1 1 0 0 1 1.4-1.4l3 3 7.6-7.6a1 1 0 1 1 1.4 1.4l-8.3 8.3a1 1 0 0 1-1.4 0Z" />
    </svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="m12 2 2.9 6 6.6.6-5 4.3 1.5 6.4L12 16.9 5.9 19.9l1.6-6.4-5-4.3 6.6-.6L12 2Z" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
};

const XMark = (p) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/* ---------- Botão primário reutilizável ---------- */
function CTA({ children, size = 'md', variant = 'primary', className = '', ...rest }) {
  const sizes = {
    md: 'px-6 py-3.5 text-[16px]',
    lg: 'px-8 py-4 text-[17px]',
    sm: 'px-4 py-2 text-[15px]',
  };
  const variants = {
    primary:
      'bg-grad-brand text-white shadow-glow-sm hover:bg-grad-brand-deep hover:-translate-y-0.5 hover:shadow-glow',
    ghost:
      'border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600',
    onDark:
      'bg-white text-ink-900 shadow-lg hover:bg-brand-50 hover:-translate-y-0.5',
  };
  return (
    <button
      onClick={openKyvo}
      className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Navbar ---------- */
function Nav() {
  // Vidro adaptativo: escuro sobre o hero, claro ao descer a página.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const onDark = !scrolled;

  const link = onDark ? 'text-ink-200 hover:text-white' : 'text-ink-600 hover:text-brand-600';
  return (
    <header className="fixed inset-x-3 top-3 z-30 sm:inset-x-4 sm:top-4">
      <nav
        aria-label="Navegação principal"
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-4 py-2.5 backdrop-blur-xl transition-colors duration-300 sm:px-6 ${
          onDark
            ? 'border-white/15 bg-white/[0.08] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)]'
            : 'border-ink-100 bg-white/70 shadow-sm'
        }`}
      >
        <a href="#top" className="flex items-center" aria-label="Kyvo, início">
          <img
            src={onDark ? '/kyvo-wordmark-white.png' : '/kyvo-wordmark.png'}
            alt="Kyvo"
            className="h-7 w-auto select-none"
            draggable={false}
          />
        </a>
        <div className={`hidden items-center gap-8 text-[15px] font-medium md:flex ${onDark ? 'text-ink-200' : 'text-ink-600'}`}>
          <a href="#solucao" className={`transition-colors ${link}`}>Solução</a>
          <a href="#como" className={`transition-colors ${link}`}>Como funciona</a>
          <a href="#faq" className={`transition-colors ${link}`}>Perguntas</a>
        </div>
        <CTA size="sm">Experimentar</CTA>
      </nav>
    </header>
  );
}

/* ---------- Conversa do hero (revela-se mensagem a mensagem) ---------- */
const HERO_MSGS = [
  { from: 'bot', text: 'Olá! 👋 Em que posso ajudar?' },
  { from: 'user', text: 'Tenho uma loja no WooCommerce e perco contactos fora de horas.' },
  { from: 'bot', text: 'Conheço bem esse problema. Respondo a cada visitante na hora e capto o contacto por si.' },
  { from: 'user', text: 'E é difícil de instalar?' },
  { from: 'bot', text: 'Nada disso! Colo-me com uma linha e trato do resto. Deixe-me o seu e-mail e mostro-lhe já?' },
];

function HeroChat() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? HERO_MSGS.length : 0);
  const [typing, setTyping] = useState(!reduce);

  useEffect(() => {
    if (reduce) return;
    let t;
    if (shown < HERO_MSGS.length) {
      // "a escrever" um pouco, depois revela a mensagem seguinte
      setTyping(true);
      const think = shown === 0 ? 700 : 1300;
      t = setTimeout(() => { setTyping(false); setShown((s) => s + 1); }, think);
    } else {
      // conversa completa — o visitante fica "a escrever" (o e-mail)
      t = setTimeout(() => setTyping(true), 500);
    }
    return () => clearTimeout(t);
  }, [shown, reduce]);

  // alinhamento do indicador "a escrever": quem fala a seguir (no fim, o visitante)
  const nextFrom = shown < HERO_MSGS.length ? HERO_MSGS[shown].from : 'user';

  const bubble = (from) =>
    from === 'bot'
      ? 'max-w-[92%] rounded-2xl rounded-tl-md border border-white/10 bg-white/10 px-3.5 py-2 text-[13.5px] leading-snug text-ink-100 backdrop-blur'
      : 'ml-auto w-fit max-w-[84%] rounded-2xl rounded-tr-md bg-grad-brand px-3.5 py-2 text-[13.5px] font-medium leading-snug text-white shadow-glow-sm';

  return (
    <div className="mt-4 space-y-2.5">
      {HERO_MSGS.slice(0, shown).map((m, i) => (
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: EASE }}
          className={bubble(m.from)}
        >
          {m.text}
        </motion.div>
      ))}
      {typing && (
        <div
          className={`flex w-fit items-center gap-1.5 rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 backdrop-blur ${nextFrom === 'bot' ? 'rounded-tl-md' : 'ml-auto rounded-tr-md'}`}
          aria-label="A escrever"
        >
          <span className="h-2 w-2 animate-bounce-dot rounded-full bg-white/70 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce-dot rounded-full bg-white/70 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce-dot rounded-full bg-white/70 [animation-delay:300ms]" />
        </div>
      )}
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };
  const item = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
      };

  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden bg-ink-900 px-5 pb-10 pt-28 sm:pt-32">
      {/* base escura + mesh de luz (nebulosa / VR, sem grelha) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-900 to-[#0a1020]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 48% at 78% 26%, rgba(24,184,255,.30), transparent 60%),' +
            'radial-gradient(46% 46% at 14% 16%, rgba(63,71,242,.26), transparent 60%),' +
            'radial-gradient(42% 42% at 64% 86%, rgba(122,75,255,.20), transparent 62%)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 -top-28 mx-auto h-[460px] max-w-3xl rounded-full bg-[#18b8ff]/20 blur-[130px]" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center py-8">
       <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-semibold text-brand-300 backdrop-blur"
          >
            <Icon.bolt className="h-4 w-4" /> O vendedor que nunca dorme
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[2.85rem] font-extrabold leading-[1.0] tracking-tightest text-white sm:text-[3.6rem] lg:text-[4.2rem]"
          >
            Continue a vender com o seu{' '}
            <span className="relative whitespace-nowrap text-brand-300">
              agente
              <svg className="absolute -bottom-1.5 left-0 h-3 w-full text-brand-400" viewBox="0 0 200 12" preserveAspectRatio="none" fill="none" aria-hidden>
                <path d="M2 8.5C40 3.5 120 2.5 198 6.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>{' '}
            personalizado.
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Transforme visitantes em clientes sem levantar um dedo. O Kyvo aborda
            cada pessoa, percebe o que procura, aconselha como um vendedor da sua
            equipa e capta o lead, 24/7, treinado nos{' '}
            <strong className="font-semibold text-white">seus</strong> produtos.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
            <CTA size="lg">
              Experimentar agora
              <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </CTA>
            <a
              href="#solucao"
              className="group/link inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-semibold text-ink-300 transition-colors hover:text-white"
            >
              Ver como funciona
              <Icon.arrow className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-medium text-ink-300">
            {['Instala em minutos', 'Sem código', 'Conforme o RGPD'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Icon.check className="h-4 w-4 text-brand-400" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual 3D em vidro (glassmorphism) — cena de conversa flutuante */}
        <motion.div
          className="relative mx-auto w-full max-w-md [perspective:1600px]"
          initial={reduce ? false : { opacity: 0, scale: 0.94, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
        >
          {/* halo de luz por trás do vidro */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#18b8ff]/45 to-[#3f47f2]/45 blur-[80px]" aria-hidden />

          {/* painel de vidro principal — inclinado em 3D */}
          <div className="relative z-10 rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-5 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-2xl [transform:rotateY(-13deg)_rotateX(7deg)]">
            <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden />
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="relative">
                <Avatar size={44} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink-900 bg-emerald-400" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-white">Kyvo · Assistente</div>
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> a responder
                </div>
              </div>
            </div>
            <HeroChat />
          </div>

          {/* chip de vidro flutuante (em frente do painel) */}
          <motion.div
            className="absolute -right-4 -top-5 z-20 hidden items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 shadow-lift backdrop-blur-xl sm:flex"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-400 text-ink-900">
              <Icon.check className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-semibold text-white">Proposta enviada</span>
          </motion.div>
        </motion.div>
       </div>
      </div>

      {/* faixa de plataformas */}
      <Reveal delay={0.2} className="relative z-10 mx-auto mt-6 w-full max-w-5xl">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-400">
          Funciona em qualquer site, sem mexer no resto da página
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {[
            { name: 'WordPress', src: '/logos/wordpress.svg' },
            { name: 'Shopify', src: '/logos/shopify.svg' },
            { name: 'Wix', src: '/logos/wix.svg' },
            { name: 'Webflow', src: '/logos/webflow.svg' },
            { name: 'Squarespace', src: '/logos/squarespace.svg' },
          ].map((p) => (
            <img
              key={p.name}
              src={p.src}
              alt={p.name}
              title={p.name}
              className="h-6 w-auto opacity-45 transition-opacity duration-200 hover:opacity-80"
              loading="lazy"
            />
          ))}
          {/* Código próprio */}
          <span title="Código próprio" className="text-ink-300 opacity-50 transition-opacity duration-200 hover:opacity-80">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Código próprio">
              <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />
            </svg>
          </span>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Problema (o custo de esperar) ---------- */
function Problem() {
  const stats = [
    ['5 min', 'A janela para responder antes de o lead esfriar'],
    ['21×', 'Mais hipóteses de qualificar quem responde a tempo'],
    ['78%', 'Compram a quem responde primeiro'],
  ];
  const without = [
    'Visitantes chegam fora de horas e ninguém responde.',
    'Qualificar cada interessado à mão é lento e não escala.',
    'Sem seguimento imediato, o interesse esfria e perde-se.',
  ];
  const withKyvo = [
    'Responde a cada visitante em segundos, 24/7.',
    'Qualifica e capta os dados em paralelo, sem esforço.',
    'Envia a proposta na hora, antes de o interesse arrefecer.',
  ];

  return (
    <section className="bg-surface px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            Quantas vendas perde por{' '}
            <span className="text-brand-600">não responder a tempo?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">
            A velocidade de resposta decide quem fecha o negócio. Cada minuto de
            espera é dinheiro a sair pela porta.
          </p>
        </Reveal>

        {/* Faixa de estatísticas */}
        <Reveal delay={0.05} className="mt-12 grid divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map(([v, l]) => (
            <div key={v} className="px-6 py-8 text-center">
              <div className="font-display text-[2.75rem] font-extrabold leading-none text-brand-600">{v}</div>
              <div className="mx-auto mt-3 max-w-[15rem] text-[14px] leading-snug text-ink-500">{l}</div>
            </div>
          ))}
        </Reveal>
        <p className="mt-3 text-center text-[12px] text-ink-400">Fonte: médias do setor. A rapidez de resposta é o fator nº 1 na conversão de leads.</p>

        {/* Sem agente vs Com o Kyvo — o lado "com" domina */}
        <div className="mt-12 grid items-stretch gap-5 md:grid-cols-5">
          <Reveal className="md:col-span-2">
            <div className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white/60 p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-400">
                  <Icon.clock className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold text-ink-500">Sem um agente</h3>
              </div>
              <ul className="mt-5 space-y-3.5">
                {without.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[15px] text-ink-500">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-400"><XMark /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-3">
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-ink-900 p-8 shadow-lift">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
              <div className="relative flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white">
                  <Icon.bolt className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold text-white">Com o Kyvo</h3>
              </div>
              <ul className="relative mt-5 space-y-3.5">
                {withKyvo.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[15px] text-ink-100">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                      <Icon.check className="h-3.5 w-3.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <CTA className="relative mt-7 self-start" variant="onDark">
                Parar de perder vendas
                <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </CTA>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Diferenciação: porque os chatbots comuns falham ---------- */
function Difference() {
  const weaknesses = [
    { icon: Icon.shield, t: 'Não conhecem os seus produtos', d: 'Respondem com FAQs genéricas. Não aconselham nem recomendam o que faz sentido para cada cliente.' },
    { icon: Icon.target, t: 'Não captam o lead', d: 'Recolhem uma mensagem solta e ficam por aí. O contacto qualificado nunca chega à sua equipa.' },
    { icon: Icon.clock, t: 'Não fazem seguimento', d: 'Deixam a venda para depois. Sem resposta imediata, o interesse esfria e o cliente desaparece.' },
  ];
  return (
    <section id="solucao" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            Não é um chatbot. <span className="text-brand-600">É um vendedor.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">
            A maioria dos chatbots não vende, só responde. Eis onde falham, e o que o
            Kyvo faz de diferente.
          </p>
        </Reveal>

        {/* 3 fraquezas dos chatbots comuns */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {weaknesses.map((w, i) => (
            <Reveal key={w.t} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-7 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-50 text-ink-400">
                  <w.icon className="h-5 w-5" />
                </span>
                <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-600">
                  <XMark className="h-3 w-3" /> Chatbot comum
                </div>
                <h3 className="mt-3 text-[17px] font-semibold text-ink-900">{w.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{w.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* A resposta do Kyvo */}
        <Reveal delay={0.1} className="mt-5">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-8 shadow-lift sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#3f47f2]/30 blur-3xl" aria-hidden />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[12px] font-semibold text-brand-300">
                  <Icon.check className="h-3.5 w-3.5" /> O Kyvo
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-white sm:text-[1.7rem]">
                  Aborda, conhece os produtos, capta o lead e conduz à venda, sozinho.
                </h3>
              </div>
              <CTA size="lg" className="shrink-0">
                Ver na prática
                <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </CTA>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Como funciona (sequência real) ---------- */
function Steps() {
  const steps = [
    { n: '01', t: 'Conversa e qualifica', d: 'O agente aborda cada visitante, percebe o que precisa e recolhe os dados certos, automaticamente.', icon: Icon.chat },
    { n: '02', t: 'Capta e envia a proposta', d: 'Recolhe o contacto e envia a proposta certa por e-mail, em segundos, sem trabalho manual.', icon: Icon.send },
    { n: '03', t: 'Conduz à venda', d: 'Entrega-lhe leads prontos a fechar e encaminha o cliente para o passo seguinte.', icon: Icon.shield },
  ];
  return (
    <section id="como" className="bg-surface px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            Vende por si, do primeiro <span className="text-brand-600">olá</span> ao fecho
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">
            Três passos. Depois é só receber leads prontos a fechar.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="relative">
              {/* seta de ligação entre passos (desktop) */}
              {i < steps.length - 1 && (
                <span className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-ink-200 md:block" aria-hidden>
                  <Icon.arrow className="h-6 w-6" />
                </span>
              )}
              <div className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-grad-brand text-white shadow-glow-sm transition-transform duration-300 group-hover:scale-110">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-[3.25rem] font-extrabold leading-none text-ink-100 transition-colors group-hover:text-brand-100">{s.n}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ink-900">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Capacidades (bento assimétrico) ---------- */
// Moldura de tile do bento (visual consistente, conteúdo livre).
function Tile({ className = '', children }) {
  return (
    <div className={`group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift ${className}`}>
      {children}
    </div>
  );
}
function TileIcon({ icon: I }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-grad-brand text-white transition-transform duration-300 group-hover:scale-110">
      <I className="h-[22px] w-[22px]" />
    </span>
  );
}
const IconGlobe = (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></svg>);
const IconDoc = (p) => (<svg viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></svg>);

function Features() {
  return (
    <section id="produtos" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            Tudo o que um bom vendedor faz, <span className="text-brand-600">automatizado</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">
            Treinado no seu negócio, a postos em minutos e sempre a trabalhar.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {/* Treinado nos seus produtos (grande, com fontes de conhecimento) */}
          <Reveal className="sm:col-span-2 lg:col-span-4">
            <Tile>
              <TileIcon icon={Icon.shield} />
              <h3 className="mt-5 text-xl font-semibold text-ink-900">Treinado nos seus produtos</h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-600">
                Carregue o catálogo, a FAQ ou o próprio site. O agente responde como um vendedor da sua equipa, com o tom de voz da marca.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:max-w-md">
                {[['catálogo.pdf', IconDoc], ['loja.pt/produtos', IconGlobe], ['perguntas frequentes', Icon.chat], ['tabela de preços', IconDoc]].map(([label, Ic]) => (
                  <div key={label} className="flex items-center gap-2 rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2 text-[12.5px] font-medium text-ink-600">
                    <Ic className="h-4 w-4 shrink-0 text-brand-500" /><span className="truncate">{label}</span>
                  </div>
                ))}
              </div>
            </Tile>
          </Reveal>

          {/* 24/7 */}
          <Reveal delay={0.05} className="lg:col-span-2">
            <Tile>
              <TileIcon icon={Icon.bolt} />
              <div className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink-900">24/7</div>
              <h3 className="mt-1 text-[17px] font-semibold text-ink-900">Sempre a responder</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-600">Atende cada visitante de imediato, mesmo fora de horas.</p>
              <div className="mt-auto flex items-center gap-2 pt-5 text-[13px] font-medium text-emerald-600">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:hidden" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
                Sempre online
              </div>
            </Tile>
          </Reveal>

          {/* Qualifica e capta leads */}
          <Reveal delay={0.05} className="lg:col-span-2">
            <Tile>
              <TileIcon icon={Icon.chat} />
              <h3 className="mt-5 text-[17px] font-semibold text-ink-900">Qualifica e capta leads</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-600">Faz as perguntas certas e recolhe o contacto.</p>
              <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-ink-100 bg-white px-3 py-2.5 shadow-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-grad-brand text-[12px] font-semibold text-white">M</span>
                <div className="min-w-0 flex-1"><div className="text-[13px] font-medium text-ink-900">Marta Silva</div><div className="truncate text-[11.5px] text-ink-400">marta@loja.pt</div></div>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">Novo</span>
              </div>
            </Tile>
          </Reveal>

          {/* Integra em minutos */}
          <Reveal delay={0.1} className="lg:col-span-2">
            <Tile>
              <TileIcon icon={Icon.send} />
              <h3 className="mt-5 text-[17px] font-semibold text-ink-900">Integra em minutos</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-600">Uma linha no site e o agente começa a vender. Sem programar.</p>
              <div className="mt-auto overflow-x-auto rounded-xl border border-ink-800 bg-ink-900 px-3 py-2.5">
                <code className="whitespace-nowrap font-mono text-[11.5px] leading-none text-ink-200">
                  <span className="text-brand-300">&lt;script</span> src=<span className="text-emerald-300">"kyvo.js"</span> <span className="text-brand-300">/&gt;</span>
                </code>
              </div>
            </Tile>
          </Reveal>

          {/* Fala a língua do cliente */}
          <Reveal delay={0.15} className="lg:col-span-2">
            <Tile>
              <TileIcon icon={IconGlobe} />
              <h3 className="mt-5 text-[17px] font-semibold text-ink-900">Fala a língua do cliente</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-600">Responde no idioma de cada visitante.</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {['Português', 'English', 'Español', 'Français'].map((l) => (
                  <span key={l} className="rounded-full border border-ink-100 bg-ink-50/60 px-2.5 py-1 text-[12px] font-medium text-ink-600">{l}</span>
                ))}
              </div>
            </Tile>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12 text-center">
          <CTA>
            Experimentar o agente
            <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </CTA>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Faixa escura: ritmo + números (substitui hero-métrica) ---------- */
function Impact() {
  const metrics = [
    ['24/7', 'A vender sem parar'],
    ['< 3 min', 'Da conversa ao lead'],
    ['100%', 'Treinado nos seus produtos'],
    ['0', 'Esforço manual'],
  ];
  return (
    <section className="px-5 py-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink-900 px-8 py-14 sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#18b8ff]/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-[#3f47f2]/25 blur-3xl" aria-hidden />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-semibold text-brand-300">
              <Icon.bolt className="h-4 w-4" /> Sempre ligado
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-[2.5rem]">
              Enquanto pensa nisto, há visitantes a sair sem comprar.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-300">
              O Kyvo não tira folgas, não esquece o seguimento e não deixa
              ninguém à espera. É o seu melhor vendedor, multiplicado.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
            {metrics.map(([v, l]) => (
              <div key={l} className="bg-ink-900 px-6 py-8">
                <div className="font-display text-4xl font-extrabold text-brand-400 sm:text-5xl">{v}</div>
                <div className="mt-2 text-[14px] text-ink-300">{l}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Comece em minutos (instalação) ---------- */
function Install() {
  const steps = [
    ['Conte-nos sobre o seu negócio', 'Partilha os seus produtos e o tom de voz da marca.'],
    ['Treinamos o seu agente', 'O Kyvo aprende a aconselhar e a vender como a sua equipa.'],
    ['Cole uma linha no seu site', 'O agente fica a vender de imediato, sem código, em qualquer plataforma.'],
  ];
  return (
    <section id="comecar" className="bg-surface px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            A funcionar <span className="text-brand-600">hoje</span>, não daqui a semanas
          </h2>
          <ol className="mt-8 space-y-6">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-grad-brand text-[15px] font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="text-[17px] font-semibold text-ink-900">{t}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <CTA className="mt-9">
            Experimentar agora
            <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </CTA>
        </Reveal>

        {/* mockup do snippet */}
        <Reveal delay={0.1} className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-lift">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-[12px] text-ink-400">index.html</span>
          </div>
          <pre className="overflow-x-auto px-5 py-5 text-[13px] leading-relaxed text-ink-200">
<span className="text-ink-400">&lt;!-- Cole antes de &lt;/body&gt; --&gt;</span>{'\n'}
<span className="text-sky-300">&lt;script</span>{'\n'}  <span className="text-brand-300">src</span>=<span className="text-emerald-300">"https://cdn.kyvo.app/widget.js"</span>{'\n'}  <span className="text-brand-300">data-kyvo-id</span>=<span className="text-emerald-300">"o-seu-id"</span> <span className="text-brand-300">defer</span>{'\n'}<span className="text-sky-300">&gt;&lt;/script&gt;</span>
          </pre>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Testemunhos (um em destaque + dois) ---------- */
function Testimonials() {
  const featured = {
    q: 'O agente atende os visitantes a qualquer hora e entrega-me leads já qualificados. Fechei mais negócios este trimestre do que no anterior, sem contratar ninguém.',
    n: 'Ricardo Sousa',
    r: 'Diretor Comercial',
  };
  const items = [
    { q: 'Passou a vender enquanto eu durmo. Deixei de perder quem chega ao site fora de horas.', n: 'Helena Marques', r: 'Gestora de E-commerce' },
    { q: 'Automatizou a parte chata: conversa, qualificação e seguimento. Eu só fecho o negócio.', n: 'Tiago Fernandes', r: 'Fundador de SaaS' },
  ];
  const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);

  return (
    <section id="testemunhos" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            Quem usa, <span className="text-brand-600">recomenda</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <figure className="flex h-full flex-col justify-between rounded-3xl bg-ink-900 p-9 shadow-lift">
              <div>
                <div className="flex gap-0.5 text-brand-400">
                  {Array.from({ length: 5 }).map((_, i) => <Icon.star key={i} className="h-5 w-5" />)}
                </div>
                <blockquote className="mt-5 font-display text-2xl font-semibold leading-snug text-white sm:text-[1.7rem]">
                  “{featured.q}”
                </blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 font-semibold text-white">
                  {initials(featured.n)}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-white">{featured.n}</span>
                  <span className="block text-[13px] text-ink-300">{featured.r}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="grid gap-5 lg:col-span-2">
            {items.map((t, i) => (
              <Reveal key={t.n} delay={i * 0.1}>
                <figure className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-7 shadow-sm">
                  <div className="flex gap-0.5 text-brand-400">
                    {Array.from({ length: 5 }).map((_, j) => <Icon.star key={j} className="h-4 w-4" />)}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-700">“{t.q}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-700">
                      {initials(t.n)}
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-ink-800">{t.n}</span>
                      <span className="block text-[13px] text-ink-500">{t.r}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const faqs = [
    ['O Kyvo funciona no meu site?', 'Sim. Basta colar uma linha de código. Funciona em qualquer site (WordPress, Shopify, Wix ou código próprio), sem mexer no resto da página.'],
    ['Consigo treiná-lo nos meus produtos?', 'Sim. O agente é treinado no seu catálogo e no tom de voz da marca, para responder e aconselhar como um vendedor da sua equipa.'],
    ['Preciso de saber programar?', 'Não. A instalação é um copiar-colar e nós tratamos da configuração e do treino consigo.'],
    ['Em que idiomas fala?', 'Em português e noutros idiomas, conforme o público do seu site.'],
    ['Para onde vão os leads captados?', 'Para onde quiser: e-mail, folha de cálculo, CRM ou notificação instantânea no Slack/WhatsApp. Sempre com consentimento e em conformidade com o RGPD.'],
    ['Quanto tempo demora a pôr a funcionar?', 'Minutos para instalar. O agente fica a postos assim que estiver treinado nos seus produtos.'],
  ];
  return (
    <section id="faq" className="bg-surface px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            Tudo o que precisa de saber
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">
            Sem letras pequenas. As respostas que importam antes de experimentar.
          </p>
        </Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={Math.min(i * 0.05, 0.2)}>
              <details className="group rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-card transition-colors open:border-brand-200 open:bg-brand-50/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-semibold text-ink-800">
                  {q}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-500 transition-transform duration-300 group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA final (fecho drenched) ---------- */
function FinalCTA() {
  return (
    <section className="px-5 py-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.25rem] bg-ink-900 px-8 py-16 text-center shadow-lift sm:px-12 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background:
            'radial-gradient(50% 60% at 20% 10%, rgba(24,184,255,.22), transparent 60%),' +
            'radial-gradient(50% 60% at 85% 100%, rgba(122,75,255,.22), transparent 60%)' }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#18b8ff]/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-72 w-72 rounded-full bg-[#3f47f2]/35 blur-3xl" aria-hidden />
        <Reveal className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-[2.2rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-[3rem]">
            Cada visitante é uma venda à espera
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-300">
            Adicione o Kyvo ao seu site e deixe de perder quem chega interessado.
            Experimente agora, no canto do ecrã.
          </p>
          <CTA size="lg" className="mt-9">
            Experimentar o agente
            <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </CTA>
          <p className="mt-4 text-[13px] text-ink-400">Instala em minutos · sem código · sem compromisso</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
const SOCIAL = [
  { label: 'LinkedIn', href: '#', d: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95C20.4 8.75 22 10.9 22 14.5V21h-4v-5.8c0-1.38-.03-3.15-1.92-3.15-1.92 0-2.22 1.5-2.22 3.05V21H9V9Z' },
  { label: 'X', href: '#', d: 'M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L8 21H4.8l7.5-8.6L4.5 3h6.6l4.5 5.6L17.5 3Zm-1.1 16h1.8L7.7 4.8H5.8L16.4 19Z' },
  { label: 'Instagram', href: '#', d: 'M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2ZM17 5.8a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3ZM12 4.6c2.4 0 2.7.01 3.6.05 2.5.12 3.66 1.3 3.77 3.77.04.9.05 1.2.05 3.58s-.01 2.67-.05 3.58c-.11 2.46-1.27 3.66-3.77 3.77-.9.04-1.2.05-3.6.05s-2.7-.01-3.6-.05c-2.5-.12-3.66-1.32-3.77-3.77C4.6 14.67 4.6 14.37 4.6 12s.01-2.67.05-3.58C4.76 5.95 5.92 4.77 8.4 4.65 9.3 4.61 9.6 4.6 12 4.6Z' },
];

const FOOTER_COLS = [
  { title: 'Produto', links: [['Solução', '#solucao'], ['Como funciona', '#como'], ['Instalar', '#instalar'], ['Entrar', '/admin']] },
  { title: 'Recursos', links: [['Perguntas', '#faq'], ['Documentação', '#'], ['Estado do serviço', '#']] },
  { title: 'Empresa', links: [['Contacto', '#'], ['Privacidade', '#'], ['Termos', '#']] },
];

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-900 px-5 pb-8 pt-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          {/* Marca */}
          <div className="max-w-xs">
            <img src="/kyvo-wordmark-white.png" alt="Kyvo" className="h-6 w-auto select-none" draggable={false} />
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-300">
              O agente de vendas com IA que responde a cada visitante e capta os contactos por si, 24/7.
            </p>
            <div className="mt-5 flex gap-2.5">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-ink-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Colunas de links */}
          {FOOTER_COLS.map((c) => (
            <div key={c.title}>
              <h3 className="text-[13px] font-semibold text-white">{c.title}</h3>
              <ul className="mt-4 space-y-3">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-[14px] text-ink-300 transition-colors hover:text-white">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-start sm:gap-5">
          <p className="text-[13px] text-ink-400">© {new Date().getFullYear()} Kyvo · o seu agente de vendas personalizado.</p>
          <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
          <div className="flex items-center gap-2 text-[13px] text-ink-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Todos os sistemas operacionais
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Showcase do backoffice (foto real do painel) ---------- */
function Showcase() {
  const highlights = [
    [Icon.target, 'Vê a origem de cada lead'],
    [Icon.chat, 'Filtra por agente'],
    [Icon.bolt, 'Atualizado em tempo real'],
  ];
  return (
    <section className="relative overflow-hidden bg-surface px-5 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-[55rem] -translate-x-1/2 rounded-full bg-brand-200/35 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[2rem] font-bold tracking-tight text-ink-900 sm:text-[2.8rem] sm:leading-[1.06]">
            Os leads aparecem todos no <span className="text-brand-600">seu painel</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">
            Veja quem o agente captou, de que agente veio e o que procura, tudo num só sítio.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift ring-1 ring-ink-900/5">
            {/* barra da janela */}
            <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/70 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
              <span className="ml-3 rounded-md border border-ink-100 bg-white px-2.5 py-0.5 text-[11px] text-ink-400">app.kyvo · Leads</span>
            </div>
            {/* foto real do backoffice */}
            <img src="/backoffice-leads.png" alt="Painel de leads do Kyvo, com a origem de cada contacto" className="block w-full" loading="lazy" />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {highlights.map(([Ic, label]) => (
            <span key={label} className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-600">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600"><Ic className="h-4 w-4" /></span>
              {label}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Prova social (logótipos de clientes) ----------
   NOTA: estes são PLACEHOLDERS. Substituir por logótipos reais (SVG/PNG em
   /public) quando existirem — é o elemento que mais constrói credibilidade. */
function SocialProof() {
  const trust = ['Conforme o RGPD', 'Dados encriptados', 'Sem cartão para experimentar', 'Instala numa linha de código'];
  return (
    <section className="border-b border-ink-100 bg-white px-5 py-7">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {trust.map((t) => (
          <span key={t} className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-500">
            <Icon.check className="h-[18px] w-[18px] text-brand-500" />{t}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-full bg-white">
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <Problem />
        <Difference />
        <Steps />
        <Features />
        <Showcase />
        <Impact />
        <Install />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
