import { Command } from '@nestjs/cqrs';
import type { AuthUser } from '../../../../common/auth/auth-user.js';
import type { CreateSupportRequestDto } from '../../dto/create-support-request.dto.js';
import type { SupportReceiptDto } from '../../dto/support-response.dto.js';

export class CreateSupportRequestCommand extends Command<SupportReceiptDto> {
  constructor(
    public readonly user: AuthUser | undefined,
    public readonly dto: CreateSupportRequestDto,
  ) {
    super();
  }
}
