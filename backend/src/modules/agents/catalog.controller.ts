import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { GetCatalogQuery } from './queries/impl/get-catalog.query.js';

@Controller('catalog')
@Roles('user')
export class CatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetCatalogQuery(user.companyId!));
  }
}
