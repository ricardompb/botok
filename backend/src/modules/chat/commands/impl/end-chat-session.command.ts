import { Command } from '@nestjs/cqrs';
import type { AuthUser } from '../../../../common/auth/auth-user.js';

export class EndChatSessionCommand extends Command<void> {
  constructor(
    public readonly user: AuthUser,
    public readonly sessionId: string,
  ) {
    super();
  }
}
