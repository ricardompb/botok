import { Command } from '@nestjs/cqrs';
import type { AgentIdDto } from '../../dto/agent-response.dto.js';
import type { SaveAgentDto } from '../../dto/save-agent.dto.js';

export class CreateAgentCommand extends Command<AgentIdDto> {
  constructor(public readonly dto: SaveAgentDto) {
    super();
  }
}
