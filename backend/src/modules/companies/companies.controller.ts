import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../common/auth/roles.decorator.js';
import { TenantParam } from '../../common/tenancy/tenant-param.decorator.js';
import { CreateCompanyCommand } from './commands/impl/create-company.command.js';
import { UpdateEntitlementsCommand } from './commands/impl/update-entitlements.command.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateEntitlementsDto } from './dto/update-entitlements.dto.js';
import { GetCompanyQuery } from './queries/impl/get-company.query.js';
import { ListCompaniesQuery } from './queries/impl/list-companies.query.js';

@Controller('companies')
@Roles('admin')
export class CompaniesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list() {
    return this.queryBus.execute(new ListCompaniesQuery());
  }

  @Get(':id')
  @TenantParam('id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetCompanyQuery(id));
  }

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.commandBus.execute(new CreateCompanyCommand(dto));
  }

  @Put(':id/entitlements')
  @TenantParam('id')
  updateEntitlements(
    @Param('id', ParseIntPipe) id: number,
    @Body() { agentIds }: UpdateEntitlementsDto,
  ) {
    return this.commandBus.execute(new UpdateEntitlementsCommand(id, agentIds));
  }
}
