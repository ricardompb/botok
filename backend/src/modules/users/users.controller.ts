import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../common/auth/roles.decorator.js';
import { CreateUserCommand } from './commands/impl/create-user.command.js';
import { UpdateUserStatusCommand } from './commands/impl/update-user-status.command.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { ListUsersQuery } from './queries/impl/list-users.query.js';

@Controller('users')
@Roles('admin')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(@Query() { companyId }: ListUsersDto) {
    return this.queryBus.execute(new ListUsersQuery(companyId));
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { active }: UpdateUserStatusDto,
  ) {
    return this.commandBus.execute(new UpdateUserStatusCommand(id, active));
  }
}
