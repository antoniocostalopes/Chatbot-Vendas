# Réplica — Chatbot de Seguros "Lara" (uthere partners)

Clone funcional do assistente conversacional de seguros da uthere partners, com os
ramos **Auto** e **Casa**. Reproduz a interface, o fluxo passo-a-passo e o
comportamento de validação do original. A simulação de cotações é **mock**
(fictícia) — não há ligação a seguradoras nem a backend reais.

## Stack
- React 18 + Vite 5
- Tailwind CSS 3
- (framer-motion incluído para evoluções de animação; o motor atual usa CSS)

## Correr

```bash
cd replica
npm install
npm run dev      # http://localhost:5173
# ou
npm run build && npm run preview
```

## Widget flutuante

A app está montada como um **widget** ancorado ao **canto superior direito**,
que **abre automaticamente** ~1,2s depois de alguém entrar no site (uma vez por
sessão — usa `sessionStorage`). O botão launcher minimiza/abre o painel.

```jsx
import Widget from './components/Widget.jsx';

<Widget autoOpen autoOpenDelay={1200} />
```

Props: `autoOpen` (liga/desliga a abertura automática) e `autoOpenDelay` (ms).

`src/App.jsx` é apenas uma página de demonstração de fundo; o que importa para
integrar noutro site é o componente `Widget`. Para embeber numa página existente,
basta montar o `Widget` num `div` próprio (ou servir o `dist/` dentro de um
`<iframe>` no canto do site).

## Como está organizado

| Ficheiro | Papel |
|---|---|
| `src/lib/flows.js` | **Configuração declarativa** das perguntas (Auto + Casa). Equivale às "pages" que o original carrega do Firestore (`autoType`, `matricula`, …). É aqui que se editam/adicionam perguntas. |
| `src/lib/validators.js` | Máscaras e validações PT: matrícula, NIF (com dígito de controlo), código postal, email, telefone, datas. |
| `src/lib/mockSimulation.js` | Gera cotações fictícias com a mesma **forma de dados** do original (seguradoras → coberturas → fracionamento). Determinístico por input. |
| `src/components/ChatBot.jsx` | Motor conversacional: percorre o flow, "escreve" as mensagens, recolhe respostas, dispara a simulação. |
| `src/components/*` | Bolhas, avatar, indicador de "a escrever", opções (`radio-chat-input`), campo de texto, cartões de cotação. |
| `src/App.jsx` | Separadores Seguro Auto / Seguro Casa + layout. |

## Fidelidade ao original

**Reproduzido a partir do que foi capturado:**
- Saudação ("Olá, eu sou o assistente…"), opções Carro/Mota/Autocaravana/Camião, prompt e máscara da matrícula (`00-00-00`), o padrão `radio-chat-input` + botão **Confirmar**, e a estrutura de cotação (seguradoras/franquias/coberturas/fracionamento) vista nos bundles `AutoSim.js`/`HomeSim.js`.

**Reconstruído de forma plausível (não 1:1):**
- A sequência completa de perguntas depois da matrícula. No original, esse
  questionário vem da configuração no Firestore (não está no JavaScript do
  cliente), por isso aqui foi recriado um fluxo de seguro Auto/Casa realista.

**Não replicado (proprietário / backend):**
- O motor real de cálculo de prémios e os preços/dados das seguradoras;
- As integrações Firebase (Auth, Firestore, Cloud Functions).

## Adicionar/editar perguntas

Basta editar `src/lib/flows.js`. Cada passo:

```js
minhaPergunta: {
  type: 'options',            // 'options' | 'input' | 'simulate'
  key: 'minhaPergunta',       // nome no objeto de respostas
  prompt: 'Texto da Lara?',
  options: [{ label: 'Sim', value: true }, { label: 'Não', value: false }],
  next: 'proximaPagina',      // id seguinte (ou função(answers) => id)
}
```
