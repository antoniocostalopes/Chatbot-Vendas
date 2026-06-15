import Avatar from './Avatar.jsx';
import Logo from './Logo.jsx';

const openLara = () => window.dispatchEvent(new Event('open-lara'));

/* ---------- Ícones (SVG, estilo Lucide) ---------- */
const Icon = {
  car: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
      <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H4a1 1 0 0 1-1-1v-4Z" />
      <path d="M7 16h.01M17 16h.01" />
    </svg>
  ),
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
  scale: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v18M7 21h10M5 7h14M5 7 3 12h4L5 7Zm14 0-2 5h4l-2-5Z" />
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
};

/* ---------- Navbar ---------- */
function Nav() {
  return (
    <header className="fixed inset-x-3 top-3 z-30 sm:inset-x-4 sm:top-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur sm:px-6">
        <a href="#top" className="flex items-center" aria-label="Closr — início">
          <Logo size={38} />
        </a>
        <div className="hidden items-center gap-7 text-[15px] font-medium text-slate-600 md:flex">
          <a href="#como" className="transition-colors hover:text-brand-600">Como funciona</a>
          <a href="#produtos" className="transition-colors hover:text-brand-600">Capacidades</a>
          <a href="#testemunhos" className="transition-colors hover:text-brand-600">Testemunhos</a>
        </div>
        <button
          onClick={openLara}
          className="cursor-pointer rounded-xl bg-brand-500 px-4 py-2 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Simular agora
        </button>
      </nav>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-5 pb-20 pt-32 sm:pt-36">
      {/* brilho de fundo */}
      <div className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-[480px] max-w-5xl rounded-full bg-brand-200/40 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[13px] font-semibold text-brand-700">
            <Icon.bolt className="h-4 w-4" /> Agente personalizado · sempre a vender
          </span>
          <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
            Continue a vender com o seu{' '}
            <span className="text-brand-600">agente personalizado</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            O Closr conversa com cada visitante, qualifica o interesse e capta
            o lead por si — treinado nos seus produtos e disponível 24/7.
            Veja-o em ação, ao vivo no canto do ecrã.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={openLara}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Começar simulação
              <Icon.arrow className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#como"
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-[16px] font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              Ver como funciona
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Icon.check className="h-4 w-4 text-green-500" /> Sem custos para o cliente</span>
            <span className="inline-flex items-center gap-1.5"><Icon.check className="h-4 w-4 text-green-500" /> 100% online</span>
            <span className="inline-flex items-center gap-1.5"><Icon.check className="h-4 w-4 text-green-500" /> Dados protegidos</span>
          </div>
        </div>

        {/* Visual: mockup de conversa + sinais de venda */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Avatar size={42} />
              <div>
                <div className="text-[15px] font-semibold text-slate-800">Joana · Assistente</div>
                <div className="flex items-center gap-1 text-[12px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> online
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-[14px] text-slate-700">
                Olá! Em que posso ajudar hoje?
              </div>
              <div className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-2.5 text-[14px] font-medium text-white">
                Quero saber mais
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-[14px] text-slate-700">
                Com todo o gosto. Deixe-me fazer-lhe duas perguntas rápidas.
              </div>
            </div>
          </div>

          {/* cartões flutuantes — sinais de venda */}
          <div className="absolute -bottom-6 -left-6 hidden w-44 rotate-[-4deg] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:block">
            <div className="text-[12px] font-medium text-slate-500">Novo lead</div>
            <div className="text-[15px] font-bold text-slate-900">qualificado</div>
          </div>
          <div className="absolute -right-5 top-10 hidden w-48 rotate-[5deg] rounded-2xl border border-green-200 bg-white p-3 shadow-lg sm:block">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-500 text-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4.5 4.5L19 7" /></svg>
              </span>
              <span className="text-[13px] font-semibold text-slate-800">Proposta enviada</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Problema ---------- */
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

  const XMark = (p) => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );

  return (
    <section className="bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-red-500">O custo de esperar</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Quantas vendas perde por não responder a tempo?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            A velocidade de resposta decide quem fecha o negócio. Cada minuto de
            espera é dinheiro a sair pela porta.
          </p>
        </div>

        {/* Faixa de estatísticas */}
        <div className="mt-12 grid divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map(([v, l]) => (
            <div key={v} className="px-6 py-7 text-center">
              <div className="text-4xl font-bold text-slate-900">{v}</div>
              <div className="mx-auto mt-2 max-w-[14rem] text-[14px] leading-snug text-slate-500">{l}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[12px] text-slate-400">Médias do setor de resposta a leads.</p>

        {/* Sem agente vs Com o Closr */}
        <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-red-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
              </span>
              <h3 className="text-lg font-semibold text-slate-800">Sem um agente</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {without.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] text-slate-600">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-500"><XMark /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-brand-500 bg-white p-7 shadow-md ring-1 ring-brand-500">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon.bolt className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">Com o Closr</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {withClosr.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] text-slate-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100 text-green-600">
                    <Icon.check className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <button
              onClick={openLara}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              Parar de perder vendas
              <Icon.arrow className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Como funciona ---------- */
function Steps() {
  const steps = [
    { n: '01', t: 'Conversa e qualifica', d: 'O agente aborda cada visitante, percebe o que precisa e recolhe os dados certos — automaticamente.', icon: Icon.chat },
    { n: '02', t: 'Capta e envia a proposta', d: 'Recolhe o contacto e envia a proposta certa por e-mail, em segundos — sem trabalho manual.', icon: Icon.scale },
    { n: '03', t: 'Conduz à venda', d: 'Entrega-lhe leads prontos a fechar e encaminha o cliente para o passo seguinte.', icon: Icon.shield },
  ];
  return (
    <section id="como" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-brand-600">Como funciona</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Vende por si, do primeiro olá ao fecho
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
              <span className="text-[13px] font-bold text-brand-300">{s.n}</span>
              <span className="mt-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Capacidades ---------- */
function Features() {
  const features = [
    { icon: Icon.shield, t: 'Treinado nos seus produtos', d: 'Conhece o seu catálogo e responde como um vendedor da sua equipa.' },
    { icon: Icon.chat, t: 'Qualifica e capta leads', d: 'Faz as perguntas certas e recolhe contactos prontos a fechar.' },
    { icon: Icon.bolt, t: 'Disponível 24/7', d: 'Atende cada visitante de imediato, em qualquer dispositivo.' },
    { icon: Icon.scale, t: 'Integra em minutos', d: 'Um snippet no seu site e o agente começa a vender — sem código.' },
  ];
  return (
    <section id="produtos" className="bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-brand-600">Capacidades</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Um agente feito à medida do seu negócio
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.t} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white">
                <f.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{f.t}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button
            onClick={openLara}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            Experimentar o agente
            <Icon.arrow className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stats ---------- */
function Stats() {
  const stats = [
    ['24/7', 'A vender sem parar'],
    ['< 3 min', 'Da conversa ao lead'],
    ['100%', 'Treinado nos seus produtos'],
    ['0', 'Esforço manual'],
  ];
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl rounded-3xl bg-brand-600 px-8 py-14 text-white shadow-lg">
        <div className="grid gap-8 text-center sm:grid-cols-4">
          {stats.map(([v, l]) => (
            <div key={l}>
              <div className="text-4xl font-bold sm:text-5xl">{v}</div>
              <div className="mt-2 text-[14px] text-brand-100">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testemunhos ---------- */
function Testimonials() {
  const items = [
    { q: 'O agente atende os visitantes a qualquer hora e entrega-me leads já qualificados. Fechei mais negócios este trimestre.', n: 'Ricardo Sousa', r: 'Diretor Comercial' },
    { q: 'Passou a vender enquanto eu durmo. Deixei de perder quem chega ao site fora de horas.', n: 'Helena Marques', r: 'Gestora de E-commerce' },
    { q: 'Automatizou a parte chata: conversa, qualificação e seguimento. Eu só fecho o negócio.', n: 'Tiago Fernandes', r: 'Fundador de SaaS' },
  ];
  return (
    <section id="testemunhos" className="bg-slate-50 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-brand-600">Testemunhos</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Quem usa, recomenda
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.n} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Icon.star key={i} className="h-4 w-4" />)}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">“{t.q}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {t.n.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-slate-800">{t.n}</span>
                  <span className="block text-[13px] text-slate-500">{t.r}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA final ---------- */
function FinalCTA() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Coloque o agente a vender por si
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Adicione a Joana ao seu site e comece a converter visitantes em clientes —
          de forma automatizada, 24/7.
        </p>
        <button
          onClick={openLara}
          className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-[17px] font-semibold text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Ver o agente em ação
          <Icon.arrow className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo size={34} />
        <p className="text-[13px] text-slate-400">
          Closr · o seu agente de vendas personalizado.
        </p>
      </div>
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
        <Steps />
        <Features />
        <Stats />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
