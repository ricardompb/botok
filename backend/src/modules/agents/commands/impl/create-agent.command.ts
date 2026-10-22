import { Command } from '@nestjs/cqrs';
import type { SaveAgentDto } from '../../dto/save-agent.dto.js';

export class CreateAgentCommand extends Command<{ id: string }> {
  constructor(public readonly dto: SaveAgentDto) {
    super();
  }
}
