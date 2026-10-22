import { Query } from '@nestjs/cqrs';
import type { AdminStatsDto } from '../../dto/dashboard-response.dto.js';

export class GetAdminStatsQuery extends Query<AdminStatsDto> {}
