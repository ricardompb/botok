// Dados iniciais extraídos do protótipo BOTOK.html (fonte única de verdade).

export const SEED_AGENTS = [
  {
    "id": "rota",
    "sortOrder": 1,
    "internalName": "ROTA da Liderança Comunicadora",
    "name": "ROTA da Liderança Comunicadora",
    "short": "ROTA",
    "icon": "route",
    "description": "Avalie riscos, organize suas ideias e encontre a melhor forma de se posicionar.",
    "title": "O que você precisa comunicar hoje?",
    "intro": "Vamos olhar para o contexto, o público e o efeito que você deseja produzir. Você pode começar com uma situação ou com um texto.",
    "prompts": [
      "Preparar uma conversa com o board",
      "Revisar uma mensagem para a equipe",
      "Avaliar se este é o momento de falar"
    ],
    "tip": "Você conduz a decisão. O BOTOK ajuda a explorar riscos, alternativas e abordagens."
  },
  {
    "id": "crise",
    "sortOrder": 2,
    "internalName": "Gestão de Crise",
    "name": "Gestão de Crise",
    "short": "Gestão de Crise",
    "icon": "crisis",
    "description": "Prepare manifestações e organize mensagens para momentos que exigem cuidado.",
    "title": "Clareza e cuidado nos momentos sensíveis.",
    "intro": "Organize o que está confirmado, identifique os públicos envolvidos e prepare uma comunicação responsável.",
    "prompts": [
      "Preparar uma primeira manifestação",
      "Revisar uma nota à imprensa",
      "Organizar mensagens-chave"
    ],
    "tip": "Em uma crise instalada, acione também a equipe IT’s OK e os responsáveis internos."
  },
  {
    "id": "midia",
    "sortOrder": 3,
    "internalName": "Media Training",
    "name": "Media Training",
    "short": "Media Training",
    "icon": "mic",
    "description": "Prepare entrevistas, antecipe perguntas difíceis e fortaleça sua mensagem-chave.",
    "title": "Sua mensagem merece chegar com clareza.",
    "intro": "Prepare-se para a entrevista com foco no público, na mensagem principal e nas perguntas que exigem atenção.",
    "prompts": [
      "Treinar uma resposta difícil",
      "Encontrar minha mensagem-chave",
      "Preparar uma entrevista"
    ],
    "tip": "Uma boa preparação considera o que você quer dizer e o que o público precisa entender."
  },
  {
    "id": "toc",
    "sortOrder": 4,
    "internalName": "TOC da Liderança Comunicadora",
    "name": "TOC da Liderança Comunicadora",
    "short": "TOC",
    "icon": "chat",
    "description": "Dê tangibilidade às ideias e comunique com objetividade e conexão.",
    "title": "Como tornar sua mensagem mais concreta?",
    "intro": "Trabalhe a clareza, os exemplos e a conexão com o público.",
    "prompts": [
      "Tornar um feedback mais específico",
      "Simplificar uma mensagem",
      "Conectar a ideia ao público"
    ],
    "tip": "Objetividade e conexão podem caminhar juntas."
  },
  {
    "id": "redes",
    "sortOrder": 5,
    "internalName": "Redator para Redes Sociais",
    "name": "Redator para Redes Sociais",
    "short": "Redes Sociais",
    "icon": "pen",
    "description": "Prepare publicações coerentes com sua voz e com o contexto da empresa.",
    "title": "O que sua publicação deve provocar?",
    "intro": "Defina o público, a intenção e a mensagem antes de escrever.",
    "prompts": [
      "Estruturar uma publicação",
      "Ajustar o tom de um texto",
      "Avaliar riscos de uma postagem"
    ],
    "tip": "Considere as políticas da empresa e confirme as informações antes de publicar."
  }
];

export const SEED_COMPANIES = [
  {
    "id": 1,
    "name": "Construtora Horizonte",
    "licenses": 5,
    "allowed": [
      "rota",
      "crise",
      "midia"
    ],
    "quota": 24,
    "until": "31/10/2027",
    "users": [
      {
        "name": "Ana Ribeiro",
        "email": "ana@horizonte.example",
        "active": true,
        "last": "Hoje"
      },
      {
        "name": "Carlos Menezes",
        "email": "carlos@horizonte.example",
        "active": true,
        "last": "Ontem"
      },
      {
        "name": "Juliana Prado",
        "email": "juliana@horizonte.example",
        "active": true,
        "last": "Há 3 dias"
      }
    ]
  },
  {
    "id": 2,
    "name": "Estúdio Aurora",
    "licenses": 3,
    "allowed": [
      "rota"
    ],
    "quota": 8,
    "until": "31/10/2027",
    "users": [
      {
        "name": "Marina Costa",
        "email": "marina@aurora.example",
        "active": true,
        "last": "Hoje"
      },
      {
        "name": "Rafael Dias",
        "email": "rafael@aurora.example",
        "active": true,
        "last": "Há 2 dias"
      }
    ]
  }
];

/** Configuração de registro aplicada aos agentes do protótipo. */
export const SEED_AGENT_REGISTRY = {
  scope: 'generic' as const,
  clientId: null,
  status: 'active' as const,
  provider: 'Microsoft Foundry',
  endpoint: 'https://foundry.example/projects/itsok',
  auth: 'entra' as const,
  secretRef: '',
  version: '1.0',
  owner: 'IT’s OK',
  approved: '2026-10-17',
  manualUrl: '',
  manualVersion: '1.0',
  tested: true,
};

export const SEED_ADMIN = {
  name: 'Equipe IT’s OK',
  email: 'equipe@itsok.example',
};

/** “Último acesso” do protótipo convertido em dias atrás. */
export const SEED_LAST_ACCESS_DAYS: Record<string, number> = {
  Hoje: 0,
  Ontem: 1,
  'Há 2 dias': 2,
  'Há 3 dias': 3,
};

/** Sessões iniciadas no mês, conforme “Utilização por assistente”. */
export const SEED_USAGE: Record<string, number> = {
  rota: 18,
  crise: 7,
  midia: 5,
};
