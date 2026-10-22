import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator.js';
import { TenantParam } from '../../common/tenancy/tenant-param.decorator.js';
import { BEARER } from '../../config/swagger.js';
import { CreateUserCommand } from './commands/impl/create-user.command.js';
import { UpdateUserStatusCommand } from './commands/impl/update-user-status.command.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { ListUsersQuery } from './queries/impl/list-users.query.js';

/** Usuários de uma empresa: o tenant é sempre explícito na rota. */
@ApiTags('Usuários da empresa')
@ApiBearerAuth(BEARER)
@Controller('companies/:companyId/users')
@Roles('admin')
@TenantParam('companyId')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** Lista os usuários da empresa. */
  @Get()
  list(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.queryBus.execute(new ListUsersQuery(companyId));
  }

  /** Adiciona um usuário (respeita as vagas contratadas; e-mail único na plataforma). */
  @Post()
  create(@Param('companyId', ParseIntPipe) companyId: number, @Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(companyId, dto));
  }

  /** Suspende ou reativa um usuário da empresa. */
  @Patch(':id/status')
  updateStatus(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { active }: UpdateUserStatusDto,
  ) {
    return this.commandBus.execute(new UpdateUserStatusCommand(companyId, id, active));
  }
}
