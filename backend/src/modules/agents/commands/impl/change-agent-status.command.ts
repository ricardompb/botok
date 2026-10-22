import { Command } from '@nestjs/cqrs';

export class ChangeAgentStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly status: 'suspended' | 'archived',
  ) {
    super();
  }
}
