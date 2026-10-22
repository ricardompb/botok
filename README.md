# Botok – Documentação de Arquitetura

Aplicação web com **React** (frontend), **NestJS** (backend) e **PostgreSQL** (banco de dados).

## Stack

| Camada   | Tecnologia                                                   |
|----------|--------------------------------------------------------------|
| Frontend | React, TypeScript, Vite, Axios                               |
| Backend  | NestJS, TypeScript, `@nestjs/cqrs`, TypeORM, class-validator |
| Banco    | PostgreSQL                                                   |

## Estrutura do Projeto

```
botok/
├── backend/
├── frontend/
├── docker-compose.yml
└── readme.MD
```

---

## Backend (NestJS)

### Princípios
- **Modularização**: um módulo por domínio (ex.: `users`).
- **DTO**: toda entrada/saída da API usa DTOs validados com `class-validator`.
- **CQRS**: escrita via **Commands**, leitura via **Queries**, cada um com seu **Handler**.

### Estrutura

```
backend/src/
├── main.ts
├── app.module.ts
├── common/
├── database/
└── modules/
    └── users/
        ├── users.module.ts
        ├── users.controller.ts
        ├── dto/
        │   ├── create-user.dto.ts
        │   ├── update-user.dto.ts
        │   └── user-response.dto.ts
        ├── entities/
        │   └── user.entity.ts
        ├── commands/
        │   ├── impl/
        │   │   ├── create-user.command.ts
        │   │   └── update-user.command.ts
        │   └── handlers/
        │       ├── create-user.handler.ts
        │       └── update-user.handler.ts
        ├── queries/
        │   ├── impl/
        │   │   ├── get-user.query.ts
        │   │   └── list-users.query.ts
        │   └── handlers/
        │       ├── get-user.handler.ts
        │       └── list-users.handler.ts
        └── repositories/
            └── users.repository.ts
```

### Instalação

```bash
npm i -g @nestjs/cli
nest new backend
cd backend
npm i @nestjs/cqrs @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer @nestjs/jwt bcryptjs
```

### Variáveis de ambiente (`backend/.env`)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=botok_app
DB_PASSWORD=botok_app
DB_NAME=botok
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN=8h
DEFAULT_PASSWORD=botok123
AUTH_LOCAL_ENABLED=true
ENTRA_API_CLIENT_ID=
ENTRA_API_SCOPE=access_as_user
ENTRA_ADMIN_TENANT_ID=
FOUNDRY_PROJECT_ENDPOINT=
```

- `FOUNDRY_PROJECT_ENDPOINT`: projeto Foundry dos agentes criados pelo seed (ver [Conversa com os agentes](#conversa-com-os-agentes-microsoft-foundry)).
- `DEFAULT_PASSWORD`: senha do login local (desenvolvimento) para os usuários do seed e os adicionados pela administração.
- Variáveis `AUTH_*`/`ENTRA_*`: ver [Autenticação (Microsoft Entra ID)](#autenticação-microsoft-entra-id).
- Com o banco vazio, o backend popula automaticamente o cenário do `BOTOK.html` (empresas, usuários, agentes e uso do mês).

### Exemplos

**DTO**
```ts
export class CreateUserDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
}
```

**Command + Handler**
```ts
export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly repo: UsersRepository) {}
  async execute({ dto }: CreateUserCommand) {
    return this.repo.create(dto);
  }
}
```

**Query + Handler**
```ts
export class GetUserQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly repo: UsersRepository) {}
  async execute({ id }: GetUserQuery) {
    return this.repo.findById(id);
  }
}
```

**Controller**
```ts
@Controller('users')
export class UsersController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }
}
```

**Module**
```ts
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersRepository, ...CommandHandlers, ...QueryHandlers],
})
export class UsersModule {}
```

**Validação global (`main.ts`)**
```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

---

## Frontend (React)

### Princípios
- **Modularização por feature** (ex.: `users`).
- **DTOs** como tipos TypeScript espelhando o backend.
- **Axios** centralizado em uma instância única; chamadas isoladas em *services*.

### Estrutura

