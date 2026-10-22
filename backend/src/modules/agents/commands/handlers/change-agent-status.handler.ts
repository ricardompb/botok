import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AgentsRepository } from '../../repositories/agents.repository.js';
import { ChangeAgentStatusCommand } from '../impl/change-agent-status.command.js';
import { AUDIT_AUTHOR } from './save-agent.js';

@CommandHandler(ChangeAgentStatusCommand)
export class ChangeAgentStatusHandler
  implements ICommandHandler<ChangeAgentStatusCommand>
{
  constructor(private readonly repo: AgentsRepository) {}

  async execute({ id, status }: ChangeAgentStatusCommand) {
    const agent = await this.repo.findById(id);
    if (!agent) throw new NotFoundException('Agente não encontrado.');
    agent.status = status;
    await this.repo.save(agent);
    const label = status === 'suspended' ? 'Agente suspenso: ' : 'Agente arquivado: ';
    await this.repo.addAudit(label + agent.internalName, AUDIT_AUTHOR);
  }
}
