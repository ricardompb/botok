import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../common/auth/roles.decorator.js';
import { ChangeAgentStatusCommand } from './commands/impl/change-agent-status.command.js';
import { CreateAgentCommand } from './commands/impl/create-agent.command.js';
import { DeleteAgentCommand } from './commands/impl/delete-agent.command.js';
import { UpdateAgentCommand } from './commands/impl/update-agent.command.js';
import { ChangeAgentStatusDto } from './dto/change-agent-status.dto.js';
import { SaveAgentDto } from './dto/save-agent.dto.js';
import { ListAgentAuditQuery } from './queries/impl/list-agent-audit.query.js';
import { ListAgentsQuery } from './queries/impl/list-agents.query.js';

@Controller('agents')
@Roles('admin')
export class AgentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list() {
    return this.queryBus.execute(new ListAgentsQuery());
  }

  @Get('audit')
  audit() {
    return this.queryBus.execute(new ListAgentAuditQuery());
  }

  @Post()
  create(@Body() dto: SaveAgentDto) {
    return this.commandBus.execute(new CreateAgentCommand(dto));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: SaveAgentDto) {
    return this.commandBus.execute(new UpdateAgentCommand(id, dto));
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() { status }: ChangeAgentStatusDto) {
    return this.commandBus.execute(new ChangeAgentStatusCommand(id, status));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteAgentCommand(id));
  }
}
