import { Body, Controller, Get, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Public } from '../../common/auth/public.decorator.js';
import { BEARER } from '../../config/swagger.js';
import { LoginCommand } from './commands/impl/login.command.js';
import { StartEntraSessionCommand } from './commands/impl/start-entra-session.command.js';
import { LoginDto } from './dto/login.dto.js';
import type { EntraClaims } from './entra/entra-claims.js';
import { CurrentEntraClaims } from './entra/entra-claims.decorator.js';
import { GetMeQuery } from './queries/impl/get-me.query.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** Login local por e-mail/senha — somente em desenvolvimento (AUTH_LOCAL_ENABLED). */
  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  /** Chamado pelo frontend após o login na Microsoft: vincula a conta e retorna o perfil. */
  @Public()
  @ApiBearerAuth(BEARER)
  @Post('entra/session')
  @HttpCode(200)
  entraSession(@CurrentEntraClaims() claims: EntraClaims | undefined) {
    if (!claims) throw new UnauthorizedException('Token do Microsoft Entra ausente ou inválido.');
    return this.commandBus.execute(new StartEntraSessionCommand(claims));
  }

  /** Perfil do usuário autenticado. */
  @ApiBearerAuth(BEARER)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetMeQuery(user.id));
  }
}
