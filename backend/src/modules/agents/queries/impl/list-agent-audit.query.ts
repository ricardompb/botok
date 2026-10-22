import { Query } from '@nestjs/cqrs';
import type { AgentAuditDto } from '../../dto/agent-response.dto.js';

export class ListAgentAuditQuery extends Query<AgentAuditDto[]> {}
