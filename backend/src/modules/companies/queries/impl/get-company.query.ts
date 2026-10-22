import { Query } from '@nestjs/cqrs';
import type { CompanyDetailDto } from '../../dto/company-response.dto.js';

export class GetCompanyQuery extends Query<CompanyDetailDto> {
  constructor(public readonly id: number) {
    super();
  }
}
