import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompaniesRepository } from '../../repositories/companies.repository.js';
import { CreateCompanyCommand } from '../impl/create-company.command.js';

/** Vigência padrão de novos contratos, conforme o protótipo. */
const DEFAULT_CONTRACT_END = '2027-10-31';

@CommandHandler(CreateCompanyCommand)
export class CreateCompanyHandler implements ICommandHandler<CreateCompanyCommand> {
  constructor(private readonly repo: CompaniesRepository) {}

  async execute({ dto }: CreateCompanyCommand) {
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('Informe o nome da empresa.');
    const company = await this.repo.create({
      name,
      licenses: dto.licenses,
      quota: 0,
      until: DEFAULT_CONTRACT_END,
      allowedAgents: [],
    });
    return { id: company.id };
  }
}
