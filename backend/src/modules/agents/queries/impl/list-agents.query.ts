import { Query } from '@nestjs/cqrs';
import type { AgentAdminDto } from '../../dto/agent-response.dto.js';

export class ListAgentsQuery extends Query<AgentAdminDto[]> {}