```
frontend/src/
├── main.tsx
├── App.tsx
├── routes/
├── shared/
│   ├── api/
│   │   └── http-client.ts
│   ├── components/
│   └── hooks/
└── modules/
    └── users/
        ├── components/
        ├── pages/
        ├── hooks/
        │   └── use-users.ts
        ├── services/
        │   └── users.service.ts
        └── dto/
            ├── create-user.dto.ts
            └── user-response.dto.ts
```

### Instalação

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm i axios react-router-dom
```

### Variáveis de ambiente (`frontend/.env`)

```
VITE_API_URL=http://localhost:3000
VITE_ENTRA_CLIENT_ID=
VITE_ENTRA_API_SCOPE=
VITE_ENTRA_AUTHORITY=https://login.microsoftonline.com/organizations
```

### Exemplos

**Instância Axios**
```ts
import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

**DTOs**
```ts
export interface CreateUserDto { name: string; email: string; }
export interface UserResponseDto { id: string; name: string; email: string; }
```

**Service**
```ts
export const usersService = {
  create: (dto: CreateUserDto) =>
    http.post<UserResponseDto>('/users', dto).then(r => r.data),
  findById: (id: string) =>
    http.get<UserResponseDto>(`/users/${id}`).then(r => r.data),
};
```

**Hook**
```ts
export function useUser(id: string) {
  const [data, setData] = useState<UserResponseDto>();
  useEffect(() => { usersService.findById(id).then(setData); }, [id]);
  return data;
}
```

---

## Banco de Dados (PostgreSQL)

`docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: botok
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

## Executando

```bash
docker compose up -d
cd backend && npm run start:dev
cd frontend && npm run dev
```

Se a porta 5432 já estiver ocupada, use `POSTGRES_PORT=5433 docker compose up -d` e ajuste `DB_PORT` no `backend/.env`.

### Acesso de demonstração (login local, só desenvolvimento)

| Perfil        | E-mail                  | Senha      | Área                                   |
|---------------|-------------------------|------------|----------------------------------------|
| Assistentes   | `ana@horizonte.example` | `botok123` | Assistentes (Construtora Horizonte)    |
| Administração | `equipe@itsok.example`  | `botok123` | Empresas, licenças e console de agentes |

### Rotas do frontend

| Rota                                  | Tela do `BOTOK.html` | Perfil   |
|---------------------------------------|----------------------|----------|
| `/entrada`                            | Entrada              | público  |
| `/assistentes`                        | Seus assistentes     | usuário  |
| `/assistentes/:agentId`               | Conversa             | usuário  |
| `/administracao`                      | Empresas e licenças  | admin    |
| `/administracao/empresas/:companyId`  | Ambiente da empresa  | admin    |
| `/administracao/agentes`              | Catálogo de agentes  | admin    |
| `/sobre`                              | Sobre o projeto      | público  |

## Conversa com os agentes (Microsoft Foundry)

A conversa é feita com agentes do **Microsoft Foundry Agent Service** (agentes atuais, identificados por nome), via SDK `@azure/ai-projects` (Conversations + Responses), com a resposta transmitida em **streaming** (Server-Sent Events) até a tela.

### Cadastro do agente (console de agentes)

| Campo do console                          | Uso                                                                 |
|-------------------------------------------|---------------------------------------------------------------------|
| Endpoint HTTPS                            | Endpoint do projeto: `https://<recurso>.services.ai.azure.com/api/projects/<projeto>` |
| Identificador do agente ou publicação     | Nome do agente no Foundry; `nome:versão` fixa uma versão (sem versão, usa a mais recente) |
| Método de autenticação                    | **Microsoft Entra ID** (único suportado pelo Foundry). “Credencial em cofre” é recusada na ativação |

Instruções, modelo e base de conhecimento continuam sendo mantidos no Foundry; o portal só referencia o agente.

### Credencial do backend

O backend usa `DefaultAzureCredential`: **identidade gerenciada** em produção e `az login` em desenvolvimento. A identidade precisa da função **Azure AI User** no projeto Foundry (IAM do recurso). Nenhuma chave é configurada no portal.

### Sem histórico

