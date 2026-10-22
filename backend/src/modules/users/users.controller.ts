import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../common/auth/roles.decorator.js';
import { TenantParam } from '../../common/tenancy/tenant-param.decorator.js';
import { CreateUserCommand } from './commands/impl/create-user.command.js';
import { UpdateUserStatusCommand } from './commands/impl/update-user-status.command.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { ListUsersQuery } from './queries/impl/list-users.query.js';

/** Usuários de uma empresa: o tenant é sempre explícito na rota. */
@Controller('companies/:companyId/users')
@Roles('admin')
@TenantParam('companyId')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.queryBus.execute(new ListUsersQuery(companyId));
  }

  @Post()
  create(@Param('companyId', ParseIntPipe) companyId: number, @Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(companyId, dto));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { active }: UpdateUserStatusDto,
  ) {
    return this.commandBus.execute(new UpdateUserStatusCommand(companyId, id, active));
  }
}
