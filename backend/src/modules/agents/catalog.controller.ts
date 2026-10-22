import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { BEARER } from '../../config/swagger.js';
import { GetCatalogQuery } from './queries/impl/get-catalog.query.js';

@ApiTags('Assistentes')
@ApiBearerAuth(BEARER)
@Controller('catalog')
@Roles('user')
export class CatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  /** Assistentes liberados para a empresa do usuário e outras especialidades. */
  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetCatalogQuery(user.tenantId!));
  }
}
