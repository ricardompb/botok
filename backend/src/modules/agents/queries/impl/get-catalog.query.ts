import { Query } from '@nestjs/cqrs';
import type { CatalogResponseDto } from '../../dto/agent-response.dto.js';

export class GetCatalogQuery extends Query<CatalogResponseDto> {
  constructor(public readonly companyId: number) {
    super();
  }
}
