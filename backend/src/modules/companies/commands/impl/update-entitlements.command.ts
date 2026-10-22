import { Command } from '@nestjs/cqrs';

export class UpdateEntitlementsCommand extends Command<void> {
  constructor(
    public readonly companyId: number,
    public readonly agentIds: string[],
  ) {
    super();
  }
}
