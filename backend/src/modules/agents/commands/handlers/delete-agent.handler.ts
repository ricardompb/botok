import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AgentsRepository } from '../../repositories/agents.repository.js';
import { DeleteAgentCommand } from '../impl/delete-agent.command.js';
import { AUDIT_AUTHOR } from './save-agent.js';

@CommandHandler(DeleteAgentCommand)
export class DeleteAgentHandler implements ICommandHandler<DeleteAgentCommand> {
  constructor(private readonly repo: AgentsRepository) {}

  async execute({ id }: DeleteAgentCommand) {
    const agent = await this.repo.findById(id);
    if (!agent) throw new NotFoundException('Agente não encontrado.');
    const companies = await this.repo.findCompanies();
    if (companies.some((c) => c.allowedAgents.some((a) => a.id === id))) {
      throw new ConflictException('Exclusão bloqueada por vínculo de licença.');
    }
    // Remove apenas o cadastro no portal; nada é excluído no Foundry.
    await this.repo.remove(agent);
    await this.repo.addAudit('Cadastro excluído: ' + agent.internalName, AUDIT_AUTHOR);
  }
}
