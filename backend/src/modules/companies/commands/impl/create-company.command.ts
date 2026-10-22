import { Command } from '@nestjs/cqrs';
import type { CreateCompanyDto } from '../../dto/create-company.dto.js';
import type { CreatedCompanyDto } from '../../dto/company-response.dto.js';

export class CreateCompanyCommand extends Command<CreatedCompanyDto> {
  constructor(public readonly dto: CreateCompanyDto) {
    super();
  }
}
