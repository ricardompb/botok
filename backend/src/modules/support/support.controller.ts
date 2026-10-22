import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Public } from '../../common/auth/public.decorator.js';
import { BEARER } from '../../config/swagger.js';
import { CreateSupportRequestCommand } from './commands/impl/create-support-request.command.js';
import { CreateSupportRequestDto } from './dto/create-support-request.dto.js';

@ApiTags('Fale conosco')
@ApiBearerAuth(BEARER)
@Controller('support')
export class SupportController {
  constructor(private readonly commandBus: CommandBus) {}

  /** Disponível também na tela de entrada, antes da autenticação. */
  @Public()
  @Post()
  create(@CurrentUser() user: AuthUser | undefined, @Body() dto: CreateSupportRequestDto) {
    return this.commandBus.execute(new CreateSupportRequestCommand(user, dto));
  }
}