- O portal **não grava mensagens**: guarda só metadados da sessão (empresa, usuário, assistente, contagem, atividade) e os identificadores remotos necessários ao descarte.
- O contexto vive na *conversation* do Foundry durante a sessão e é **apagado no Foundry** (conversa e respostas) ao encerrar, trocar de assistente, sair da tela ou fechar a página.
- Sem aviso do navegador, um coletor no servidor descarta as conversas **sem atividade há 30 minutos** (verificação a cada minuto).
- Conteúdo de conversa não é registrado em logs.

### Fluxo

`POST /chat/messages` (SSE: `session` → `delta`… → `done` | `error`) · `POST /chat/sessions/:id/end` (encerramento explícito). Se o Foundry estiver indisponível, o usuário recebe “O assistente não está disponível no momento”.

## Multi-tenancy (separação lógica dos dados)

Cada **empresa cliente é um tenant** (`companies.id`). A IT’s OK opera a plataforma acima dos tenants. O isolamento tem duas barreiras:

1. **Aplicação** — todo acesso ao banco passa pelo `TenantDb` (`backend/src/common/tenancy`), dentro de um contexto aberto por requisição pelo `TenantContextInterceptor`. Fora de um contexto, nenhuma consulta é executada. Os repositórios filtram pelo tenant do contexto e recusam pedidos explícitos de outro tenant.
2. **Banco (Row-Level Security)** — cada operação roda em uma transação com `app.tenant_id` / `app.bypass_rls`, e as políticas do PostgreSQL (`rls.ts`, aplicadas na inicialização) só devolvem e só aceitam linhas do tenant atual. O backend conecta como `botok_app`, sem `SUPERUSER`/`BYPASSRLS`, e as tabelas usam `FORCE ROW LEVEL SECURITY`.

| Contexto   | Quando                                                         | Dados visíveis                         |
|------------|----------------------------------------------------------------|----------------------------------------|
| `tenant`   | Usuário de empresa (sempre o próprio tenant)                   | Somente a empresa                      |
| `tenant`   | Admin IT’s OK em rota de empresa (`/companies/:companyId/...`) | Somente a empresa da rota — **auditado** |
| `platform` | Admin IT’s OK em visões gerais (empresas, catálogo, consumo)   | Todos os tenants                       |
| `system`   | Sem usuário: login, vínculo do Entra, Fale conosco anônimo, seed | Todos (operações internas)           |

| Tabela              | Tenant                     | Regra                                                         |
|---------------------|----------------------------|---------------------------------------------------------------|
| `companies`         | `id`                       | A empresa só vê a si mesma                                    |
| `users`             | `tenantId`                 | `null` para administradores IT’s OK                           |
| `company_agents`    | `tenantId`                 | Permissões de agentes da empresa                              |
| `chat_sessions`     | `tenantId`                 | Metadados de consumo (sem conteúdo)                           |
| `support_requests`  | `tenantId`                 | `null` para administração ou pedidos antes do login           |
| `tenant_access_log` | `tenantId`                 | Cada operação da IT’s OK nos dados de uma empresa, inclusive tentativas negadas |
| `agents`            | `tenantId` (opcional)      | Catálogo global: genéricos (`null`) visíveis a todos; exclusivos só à empresa; alterações só pela plataforma |
| `agent_audit`       | —                          | Somente plataforma                                            |

Os e-mails são únicos na plataforma (necessário para o login e o vínculo com o Entra).

O usuário `botok_app` é criado por `docker/postgres/init/01-app-role.sql` na primeira inicialização do volume. Em um volume já existente, execute uma vez:

```bash
docker compose exec -T postgres psql -U postgres -d botok < docker/postgres/init/01-app-role.sql
```

## Autenticação (Microsoft Entra ID)

O login é feito no **Microsoft Entra ID**, em modo **multi-tenant**: cada usuário entra com a conta Microsoft corporativa da própria empresa. O Entra apenas autentica; **perfil (administrador ou usuário), empresa, suspensão e vagas continuam no banco do portal**.

### Regras de acesso

