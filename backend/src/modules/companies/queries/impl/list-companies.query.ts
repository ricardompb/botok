import { Query } from '@nestjs/cqrs';
import type { CompanyListItemDto } from '../../dto/company-response.dto.js';

export class ListCompaniesQuery extends Query<CompanyListItemDto[]> {}
