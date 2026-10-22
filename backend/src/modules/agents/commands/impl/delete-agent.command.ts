import { Command } from '@nestjs/cqrs';

export class DeleteAgentCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
