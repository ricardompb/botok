import { Command } from '@nestjs/cqrs';
import type { AuthUser } from '../../../../common/auth/auth-user.js';
import type { SendMessageDto } from '../../dto/send-message.dto.js';

/** Recebe os eventos da resposta conforme o Foundry os gera. */
export interface ReplySink {
  session(sessionId: string): void;
  delta(text: string): void;
}

export class SendMessageCommand extends Command<void> {
  constructor(
    public readonly user: AuthUser,
    public readonly dto: SendMessageDto,
    public readonly sink: ReplySink,
    public readonly signal?: AbortSignal,
  ) {
    super();
  }
}
