import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { canBeGranted } from '../../../agents/agent-policy.js';
import { AgentsRepository } from '../../../agents/repositories/agents.repository.js';
import { CompaniesRepository } from '../../repositories/companies.repository.js';
import { UpdateEntitlementsCommand } from '../impl/update-entitlements.command.js';

@CommandHandler(UpdateEntitlementsCommand)
export class UpdateEntitlementsHandler
  implements ICommandHandler<UpdateEntitlementsCommand>
{
  constructor(
    private readonly repo: CompaniesRepository,
    private readonly agents: AgentsRepository,
  ) {}

  async execute({ companyId, agentIds }: UpdateEntitlementsCommand) {
    const company = await this.repo.findById(companyId);
    if (!company) throw new NotFoundException('Empresa não encontrada.');
    const agents = await this.agents.findByIds(agentIds);
    // Agentes exclusivos de outro cliente nunca podem ser liberados.
    company.allowedAgents = agents.filter((a) => canBeGranted(a, company.id));
    await this.repo.save(company);
  }
}
