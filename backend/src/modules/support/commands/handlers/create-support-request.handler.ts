import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SupportRequestsRepository } from '../../repositories/support-requests.repository.js';
import { CreateSupportRequestCommand } from '../impl/create-support-request.command.js';

@CommandHandler(CreateSupportRequestCommand)
export class CreateSupportRequestHandler
  implements ICommandHandler<CreateSupportRequestCommand>
{
  constructor(private readonly repo: SupportRequestsRepository) {}

  async execute({ user, dto }: CreateSupportRequestCommand) {
    const email = user?.email ?? dto.email;
    if (!email) throw new BadRequestException('Informe o e-mail para retorno.');
    const request = await this.repo.create({
      category: dto.category,
      issue: dto.issue,
      agentId: dto.agentId || null,
      impact: dto.impact,
      email,
      userId: user?.id ?? null,
    });
    return { protocol: request.protocol, category: request.category, issue: request.issue };
  }
}
