import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { Roles } from '../../common/auth/roles.decorator.js';
import { SendMessageCommand } from './commands/impl/send-message.command.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('chat')
@Roles('user')
export class ChatController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('messages')
  @HttpCode(200)
  send(@CurrentUser() user: AuthUser, @Body() dto: SendMessageDto) {
    return this.commandBus.execute(new SendMessageCommand(user, dto));
  }
}
