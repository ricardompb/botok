import { Query } from '@nestjs/cqrs';
import type { AgentUsageDto } from '../../dto/dashboard-response.dto.js';

export class GetAgentUsageQuery extends Query<AgentUsageDto[]> {}