- Só entra quem a administração cadastrou no portal. No primeiro acesso, a conta Microsoft (`tid` + `oid`) é vinculada ao usuário pelo e-mail (UPN).
- O primeiro acesso de um usuário fixa o tenant da empresa; depois disso, contas de outros tenants são recusadas para aquela empresa.
- Contas convidadas (B2B) e contas pessoais da Microsoft não são aceitas.
- Administradores só são aceitos quando vêm do tenant da IT’s OK (`ENTRA_ADMIN_TENANT_ID`).
- A verificação adicional (MFA) é feita pelo Entra, via Acesso Condicional em cada tenant.
- O backend valida cada access token: assinatura (JWKS da Microsoft), audience, emissor do tenant, expiração e escopo `access_as_user`; suspensão e vigência do contrato são revalidadas a cada requisição.

### App registrations (no tenant da IT’s OK)

1. **botok-api**: tipos de conta *“Contas em qualquer diretório organizacional (multilocatário)”*; em *Expor uma API*, URI `api://<client-id-da-api>` e escopo `access_as_user`; no manifesto, `requestedAccessTokenVersion: 2`.
2. **botok-web**: multilocatário; plataforma **SPA** com URIs de redirecionamento `http://localhost:5173/` (e a URL de produção, com `/` no final); em *Permissões de API*, adicionar `botok-api / access_as_user` (delegada).

Nos tenants dos clientes, o consentimento ao app pode exigir aprovação de um administrador da empresa cliente.

### Configuração

| Onde     | Variável                | Valor                                               |
|----------|-------------------------|-----------------------------------------------------|
| backend  | `ENTRA_API_CLIENT_ID`   | Client ID do **botok-api**                          |
| backend  | `ENTRA_API_SCOPE`       | `access_as_user`                                    |
| backend  | `ENTRA_ADMIN_TENANT_ID` | Tenant ID da IT’s OK                                |
| backend  | `AUTH_LOCAL_ENABLED`    | `false` em produção (o backend recusa `true` com `NODE_ENV=production`) |
| frontend | `VITE_ENTRA_CLIENT_ID`  | Client ID do **botok-web**                          |
| frontend | `VITE_ENTRA_API_SCOPE`  | `api://<client-id-da-api>/access_as_user`           |
| frontend | `VITE_ENTRA_AUTHORITY`  | `https://login.microsoftonline.com/organizations`   |

Com `VITE_ENTRA_CLIENT_ID` vazio, o frontend usa o login local por e-mail/senha (desenvolvimento). Com o Entra configurado, a tela de entrada mostra apenas o e-mail profissional (enviado à Microsoft como sugestão de conta) e o botão **Entrar com Microsoft**; senha e recuperação de acesso ficam no Entra.

## Convenções

- Um módulo por domínio, nos dois lados.
- Controllers não contêm regra de negócio: apenas despacham Commands/Queries.
- Commands alteram estado; Queries apenas leem.
- Entidades nunca são expostas diretamente: mapear para DTO de resposta.
- Frontend nunca usa Axios direto em componentes: usar *services* e *hooks*.

## Referência de Design (`BOTOK.html`)

O app deve ser **100% baseado no `BOTOK.html`**, que é a fonte única de verdade para o produto.

- **Telas e fluxos**: todas as telas, rotas e navegação do app devem corresponder às do `BOTOK.html`.
- **UI**: layout, componentes, textos, cores, tipografia, espaçamentos, ícones e estados (hover, vazio, erro, carregando) devem ser fiéis ao arquivo.
- **Componentização**: cada seção/bloco do HTML vira um componente React; estilos e variáveis (CSS custom properties) são migrados mantendo os mesmos valores.
- **Comportamento**: interações e scripts do HTML devem ser reproduzidos em hooks/componentes React.
- **Acesso por perfil**: a barra superior deve reproduzir as opções **Entrar**, **Assistentes** e **Administração** do protótipo. Usuários assistentes não administradores veem somente as funcionalidades da área de assistentes; apenas administradores veem e acessam as funções da área administrativa, conforme o `BOTOK.html`.
- **Dados**: campos, entidades e listas exibidos no HTML definem os módulos, entidades e DTOs do backend.
- **Divergências**: em caso de dúvida ou conflito, o `BOTOK.html` prevalece; nenhuma funcionalidade ou elemento visual fora dele deve ser adicionado sem aprovação.
