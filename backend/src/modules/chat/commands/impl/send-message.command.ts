import { Command } from '@nestjs/cqrs';
import type { AuthUser } from '../../../../common/auth/auth-user.js';
import type { SendMessageDto } from '../../dto/send-message.dto.js';
import type { SendMessageResponseDto } from '../../dto/send-message-response.dto.js';

export class SendMessageCommand extends Command<SendMessageResponseDto> {
  constructor(
    public readonly user: AuthUser,
    public readonly dto: SendMessageDto,
  ) {
    super();
  }
}
