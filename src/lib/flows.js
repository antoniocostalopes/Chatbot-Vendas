// Configuração declarativa do questionário — equivalente ao que o original
// carrega do Firestore (pages: autoType, matricula, ...). Cada passo é um "page".
//
// Tipos de passo:
//   - 'options'  -> botões radio-chat-input + Confirmar
//   - 'input'    -> campo de texto (com kind para máscara/validação)
//   - 'message'  -> apenas uma mensagem da Lara (sem resposta)
//   - 'simulate' -> dispara a simulação mock
//
// O campo `next` pode ser um id de página ou uma função(answers) => id.

export const GREETING = {
  auto: 'Olá, eu sou o assistente e vou procurar o melhor seguro auto para si. Que seguro procura?',
  home: 'Olá, eu sou o assistente e vou procurar o melhor seguro para a sua casa. Vamos começar?',
};

// Pergunta inicial — escolha do produto. Conforme a opção, ramifica para o
// fluxo 'auto' ou 'home'.
export const PRODUCT_STEP = {
  type: 'options',
  key: 'product',
  prompt: 'Olá, eu sou o Kyvo! Que tipo de seguro procura?',
  options: [
    { label: 'Seguro Auto', value: 'auto' },
    { label: 'Seguro Casa', value: 'home' },
  ],
};

const autoFlow = {
  start: 'autoType',
  pages: {
    autoType: {
      type: 'options',
      key: 'autoType',
      prompt: 'Boa escolha! Que tipo de veículo pretende segurar?',
      options: [
        { label: 'Carro', value: 'car' },
        { label: 'Mota', value: 'motorcycle' },
        { label: 'Autocaravana', value: 'motorhome' },
        { label: 'Camião', value: 'truck' },
      ],
      next: 'plate',
    },
    // A partir daqui a ordem segue o fluxo real do chatbot original
    // (verificado: autoType -> plate -> carOwner -> name -> nif -> ...).
    plate: {
      type: 'input',
      key: 'plate',
      kind: 'plate',
      prompt: 'Vamos começar pela matrícula do seu carro',
      placeholder: '00-00-00',
      next: 'carOwner',
    },
    carOwner: {
      type: 'options',
      key: 'carOwner',
      prompt: 'É o proprietário?',
      options: [
        { label: 'Sim', value: 'yes' },
        { label: 'É da empresa', value: 'company' },
        { label: 'Não', value: 'no' },
      ],
      next: 'name',
    },
    name: {
      type: 'input',
      key: 'name',
      kind: 'name',
      prompt: 'Óptimo. Como se chama? (nome completo)',
      placeholder: 'Nome completo',
      next: 'nif',
    },
    nif: {
      type: 'input',
      key: 'nif',
      kind: 'nif',
      prompt: 'Preciso desta informação para encontrar o melhor preço possível para si. Qual o seu NIF?',
      placeholder: '000000000',
      next: 'birth',
    },
    birth: {
      type: 'input',
      key: 'birth',
      kind: 'date',
      prompt: 'Qual a sua data de nascimento?',
      placeholder: 'dd/mm/aaaa',
      next: 'claims',
    },
    claims: {
      type: 'options',
      key: 'claims',
      prompt: 'Quantos sinistros teve nos últimos 2 anos?',
      options: [
        { label: 'Nenhum', value: 0 },
        { label: '1', value: 1 },
        { label: '2 ou mais', value: 2 },
      ],
      next: 'coverage',
    },
    coverage: {
      type: 'options',
      key: 'coverage',
      prompt: 'Que tipo de cobertura procura?',
      options: [
        { label: 'Apenas Responsabilidade Civil', value: 'rc' },
        { label: 'Danos Próprios', value: 'dp' },
      ],
      next: 'email',
    },
    email: {
      type: 'input',
      key: 'email',
      kind: 'email',
      prompt: 'E o seu e-mail?',
      placeholder: 'nome@exemplo.pt',
      next: 'phone',
    },
    phone: {
      type: 'input',
      key: 'phone',
      kind: 'phone',
      prompt: 'Por último, o seu contacto telefónico?',
      placeholder: '912345678',
      next: 'summary',
    },
    summary: {
      type: 'summary',
      prompt: 'Está quase! Confirme os seus dados antes de eu enviar a proposta.',
      next: 'done',
    },
    done: {
      type: 'finish',
      prompt:
        'Perfeito! Vou analisar as melhores propostas para o seu perfil e enviar a sua simulação por e-mail. Recebê-la-á dentro de minutos.',
    },
  },
};

const homeFlow = {
  start: 'homeType',
  pages: {
    homeType: {
      type: 'options',
      key: 'homeType',
      prompt: 'Boa escolha! Que tipo de imóvel pretende segurar?',
      options: [
        { label: 'Apartamento', value: 'apartment' },
        { label: 'Moradia', value: 'house' },
      ],
      next: 'regime',
    },
    regime: {
      type: 'options',
      key: 'regime',
      prompt: 'É proprietário ou inquilino?',
      options: [
        { label: 'Proprietário', value: 'owner' },
        { label: 'Inquilino', value: 'tenant' },
      ],
      next: 'area',
    },
    area: {
      type: 'input',
      key: 'area',
      kind: 'number',
      prompt: 'Qual a área aproximada do imóvel (m²)?',
      placeholder: '120',
      next: 'year',
    },
    year: {
      type: 'input',
      key: 'year',
      kind: 'number',
      prompt: 'Em que ano foi construído o imóvel?',
      placeholder: '1998',
      next: 'capital',
    },
    capital: {
      type: 'options',
      key: 'capital',
      prompt: 'Que capital pretende segurar para o recheio?',
      options: [
        { label: 'Até 25.000€', value: 25000 },
        { label: '25.000€ a 50.000€', value: 50000 },
        { label: 'Mais de 50.000€', value: 75000 },
      ],
      next: 'postal',
    },
    postal: {
      type: 'input',
      key: 'postal',
      kind: 'postal',
      prompt: 'Qual o código postal do imóvel?',
      placeholder: '0000-000',
      next: 'name',
    },
    name: {
      type: 'input',
      key: 'name',
      kind: 'name',
      prompt: 'Qual o seu nome completo?',
      placeholder: 'Nome completo',
      next: 'nif',
    },
    nif: {
      type: 'input',
      key: 'nif',
      kind: 'nif',
      prompt: 'Qual o seu NIF?',
      placeholder: '000000000',
      next: 'email',
    },
    email: {
      type: 'input',
      key: 'email',
      kind: 'email',
      prompt: 'E o seu e-mail?',
      placeholder: 'nome@exemplo.pt',
      next: 'phone',
    },
    phone: {
      type: 'input',
      key: 'phone',
      kind: 'phone',
      prompt: 'Por último, o seu contacto telefónico?',
      placeholder: '912345678',
      next: 'summary',
    },
    summary: {
      type: 'summary',
      prompt: 'Está quase! Confirme os seus dados antes de eu enviar a proposta.',
      next: 'done',
    },
    done: {
      type: 'finish',
      prompt:
        'Obrigado! Vou preparar as melhores propostas para a sua casa e enviar a simulação por e-mail. Recebê-la-á dentro de minutos.',
    },
  },
};

export const FLOWS = { auto: autoFlow, home: homeFlow };
