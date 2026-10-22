import { Command } from '@nestjs/cqrs';
import type { AgentIdDto } from '../../dto/agent-response.dto.js';
import type { SaveAgentDto } from '../../dto/save-agent.dto.js';

export class UpdateAgentCommand extends Command<AgentIdDto> {
  constructor(
    public readonly id: string,
    public readonly dto: SaveAgentDto,
  ) {
    super();
  }
}
