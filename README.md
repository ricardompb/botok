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
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=botok
PORT=3000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN=8h
DEFAULT_PASSWORD=botok123
```

- `DEFAULT_PASSWORD`: senha dos usuários criados pelo seed e dos usuários adicionados pela administração.
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

### Acesso de demonstração

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
