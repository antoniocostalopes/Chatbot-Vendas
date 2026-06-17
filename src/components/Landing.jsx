import { motion, useReducedMotion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import Logo from './Logo.jsx';

const openLara = () => window.dispatchEvent(new Event('open-lara'));

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
      viewport={{ once: true, margin: '-60px' }}
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
      'bg-brand-500 text-white shadow-glow-sm hover:bg-brand-600 hover:-translate-y-0.5',
    ghost:
      'border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600',
    onDark:
      'bg-white text-ink-900 shadow-lg hover:bg-brand-50 hover:-translate-y-0.5',
  };
  return (
    <button
      onClick={openLara}
      className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Navbar ---------- */
function Nav() {
  return (
    <header className="fixed inset-x-3 top-3 z-30 sm:inset-x-4 sm:top-4">
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-ink-100 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-6"
      >
        <a href="#top" className="flex items-center" aria-label="Closr — início">
          <Logo size={38} />
        </a>
        <div className="hidden items-center gap-8 text-[15px] font-medium text-ink-600 md:flex">
          <a href="#solucao" className="transition-colors hover:text-brand-600">Solução</a>
          <a href="#como" className="transition-colors hover:text-brand-600">Como funciona</a>
          <a href="#faq" className="transition-colors hover:text-brand-600">Perguntas</a>
        </div>
        <CTA size="sm">Experimentar</CTA>
      </nav>
    </header>
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
    <section id="top" className="relative overflow-hidden px-5 pb-24 pt-32 sm:pt-36">
      {/* brilho quente de fundo */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[520px] max-w-4xl rounded-full bg-brand-300/35 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-brand-200/40 blur-[100px]" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-[13px] font-semibold text-brand-700"
          >
            <Icon.bolt className="h-4 w-4" /> O vendedor que nunca dorme
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[2.7rem] font-extrabold leading-[1.02] tracking-tightest text-ink-900 sm:text-[3.4rem] lg:text-[4rem]"
          >
            Continue a vender com o seu{' '}
            <span className="relative whitespace-nowrap text-brand-600">
              agente
              <svg className="absolute -bottom-1.5 left-0 h-3 w-full text-brand-400" viewBox="0 0 200 12" preserveAspectRatio="none" fill="none" aria-hidden>
                <path d="M2 8.5C40 3.5 120 2.5 198 6.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>{' '}
            personalizado.
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
            Transforme visitantes em clientes sem levantar um dedo. O Closr aborda
            cada pessoa, percebe o que procura, aconselha como um vendedor da sua
            equipa e capta o lead — 24/7, treinado nos{' '}
            <strong className="font-semibold text-ink-800">seus</strong> produtos.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <CTA size="lg">
              Experimentar agora
              <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </CTA>
            <a
              href="#solucao"
              className="cursor-pointer rounded-xl border border-ink-200 bg-white px-7 py-4 text-[16px] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              Ver a solução
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-medium text-ink-500">
            {['Instala em minutos', 'Sem código', 'Conforme o RGPD'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Icon.check className="h-4 w-4 text-brand-500" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual: conversa ao vivo + sinais de venda */}
        <motion.div
          className="relative mx-auto w-full max-w-md"
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        >
          <div className="rounded-[1.75rem] border border-ink-100 bg-white p-5 shadow-lift">
            <div className="flex items-center gap-3 border-b border-ink-100 pb-4">
              <div className="relative">
                <Avatar size={44} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-ink-800">Joana · Assistente</div>
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> a responder
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink-100 px-4 py-2.5 text-[14px] text-ink-700">
                Olá! Em que posso ajudar hoje?
              </div>
              <div className="ml-auto w-fit rounded-2xl rounded-tr-md bg-brand-500 px-4 py-2.5 text-[14px] font-medium text-white shadow-glow-sm">
                Quero saber mais
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-ink-100 px-4 py-3 w-fit" aria-label="A escrever">
                <span className="h-2 w-2 animate-bounce-dot rounded-full bg-ink-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce-dot rounded-full bg-ink-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce-dot rounded-full bg-ink-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>

          {/* cartões flutuantes — sinais de venda */}
          <motion.div
            className="absolute -bottom-7 -left-5 hidden w-44 rotate-[-5deg] rounded-2xl border border-ink-100 bg-white p-3.5 shadow-lift sm:block"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.9 }}
          >
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-600">
                <Icon.target className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[11px] font-medium text-ink-500">Novo lead</div>
                <div className="text-[14px] font-bold text-ink-900">qualificado</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-5 top-8 hidden w-48 rotate-[5deg] rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-lift sm:block"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
          >
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                <Icon.check className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-semibold text-ink-800">Proposta enviada</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* faixa de plataformas */}
      <Reveal delay={0.2} className="relative mx-auto mt-20 max-w-5xl">
        <p className="text-center text-[13px] font-medium text-ink-400">
          Funciona em qualquer site — sem mexer no resto da página
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[15px] font-semibold text-ink-400">
          {['WordPress', 'Shopify', 'Wix', 'Webflow', 'Squarespace', 'Código próprio'].map((p) => (
            <span key={p} className="transition-colors hover:text-ink-600">{p}</span>
          ))}
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
  const withClosr = [
    'Responde a cada visitante em segundos, 24/7.',
    'Qualifica e capta os dados em paralelo, sem esforço.',
    'Envia a proposta na hora — o interesse não arrefece.',
  ];

  return (
    <section className="bg-surface px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-[2.6rem] sm:leading-[1.08]">
            Quantas vendas perde por{' '}
            <span className="text-brand-600">não responder a tempo?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">
            A velocidade de resposta decide quem fecha o negócio. Cada minuto de
            espera é dinheiro a sair pela porta.
          </p>
        </Reveal>

        {/* Faixa de estatísticas */}
        <Reveal delay={0.05} className="mt-12 grid divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map(([v, l]) => (
            <div key={v} className="px-6 py-8 text-center">
              <div className="font-display text-[2.75rem] font-extrabold leading-none text-ink-900">{v}</div>
              <div className="mx-auto mt-3 max-w-[15rem] text-[14px] leading-snug text-ink-500">{l}</div>
            </div>
          ))}
        </Reveal>
        <p className="mt-3 text-center text-[12px] text-ink-400">Médias do setor de resposta a leads.</p>

        {/* Sem agente vs Com o Closr — o lado "com" domina */}
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
                <h3 className="text-lg font-semibold text-white">Com o Closr</h3>
              </div>
              <ul className="relative mt-5 space-y-3.5">
                {withClosr.map((t) => (
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

/* ---------- Diferenciação (solução) ---------- */
function Difference() {
  const rows = [
    ['Espera que cliquem em "ajuda"', 'Aborda cada visitante primeiro'],
    ['Responde com FAQs genéricas', 'Conhece os seus produtos e aconselha'],
    ['Recolhe uma mensagem solta', 'Qualifica e capta o lead completo'],
    ['Deixa a venda para depois', 'Conduz à proposta na hora'],
  ];
  return (
    <section id="solucao" className="px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-[2.6rem] sm:leading-[1.08]">
            Não é um chatbot. <span className="text-brand-600">É um vendedor.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">
            Os chatbots respondem a perguntas. O Closr faz o que um bom vendedor faz —
            aborda, aconselha, qualifica e conduz à decisão.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-12 overflow-hidden rounded-3xl border border-ink-100 shadow-sm">
          <div className="grid grid-cols-2 text-[13px] font-semibold uppercase tracking-wide">
            <div className="bg-ink-50 px-5 py-3.5 text-ink-400">Chatbot tradicional</div>
            <div className="bg-brand-500 px-5 py-3.5 text-white">Closr</div>
          </div>
          <div className="grid grid-cols-2">
            {rows.map(([bad, good], i) => (
              <div key={i} className="contents">
                <div className="flex items-start gap-2.5 border-t border-ink-100 bg-white px-5 py-4 text-[15px] text-ink-500">
                  <span className="mt-0.5 text-ink-300"><XMark /></span>
                  {bad}
                </div>
                <div className="flex items-start gap-2.5 border-t border-brand-100 bg-brand-50/50 px-5 py-4 text-[15px] font-medium text-ink-800">
                  <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {good}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Como funciona (sequência real) ---------- */
function Steps() {
  const steps = [
    { n: '01', t: 'Conversa e qualifica', d: 'O agente aborda cada visitante, percebe o que precisa e recolhe os dados certos — automaticamente.', icon: Icon.chat },
    { n: '02', t: 'Capta e envia a proposta', d: 'Recolhe o contacto e envia a proposta certa por e-mail, em segundos — sem trabalho manual.', icon: Icon.send },
    { n: '03', t: 'Conduz à venda', d: 'Entrega-lhe leads prontos a fechar e encaminha o cliente para o passo seguinte.', icon: Icon.shield },
  ];
  return (
    <section id="como" className="bg-surface px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-[2.6rem] sm:leading-[1.08]">
            Vende por si, do primeiro <span className="text-brand-600">olá</span> ao fecho
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* linha que liga a sequência */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block" aria-hidden />
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12} className="relative">
                <div className="flex items-center gap-4">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white shadow-glow-sm">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-5xl font-extrabold leading-none text-brand-200">{s.n}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ink-900">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Capacidades (bento assimétrico) ---------- */
function Features() {
  const features = [
    { icon: Icon.shield, t: 'Treinado nos seus produtos', d: 'Conhece o seu catálogo e responde como um vendedor da sua equipa, com o tom de voz da marca.', big: true },
    { icon: Icon.chat, t: 'Qualifica e capta leads', d: 'Faz as perguntas certas e recolhe contactos prontos a fechar.', big: false },
    { icon: Icon.bolt, t: 'Disponível 24/7', d: 'Atende cada visitante de imediato, em qualquer dispositivo.', big: false },
    { icon: Icon.send, t: 'Integra em minutos', d: 'Um snippet no seu site e o agente começa a vender — sem código, em qualquer plataforma.', big: true },
  ];
  return (
    <section id="produtos" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-[2.6rem] sm:leading-[1.08]">
            Tudo o que um bom vendedor faz — <span className="text-brand-600">automatizado</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">
            Treinado no seu negócio, a postos em minutos e sempre a trabalhar.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {features.map((f, i) => (
            <Reveal
              key={f.t}
              delay={i * 0.08}
              className={f.big ? 'md:col-span-4' : 'md:col-span-2'}
            >
              <div className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-ink-900">{f.t}</h3>
                <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-600">{f.d}</p>
              </div>
            </Reveal>
          ))}
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
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" aria-hidden />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-semibold text-brand-300">
              <Icon.bolt className="h-4 w-4" /> Sempre ligado
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-[2.5rem]">
              Enquanto pensa nisto, há visitantes a sair sem comprar.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-300">
              O Closr não tira folgas, não esquece o seguimento e não deixa
              ninguém à espera. É o seu melhor vendedor — multiplicado.
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
    ['Treinamos o seu agente', 'O Closr aprende a aconselhar e a vender como a sua equipa.'],
    ['Cole uma linha no seu site', 'O agente fica a vender de imediato — sem código, em qualquer plataforma.'],
  ];
  return (
    <section id="comecar" className="bg-surface px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-[2.6rem] sm:leading-[1.08]">
            A funcionar <span className="text-brand-600">hoje</span>, não daqui a semanas
          </h2>
          <ol className="mt-8 space-y-6">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 text-[15px] font-bold text-white">{i + 1}</span>
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
<span className="text-sky-300">&lt;script</span>{'\n'}  <span className="text-brand-300">src</span>=<span className="text-emerald-300">"https://cdn.closr.app/widget.js"</span>{'\n'}  <span className="text-brand-300">data-closr-id</span>=<span className="text-emerald-300">"o-seu-id"</span> <span className="text-brand-300">defer</span>{'\n'}<span className="text-sky-300">&gt;&lt;/script&gt;</span>
          </pre>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Testemunhos (um em destaque + dois) ---------- */
function Testimonials() {
  const featured = {
    q: 'O agente atende os visitantes a qualquer hora e entrega-me leads já qualificados. Fechei mais negócios este trimestre do que no anterior — sem contratar ninguém.',
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
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-[2.6rem] sm:leading-[1.08]">
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
    ['O Closr funciona no meu site?', 'Sim. Basta colar uma linha de código — funciona em qualquer site (WordPress, Shopify, Wix ou código próprio), sem mexer no resto da página.'],
    ['Consigo treiná-lo nos meus produtos?', 'Sim. O agente é treinado no seu catálogo e no tom de voz da marca, para responder e aconselhar como um vendedor da sua equipa.'],
    ['Preciso de saber programar?', 'Não. A instalação é um copiar-colar e nós tratamos da configuração e do treino consigo.'],
    ['Em que idiomas fala?', 'Em português e noutros idiomas, conforme o público do seu site.'],
    ['Para onde vão os leads captados?', 'Para onde quiser — e-mail, folha de cálculo, CRM ou notificação instantânea no Slack/WhatsApp. Sempre com consentimento e em conformidade com o RGPD.'],
    ['Quanto tempo demora a pôr a funcionar?', 'Minutos para instalar. O agente fica a postos assim que estiver treinado nos seus produtos.'],
  ];
  return (
    <section id="faq" className="bg-surface px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-[2.6rem] sm:leading-[1.08]">
            Tudo o que precisa de saber
          </h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={Math.min(i * 0.05, 0.2)}>
              <details className="group rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-sm transition-colors open:border-brand-200 open:bg-brand-50/40">
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
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.25rem] bg-brand-500 px-8 py-16 text-center shadow-glow sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-brand-700/30 blur-3xl" aria-hidden />
        <Reveal className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-[2.75rem]">
            Cada visitante é uma venda à espera
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-50">
            Adicione a Joana ao seu site e deixe de perder quem chega interessado.
            Experimente agora, no canto do ecrã.
          </p>
          <CTA size="lg" variant="onDark" className="mt-9">
            Experimentar o agente
            <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </CTA>
          <p className="mt-4 text-[13px] text-brand-100">Instala em minutos · sem código · sem compromisso</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <Logo size={34} />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] font-medium text-ink-500">
          <a href="#solucao" className="transition-colors hover:text-brand-600">Solução</a>
          <a href="#como" className="transition-colors hover:text-brand-600">Como funciona</a>
          <a href="#faq" className="transition-colors hover:text-brand-600">Perguntas</a>
          <a href="#" className="transition-colors hover:text-brand-600">Privacidade</a>
          <a href="#" className="transition-colors hover:text-brand-600">Contacto</a>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-center text-[13px] text-ink-400 sm:text-left">
        © Closr · o seu agente de vendas personalizado.
      </p>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-full bg-white">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Difference />
        <Steps />
        <Features />
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
