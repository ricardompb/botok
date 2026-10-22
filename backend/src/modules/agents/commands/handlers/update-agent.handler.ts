import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AgentsRepository } from '../../repositories/agents.repository.js';
import { UpdateAgentCommand } from '../impl/update-agent.command.js';
import { AUDIT_AUTHOR, buildAgentFields } from './save-agent.js';

@CommandHandler(UpdateAgentCommand)
export class UpdateAgentHandler implements ICommandHandler<UpdateAgentCommand> {
  constructor(private readonly repo: AgentsRepository) {}

  async execute({ id, dto }: UpdateAgentCommand) {
    const agent = await this.repo.findById(id);
    if (!agent) throw new NotFoundException('Agente não encontrado.');
    Object.assign(agent, await buildAgentFields(this.repo, dto, agent));
    await this.repo.save(agent);
    const removed =
      agent.clientId !== null
        ? await this.repo.revokeFromOtherCompanies(agent.id, agent.clientId)
        : 0;
    await this.repo.addAudit(
      `Agente atualizado: ${agent.internalName} · v${agent.version}` +
        (removed ? ' · permissões incompatíveis removidas' : ''),
      AUDIT_AUTHOR,
    );
    return { id: agent.id };
  }
}
