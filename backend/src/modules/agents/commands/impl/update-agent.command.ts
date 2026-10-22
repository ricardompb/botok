import { Command } from '@nestjs/cqrs';
import type { SaveAgentDto } from '../../dto/save-agent.dto.js';

export class UpdateAgentCommand extends Command<{ id: string }> {
  constructor(
    public readonly id: string,
    public readonly dto: SaveAgentDto,
  ) {
    super();
  }
}
