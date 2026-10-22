import { Command } from '@nestjs/cqrs';
import type { UserResponseDto } from '../../dto/user-response.dto.js';

export class UpdateUserStatusCommand extends Command<UserResponseDto> {
  constructor(
    public readonly id: string,
    public readonly active: boolean,
  ) {
    super();
  }
}
